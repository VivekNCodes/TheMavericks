export type AppLanguage = "hinglish" | "hi" | "en";

export interface IrrigationTranslationDictionary {
  // App Header
  appTitle: string;
  appSubtitle: string;
  appTag: string;
  quickPresetsLabel: string;
  presetJaipurTomato: string;
  presetJaipurWheat: string;
  presetSanganerChili: string;
  customScenarioActive: string;
  verifyEngineBtn: string;
  dismissBtn: string;
  testsPassedNotice: string;

  // Farm Details Section 1
  farmDetailsTitle: string;
  farmDetailsSub: string;
  editDetailsBtn: string;
  closeEditorBtn: string;
  fieldLocationLabel: string;
  cropAndStageLabel: string;
  fieldAreaLabel: string;
  methodAndWaterLabel: string;
  availableWord: string;
  bighaConversionNote: string;

  // Quick Editor Form
  editorTitle: string;
  selectCropLabel: string;
  selectStageLabel: string;
  enterAreaLabel: string;
  selectMethodLabel: string;
  waterBudgetLabel: string;
  flowRateLabel: string;
  saveAndApplyBtn: string;

  // Crop & Stage Names
  cropTomato: string;
  cropWheat: string;
  cropChili: string;
  cropPotato: string;

  stageFlowering: string;
  stageVegetative: string;
  stageFruitFormation: string;
  stageGrainFilling: string;

  methodDrip: string;
  methodSprinkler: string;
  methodFlood: string;

  unitAcre: string;
  unitBigha: string;
  unitHectare: string;

  // Today's Decision Section 2
  todaysAdviceTitle: string;
  decisionIrrigateHeadline: string;
  decisionIrrigateSubtitle: (crop: string, stage: string) => string;
  decisionRainDelayHeadline: string;
  decisionRainDelaySubtitle: string;
  decisionCheckSoilHeadline: string;
  decisionCheckSoilSubtitle: string;
  budgetFeasibleBadge: string;
  budgetFeasibleSub: string;

  // Water & Pump Plan Section 3
  waterPlanTitle: string;
  waterPlanSub: string;
  periodLabel: string;
  recommendedWaterLabel: string;
  litersUnit: string;
  budgetUtilizationLabel: string;
  pumpRuntimeLabel: string;
  deliveryRateLabel: string;
  litersPerHourUnit: string;
  preferredTimingLabel: string;
  preferredTimingValue: string;
  middaySunWarning: string;
  waterReconciliationTitle: string;
  waterReconciliationSub: string;
  estimatedNeedLabel: string;
  allocatedWaterLabel: string;
  availableBudgetLabel: string;
  budgetShortfallLabel: string;
  waterSurplusLabel: string;
  invariantGuaranteeText: (budget: string) => string;

  // Weather Section 4
  weatherSectionTitle: string;
  weatherSectionSub: string;
  weatherWarningNotice: string;
  retryBtn: string;
  loadingStatus: string;
  emptyForecastMsg: string;

  // Irrigation Calendar Section 5 (Replaces old expert link)
  calendarSectionTitle: string;
  calendarSectionSub: string;
  colDay: string;
  colScheduledWater: string;
  colPumpHours: string;
  colExpectedRain: string;
  colAction: string;
  actionIrrigateToday: string;
  actionIrrigateBooster: string;
  actionRestNoWater: string;
  actionRainWait: string;
  rainForecastText: (mm: number) => string;
  dryWeatherText: string;

  // Action Steps Section 6
  actionStepsTitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: (timeFormatted: string) => string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;

  // Validation & Form Feedback
  invalidBudgetWarning: string;
  changesSavedSuccess: string;

  // Why This Recommendation Section 7
  whyAdviceTitle: string;
  whyAdviceSub: string;
  readMoreBtn: string;
  collapseBtn: string;
  summaryRationaleText: (
    crop: string,
    stage: string,
    soil: string,
    depletionMm: number,
    rawMm: number,
    budgetLiters: string,
    scheduleName: string,
    score: number
  ) => string;
  phenologyReasonText: (crop: string, stage: string, budget: string) => string;
  transparencyTitle: string;
  soilModelDisclaimer: string;
  rainUncertaintyDisclaimer: string;
  yieldDisclaimer: string;
}

