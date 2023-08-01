import IAreaResult from './IAreaResult';

export default interface ISettings {
  apiKey: string;
  espAreas: IAreaResult[];
  theme: string;
  interval: number;
  runAtStartup: boolean;
}
