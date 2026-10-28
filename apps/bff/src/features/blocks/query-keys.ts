export const blockKeys = {
  all: ['blocks'],
  list: (regionId: string) => [...blockKeys.all, 'region', regionId],
};
