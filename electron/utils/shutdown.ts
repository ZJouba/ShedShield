import cp from 'child_process';
import { Notification } from 'electron';

export function shutdown() {
  const cmdarguments = ['shutdown'];

  if (process.platform === 'linux' || process.platform === 'darwin') {
    cmdarguments.unshift('sudo');
  }

  if (process.platform === 'win32') {
    cmdarguments.push('-s');
  }

  executeCmd(cmdarguments);
}

const executeCmd = (cmd: string[]) => {
  new Notification({
    title: 'ShedShield shutdown',
    body: 'ShedShield will now shut down your PC'
  }).show();
  cp.exec(cmd.join(' '));
}