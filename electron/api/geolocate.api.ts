const NOMINATIM = 'https://nominatim.openstreetmap.org/'

export const geolocateAPI = {
  search: (searchQuery: string): Promise<Response> => fetch(`${NOMINATIM}search?format=json&countrycodes=za&q=${searchQuery}`, {method: 'GET'})
}