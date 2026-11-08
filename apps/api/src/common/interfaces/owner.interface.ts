import { OwnerStatus } from '../enums/owner-status.enum';
import type { IParcelOwnership } from './parcel-ownership.interface';
import type { IProject } from './project.interface';

/** A person or organization that can hold shares in parcels of one project. */
export interface IOwner {
  id: string;
  projectId: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  status: OwnerStatus;
  nationalId: string;
  createdAt: Date;
  updatedAt: Date;
  /** Only present when the relation is explicitly loaded. */
  project?: IProject;
  ownerships?: IParcelOwnership[];
}
