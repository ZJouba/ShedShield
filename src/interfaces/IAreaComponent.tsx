import { Dayjs } from 'dayjs';

export default interface IAreaComponent {
  id: string;
  interval: number;
  handleNextEvent: (date: Dayjs) => void;
}
