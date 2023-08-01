import cp from 'child_process';

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
  cp.exec(cmd.join(' '));
}