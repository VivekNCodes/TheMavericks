import { GrowingPlan } from "../types";
import { SupportedLanguage } from "@/i18n/translations";

/**
 * Deterministic natural-language advisory generator.
 * Produces authentic, grounded, farmer-friendly explanations in all 4 languages.
 */
export function generateDeterministicExplanation(
  plan: GrowingPlan,
  lang: SupportedLanguage = "en"
): string {
  const cropName = plan.crop.name;
  const areaStr = `${plan.input.landArea} ${plan.input.areaUnit}`;
  const locationStr = plan.weatherOutlook.resolvedLocation;
  const soilRating = plan.soilAssessment.rating;
  const grossWater = plan.waterBudget.grossIrrigationRequirementMm;
  const intervalDays = plan.waterBudget.estimatedIrrigationIntervalDays;
  const rainNext7Days = plan.weatherOutlook.totalForecastRainMmNext7Days;

  if (lang === "hi") {
    let soilText = "आपकी चुनी गई मिट्टी इस फसल के लिए अनुकूल है।";
    if (soilRating === "ideal") soilText = "आपकी खेत की मिट्टी इस फसल के लिए सर्वोत्तम एवं आदर्श है।";
    else if (soilRating === "marginal" || soilRating === "poor")
      soilText = "आपकी मिट्टी में कुछ सुधार की आवश्यकता है; जैविक खाद (गोबर खाद) का भरपूर उपयोग करें।";

    let rainText =
      rainNext7Days > 5
        ? `अगले 7 दिनों में लगभग ${rainNext7Days} मिमी बारिश का अनुमान है, जिससे आपकी सिंचाई की बचत होगी।`
        : "अगले सप्ताह बारिश की संभावना बहुत कम है, अतः तय समय पर सिंचाई करें।";

    return `नमस्ते किसान साथी! आपके ${locationStr} स्थित ${areaStr} खेत के लिए ${cropName} की विस्तृत बुवाई योजना तैयार है। ${soilText} ${rainText} आपकी चुनी गई सिंचाई विधि के अनुसार प्रति चक्र लगभग ${grossWater} मिमी पानी और हर ${intervalDays} दिन में हल्की सिंचाई की आवश्यकता होगी। बुवाई से पूर्व बीज उपचार अवश्य करें और पहली सिंचाई सीआरआई / प्रारंभिक कल्ले फूटने पर ही दें।`;
  }

  if (lang === "mr") {
    let soilText = "आपली निवडलेली माती या पिकासाठी योग्य आहे.";
    if (soilRating === "ideal") soilText = "आपल्या शेतातील माती या पिकासाठी अत्यंत उत्तम आणि पोषक आहे.";
    else if (soilRating === "marginal" || soilRating === "poor")
      soilText = "मातीमध्ये सुधारणा करण्यासाठी शेणखताचा किंवा सेंद्रिय खताचा वापर करा.";

    let rainText =
      rainNext7Days > 5
        ? `पुढील ७ दिवसांत सुमारे ${rainNext7Days} मिमी पावसाचा अंदाज आहे, ज्यामुळे सिंचनाची बचत होईल.`
        : "पुढील आठवड्यात पावसाची शक्यता कमी आहे, त्यामुळे वेळेवर पाणी द्यावे.";

    return `नमस्कार शेतकरी बंधू! तुमच्या ${locationStr} येथील ${areaStr} क्षेत्रासाठी ${cropName} लागवड आराखडा तयार आहे. ${soilText} ${rainText} सिंचनासाठी दर ${intervalDays} दिवसांनी अंदाजे ${grossWater} मिमी पाणी नियोजन फायदेशीर ठरेल. पेरणीपूर्वी बीजप्रक्रिया नक्की करा.`;
  }

  if (lang === "pa") {
    let soilText = "ਤੁਹਾਡੀ ਜ਼ਮੀਨ ਇਸ ਫ਼ਸਲ ਲਈ ਢੁਕਵੀਂ ਹੈ।";
    if (soilRating === "ideal") soilText = "ਤੁਹਾਡੀ ਜ਼ਮੀਨ ਇਸ ਫ਼ਸਲ ਲਈ ਬਹੁਤ ਵਧੀਆ ਅਤੇ ਉਪਜਾਊ ਹੈ।";

    let rainText =
      rainNext7Days > 5
        ? `ਅਗਲੇ 7 ਦਿਨਾਂ ਵਿੱਚ ਲਗਭਗ ${rainNext7Days} ਮਿ.ਮੀ. ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ਹੈ, ਜਿਸ ਨਾਲ ਪਾਣੀ ਦੀ ਬੱਚਤ ਹੋਵੇਗੀ।`
        : "ਅਗਲੇ ਹਫ਼ਤੇ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ਘੱਟ ਹੈ, ਇਸ ਲਈ ਸਮੇਂ ਸਿਰ ਪਾਣੀ ਲਗਾਓ।";

    return `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! ਤੁਹਾਡੇ ${locationStr} ਦੇ ${areaStr} ਖੇਤ ਲਈ ${cropName} ਦੀ ਬਿਜਾਈ ਯੋਜਨਾ ਤਿਆਰ ਹੈ। ${soilText} ${rainText} ਅੰਦਾਜ਼ਨ ਹਰ ${intervalDays} ਦਿਨਾਂ ਬਾਅਦ ਲਗਭਗ ${grossWater} ਮਿ.ਮੀ. ਪਾਣੀ ਦੀ ਲੋੜ ਪਵੇਗੀ। ਬਿਜਾਈ ਤੋਂ ਪਹਿਲਾਂ ਬੀਜ ਸੋਧ ਜ਼ਰੂਰ ਕਰੋ।`;
  }

  // Default English
  let soilText = "Your selected soil provides a suitable growing foundation.";
  if (soilRating === "ideal")
    soilText = "Your soil characteristics are ideal and well-matched for optimal root penetration and nutrient uptake.";
  else if (soilRating === "marginal" || soilRating === "poor")
    soilText = "Your soil structure requires organic conditioning (FYM / vermicompost) to buffer moisture and nutrient retention.";

  let rainText =
    rainNext7Days > 5
      ? `Forecast indicates approximately ${rainNext7Days} mm of rainfall over the upcoming week, reducing immediate irrigation demand.`
      : "Dry weather is expected over the coming week; ensure timely application of first irrigation.";

  return `Hello Farmer! Here is your custom growing advisory for ${cropName} across ${areaStr} in ${locationStr}. ${soilText} ${rainText} Based on your irrigation method, deliver ~${grossWater} mm gross water depth at approximately ${intervalDays}-day intervals. Ensure seed inoculation with recommended biofertilizers before sowing on ${plan.input.sowingDate}, and apply basal fertilizers at root depth.`;
}