export const IRRIGATION_TRANSLATIONS: Record<AppLanguage, IrrigationTranslationDictionary> = {
  // 1. Hinglish (Conversational wording - Default)
  hinglish: {
    appTitle: "KrishiSetu Smart Irrigation Advisor",
    appSubtitle: "Mausam aur paani ke hisaab se 5 seconds mein sahi irrigation faisla",
    appTag: "Farmer-Friendly Mode",
    quickPresetsLabel: "Quick Presets (Namuna):",
    presetJaipurTomato: "Jaipur Tomato (1 Acre, 40k L)",
    presetJaipurWheat: "Jaipur Wheat (2 Acres, 90k L)",
    presetSanganerChili: "Sanganer Chili (0.5 Acre, 25k L)",
    customScenarioActive: "Custom Field Scenario",
    verifyEngineBtn: "Engine Math Check",
    dismissBtn: "Close",
    testsPassedNotice: "Calculation Engine Verification: Sabhi 36 Invariant Tests Pass",

    farmDetailsTitle: "1. Khet Ka Details (Farm Info)",
    farmDetailsSub: "Crop, area aur available paani ki jankari",
    editDetailsBtn: "Details Badlein",
    closeEditorBtn: "Band Karein",
    fieldLocationLabel: "Location (Sthan)",
    cropAndStageLabel: "Crop Aur Stage",
    fieldAreaLabel: "Khet Ka Size (Area)",
    methodAndWaterLabel: "Method Aur Paani Budget",
    availableWord: "available",
    bighaConversionNote: "Regional Standard: 1 Bigha ≈ 0.625 Acre (2,529 sq.m / 0.253 Hectare) ke hisaab se calculated hai.",

    editorTitle: "Khet Ki Details Update Karein:",
    selectCropLabel: "Crop Chunein:",
    selectStageLabel: "Fasal Ki Stage (Avastha):",
    enterAreaLabel: "Khet Ka Area:",
    selectMethodLabel: "Irrigation Ka Method:",
    waterBudgetLabel: "Available Paani (Liters):",
    flowRateLabel: "Pump Delivery Capacity (L/hr):",
    saveAndApplyBtn: "Save Aur Update Karein",

    cropTomato: "Tomato (Tamatar)",
    cropWheat: "Wheat (Gehun)",
    cropChili: "Chili (Mirch)",
    cropPotato: "Potato (Aloo)",

    stageFlowering: "Flowering (Phool Aana)",
    stageVegetative: "Vegetative (Badhwar)",
    stageFruitFormation: "Fruit Formation (Fal Banna)",
    stageGrainFilling: "Grain Filling (Daana Bharna)",

    methodDrip: "Drip Irrigation (90% efficiency)",
    methodSprinkler: "Sprinkler System (75% efficiency)",
    methodFlood: "Flood / Khula Paani (60% efficiency)",

    unitAcre: "Acre (Ekad)",
    unitBigha: "Bigha",
    unitHectare: "Hectare",

    todaysAdviceTitle: "2. Aaj Ka Main Faisla (Today's Decision)",
    decisionIrrigateHeadline: "Aaj Irrigation Karein",
    decisionIrrigateSubtitle: (crop, stage) =>
      `Aapki ${crop} abhi ${stage} stage par hai. Recommended paani dein taaki crop stress na ho.`,
    decisionRainDelayHeadline: "Baarish Ki Sambhavna - Dobara Check Karein",
    decisionRainDelaySubtitle:
      "Agle 24-48 hours mein baarish expected hai. Paani aur bijli bachane ke liye aaj paani na dein.",
    decisionCheckSoilHeadline: "Pehle Mitti Ki Nami Check Karein",
    decisionCheckSoilSubtitle:
      "Root zone mein abhi safe nami ho sakti hai. Pump chalane se pehle field mein mitti touch karke check karein.",
    budgetFeasibleBadge: "Available Budget Ke Andar 100% Safe",
    budgetFeasibleSub: "Kam paani mein maximum crop protection",

    waterPlanTitle: "3. Paani Aur Pump Ka Plan (Water & Pump)",
    waterPlanSub: "Recommended paani ki quantity aur pump chalane ka time",
    periodLabel: "Agle 5 dino ke liye",
    recommendedWaterLabel: "Recommended Paani",
    litersUnit: "Liters",
    budgetUtilizationLabel: "Available Budget Ka Use:",
    pumpRuntimeLabel: "Pump Chalane Ka Time",
    deliveryRateLabel: "Pump Capacity: ",
    litersPerHourUnit: " L/hr",
    preferredTimingLabel: "Sahi Time (Preferred Timing)",
    preferredTimingValue: "Subah 6:00 se 9:00 AM ya shaam 4:30 PM ke baad",
    middaySunWarning: "Dopahar ki dhoop mein paani na dein (evaporation loss)",
    waterReconciliationTitle: "Paani Ka Hisaab (Water Reconciliation):",
    waterReconciliationSub: "Crop ki zaroorat vs available paani limit",
    estimatedNeedLabel: "Crop Ki Total Zaroorat:",
    allocatedWaterLabel: "Plan Mein Diya Gaya Paani:",
    availableBudgetLabel: "Aapke Paani Ka Budget:",
    budgetShortfallLabel: "Paani Ki Kami (Shortage):",
    waterSurplusLabel: "Paani Ki Bachat (Surplus):",
    invariantGuaranteeText: (budget) =>
      `Yeh plan aapke available paani (${budget} L) se zyada paani kabhi allocate nahi karega.`,

    weatherSectionTitle: "Local Mausam Aur Baarish Ka Forecast",
    weatherSectionSub: "Open-Meteo Satellite Feed",
    weatherWarningNotice:
      "Mausam Notice: Live satellite data connect nahi ho saka. Average climate data use ho raha hai. Irrigation se pehle field aur aasmaan zaroor check karein.",
    retryBtn: "Try Again",
    loadingStatus: "Loading ho raha hai...",
    emptyForecastMsg: "Forecast data load nahi ho paya. Dobara try karein.",

    calendarSectionTitle: "4. 5-Dino Ka Irrigation Calendar (Schedule)",
    calendarSectionSub: "Kis din kitna paani dena hai aur pump kitna chalana hai",
    colDay: "Din / Date",
    colScheduledWater: "Paani Quantity",
    colPumpHours: "Pump Time",
    colExpectedRain: "Expected Baarish",
    colAction: "Sallah (Action)",
    actionIrrigateToday: "Aaj Paani Dein",
    actionIrrigateBooster: "Booster Paani Dein",
    actionRestNoWater: "Rest (No Water)",
    actionRainWait: "Baarish Ka Wait",
    rainForecastText: (mm) => `🌧 ${mm} mm baarish`,
    dryWeatherText: "☀ 0 mm baarish (Dry)",

    actionStepsTitle: "5. Agle Zaroori Kadam (Action Steps)",
    step1Title: "Pipes Aur Filters Check Karein",
    step1Desc: "Pump chalu karne se pehle filters clean karein taaki poore khet mein barabar paani pahuche.",
    step2Title: "Time Par Pump Band Karein",
    step2Desc: (timeFormatted) =>
      `Pump ko lagbhag ${timeFormatted} hi chalayein. Zyada paani se khad aur nutrients beh jaate hain.`,
    step3Title: "Baarish Hone Par Pump Turant Rokein",
    step3Desc: "Forecast badal sakta hai. Agar natural baarish shuru ho jaye toh pump turant band karein.",
    step4Title: "Khet Mein Mitti Ki Nami Check Karein",
    step4Desc: "Agle din 4-6 inch gehri mitti haath mein lekar check karein. Agar laddu banta hai toh nami theek hai.",

    invalidBudgetWarning: "Paani ka budget kam se kam 1,000 Liters hona zaroori hai.",
    changesSavedSuccess: "Khet ki details save ho gayi hain!",

    whyAdviceTitle: "6. Yeh Sallah Kyu Di Gayi Hai? (Explanation)",
    whyAdviceSub: "Aasan bhasha mein agronomic reason aur limits",
    readMoreBtn: "Details Padhein",
    collapseBtn: "Band Karein",
    summaryRationaleText: (crop, stage, soil, depletionMm, rawMm, budgetLiters, scheduleName, score) =>
      `Aapki ${crop} ki fasal ${soil} mitti par abhi ${stage} stage par hai. Roots mein anumaanit paani ki kami ${depletionMm} mm pahunch chuki hai (RAW buffer limit: ${rawMm} mm). Aapke paas available ${budgetLiters} L paani ke budget mein, "${scheduleName}" schedule sabse best score (${score}/100) par chuna gaya hai taaki fasal ko stress na ho aur paani bhi na khatam ho.`,
    phenologyReasonText: (crop, stage, budget) =>
      `Aapki ${crop} abhi ${stage} stage par hai. Available budget (${budget} L) ke andar crop ko stress se bachane ke liye yeh schedule choose kiya gaya hai.`,
    transparencyTitle: "Zaroori Baatein Aur Limits (Transparency):",
    soilModelDisclaimer:
      "Mitti Ki Nami: Yeh mathematical model estimate hai (sensor reading nahi). Last irrigation date se calculate kiya gaya hai.",
    rainUncertaintyDisclaimer:
      "Baarish Ki Uncertainty: Forecast 100% guarantee nahi hota. 2mm se kam baarish mitti tak nahi pahuchti.",
    yieldDisclaimer:
      "Yield Guarantee: Sahi irrigation crop ko bachata hai, par final yield khad, beej aur pest management par bhi depend karta hai.",
  },

  // 2. Hindi (Devanagari script)
  hi: {
    appTitle: "कृषि-सेतु स्मार्ट सिंचाई सलाहकार",
    appSubtitle: "मौसम और उपलब्ध पानी के अनुसार 5 सेकंड में सही सिंचाई का निर्णय लें",
    appTag: "किसान-हितैषी संस्करण",
    quickPresetsLabel: "त्वरित नमूना परिदृश्य:",
    presetJaipurTomato: "जयपुर टमाटर (1 एकड़, 40k ली)",
    presetJaipurWheat: "जयपुर गेहूं (2 एकड़, 90k ली)",
    presetSanganerChili: "सांगानेर मिर्च (0.5 एकड़, 25k ली)",
    customScenarioActive: "कस्टम परिदृश्य सक्रिय",
    verifyEngineBtn: "गणना इंजन परीक्षण",
    dismissBtn: "हटाएं",
    testsPassedNotice: "गणना इंजन सत्यापन: सभी 36 परीक्षण सफल रहे",

    farmDetailsTitle: "1. खेत का विवरण",
    farmDetailsSub: "फसल, क्षेत्रफल और उपलब्ध पानी की जानकारी",
    editDetailsBtn: "विवरण बदलें",
    closeEditorBtn: "बंद करें",
    fieldLocationLabel: "स्थान",
    cropAndStageLabel: "फसल और अवस्था",
    fieldAreaLabel: "खेत का क्षेत्रफल",
    methodAndWaterLabel: "सिंचाई साधन व बजट",
    availableWord: "उपलब्ध",
    bighaConversionNote: "क्षेत्रीय मानक: 1 बीघा ≈ 0.625 एकड़ (2,529 वर्ग मीटर / 0.253 हेक्टेयर) मानकर गणना की गई है।",

    editorTitle: "खेत का विवरण अपडेट करें:",
    selectCropLabel: "फसल चुनें:",
    selectStageLabel: "फसल की अवस्था:",
    enterAreaLabel: "खेत का क्षेत्रफल:",
    selectMethodLabel: "सिंचाई का साधन:",
    waterBudgetLabel: "उपलब्ध पानी (लीटर):",
    flowRateLabel: "पंप की क्षमता (लीटर/घंटा):",
    saveAndApplyBtn: "अपडेट करें और सलाह देखें",

    cropTomato: "टमाटर (Tomato)",
    cropWheat: "गेहूं (Wheat)",
    cropChili: "मिर्च (Chili)",
    cropPotato: "आलू (Potato)",

    stageFlowering: "फूल आना (Flowering)",
    stageVegetative: "वानस्पतिक बढ़वार (Vegetative)",
    stageFruitFormation: "फल विकास (Fruit Formation)",
    stageGrainFilling: "दाना भराव (Grain Filling)",

    methodDrip: "ड्रिप (टपक सिंचाई - 90% दक्षता)",
    methodSprinkler: "फव्वारा सिंचाई (75% दक्षता)",
    methodFlood: "खुला पानी / क्यारी (60% दक्षता)",

    unitAcre: "एकड़ (Acre)",
    unitBigha: "बीघा (Bigha)",
    unitHectare: "हेक्टेयर (Ha)",

    todaysAdviceTitle: "2. आज की मुख्य सलाह",
    decisionIrrigateHeadline: "आज सिंचाई करें",
    decisionIrrigateSubtitle: (crop, stage) =>
      `आपकी फसल ${crop} (${stage}) अवस्था में है। अनुशंसित पानी दें ताकि फसल में नमी की कमी न हो।`,
    decisionRainDelayHeadline: "बारिश के कारण दोबारा जाँचें",
    decisionRainDelaySubtitle:
      "अगले 24-48 घंटों में बारिश का अनुमान है। पानी और बिजली बचाने के लिए आज सिंचाई टालें।",
    decisionCheckSoilHeadline: "पहले मिट्टी की नमी जाँचें",
    decisionCheckSoilSubtitle:
      "जड़ों में अभी पर्याप्त नमी हो सकती है। पंप चलाने से पहले खेत में 4-6 इंच खुरपी से मिट्टी छूकर देखें।",
    budgetFeasibleBadge: "उपलब्ध पानी के अनुसार पूरी तरह सुरक्षित",
    budgetFeasibleSub: "कम पानी में अधिकतम फसल सुरक्षा",

    waterPlanTitle: "3. पानी और पंप की योजना",
    waterPlanSub: "अनुशंसित पानी की मात्रा और पंप चलाने का समय",
    periodLabel: "अगले 5 दिनों के लिए",
    recommendedWaterLabel: "अनुशंसित पानी",
    litersUnit: "लीटर",
    budgetUtilizationLabel: "उपलब्ध पानी का उपयोग:",
    pumpRuntimeLabel: "पंप चलाने का समय",
    deliveryRateLabel: "पंप क्षमता: ",
    litersPerHourUnit: " ली/घंटा",
    preferredTimingLabel: "सिंचाई का सही समय",
    preferredTimingValue: "सुबह 6:00 से 9:00 बजे या शाम 4:30 के बाद",
    middaySunWarning: "दोपहर की तेज धूप में पानी न दें (वाष्पीकरण हानि)",
    waterReconciliationTitle: "पानी का हिसाब (Water Reconciliation):",
    waterReconciliationSub: "फसल की कुल जरूरत vs उपलब्ध बजट",
    estimatedNeedLabel: "अनुमानित सिंचाई की जरूरत:",
    allocatedWaterLabel: "योजना में दिया गया पानी:",
    availableBudgetLabel: "उपलब्ध पानी का बजट:",
    budgetShortfallLabel: "उपलब्ध पानी की कमी:",
    waterSurplusLabel: "पानी की बचत (अतिरिक्त पानी):",
    invariantGuaranteeText: (budget) =>
      `यह योजना आपके उपलब्ध पानी (${budget} L) से अधिक पानी कभी खर्च नहीं करेगी।`,

    weatherSectionTitle: "स्थानीय मौसम और बारिश का पूर्वानुमान",
    weatherSectionSub: "Open-Meteo उपग्रह डेटा",
    weatherWarningNotice:
      "मौसम चेतावनी: ताज़ा उपग्रह डेटा उपलब्ध नहीं है। ऐतिहासिक जलवायु औसत दिखाया जा रहा है। सिंचाई से पहले खेत में मिट्टी और आसमान अवश्य देखें।",
    retryBtn: "पुनः प्रयास करें",
    loadingStatus: "लोड हो रहा है...",
    emptyForecastMsg: "पूर्वानुमान डेटा उपलब्ध नहीं है। कृपया पुनः प्रयास करें।",

    calendarSectionTitle: "4. 5-दिवसीय सिंचाई कैलेंडर (दिन-प्रतिदिन योजना)",
    calendarSectionSub: "किस दिन कितना पानी देना है और पंप कितने समय चलाना है",
    colDay: "दिन / तारीख",
    colScheduledWater: "सिंचाई का पानी",
    colPumpHours: "पंप समय",
    colExpectedRain: "संभावित बारिश",
    colAction: "सलाह",
    actionIrrigateToday: "आज पानी दें",
    actionIrrigateBooster: "बूस्टर सिंचाई",
    actionRestNoWater: "सिंचाई नहीं (विश्राम)",
    actionRainWait: "बारिश का इंतज़ार",
    rainForecastText: (mm) => `🌧 ${mm} मिमी वर्षा`,
    dryWeatherText: "☀ 0 मिमी वर्षा (मौसम साफ़)",

    actionStepsTitle: "5. किसान के लिए अगले जरूरी कदम",
    step1Title: "पाइप और फिल्टर की जाँच करें",
    step1Desc: "पंप शुरू करने से पहले ड्रिप या स्प्रिंकलर के फिल्टर साफ करें ताकि पूरे खेत में समान दबाव से पानी पहुँचे।",
    step2Title: "समय पर पंप बंद करें",
    step2Desc: (timeFormatted) =>
      `पंप को केवल अनुशंसित समय (${timeFormatted}) तक ही चलाएं। अधिक पानी बहने से खाद और पोषक तत्वों का नुकसान होता है।`,
    step3Title: "बारिश होने पर तुरंत पंप रोकें",
    step3Desc: "मौसम का पूर्वानुमान बदल सकता है। यदि बारिश शुरू हो जाए तो तुरंत पंप बंद करके पानी और बिजली बचाएं।",
    step4Title: "खेत में नमी की जाँच करें",
    step4Desc: "सिंचाई के अगले दिन खुरपी से 4 से 6 इंच गहरी मिट्टी उठाकर मुट्ठी बांधें। यदि लड्डू बनता है तो नमी पर्याप्त है।",

    invalidBudgetWarning: "पानी का बजट कम से कम 1,000 लीटर होना आवश्यक है।",
    changesSavedSuccess: "खेत का विवरण सफलतापूर्वक सहेजा गया!",

    whyAdviceTitle: "6. यह सलाह क्यों दी गई है? (विस्तृत कारण)",
    whyAdviceSub: "सरल भाषा में वैज्ञानिक कारण और सीमाएं",
    readMoreBtn: "विस्तार से पढ़ें",
    collapseBtn: "संक्षेप में देखें",
    summaryRationaleText: (crop, stage, soil, depletionMm, rawMm, budgetLiters, scheduleName, score) =>
      `आपकी ${crop} की फसल ${soil} मिट्टी में वर्तमान में ${stage} अवस्था में है। जड़ क्षेत्र में अनुमानित पानी की कमी ${depletionMm} मिमी हो चुकी है (सुरक्षित सीमा: ${rawMm} मिमी)। आपके उपलब्ध ${budgetLiters} लीटर पानी के बजट को ध्यान में रखते हुए, "${scheduleName}" अनुसूची को सर्वाधिक अंक (${score}/100) मिले हैं। यह योजना फसल की नाजुक अवस्था को पानी देकर बचाती है और आपके बजट का उल्लंघन नहीं करती।`,
    phenologyReasonText: (crop, stage, budget) =>
      `आपकी फसल ${crop} अभी ${stage} अवस्था में है। उपलब्ध बजट (${budget} L) के अंदर फसल को नमी के तनाव से बचाते हुए यह योजना चुनी गई है।`,
    transparencyTitle: "पारदर्शिता और महत्वपूर्ण सीमाएं:",
    soilModelDisclaimer:
      "मिट्टी की नमी: यह एक गणितीय मॉडल अनुमान है (सेंसर रीडिंग नहीं)। पिछली सिंचाई की तारीख से वाष्पीकरण जोड़कर इसका अनुमान लगाया गया है।",
    rainUncertaintyDisclaimer:
      "बारिश की अनिश्चितता: पूर्वानुमानित वर्षा 100% सुनिश्चित नहीं होती। 2 मिमी से कम बारिश पौधों की जड़ों तक नहीं पहुँच पाती।",
    yieldDisclaimer:
      "पैदावार गारंटी: सही सिंचाई फसल को सूखने से बचाती है, परंतु कुल पैदावार खाद, बीज और कीट नियंत्रण पर भी निर्भर करती है।",
  },

  // 3. English
  en: {
    appTitle: "KrishiSetu Smart Irrigation Scheduler",
    appSubtitle: "Weather-calibrated water budgeting and instant 5-second irrigation decisions",
    appTag: "Farmer-First Edition",
    quickPresetsLabel: "Quick Benchmark Scenarios:",
    presetJaipurTomato: "Jaipur Tomato (1 Acre, 40k L)",
    presetJaipurWheat: "Jaipur Wheat (2 Acres, 90k L)",
    presetSanganerChili: "Sanganer Chili (0.5 Acre, 25k L)",
    customScenarioActive: "Custom Scenario Active",
    verifyEngineBtn: "Verify Engine Math",
    dismissBtn: "Dismiss",
    testsPassedNotice: "Calculation Engine Verification: All 36 Invariant Tests Passed",

    farmDetailsTitle: "1. Farm Details",
    farmDetailsSub: "Crop, field area and water availability",
    editDetailsBtn: "Edit Details",
    closeEditorBtn: "Close Editor",
    fieldLocationLabel: "Location",
    cropAndStageLabel: "Crop & Growth Stage",
    fieldAreaLabel: "Field Size",
    methodAndWaterLabel: "Method & Water Budget",
    availableWord: "available",
    bighaConversionNote: "Regional Standard: 1 Bigha ≈ 0.625 Acre (2,529 m² / 0.253 Hectare).",

    editorTitle: "Update Farm Details:",
    selectCropLabel: "Select Crop:",
    selectStageLabel: "Growth Stage:",
    enterAreaLabel: "Field Area:",
    selectMethodLabel: "Irrigation Method:",
    waterBudgetLabel: "Available Water (Liters):",
    flowRateLabel: "Pump Delivery Rate (L/hr):",
    saveAndApplyBtn: "Save and Recalculate",

    cropTomato: "Tomato",
    cropWheat: "Wheat",
    cropChili: "Chili",
    cropPotato: "Potato",

    stageFlowering: "Flowering Stage",
    stageVegetative: "Vegetative Stage",
    stageFruitFormation: "Fruit Formation",
    stageGrainFilling: "Grain Filling",

    methodDrip: "Drip Irrigation (90% efficiency)",
    methodSprinkler: "Sprinkler System (75% efficiency)",
    methodFlood: "Surface / Flood (60% efficiency)",

    unitAcre: "Acre",
    unitBigha: "Bigha",
    unitHectare: "Hectare",

    todaysAdviceTitle: "2. Today's Primary Decision",
    decisionIrrigateHeadline: "Irrigate Today",
    decisionIrrigateSubtitle: (crop, stage) =>
      `Your ${crop} crop is in the critical ${stage} stage. Apply recommended water to prevent water stress.`,
    decisionRainDelayHeadline: "Check Weather - Rain Expected",
    decisionRainDelaySubtitle:
      "Rain is forecasted in the next 24-48 hours. Delay irrigation today to conserve water and pumping electricity.",
    decisionCheckSoilHeadline: "Check Soil Moisture First",
    decisionCheckSoilSubtitle:
      "Root zone still retains safe moisture. Inspect top 4–6 inches of soil with a trowel before pumping.",
    budgetFeasibleBadge: "Strictly Feasible Within Available Water",
    budgetFeasibleSub: "Calibrated for harvest protection under water caps",

    waterPlanTitle: "3. Water & Pump Plan",
    waterPlanSub: "Recommended water volume and pump operation schedule",
    periodLabel: "For 5-Day Period",
    recommendedWaterLabel: "Recommended Water",
    litersUnit: "Liters",
    budgetUtilizationLabel: "Budget Utilization:",
    pumpRuntimeLabel: "Pump Runtime",
    deliveryRateLabel: "Delivery Rate: ",
    litersPerHourUnit: " L/hr",
    preferredTimingLabel: "Preferred Timing",
    preferredTimingValue: "Early morning (6:00–9:00 AM) or late afternoon (after 4:30 PM)",
    middaySunWarning: "Avoid peak midday sun (high evaporation loss)",
    waterReconciliationTitle: "Water Balance Reconciliation:",
    waterReconciliationSub: "Gross crop demand vs farm budget limit",
    estimatedNeedLabel: "Estimated Gross Need:",
    allocatedWaterLabel: "Allocated in Plan:",
    availableBudgetLabel: "Available Water Limit:",
    budgetShortfallLabel: "Budget Shortfall:",
    waterSurplusLabel: "Water Surplus:",
    invariantGuaranteeText: (budget) =>
      `Strict Invariant: Scheduled water will never exceed your available budget of ${budget} L.`,

    weatherSectionTitle: "Local Weather & Rainfall Forecast",
    weatherSectionSub: "Open-Meteo Satellite Feed",
    weatherWarningNotice:
      "Weather Notice: Live satellite telemetry unavailable. Displaying historical climatological averages. Please inspect soil and sky before irrigating.",
    retryBtn: "Retry",
    loadingStatus: "Loading...",
    emptyForecastMsg: "Forecast data could not be retrieved. Please retry.",

    calendarSectionTitle: "4. 5-Day Irrigation Calendar (Daily Plan)",
    calendarSectionSub: "Scheduled water volume and operating pump duration per day",
    colDay: "Day / Date",
    colScheduledWater: "Scheduled Water",
    colPumpHours: "Pump Time",
    colExpectedRain: "Expected Rain",
    colAction: "Advice / Action",
    actionIrrigateToday: "Irrigate Today",
    actionIrrigateBooster: "Booster Dose",
    actionRestNoWater: "Rest (No Irrigation)",
    actionRainWait: "Wait for Rain",
    rainForecastText: (mm) => `🌧 ${mm} mm rain`,
    dryWeatherText: "☀ 0 mm rain (Dry)",

    actionStepsTitle: "5. Recommended Action Steps",
    step1Title: "Inspect Filters & Lines",
    step1Desc: "Clean screen/disc filters before pumping to ensure uniform pressure across emitters.",
    step2Title: "Stop Pump on Time",
    step2Desc: (timeFormatted) =>
      `Run pump only for the recommended runtime (${timeFormatted}). Over-irrigation leaches expensive soil nutrients.`,
    step3Title: "Shut Off If Rain Begins",
    step3Desc: "Weather forecasts carry uncertainty. If natural rain starts, turn off the pump immediately.",
    step4Title: "Inspect Soil Moisture by Hand",
    step4Desc: "Next day, squeeze a handful of soil 4–6 inches deep. If it forms a firm ball without dripping, moisture is ideal.",

    invalidBudgetWarning: "Water budget must be at least 1,000 Liters.",
    changesSavedSuccess: "Field details updated successfully!",

    whyAdviceTitle: "6. Why This Recommendation? (Agronomic Rationale)",
    whyAdviceSub: "Plain-language explanation and transparent limits",
    readMoreBtn: "Read Details",
    collapseBtn: "Collapse",
    summaryRationaleText: (crop, stage, soil, depletionMm, rawMm, budgetLiters, scheduleName, score) =>
      `Your ${crop} crop is at the ${stage} stage on ${soil} soil. Estimated root depletion has reached ${depletionMm} mm (RAW buffer limit: ${rawMm} mm). With an available water budget of ${budgetLiters} L, the "${scheduleName}" schedule scored highest (${score}/100) by delivering targeted moisture to critical flower/fruit nodes while strictly respecting your water budget.`,
    phenologyReasonText: (crop, stage, budget) =>
      `Your ${crop} crop is currently in the ${stage} stage. This schedule was selected to optimize crop protection within your available ${budget} L water budget.`,
    transparencyTitle: "Important Transparency Notice:",
    soilModelDisclaimer:
      "Soil Moisture: This is an agronomic model estimate, not a physical sensor reading. It is computed from elapsed days since last irrigation.",
    rainUncertaintyDisclaimer:
      "Rainfall Uncertainty: Weather forecasts carry natural uncertainty. Showers under 2 mm evaporate before infiltrating root zones.",
    yieldDisclaimer:
      "Yield Guarantee: Efficient water budgeting prevents moisture stress, but final yield also depends on fertilizers, seeds, and pest management.",
  },
};
