import { spawn } from 'child_process';
import { Notification } from 'electron';
import logger from './logger';

export function shutdown() {
  const cmdarguments = ['shutdown'];

  if (process.platform === 'linux' || process.platform === 'darwin') {
    cmdarguments.unshift('sudo');
  }

  if (process.platform === 'win32') {
    cmdarguments.push('-s');
  }

  
  new Notification({
    title: 'ShedShield shutdown',
    body: 'ShedShield will now shut down your PC'
  }).show();

  executeCmd(cmdarguments);
}

export const executeCmd = (cmd: string[]) => {
  const cp = spawn(cmd.join(' '), {shell: true});
  cp.stdout.on('data', (data) => data && logger.info(data));
  cp.stderr.on('data', (error) => error && logger.error(error));
  cp.on('exit', (code) => logger.info(`child process exited with code ${code}`));
}