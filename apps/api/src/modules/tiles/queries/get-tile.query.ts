import { IncomingHttpHeaders } from "node:http";

export class GetTileQuery {
  constructor(
    readonly z: number,
    readonly x: number,
    readonly y: number,
    readonly requestHeaders: IncomingHttpHeaders = {},
  ) {}
}
