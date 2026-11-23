import { UnprocessableEntityException } from '@nestjs/common';

/** The map API only describes single-part outlines, like the list does (`GET /map/features` omits the others). */
export class MultipartFeatureError extends UnprocessableEntityException {
  constructor(id: string) {
    super({
      code: 'MULTIPART_FEATURE',
      message: `Feature ${id} consists of several separate polygons, which the map API cannot represent`,
    });
  }
}
