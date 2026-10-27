import { CreateProjectHandler } from './commands/create-project/create-project.handler';
import { GetProjectHandler } from './queries/get-project/get-project.handler';
import { ListProjectsHandler } from './queries/list-projects/list-projects.handler';

/** Every CQRS handler of the projects module, registered in one place. */
export const PROJECT_HANDLERS = [CreateProjectHandler, GetProjectHandler, ListProjectsHandler];
