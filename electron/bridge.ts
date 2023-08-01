import { contextBridge, ipcRenderer } from 'electron';
import ISettings from '../src/interfaces/ISettings';
import { Dayjs } from 'dayjs';

const api = {
  getSettings: async () => {
    return await ipcRenderer.invoke('getSettings');
  },

  saveSettings: async (settings: ISettings) => {
    return await ipcRenderer.invoke('saveSettings', settings); 
  },

  searchArea: async (searchQuery: string) => {
    return await ipcRenderer.invoke('searchArea', searchQuery);
  },

  geolocate: async (searchQuery: string) => {
    return await ipcRenderer.invoke('geolocate', searchQuery);
  },

  getAreaInfo: async (id: string) => {
    return await ipcRenderer.invoke('getAreaInfo', id);
  },

  setCron: async (cron: Date, formatted: string) => {
    return await ipcRenderer.invoke('setCron', cron, formatted);
  },

  info: async (...args: any[]) => {
    ipcRenderer.send('info', args);
  },

  warn: async (...args: any[]) => {
    ipcRenderer.send('warn', args);
  },

  error: async (...args: any[]) => {
    ipcRenderer.send('error', args);
  },

  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_, data) => callback(data))
  }
}

contextBridge.exposeInMainWorld('Main', api)

const theme = {
  set: async (theme: string) => {
    ipcRenderer.invoke('setTheme', theme);
  }
}
contextBridge.exposeInMainWorld('theme', theme);