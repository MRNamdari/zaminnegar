/** TanStack Query keys of the projects feature. */
export const projectKeys = {
  all: ['projects'] as const,
  list: () => [...projectKeys.all, 'list'] as const,
};
