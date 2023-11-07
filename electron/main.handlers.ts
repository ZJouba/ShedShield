import { IpcMain, Tray, app, nativeTheme } from 'electron'
import { geolocateAPI } from './api/geolocate.api'
import { espAPI } from './api/esp.api'
import Store from 'electron-store'
import ISettings from '../src/interfaces/ISettings'
import { CronJob } from 'cron'
import { executeCmd, shutdown } from './utils/shutdown'
import logger from './utils/logger'
import dayjs from 'dayjs';

const store = new Store();

export const registerHandlers = (ipcMain: IpcMain, tray: Tray | null) => {
  let shutdownJob: CronJob
  const otherJobs: {name: string, job: CronJob}[] = [];

  ipcMain.handle('getSettings', () => {
    const settings: ISettings = store.get('settings') as ISettings || {
      espAreas: [],
      theme: '',
      interval: 0,
      runAtStartup: false,
    };

    if (!settings.theme)
      settings.theme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
    return settings
  });

  ipcMain.handle('saveSettings', (event: any, settings: ISettings) => {
    store.set('settings', settings);
    app.setLoginItemSettings({
      openAtLogin: settings.runAtStartup,
    });
  });

  ipcMain.handle('setTheme', (event: any, theme: string) => {
    nativeTheme.themeSource = theme as ('system' | 'light' | 'dark');
  });

  ipcMain.handle('searchArea', async (event: any, searchQuery: string) => {
    const response = await espAPI.searchArea(searchQuery);
    if (response.status < 200 || response.status > 299) throw Error("Couldn't search for loadshedding areas. " + response.statusText);
    const results = await response.json();
    return results?.areas;
  });

  ipcMain.handle('geolocate', async (event: any, searchQuery: string) => {
    const response = await geolocateAPI.search(searchQuery)
    return await response.json()
  });

  ipcMain.handle('getAreaInfo', async (event: any, id: string) => {
    const response = await espAPI.areaInfo(id)
    return await response.json()
  });

  ipcMain.handle('setCron', async (event: any, cron: Date, formatted: string) => {
    if (shutdownJob) {
      shutdownJob.stop()
    }
    try {
      shutdownJob = new CronJob(
        cron,
        () => {
          shutdown();
        },
        null,
        true,
      );
      tray?.setToolTip(`Shutting down at ${formatted}`);
    } catch (e) {
      e && logger.error(e);
    }

    const { commands } = store.get('settings') as ISettings;
    commands.forEach((command) => {
      const name = `${command.duration} ${command.unit} before loadshedding run ${command.command}`;
      const existingJobs = otherJobs?.filter(job => job.name === name) || [];
      if (existingJobs.length > 0) {
        existingJobs.forEach((job) => {
          job.job.stop()
          otherJobs.splice(otherJobs.indexOf(job));
        });
      };
      otherJobs.push({
        name,
        job: new CronJob(
          dayjs(cron).add(-1 * command.duration, command.unit[0] as dayjs.ManipulateType).toDate(),
          () => {
            executeCmd([command.command])
          },
          null,
          true
        )
      });
    })
  });

  ipcMain.handle('info', async (event: any, ...args: any[]) => logger.info(args));
  ipcMain.handle('error', async (event: any, ...args: any[]) => logger.error(args));
  ipcMain.handle('warn', async (event: any, ...args: any[]) => logger.warn(args));
}
