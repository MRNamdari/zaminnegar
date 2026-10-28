export const ownerKeys = {
  all: ['owners'],
  list: () => [...ownerKeys.all, 'list'],
  parcel: (parcelId: string) => [...ownerKeys.all, 'parcel', parcelId],
};
