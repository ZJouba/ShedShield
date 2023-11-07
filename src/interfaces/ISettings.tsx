import IAreaResult from './IAreaResult';
import { Command } from './ICommandComponent';

export default interface ISettings {
  apiKey: string;
  espAreas: IAreaResult[];
  theme: string;
  interval: number;
  updates: number;
  runAtStartup: boolean;
  commands: Command[];
}
