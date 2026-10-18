import { SupportedLanguage } from "@/i18n/translations";
import { ChatResponsePayload, CommandAction } from "../types";
import {
  retrieveAgriculturalGrounding,
  GroundingContextResult,
} from "./agricultural-knowledge";
import type { UserAgriculturalContext } from "@/types/auth";

/**
 * Controlled command-routing layer for application navigation and voice actions.
 */
export function detectVoiceCommand(query: string): CommandAction | undefined {
  const clean = query.trim().toLowerCase();

  // Dashboard navigation
  if (
    /(open|go to|show|view)\s+(my\s+)?dashboard/i.test(clean) ||
    /(डैशबोर्ड|होम|मुख्य पृष्ठ)/i.test(clean)
  ) {
    return { type: "navigate", target: "/", message: "Navigating to your farm dashboard." };
  }

  // Saved Crops navigation
  if (
    /(show|view|open|see)\s+(my\s+)?(saved\s+)?crops/i.test(clean) ||
    /(मेरी\s+फसलें|फसल\s+दिखाओ|फसलें\s+खोलो)/i.test(clean)
  ) {
    return { type: "navigate", target: "/#crops", message: "Opening your saved crops section." };
  }

  // Add new crop action
  if (
    /(add|create|register)\s+(a\s+)?(new\s+)?crop/i.test(clean) ||
    /(नई\s+फसल\s+जोड़ो|फसल\s+दर्ज\s+करो)/i.test(clean)
  ) {
    return { type: "open_modal", target: "add_crop", message: "Opening crop addition window." };
  }

  // Disease detection navigation
  if (
    /(open|start|go to)\s+(crop\s+)?disease(\s+detection)?/i.test(clean) ||
    /(रोग\s+पहचान|बीमारी\s+पहचान|पत्ता\s+जांच)/i.test(clean)
  ) {
    return { type: "navigate", target: "/crop-disease", message: "Opening leaf disease diagnostic tool." };
  }

  // Disease reports / history
  if (
    /(recent\s+disease\s+reports|disease\s+history|diagnosis\s+history)/i.test(clean) ||
    /(रोग\s+इतिहास|पिछली\s+रिपोर्ट|रोग\s+रिपोर्ट)/i.test(clean)
  ) {
    return { type: "navigate", target: "/crop-disease#history", message: "Opening your past disease diagnosis history." };
  }

  // Profile navigation
  if (
    /(open|view|go to)\s+(my\s+)?profile/i.test(clean) ||
    /(मेरी\s+प्रोफाइल|किसान\s+खाता|प्रोफाइल\s+खोलो)/i.test(clean)
  ) {
    return { type: "navigate", target: "/profile", message: "Opening your farmer profile." };
  }

  // Language switches
  if (
    /(switch to|speak in|change to)\s+hindi/i.test(clean) ||
    /(हिंदी\s+में\s+बात\s+करो|हिंदी\s+चुनो|हिंदी\s+करो)/i.test(clean)
  ) {
    return { type: "change_language", target: "hi", message: "भाषा बदलकर हिंदी कर दी गई है।" };
  }
  if (
    /(switch to|speak in|change to)\s+english/i.test(clean) ||
    /(अंग्रेजी\s+चुनो|इंग्लिश\s+करो)/i.test(clean)
  ) {
    return { type: "change_language", target: "en", message: "Language switched to English." };
  }

  // Stop speech playback
  if (
    /(stop speaking|be quiet|mute|stop audio|pause voice)/i.test(clean) ||
    /(चुप\s+रहो|बोलना\s+बंद\s+करो|आवाज\s+बंद)/i.test(clean)
  ) {
    return { type: "stop_speech", message: "Stopping speech audio." };
  }

  return undefined;
}

/**
 * Heuristic detector for Indian regional scripts and languages.
 */
export function detectIndianLanguage(
  text: string,
  preferredLang: SupportedLanguage = "en"
): SupportedLanguage {
  if (!text) return preferredLang;

  // Gurmukhi Unicode block (\u0A00 - \u0A7F) -> Punjabi
  if (/[\u0A00-\u0A7F]/.test(text)) {
    return "pa";
  }

  // Devanagari Unicode block (\u0900 - \u097F)
  if (/[\u0900-\u097F]/.test(text)) {
    const marathiKeywords = [
      "आहे", "नाही", "पिकाला", "पिकासाठी", "शेती", "शेतकरी", "पाऊस", "लागवड",
      "खत", "करावे", "द्यावे", "कधी", "कसे", "कांदा", "टोमॅटो", "गहू", "बटाटा"
    ];
    const isMarathi = marathiKeywords.some((word) => text.includes(word));
    if (isMarathi || preferredLang === "mr") {
      return "mr";
    }
    return "hi";
  }

  return preferredLang;
}

