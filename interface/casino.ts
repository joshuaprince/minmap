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

  // minimums: { [key in TimeFrame]: Minimum }
  minimums: Record<TimeFrame, Minimum>

  extras: { [key: string]: string }
}
