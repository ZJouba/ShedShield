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
  id: string;
  events: IEvent[] | null;
  info: IInfo | null;
  schedule: ISchedule | null;
  error: string;
}