function formatCropName(cropName: string, lang: SupportedLanguage): string {
  if (lang === "hi" || lang === "mr") {
    const match = cropName.match(/\(([^)]+)\)/);
    if (match && match[1]) {
      return match[1];
    }
  }
  return cropName.split(" (")[0] || cropName;
}

/**
 * Intelligent Offline Grounded Agricultural Engine.
 * Dynamically synthesizes accurate, question-specific advice from verified ICAR data
 * when GEMINI_API_KEY is not set or network is offline.
 */
function generateDeterministicFallbackReply(
  userQuery: string,
  contextResult: GroundingContextResult,
  lang: SupportedLanguage,
  userContext?: UserAgriculturalContext | null
): string {
  const { intent, matchedCrop, matchedSoil, matchedDisease, matchedScheme, weatherOutlook, groundedText } = contextResult;
  const cropTitle = matchedCrop ? formatCropName(matchedCrop.name, lang) : "";

  // 0. PERSONALIZED CROP & FARM PROFILE INTENT
  if (userContext && userContext.crops && userContext.crops.length > 0) {
    const qLower = userQuery.toLowerCase();
    const isAskingAboutUserFarm =
      /(my crop|my farm|my field|how is my|when should i irrigate|meri fasal|apni fasal|hamari fasal|माझी शेती|ਮੇਰੀ ਫ਼ਸਲ)/i.test(qLower) ||
      userContext.crops.some((c) => qLower.includes(c.cropName.toLowerCase()));

    if (isAskingAboutUserFarm) {
      const cropList = userContext.crops
        .map((c) => `• ${c.cropName} (${c.variety || "Standard variety"}): ${c.acreage} acres - ${c.growthStage} stage${c.sowingDate ? ` (Sown: ${new Date(c.sowingDate).toLocaleDateString()})` : ""}`)
        .join("\n");

      if (lang === "hi") {
        return `नमस्ते ${userContext.farmerName}! आपके पंजीकृत कृषि प्रोफाइल के अनुसार:
📍 स्थान: ${userContext.location} (${userContext.farmSize} ${userContext.farmSizeUnit})
🌱 आपकी पंजीकृत फसलें:
${cropList}

${
  userContext.recentDiseases.length > 0
    ? `⚠️ हाल ही में दर्ज रोग रिपोर्ट:
${userContext.recentDiseases.map((d) => `• ${d.detectedDisease} (${d.severity} तीव्रता)`).join("\n")}
💡 सलाह: प्रभावित पत्तियों को हटाएँ, हवा का संचार सुधारे और आवश्यकतानुसार अनुशंसित जैविक/रासायनिक उपचार करें।`
    : `💡 सलाह: आपकी फसलें वर्तमान अवस्था में सामान्य बढ़वार पर हैं। क्रांतिक अवस्थाओं पर ही आवश्यकतानुसार सिंचाई व संतुलित खाद (NPK) दें।`
}`;
      }

      return `Hello ${userContext.farmerName}! Based on your registered farm profile:
📍 Location: ${userContext.location} (${userContext.farmSize} ${userContext.farmSizeUnit})
🌱 Your Registered Crops:
${cropList}

${
  userContext.recentDiseases.length > 0
    ? `⚠️ Recent On-Farm Disease Reports:
${userContext.recentDiseases.map((d) => `• ${d.detectedDisease} (${d.severity} severity)`).join("\n")}
💡 Advisory: Ensure good row ventilation, sanitize infected foliage, and apply approved IPM remedies.`
    : `💡 Advisory: Your active crops are progressing well. Adhere to split fertilizer applications and stage-specific irrigation.`
}`;
    }
  }

  // 1. GREETING INTENT
  if (intent === "greeting") {
    if (lang === "hi") {
      return `नमस्ते किसान साथी! मैं AgroSaathi (एग्रोसाथी) AI सहायक हूँ।

आज आपकी खेती और फसल में मैं कैसे सहायता कर सकता हूँ? आप मुझसे पूछ सकते हैं:
1. 🌾 फसलों की बुवाई, उन्नत किस्में और उपयुक्त मौसम
2. 🔬 फसल रोगों (झुलसा, रतुआ, मरोड़िया) की पहचान व जैविक/रासायनिक उपचार
3. 🧪 संतुलित खाद (यूरिया, DAP, MOP, NPK) का सही समय व मात्रा
4. 💧 फसलों की क्रांतिक अवस्थाओं पर सिंचाई का समय
5. 🏛️ सरकारी योजनाएं (PM-किसान, फसल बीमा योजना, किसान क्रेडिट कार्ड)

कृपया अपनी फसल, समस्या या प्रश्न नीचे लिखें!`;
    }
    if (lang === "mr") {
      return `नमस्कार शेतकरी मित्रा! मी AgroSaathi (ॲग्रोसाथी) शेती सल्लागार एआय सहाय्यक आहे.

मी आपल्याला पुढील बाबींमध्ये मदत करू शकतो:
1. 🌾 पिकांची लागवड, वाण आणि हंगाम नियोजन
2. 🔬 कीड व रोग नियंत्रण (जैविक आणि CIBRC प्रमाणित उपाय)
3. 🧪 खत व्यवस्थापन (NPK, युरिया, डीएपी)
4. 💧 पाणी व्यवस्थापन आणि ठिबक सिंचन
5. 🏛️ सरकारी योजना (पीएम किसान, पीक विमा, केसीसी)

आपला प्रश्न खाली विचारा!`;
    }
    if (lang === "pa") {
      return `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! ਮੈਂ AgroSaathi (ਐਗਰੋਸਾਥੀ) ਖੇਤੀਬਾੜੀ ਸਹਾਇਕ ਹਾਂ।

ਮੈਂ ਤੁਹਾਡੀ ਖੇਤੀ ਵਿੱਚ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ? ਤੁਸੀਂ ਮੈਨੂੰ ਪੁੱਛ ਸਕਦੇ ਹੋ:
1. 🌾 ਫ਼ਸਲਾਂ ਦੀ ਬਿਜਾਈ ਅਤੇ ਸਹੀ ਕਿਸਮਾਂ
2. 🔬 ਕੀੜੇ-ਮਕੌੜਿਆਂ ਅਤੇ ਬਿਮਾਰੀਆਂ ਦੀ ਰੋਕਥਾਮ
3. 🧪 ਖ਼ਾਦਾਂ (ਯੂਰੀਆ, ਡੀ.ਏ.ਪੀ.) ਦੀ ਸਹੀ ਮਾਤਰਾ
4. 💧 ਸਿੰਚਾਈ ਦੇ ਜ਼ਰੂਰੀ ਸਮੇਂ
5. 🏛️ ਸਰਕਾਰੀ ਸਕੀਮਾਂ (ਪੀਐਮ-ਕਿਸਾਨ, ਫਸਲ ਬੀਮਾ, ਕੇਸੀਸੀ)

ਆਪਣਾ ਸਵਾਲ ਹੇਠਾਂ ਲਿਖੋ!`;
    }
    return `Hello Farmer! I am AgroSaathi AI Sahayak, your dedicated agricultural assistant.

How can I assist your farm operations today? You can ask me about:
1. 🌾 Crop agronomy, sowing windows, seed rates, and recommended varieties
2. 🔬 Foliar disease identification, symptoms, and ICAR-approved IPM remedies
3. 🧪 Balanced fertilizer schedules (NPK, Urea, DAP) and soil health
4. 💧 Irrigation scheduling and water-critical growth stages
5. 🏛️ Central agricultural schemes (PM-KISAN, PMFBY Crop Insurance, KCC)

Feel free to mention your crop, symptoms, or any question!`;
  }

  // 2. GOVERNMENT SCHEMES INTENT
  if (intent === "scheme" && matchedScheme) {
    if (lang === "hi") {
      return `किसान साथी, "${matchedScheme.hindiName}" (${matchedScheme.shortName}) का विवरण:

📌 मुख्य लाभ:
${matchedScheme.benefit}

📋 पात्रता (Eligibility):
${matchedScheme.eligibility}

📄 आवश्यक दस्तावेज:
${matchedScheme.documents.map((d) => `• ${d}`).join("\n")}

🔗 आधिकारिक पोर्टल एवं सहायता:
${matchedScheme.officialPortal}

💡 सलाह: आवेदन करने से पहले अपने नजदीकी कॉमन सर्विस सेंटर (CSC) या ब्लॉक कृषि कार्यालय से विवरण सत्यापित अवश्य करें।`;
    }
    return `Here are the official details for ${matchedScheme.name} (${matchedScheme.shortName}):

📌 Key Benefits:
${matchedScheme.benefit}

📋 Eligibility Criteria:
${matchedScheme.eligibility}

📄 Required Documentation:
${matchedScheme.documents.map((d) => `• ${d}`).join("\n")}

🔗 Official Portal & Verification:
${matchedScheme.officialPortal}

💡 Advisory Note: Please verify current active enrollment windows at your nearest Common Service Centre (CSC) or District Agriculture Office.`;
  }

  // 3. FERTILIZER INTENT
  if (intent === "fertilizer" && matchedCrop) {
    if (lang === "hi") {
      return `किसान साथी, ${cropTitle} की फसल के लिए ICAR द्वारा अनुशंसित खाद प्रबंधन:

🧪 मानक उर्वरक मात्रा (प्रति हेक्टेयर):
• नाइट्रोजन (N): ${matchedCrop.standardNpkPerHectare.n} किग्रा/हेक्टेयर
• फास्फोरस (P): ${matchedCrop.standardNpkPerHectare.p} किग्रा/हेक्टेयर
• पोटाश (K): ${matchedCrop.standardNpkPerHectare.k} किग्रा/हेक्टेयर
• जैविक खाद (FYM): ${matchedCrop.fymTonnesPerHectare} टन अच्छी सड़ी गोबर की खाद बुवाई से पहले खेत में मिलाएं।

🌱 खाद देने की सही विधि व समय (Split Schedule):
1. बुवाई के समय (Basal Dose): फास्फोरस और पोटाश की पूरी मात्रा तथा नाइट्रोजन की 1/3 मात्रा (DAP/NPK और MOP के माध्यम से) बुवाई के समय कतारों में दें।
2. पहली टॉप-ड्रेसिंग: पहली सिंचाई के बाद (जैसे गेहूं में CRI अवस्था पर, 21-25 दिन बाद) बची हुई नाइट्रोजन की आधी मात्रा (यूरिया) का बुरकाव करें।
3. दूसरी टॉप-ड्रेसिंग: कल्ले फूटने या फूल आने से ठीक पहले शेष यूरिया दें।

💡 विशेष सलाह: मिट्टी की जांच (मृदा स्वास्थ्य कार्ड) के आधार पर ही खाद की मात्रा तय करें। यदि मिट्टी में जिंक की कमी है तो 25 किग्रा जिंक सल्फेट प्रति हेक्टेयर बुवाई के समय डालें।`;
    }
    return `For ${cropTitle} (${matchedCrop.scientificName}), here is the ICAR standard scientific fertilizer management:

🧪 Standard Nutrient Recommendation (Per Hectare):
• Nitrogen (N): ${matchedCrop.standardNpkPerHectare.n} kg/ha
• Phosphorus (P): ${matchedCrop.standardNpkPerHectare.p} kg/ha
• Potassium (K): ${matchedCrop.standardNpkPerHectare.k} kg/ha
• Organic FYM: ${matchedCrop.fymTonnesPerHectare} tonnes/ha well-decomposed farmyard manure incorporated during final tillage.

🌱 Recommended Split Application Schedule:
1. Basal Application (At Sowing): Apply 100% of Phosphorus (P) and Potassium (K) alongside 30-50% of Nitrogen (via DAP/NPK and MOP) in seed furrows.
2. First Top-Dressing: Apply half of remaining Nitrogen (Urea) immediately after the first critical irrigation (e.g., Crown Root Initiation stage for cereals at 21-25 days).
3. Second Top-Dressing: Broadcast the remaining Urea prior to the panicle initiation or pre-flowering stage.

💡 Micronutrient Alert: If soil testing indicates Zinc deficiency, apply Zinc Sulphate (21%) @ 25 kg/ha at basal preparation. Do not mix Zinc directly with Phosphatic fertilizers (DAP).`;
  }

  // 4. DISEASE & PEST INTENT
  if ((intent === "disease" || matchedDisease) && matchedDisease) {
    if (lang === "hi") {
      return `किसान साथी, "${matchedDisease.disease}" (${matchedDisease.crop}) के लिए ICAR एकीकृत नाशीजीव प्रबंधन (IPM) निर्देश:

🔍 रोग के लक्षण (Diagnostic Symptoms):
${matchedDisease.symptoms}

🌿 जैविक एवं देसी रोकथाम (Cultural & Organic Remedies):
${matchedDisease.organicRemedies.map((r) => `• ${r}`).join("\n")}

💊 CIBRC अनुमोदित रासायनिक उपचार (Chemical Interventions):
${matchedDisease.chemicalRemedies.map((c) => `• ${c}`).join("\n")}

🛡️ खेत प्रबंधन के मुख्य कदम:
${matchedDisease.actions.map((a) => `• ${a}`).join("\n")}

⚠️ चेतावनी: कीटनाशक/फफूंदनाशक का छिड़काव करते समय मास्क व दस्ताने पहनें और हवा की दिशा में ही स्प्रे करें। गंभीर प्रकोप की स्थिति में नजदीकी कृषि विज्ञान केंद्र (KVK) के विशेषज्ञ से सलाह लें।`;
    }
    return `For ${matchedDisease.disease} affecting ${matchedDisease.crop}, here is the verified ICAR Integrated Pest Management (IPM) advisory:

🔍 Diagnostic Symptoms:
${matchedDisease.symptoms}

🌿 Organic & Cultural Control Measures:
${matchedDisease.organicRemedies.map((r) => `• ${r}`).join("\n")}

💊 CIBRC Approved Chemical Interventions:
${matchedDisease.chemicalRemedies.map((c) => `• ${c}`).join("\n")}

🛡️ Field Sanitation & Management Actions:
${matchedDisease.actions.map((a) => `• ${a}`).join("\n")}

⚠️ Caution & Safety: Chemical sprays must strictly follow CIBRC label claims and waiting periods. For critical infestations, confirm diagnostic leaf samples at your local Krishi Vigyan Kendra (KVK).`;
  }

  // 5. IRRIGATION INTENT
  if (intent === "irrigation" && matchedCrop) {
    if (lang === "hi") {
      return `किसान साथी, ${cropTitle} की फसल के लिए सिंचाई एवं जल प्रबंधन:

💧 कुल जल मांग:
• मानक आवश्यकता: ${matchedCrop.totalWaterDemandMm.standard} मिमी (न्यूनतम: ${matchedCrop.totalWaterDemandMm.min} मिमी - अधिकतम: ${matchedCrop.totalWaterDemandMm.max} मिमी)

⏰ जल की दृष्टि से सबसे क्रांतिक अवस्थाएं (Critical Moisture Stages):
${matchedCrop.stages.map((st, i) => `${i + 1}. ${st.defaultName} - ${st.criticalWaterStage ? "⚠️ अति-क्रांतिक (सिंचाई अनिवार्य)" : "मध्यम मांग"}`).join("\n")}

💡 जल संरक्षण सलाह: दोपहर की तेज धूप में सिंचाई से बचें; सुबह या शाम के समय पानी दें। जल बचत के लिए ड्रिप (टपक) या फव्वारा सिंचाई अपनाएं जिससे 30-40% पानी की बचत होती है।`;
    }
    return `For ${cropTitle} (${matchedCrop.scientificName}), here is the irrigation scheduling package:

💧 Water Requirement:
• Standard Total Demand: ${matchedCrop.totalWaterDemandMm.standard} mm (Range: ${matchedCrop.totalWaterDemandMm.min} - ${matchedCrop.totalWaterDemandMm.max} mm)

⏰ Critical Water & Moisture Stress Stages:
${matchedCrop.stages.map((st, i) => `${i + 1}. ${st.defaultName} (${st.criticalWaterStage ? "CRITICAL - Water Stress Severely Cuts Yield" : "Moderate Demand"})`).join("\n")}

💡 Water Efficiency Tips: Avoid mid-day flood irrigation to minimize evaporation loss. Adopt micro-irrigation (Drip/Sprinkler) with surface mulching to conserve root-zone soil moisture.`;
  }

  // 6. SOIL INTENT
  if (intent === "soil" && matchedSoil) {
    if (lang === "hi") {
      return `किसान साथी, ${matchedSoil.name} की विशेषताएं एवं सुधार उपाय:

🌱 मिट्टी का विवरण:
${matchedSoil.description}

📊 मिट्टी की जल एवं भौतिक विशेषताएं:
• जल धारण क्षमता (AWC): ${matchedSoil.awcMmPerMeter} मिमी प्रति मीटर
• जल रिसने की दर (Infiltration): ${matchedSoil.infiltrationRateMmPerHour} मिमी/घंटा
• सामान्य pH मान: ${matchedSoil.typicalPhMin} - ${matchedSoil.typicalPhMax}

💡 सुधार एवं प्रबंधन:
• यदि मिट्टी क्षारीय (Alkaline, pH > 8.0) है, तो जिप्सम (Gypsum) और ढैंचा/सनई की हरी खाद का प्रयोग करें।
• यदि मिट्टी अम्लीय (Acidic, pH < 6.0) है, तो कृषि चूना (Agricultural Lime) मिलाएं।
• मिट्टी की संरचना और जल अवशोषण सुधारने के लिए हर साल 10-12 टन सड़ी गोबर खाद या वर्मीकम्पोस्ट मिलाएं।`;
    }
    return `Soil characteristics and management guidance for ${matchedSoil.name}:

🌱 Soil Overview:
${matchedSoil.description}

📊 Hydrological Properties:
• Available Water Capacity (AWC): ${matchedSoil.awcMmPerMeter} mm/m soil depth
• Infiltration Rate: ${matchedSoil.infiltrationRateMmPerHour} mm/hour
• Typical Soil pH Range: ${matchedSoil.typicalPhMin} - ${matchedSoil.typicalPhMax}

💡 Soil Amendments & Best Practices:
• For alkaline soils (pH > 8.0): Apply agricultural gypsum and green manure crops (Dhaincha/Sesbania).
• For acidic soils (pH < 6.0): Incorporate agricultural lime or dolomite prior to sowing.
• Add 10-12 t/ha well-rotted FYM or vermicompost annually to boost soil organic carbon (SOC) and microbial vitality.`;
  }

  // 7. WEATHER INTENT
  if (intent === "weather" && weatherOutlook) {
    if (lang === "hi") {
      return `📍 ${weatherOutlook.resolvedLocation} के लिए मौसम पूर्वानुमान:

🌡️ वर्तमान स्थिति:
• मौसम: ${weatherOutlook.currentCondition}
• तापमान: ${weatherOutlook.currentTemp}°C | आर्द्रता: ${weatherOutlook.currentHumidity}% | हवा: ${weatherOutlook.currentWindKmh} किमी/घंटा

📅 आगामी 7 दिनों का दृष्टिकोण:
• औसत अधिकतम तापमान: ${weatherOutlook.averageMaxTempNext7Days}°C
• कुल अनुमानित वर्षा: ${weatherOutlook.totalForecastRainMmNext7Days} मिमी

⚠️ कृषि-मौसम जोखिम एवं उपाय:
${weatherOutlook.risks.map((r) => `• ${r.title} (${r.severity.toUpperCase()}): ${r.description} ➔ उपाय: ${r.recommendation}`).join("\n")}`;
    }
    return `📍 Agrometeorological Outlook for ${weatherOutlook.resolvedLocation}:

🌡️ Current Conditions:
• Weather: ${weatherOutlook.currentCondition}
• Temperature: ${weatherOutlook.currentTemp}°C | Humidity: ${weatherOutlook.currentHumidity}% | Wind: ${weatherOutlook.currentWindKmh} km/h

📅 7-Day Forecast Horizon:
• Average High Temperature: ${weatherOutlook.averageMaxTempNext7Days}°C
• Total Projected Rain: ${weatherOutlook.totalForecastRainMmNext7Days} mm

⚠️ Agrometeorological Risks & Recommendations:
${weatherOutlook.risks.map((r) => `• ${r.title} (${r.severity.toUpperCase()}): ${r.description} ➔ Action: ${r.recommendation}`).join("\n")}`;
  }

  // 8. CROP AGRONOMY INTENT
  if (intent === "crop" && matchedCrop) {
    if (lang === "hi") {
      return `किसान साथी, ${cropTitle} (${matchedCrop.scientificName}) की मुख्य कृषि जानकारी:

🌾 मौसम एवं अवधि:
• उपयुक्त मौसम: ${matchedCrop.season.toUpperCase()}
• फसल अवधि: ${matchedCrop.totalDurationDays.standard} दिन (दायरा: ${matchedCrop.totalDurationDays.min}-${matchedCrop.totalDurationDays.max} दिन)

🌡️ तापमान एवं मिट्टी:
• अंकुरण हेतु अनुकूल तापमान: ${matchedCrop.tempRequirements.germinationOptimal}°C (बढ़वार तापमान: ${matchedCrop.tempRequirements.growingOptimalMin}-${matchedCrop.tempRequirements.growingOptimalMax}°C)
• पाला संवेदनशीलता: ${matchedCrop.tempRequirements.frostSensitive ? "हाँ (पाला संवेदनशील)" : "नहीं"}
• उपयुक्त मिट्टी: ${matchedCrop.suitableSoils.join(", ")} (pH: ${matchedCrop.optimalPh.min} - ${matchedCrop.optimalPh.max})

💧 कुल जल मांग: ${matchedCrop.totalWaterDemandMm.standard} मिमी

💡 अधिक जानकारी के लिए आप खाद, सिंचाई, या रोगों के बारे में पूछ सकते हैं!`;
    }
    return `Agronomic summary for ${cropTitle} (${matchedCrop.scientificName}):

🌾 Season & Growth Duration:
• Optimal Cropping Season: ${matchedCrop.season.toUpperCase()}
• Total Growth Duration: ${matchedCrop.totalDurationDays.standard} days (Range: ${matchedCrop.totalDurationDays.min}-${matchedCrop.totalDurationDays.max} days)

🌡️ Climate & Soil Requirements:
• Germination Optimal Temp: ${matchedCrop.tempRequirements.germinationOptimal}°C (Vegetative Growth: ${matchedCrop.tempRequirements.growingOptimalMin}-${matchedCrop.tempRequirements.growingOptimalMax}°C)
• Frost Sensitivity: ${matchedCrop.tempRequirements.frostSensitive ? "Yes (Susceptible to cold snaps)" : "No (Cold tolerant)"}
• Suitable Soils: ${matchedCrop.suitableSoils.join(", ")} (pH Range: ${matchedCrop.optimalPh.min} - ${matchedCrop.optimalPh.max})

💧 Total Crop Water Demand: ${matchedCrop.totalWaterDemandMm.standard} mm

💡 Feel free to ask specific follow-ups regarding fertilizer split schedules, pest management, or critical irrigation stages!`;
  }

  // 9. GENERAL FALLBACK (Grounding Summary)
  if (lang === "hi") {
    return `नमस्ते किसान साथी! AgroSaathi (एग्रोसाथी) के सत्यापित कृषि ज्ञानकोष के अनुसार:

${groundedText}

सलाह: यह जानकारी ICAR (भारतीय कृषि अनुसंधान परिषद) और ओपन-मौसम (Open-Meteo) के प्रमाणित आंकड़ों पर आधारित है। रासायनिक उपचार या खाद की अंतिम मात्रा के लिए अपने नजदीकी कृषि विज्ञान केंद्र (KVK) या ग्राम कृषि अधिकारी से संपर्क करें।`;
  }

  return `Hello Farmer! Based on AgroSaathi's verified agronomic knowledge base:

${groundedText}

Advisory Note: This guidance is based on verified ICAR agronomic research. For field-specific chemical sprays or diagnosis, please consult your nearest Krishi Vigyan Kendra (KVK) or local agricultural officer.`;
}

