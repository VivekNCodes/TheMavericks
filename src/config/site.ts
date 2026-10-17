export const siteConfig = {
  name: "KrishiSetu AI",
  shortName: "KrishiSetu",
  tagline: "Smart Farming, Brighter Futures",
  description:
    "An integrated agricultural intelligence platform uniting crop disease detection, mandi price intelligence, smart irrigation guidance, and direct farmer-to-buyer marketplace.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  defaultLocation: "Jaipur, Rajasthan",
  defaultWeather: {
    temp: 28,
    condition: "Sunny",
  },
  currentUser: {
    id: "farmer-ramesh",
    name: "Ramesh Kumar",
    role: "Farmer",
    location: "Jaipur, Rajasthan",
    avatarUrl: "/images/ramesh-avatar.webp",
  },
};
