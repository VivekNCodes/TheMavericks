export interface CropDefinition {
  id: string;
  name: string;
  hindiName: string;
  scientificName: string;
  defaultAcreage: number;
  stages: string[];
  varieties: string[];
  imageUrl: string;
}

export const SUPPORTED_CROPS: CropDefinition[] = [
  {
    id: "tomato",
    name: "Tomato",
    hindiName: "टमाटर",
    scientificName: "Solanum lycopersicum",
    defaultAcreage: 1.2,
    stages: ["Nursery", "Vegetative", "Flowering", "Fruit Formation", "Harvesting"],
    varieties: ["Abhinav F1", "Pusa Ruby", "Arka Rakshak"],
    imageUrl: "/images/crop-tomato.webp",
  },
  {
    id: "wheat",
    name: "Wheat",
    hindiName: "गेहूं",
    scientificName: "Triticum aestivum",
    defaultAcreage: 2.0,
    stages: ["Crown Root", "Tillering", "Jointing", "Heading", "Grain Filling", "Maturity"],
    varieties: ["HD-2967", "PBW-343", "Sharbati"],
    imageUrl: "/images/crop-wheat.webp",
  },
  {
    id: "chili",
    name: "Chili",
    hindiName: "मिर्च",
    scientificName: "Capsicum annuum",
    defaultAcreage: 0.5,
    stages: ["Vegetative", "Flowering", "Fruit Set", "Ripening"],
    varieties: ["Kashi Anmol", "Pusa Jwala", "G-4"],
    imageUrl: "/images/crop-chili.webp",
  },
  {
    id: "potato",
    name: "Potato",
    hindiName: "आलू",
    scientificName: "Solanum tuberosum",
    defaultAcreage: 1.0,
    stages: ["Sprouting", "Vegetative", "Tuber Initiation", "Tuber Bulking", "Maturation"],
    varieties: ["Kufri Jyoti", "Kufri Pukhraj", "Kufri Bahar"],
    imageUrl: "/images/crop-potato.webp",
  },
  {
    id: "onion",
    name: "Onion",
    hindiName: "प्याज",
    scientificName: "Allium cepa",
    defaultAcreage: 0.8,
    stages: ["Seedling", "Vegetative", "Bulbing", "Bulb Maturity"],
    varieties: ["Nashik Red", "Pusa Red", "Bhima Super"],
    imageUrl: "/images/crop-onion.webp",
  },
];