/**
 * Builds the specialized system instruction prompt for Gemini.
 */
function buildSystemInstructions(
  targetLanguage: SupportedLanguage,
  groundingContext: string,
  userLocation: string,
  userContext?: UserAgriculturalContext | null
): string {
  const languageNames: Record<SupportedLanguage, string> = {
    en: "English",
    hi: "Hindi (हिन्दी)",
    mr: "Marathi (मराठी)",
    pa: "Punjabi (ਪੰਜਾਬੀ)",
  };

  const userContextSection = userContext
    ? `\n=======================================================
AUTHENTICATED FARMER PROFILE & SAVED CROPS (RECORD DATA):
- Farmer Name: ${userContext.farmerName}
- Farm Location: ${userContext.location}
- Total Land Holdings: ${userContext.farmSize} ${userContext.farmSizeUnit}
- Soil Classification: ${userContext.soilType || "Not specified by farmer"}
- Primary Irrigation Method: ${userContext.irrigationMethod || "Not specified by farmer"}
- Farming Experience: ${userContext.farmingExperience ? `${userContext.farmingExperience} years` : "Not specified"}

REGISTERED CROPS IN FARM:
${
  userContext.crops.length === 0
    ? "No crops registered in farm profile yet."
    : userContext.crops
        .map(
          (c, idx) =>
            `${idx + 1}. ${c.cropName}${c.variety ? ` (Variety: ${c.variety})` : ""}: ${c.acreage} acres, Growth Stage: ${c.growthStage}${c.sowingDate ? `, Sowing Date: ${new Date(c.sowingDate).toLocaleDateString()}` : ""}${c.expectedHarvestDate ? `, Expected Harvest: ${new Date(c.expectedHarvestDate).toLocaleDateString()}` : ""}${c.soilType ? `, Soil: ${c.soilType}` : ""}${c.irrigationType ? `, Irrigation: ${c.irrigationType}` : ""}`
        )
        .join("\n")
}

RECENT ON-FARM DISEASE DETECTION LOGS:
${
  userContext.recentDiseases.length === 0
    ? "No prior crop diseases recorded on file."
    : userContext.recentDiseases
        .map(
          (d, idx) =>
            `${idx + 1}. ${d.detectedDisease}${d.scientificName ? ` (${d.scientificName})` : ""} - Severity: ${d.severity}, Diagnosed: ${new Date(d.createdAt).toLocaleDateString()}`
        )
        .join("\n")
}
=======================================================
PERSONALIZATION INSTRUCTIONS:
- When the farmer asks about 'my crop', 'how is my wheat doing?', 'when should I irrigate?', or 'what should I do about the disease detected in my plant?', you MUST specifically reference their registered crops, varieties, acreage, growth stages, or recent disease records from the data above.
- If a crop or farm detail is not in their profile (e.g. asking about a crop they haven't saved), answer clearly and politely ask them for the variety or sowing date rather than fabricating values.`
    : "";

  return `You are "AgroSaathi AI Sahayak" (एग्रोसाथी सहायक), an intelligent, empathetic, humble, and practical agricultural AI assistant for farmers in India.

CORE MISSION & ETHICAL PRINCIPLES:
1. Explanatory Advisory Role: You are a dedicated agricultural advisor. Acknowledge uncertainty whenever field symptoms are ambiguous or require physical laboratory leaf culture.
2. Zero Fabrication & Data Honesty: NEVER fabricate unverified pesticide dosages, unregistered chemical brands, fictitious weather numbers, or false government benefit amounts. If live telemetry or a specific rate is unavailable, clearly state so honestly.
3. Grounding & Evidence: Heavily prioritize the verified ICAR, FAO-56, and official Central Government scheme context provided below.
4. Integrated Pest Management (IPM): Always advocate cultural sanitation, resistant varieties, and bio-control inoculants (Trichoderma, 5% Neem oil / NSKE) before mentioning approved synthetic chemicals. All chemical advice must adhere to CIBRC guidelines.
5. Language & Tone: You MUST converse natively in ${languageNames[targetLanguage]}. Match the farmer's script and dialect. Use respectful, warm terminology (e.g. "किसान साथी", "शेतकरी मित्र", "ਕਿਸਾਨ ਵੀਰੋ").
6. Local Extension Safety Disclaimer: Whenever advising on severe crop diseases, high pest infestations, or synthetic chemicals, recommend cross-verifying with the nearest Krishi Vigyan Kendra (KVK) or District Agriculture Officer.
7. User Context: Farmer is operating in or near "${userLocation}".
${userContextSection}

=======================================================
VERIFIED AGROSAATHI GROUNDED KNOWLEDGE BASE CONTEXT:
${groundingContext}
=======================================================`;
}

