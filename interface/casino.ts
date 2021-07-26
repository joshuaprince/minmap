export enum TimeFrame {
  WEEKDAY = "WeekDay Min",
  WEEKNIGHT = "WeekNight Min",
  WEEKEND = "WeekendMin",
  WEEKENDNIGHT = "WeekendnightMin",
}

export type Minimum = null | {
  low: number
  high: number | null
}

export type Casino = {
  name: string
  coords: [number, number]
  updated: string

  minimums: Record<TimeFrame, Minimum>

  extras: { [key: string]: string }
}
