import type { IParcel } from '../../parcels/interfaces/parcel.interface';

/** A project groups the parcels of one farm or survey. */
export interface IProject {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  /** Only present when the relation is explicitly loaded. */
  parcels?: IParcel[];
}

/** Fields a caller may provide when creating a project. */
export type ICreateProject = Pick<IProject, 'name' | 'description'>;