/**
 * Optional AI Explanation using Google Gemini API or local open weights.
 * If an API key is available in process.env.GEMINI_API_KEY, this calls Gemini to rewrite the
 * structured agronomic facts into an empathetic, local spoken farmer dialogue.
 * If no key is set or call fails, gracefully falls back to deterministic template.
 */
export async function getPlanAiExplanation(
  plan: GrowingPlan,
  lang: SupportedLanguage = "en"
): Promise<string> {
  const deterministicText = generateDeterministicExplanation(plan, lang);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return deterministicText;
  }

  try {
    const prompt = `You are KrishiSetu AI, an expert, humble Indian agronomist assisting a farmer.
Explain the following calculated crop plan in simple, warm, actionable language suitable for an Indian farmer in language: ${lang}.
DO NOT invent or alter any of these calculated agronomic facts:
- Crop: ${plan.crop.name} (${plan.crop.scientificName})
- Land area: ${plan.input.landArea} ${plan.input.areaUnit} (${plan.normalizedAreaAcres} acres)
- Sowing Date: ${plan.input.sowingDate}
- Soil Suitability: ${plan.soilAssessment.rating} (Score: ${plan.soilAssessment.score}/100, pH: ${plan.soilAssessment.phValueUsed})
- Next 7-day weather: High ${plan.weatherOutlook.averageMaxTempNext7Days}°C, Rain ${plan.weatherOutlook.totalForecastRainMmNext7Days} mm
- Irrigation Interval: every ${plan.waterBudget.estimatedIrrigationIntervalDays} days, Gross water: ${plan.waterBudget.grossIrrigationRequirementMm} mm
- Key alerts: ${plan.weatherOutlook.risks.map((r) => r.title).join(", ") || "None"}
Keep response concise (3-4 sentences max), encouraging, practical, and in ${lang}.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 250, temperature: 0.3 },
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (aiText && aiText.length > 20) {
        return aiText;
      }
    }
  } catch (e) {
    console.warn("AI explanation call bypassed, using deterministic agronomic guidance:", e);
  }

  return deterministicText;
}
