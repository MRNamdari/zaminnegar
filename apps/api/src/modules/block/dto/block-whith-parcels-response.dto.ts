import { ApiProperty } from "@nestjs/swagger";
import { BlockResponseDto } from "./block-response.dto";
import { ParcelResponseDto } from "../../parcel/dto/parcel-response.dto";
import { Expose, plainToInstance, Type } from "class-transformer";
import { IBlock } from "../../../common/interfaces/block.interface";

export class BlockWithParcelsResponse extends BlockResponseDto {
  @ApiProperty({ type: () => ParcelResponseDto })
  @Expose()
  @Type(() => ParcelResponseDto)
  parcels!: ParcelResponseDto;

  static from(block: IBlock): BlockWithParcelsResponse {
    return plainToInstance(BlockWithParcelsResponse, block, {
      excludeExtraneousValues: true,
    });
  }
}