import { Transform, Type } from "class-transformer";
import { IsInt, Max, Min } from "class-validator";
const toNumber = ({ value }: { value: unknown }): unknown =>
  value === "" ? value : Number(value);
export class TileParamsDto {
  @Transform(toNumber) @Type(() => Number) @IsInt() @Min(0) @Max(30) z!: number;
  @Transform(toNumber) @Type(() => Number) @IsInt() @Min(0) x!: number;
  @Transform(toNumber) @Type(() => Number) @IsInt() @Min(0) y!: number;
}
