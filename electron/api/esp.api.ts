import Store from 'electron-store'
import ISettings from '../../src/interfaces/ISettings';
const ESP = 'https://developer.sepush.co.za/business/2.0/'

const store = new Store()

const ESPToken = () => {
  return {
    headers: {
      'Token': (store.get('settings') as ISettings)?.apiKey
    }
  }
};

export const espAPI = {
  searchArea: (searchQuery: string): Promise<Response> => fetch(`${ESP}areas_search?${searchQuery}`, {method: 'GET', ...ESPToken()}),

  areaInfo: (id: string): Promise<Response> => fetch(`${ESP}area?id=${id}${process.env.NODE_ENV !== 'production' ? '&test=current' : ''}`, {method: 'GET', ...ESPToken()}),
}