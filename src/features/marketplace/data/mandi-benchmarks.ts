import { MandiBenchmarkPrice } from "../types";

export const MANDI_BENCHMARK_RATES: Record<string, MandiBenchmarkPrice> = {
  Tomato: {
    cropName: "Tomato",
    mandiName: "Jaipur APMC Mandi",
    district: "Jaipur",
    state: "Rajasthan",
    modalPriceQuintal: 1850,
    minPriceQuintal: 1200,
    maxPriceQuintal: 2300,
    pricePerKg: 18.5,
    updatedDate: "16 Oct 2026",
  },
  Potato: {
    cropName: "Potato",
    mandiName: "Sanganer Sub-Yard Mandi",
    district: "Jaipur",
    state: "Rajasthan",
    modalPriceQuintal: 1250,
    minPriceQuintal: 950,
    maxPriceQuintal: 1450,
    pricePerKg: 12.5,
    updatedDate: "16 Oct 2026",
  },
  Onion: {
    cropName: "Onion",
    mandiName: "Chomu Krishi Upaj Mandi",
    district: "Jaipur",
    state: "Rajasthan",
    modalPriceQuintal: 1650,
    minPriceQuintal: 1300,
    maxPriceQuintal: 1950,
    pricePerKg: 16.5,
    updatedDate: "16 Oct 2026",
  },
  Wheat: {
    cropName: "Wheat",
    mandiName: "Jaipur Main Yard",
    district: "Jaipur",
    state: "Rajasthan",
    modalPriceQuintal: 2150,
    minPriceQuintal: 1900,
    maxPriceQuintal: 2400,
    pricePerKg: 21.5,
    updatedDate: "16 Oct 2026",
  },
  Chili: {
    cropName: "Chili",
    mandiName: "Kota Mandi",
    district: "Kota",
    state: "Rajasthan",
    modalPriceQuintal: 7200,
    minPriceQuintal: 5800,
    maxPriceQuintal: 8500,
    pricePerKg: 72.0,
    updatedDate: "15 Oct 2026",
  },
  Mustard: {
    cropName: "Mustard",
    mandiName: "Alwar Grain Mandi",
    district: "Alwar",
    state: "Rajasthan",
    modalPriceQuintal: 5350,
    minPriceQuintal: 4900,
    maxPriceQuintal: 5700,
    pricePerKg: 53.5,
    updatedDate: "16 Oct 2026",
  },
  Soybean: {
    cropName: "Soybean",
    mandiName: "Kota Krishi Mandi",
    district: "Kota",
    state: "Rajasthan",
    modalPriceQuintal: 4400,
    minPriceQuintal: 3900,
    maxPriceQuintal: 4750,
    pricePerKg: 44.0,
    updatedDate: "15 Oct 2026",
  },
  Garlic: {
    cropName: "Garlic",
    mandiName: "Jodhpur Mandi",
    district: "Jodhpur",
    state: "Rajasthan",
    modalPriceQuintal: 8900,
    minPriceQuintal: 7500,
    maxPriceQuintal: 10500,
    pricePerKg: 89.0,
    updatedDate: "16 Oct 2026",
  },
};

export function getMandiBenchmark(cropName: string): MandiBenchmarkPrice | null {
  const normalized = cropName.trim().toLowerCase();
  for (const [key, value] of Object.entries(MANDI_BENCHMARK_RATES)) {
    if (key.toLowerCase() === normalized || normalized.includes(key.toLowerCase())) {
      return value;
    }
  }
  return null;
}
