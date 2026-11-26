import { applyDecorators } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

/**
 * Optional user-assigned area in square meters, stored on the feature's boundary as `manualAreaM2`.
 * Left out (or null) it stays null and responses fall back to the area computed from the geometry.
 */
export const ManualAreaField = () =>
  applyDecorators(
    ApiPropertyOptional({
      type: 'number',
      nullable: true,
      minimum: 0,
      description:
        'User-assigned area in square meters. Optional; when null the geodesic area computed from the geometry is reported as areaM2. On update, send null to clear it.',
    }),
    IsOptional(),
    IsNumber(),
    Min(0),
  );
