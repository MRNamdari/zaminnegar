import type { CreateBoundaryDto } from "@zaminnegar/api-client";
import { err, ok, type Result } from "neverthrow";
import { z } from "zod";
import { validationError, type EditorError } from "../../core/errors";
import { polygonGeometrySchema, positionSchema, type PolygonGeometry } from "../../core/schemas";
import { invalidResponse } from "./error-translation";

/**
 * Pure geometry conversion between the editor's `Polygon` and the API's geometry DTO.
 * No endpoint knowledge lives here. Coordinates are never rounded, reordered, simplified
 * or dropped: they are either carried over exactly or the conversion fails.
 *
 * The generated geometry schema uses MultiPolygon coordinate depth (`number[][][][]`)
 * even though its `type` enum also lists "Polygon", so a Polygon is sent as a
 * MultiPolygon with a single part (`[rings]`), which changes no coordinate value.
 */

type ApiGeometryDto = NonNullable<CreateBoundaryDto["geometry"]>;
export type ApiMultiPolygon = ApiGeometryDto & {
  type: "MultiPolygon";
  coordinates: NonNullable<ApiGeometryDto["coordinates"]>;
};

const issuesOf = (error: z.ZodError) => error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));

/** Editor Polygon -> API geometry. Rejects invalid or unclosed polygons instead of repairing them. */
export function toApiGeometry(geometry: PolygonGeometry): Result<ApiMultiPolygon, EditorError> {
  const parsed = polygonGeometrySchema.safeParse(geometry);
  if (!parsed.success) {
    return err(validationError("invalid_geometry", "The polygon is not valid", issuesOf(parsed.error)));
  }
  const rings = parsed.data.coordinates;
  const open = rings.findIndex((ring) => {
    const first = ring[0];
    const last = ring[ring.length - 1];
    return first === undefined || last === undefined || first[0] !== last[0] || first[1] !== last[1];
  });
  if (open !== -1) {
    return err(
      validationError("unclosed_ring", "Every polygon ring must end where it starts", [
        { path: `coordinates.${open}`, message: "First and last positions differ" },
      ]),
    );
  }
  return ok({ type: "MultiPolygon", coordinates: [rings] });
}

const geometryTypeSchema = z.object({ type: z.string() });
const multiPolygonSchema = z.object({
  type: z.literal("MultiPolygon"),
  coordinates: z.array(z.array(z.array(positionSchema).min(4)).min(1)),
});

/** API boundary geometry (untrusted) -> editor Polygon. Fails for anything the editor cannot represent exactly. */
export function fromApiGeometry(value: unknown): Result<PolygonGeometry, EditorError> {
  const typed = geometryTypeSchema.safeParse(value);
  if (!typed.success) return err(invalidResponse("boundary geometry"));

  switch (typed.data.type) {
    case "Polygon": {
      const polygon = polygonGeometrySchema.safeParse(value);
      return polygon.success ? ok(polygon.data) : err(invalidResponse("boundary geometry"));
    }
    case "MultiPolygon": {
      const multi = multiPolygonSchema.safeParse(value);
      if (!multi.success) return err(invalidResponse("boundary geometry"));
      const [only, ...rest] = multi.data.coordinates;
      if (only === undefined) return err(invalidResponse("boundary geometry"));
      if (rest.length > 0) {
        const parts = rest.length + 1;
        return err(
          validationError(
            "invalid_geometry",
            `The boundary consists of ${parts} separate polygons, which the editor cannot display or edit`,
            [{ path: "geometry.coordinates", message: `Expected one polygon part, received ${parts}` }],
          ),
        );
      }
      return ok({ type: "Polygon", coordinates: only });
    }
    default:
      return err(
        validationError("invalid_geometry", `Unsupported geometry type "${typed.data.type}"`, [
          { path: "geometry.type", message: "Expected Polygon or a single-part MultiPolygon" },
        ]),
      );
  }
}
