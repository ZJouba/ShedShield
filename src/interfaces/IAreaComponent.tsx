import { Dayjs } from 'dayjs';
import IAreaInfo from './IAreaInfo';

export default interface IAreaComponent {
  areaInfo: IAreaInfo | undefined;
  interval: number;
  handleNextEvent: (date: Dayjs) => void;
}
