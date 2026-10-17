import { SuggestedPrompt } from "../types";

export const SUGGESTED_FARMER_PROMPTS: SuggestedPrompt[] = [
  {
    id: "prompt-wheat-irrigation",
    category: "irrigation",
    categoryLabel: {
      en: "Water & Irrigation",
      hi: "सिंचाई एवं जल",
      mr: "पाणी आणि सिंचन",
      pa: "ਪਾਣੀ ਅਤੇ ਸਿੰਚਾਈ",
    },
    text: {
      en: "When is the most critical stage to irrigate wheat, and how many times?",
      hi: "गेहूं में पहली और सबसे जरूरी सिंचाई किस अवस्था (CRI) पर करनी चाहिए?",
      mr: "गव्हाला पहिले आणि सर्वात महत्त्वाचे पाणी कधी द्यावे?",
      pa: "ਕਣਕ ਨੂੰ ਪਹਿਲਾ ਅਤੇ ਸਭ ਤੋਂ ਜ਼ਰੂਰੀ ਪਾਣੀ ਕਿਹੜੀ ਅਵਸਥਾ ਵਿੱਚ ਲਾਉਣਾ ਚਾਹੀਦਾ ਹੈ?",
    },
  },
  {
    id: "prompt-tomato-disease",
    category: "crop_disease",
    categoryLabel: {
      en: "Crop Disease",
      hi: "फसल रोग",
      mr: "पीक रोग",
      pa: "ਫ਼ਸਲ ਰੋਗ",
    },
    text: {
      en: "My tomato leaves have dark brown spots with concentric rings. What disease is this?",
      hi: "टमाटर के पत्तों पर गोल छल्लेदार काले धब्बे बन रहे हैं, यह कौन सा रोग है?",
      mr: "टोमॅटोच्या पानांवर काळे गोलाकार डाग पडत आहेत, हा कोणता रोग आहे?",
      pa: "ਟਮਾਟਰ ਦੇ ਪੱਤਿਆਂ 'ਤੇ ਗੋਲ ਕਾਲੇ ਧੱਬੇ ਪੈ ਰਹੇ ਹਨ, ਇਹ ਕਿਹੜੀ ਬਿਮਾਰੀ ਹੈ?",
    },
  },
  {
    id: "prompt-soil-ph",
    category: "soils",
    categoryLabel: {
      en: "Soil & Fertilizer",
      hi: "मिट्टी और खाद",
      mr: "माती आणि खत",
      pa: "ਮਿੱਟੀ ਅਤੇ ਖ਼ਾਦ",
    },
    text: {
      en: "What is the ideal soil pH for potato and how do I improve black soil drainage?",
      hi: "आलू के लिए उपयुक्त मिट्टी और पीएच क्या है, और काली मिट्टी में जल निकासी कैसे सुधारें?",
      mr: "बटाटा पिकासाठी कोणती माती योग्य आहे आणि निचरा कसा सुधारावा?",
      pa: "ਆਲੂ ਦੀ ਫ਼ਸਲ ਲਈ ਢੁਕਵੀਂ ਜ਼ਮੀਨ ਅਤੇ ਨਿਕਾਸੀ ਸੁਧਾਰਨ ਦੇ ਤਰੀਕੇ ਕੀ ਹਨ?",
    },
  },
  {
    id: "prompt-mustard-fertilizer",
    category: "soils",
    categoryLabel: {
      en: "Nutrient Plan",
      hi: "पोषक तत्व सलाह",
      mr: "खत व्यवस्थापन",
      pa: "ਖ਼ਾਦ ਪ੍ਰਬੰਧਨ",
    },
    text: {
      en: "What is the recommended NPK and Sulphur dose for 2 acres of mustard?",
      hi: "2 एकड़ सरसों की बुवाई के लिए एनपीके और सल्फर की कितनी मात्रा डालें?",
      mr: "२ एकर मोहरीच्या लागवडीसाठी किती खत (NPK) द्यावे?",
      pa: "2 ਏਕੜ ਸਰ੍ਹੋਂ ਦੀ ਬਿਜਾਈ ਲਈ ਖ਼ਾਦ ਦੀ ਸਹੀ ਮਾਤਰਾ ਕਿੰਨੀ ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ?",
    },
  },
  {
    id: "prompt-weather-frost",
    category: "general",
    categoryLabel: {
      en: "Weather Protection",
      hi: "मौसम सुरक्षा",
      mr: "हवामान संरक्षण",
      pa: "ਮੌਸਮ ਬਚਾਅ",
    },
    text: {
      en: "How can I protect vegetable seedlings and mustard from ground frost during winter?",
      hi: "सर्दियों में पाले (शीतलहर) से सब्जियों और सरसों की फसल को कैसे बचाएं?",
      mr: "हिवाळ्यात थंडी आणि धुक्यापासून भाजीपाला पिकांचे रक्षण कसे करावे?",
      pa: "ਸਰਦੀਆਂ ਵਿੱਚ ਕੋਰੇ ਅਤੇ ਠੰਢ ਤੋਂ ਸਬਜ਼ੀਆਂ ਨੂੰ ਬਚਾਉਣ ਲਈ ਕੀ ਕਰਨਾ ਚਾਹੀਦਾ ਹੈ?",
    },
  },
  {
    id: "prompt-mandi-prices",
    category: "mandi",
    categoryLabel: {
      en: "Mandi Rates",
      hi: "मंडी भाव",
      mr: "बाजार भाव",
      pa: "ਮੰਡੀ ਭਾਅ",
    },
    text: {
      en: "How does APMC modal price work and when should I harvest onion for best rates?",
      hi: "मंडी में मॉडल भाव क्या होता है, और प्याज की बेहतर कीमत के लिए तुड़ाई कब करें?",
      mr: "कांद्याला चांगला बाजार भाव मिळण्यासाठी काढणी आणि साठवणूक कशी करावी?",
      pa: "ਮੰਡੀ ਵਿੱਚ ਫ਼ਸਲ ਦਾ ਚੰਗਾ ਭਾਅ ਲੈਣ ਲਈ ਸਹੀ ਸਮੇਂ 'ਤੇ ਵੇਚਣ ਦੇ ਕੀ ਸੁਝਾਅ ਹਨ?",
    },
  },
];
