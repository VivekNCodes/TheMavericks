export interface IrrigationFieldInput {
  crop: string;
  growthStage: string;
  soilType: string;
  lastIrrigatedDate: string;
  fieldLocation: string;
}

export interface WeatherDayForecast {
  day: string;
  tempMax: number;
  rainMm: number;
  condition: string;
}