/**
 * Call Google Gemini API (Free tier supported models: gemini-1.5-flash, gemini-2.0-flash)
 * with robust offline ICAR knowledge engine fallback.
 */
export async function generateChatbotResponse(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  selectedLanguage: SupportedLanguage,
  farmerLocation = "Jaipur, Rajasthan",
  userContext?: UserAgriculturalContext | null
): Promise<ChatResponsePayload> {
  const lastUserMessage = messages[messages.length - 1]?.content || "";
  const detectedLang = detectIndianLanguage(lastUserMessage, selectedLanguage);
  const voiceCommand = detectVoiceCommand(lastUserMessage);

  // 1. Retrieve verified agronomic grounding context with multi-turn conversation awareness
  const contextResult = await retrieveAgriculturalGrounding(
    lastUserMessage,
    farmerLocation,
    messages.slice(0, -1)
  );

  const { groundedText, citations } = contextResult;

  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  // 2. If no API key configured, use deterministic grounded engine
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
    const fallbackReply = generateDeterministicFallbackReply(
      lastUserMessage,
      contextResult,
      detectedLang,
      userContext
    );

    return {
      reply: fallbackReply,
      language: detectedLang,
      detectedLanguage: detectedLang,
      groundings: citations,
      mode: "knowledge-base",
      commandAction: voiceCommand,
    };
  }

  // 3. Call Google Gemini API via official REST v1beta endpoint
  try {
    const systemPrompt = buildSystemInstructions(
      detectedLang,
      groundedText,
      farmerLocation,
      userContext
    );

    // Map conversation history to Gemini contents format (last 8 turns)
    const contents = messages.slice(-8).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents,
        generationConfig: {
          temperature: 0.3,
          topP: 0.85,
          maxOutputTokens: 800,
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (replyText && replyText.length > 5) {
        return {
          reply: replyText,
          language: detectedLang,
          detectedLanguage: detectedLang,
          groundings: citations,
          mode: "gemini-live",
          commandAction: voiceCommand,
        };
      }
    } else {
      const errText = await response.text();
      console.warn(`Gemini API error (Status ${response.status}):`, errText);
    }
  } catch (err) {
    console.warn("Gemini live call timed out or failed, utilizing grounded knowledge fallback:", err);
  }

  // Fallback if Gemini request encountered rate limits, invalid key, or network timeout
  const fallbackReply = generateDeterministicFallbackReply(
    lastUserMessage,
    contextResult,
    detectedLang,
    userContext
  );

  return {
    reply: fallbackReply,
    language: detectedLang,
    detectedLanguage: detectedLang,
    groundings: citations,
    mode: "knowledge-base",
    commandAction: voiceCommand,
  };
}
