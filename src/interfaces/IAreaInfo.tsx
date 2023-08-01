interface IEvent {
  end: string;
  note: string;
  start: string;
}

interface IInfo {
  name: string;
  region: string;
}

interface IDays {
  date: string;
  name: string;
  stages: string[][];
}

interface ISchedule {
  days: IDays[];
  source: string;
}

export default interface IAreaInfo {
  events: IEvent[];
  info: IInfo;
  schedule: ISchedule;
}
