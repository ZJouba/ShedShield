import React from 'react';

export interface Command {
  duration: number;
  unit: string;
  command: string;
}

export default interface ICommandComponent {
  commands: Command[];
  setCommands: React.Dispatch<React.SetStateAction<Command[]>>;
};