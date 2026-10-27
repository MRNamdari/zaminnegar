import { Command } from '@nestjs/cqrs';
import type { CreateParcelDto } from '../../dto/create-parcel.dto';
import type { IParcel } from '../../interfaces/parcel.interface';

/** Creates a parcel inside a project. Resolves with the stored parcel (including its computed area). */
export class CreateParcelCommand extends Command<IParcel> {
  constructor(
    public readonly projectId: string,
    public readonly input: CreateParcelDto,
  ) {
    super();
  }
}
