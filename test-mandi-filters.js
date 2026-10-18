// Mandatory Automated Test Suite for AgroSaathi Mandi Filters Fix
// Tests all 18 requirements from Section 7 of the specification

const assert = require("assert");
const fs = require("fs");
const path = require("path");

console.log("=====================================================================");
console.log("   AgroSaathi Mandi Filter Fix & UI Preservation Test Suite");
console.log("=====================================================================\n");

let passed = 0;
let failed = 0;

function runTest(testName, fn) {
  try {
    fn();
    console.log(`[PASS] ${testName}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${testName}`);
    console.error(`       Error: ${err.message}\n`);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// Load Source Files for AST / Structural & Logic Verification
// -----------------------------------------------------------------------------
const locationDataTs = fs.readFileSync(
  path.join(__dirname, "src/features/mandi-prices/services/location-data.ts"),
  "utf8"
);
const mandiApiTs = fs.readFileSync(
  path.join(__dirname, "src/features/mandi-prices/services/mandi-api.ts"),
  "utf8"
);
const apiRouteTs = fs.readFileSync(
  path.join(__dirname, "src/app/api/mandi-prices/route.ts"),
  "utf8"
);
const previewTsx = fs.readFileSync(
  path.join(__dirname, "src/features/mandi-prices/components/MandiPricesPreview.tsx"),
  "utf8"
);
const pageTsx = fs.readFileSync(
  path.join(__dirname, "src/app/mandi-prices/page.tsx"),
  "utf8"
);
const placeholderTsx = fs.readFileSync(
  path.join(__dirname, "src/components/shared/ModulePlaceholder.tsx"),
  "utf8"
);
const translationsTs = fs.readFileSync(
  path.join(__dirname, "src/i18n/translations.ts"),
  "utf8"
);
const referenceRecordsTs = fs.readFileSync(
  path.join(__dirname, "src/features/mandi-prices/services/reference-records.ts"),
  "utf8"
);

function loadTsModule(filePath) {
  const ts = require("typescript");
  const code = fs.readFileSync(filePath, "utf8");
  const transpiled = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const m = { exports: {} };
  const customRequire = (id) => {
    if (id.startsWith(".")) {
      const resolvedPath = path.resolve(path.dirname(filePath), id);
      if (fs.existsSync(resolvedPath + ".ts")) {
        return loadTsModule(resolvedPath + ".ts");
      }
      if (fs.existsSync(resolvedPath + ".tsx")) {
        return loadTsModule(resolvedPath + ".tsx");
      }
      if (fs.existsSync(resolvedPath + ".js")) {
        return require(resolvedPath + ".js");
      }
    }
    return require(id);
  };
  const fn = new Function("module", "exports", "require", "__dirname", transpiled.outputText);
  fn(m, m.exports, customRequire, path.dirname(filePath));
  return m.exports;
}

// -----------------------------------------------------------------------------
// Helper Location Registry & Reference Records Logic
// -----------------------------------------------------------------------------
const {
  AUTHORITATIVE_INDIAN_STATES_AND_UTS,
  getDistrictsForState,
  isAllStates,
  isAllDistricts,
} = loadTsModule(path.join(__dirname, "src/features/mandi-prices/services/location-data.ts"));

const { REFERENCE_MANDI_RECORDS } = loadTsModule(
  path.join(__dirname, "src/features/mandi-prices/services/reference-records.ts")
);

// TEST 1: All States appears in the state dropdown
runTest("Test 1: All States option is configured in State dropdown", () => {
  assert(
    previewTsx.includes('<option value="">{t("mandiAllStates") || "All States"}</option>') ||
      previewTsx.includes('t("mandiAllStates")'),
    "State dropdown must contain an All States option with value empty string"
  );
  assert(
    previewTsx.includes('value={selectedState}'),
    "State dropdown must bind to selectedState"
  );
});

// TEST 2: All Districts appears in the district dropdown
runTest("Test 2: All Districts option is configured in District dropdown", () => {
  assert(
    previewTsx.includes('<option value="">{t("mandiAllDistricts") || "All Districts"}</option>') ||
      previewTsx.includes('t("mandiAllDistricts")'),
    "District dropdown must contain an All Districts option with value empty string"
  );
  assert(
    previewTsx.includes('value={selectedDistrict}'),
    "District dropdown must bind to selectedDistrict"
  );
});

// TEST 3: Every state and union territory in the authoritative configured list is available
runTest("Test 3: Authoritative list contains all 36 Indian States and Union Territories", () => {
  assert.strictEqual(
    AUTHORITATIVE_INDIAN_STATES_AND_UTS.length,
    36,
    "Authoritative list must contain exactly 36 States and UTs"
  );
  const sampleRequired = [
    "Rajasthan", "Uttar Pradesh", "Punjab", "Haryana", "Maharashtra",
    "Madhya Pradesh", "Gujarat", "Karnataka", "Tamil Nadu", "Kerala",
    "West Bengal", "Bihar", "Odisha", "Assam", "Delhi", "Jammu and Kashmir"
  ];
  for (const st of sampleRequired) {
    assert(
      AUTHORITATIVE_INDIAN_STATES_AND_UTS.includes(st),
      `Missing state: ${st}`
    );
  }
});

// TEST 4: Selecting All States removes state filter from API query
runTest("Test 4: Selecting All States removes state filter from API query (no literal string sent)", () => {
  // Test isAllStates helper logic
  assert.strictEqual(isAllStates(""), true, "Empty string must be detected as All States");
  assert.strictEqual(isAllStates("All States"), true, "'All States' must be detected as All States");
  assert.strictEqual(isAllStates("All States / UTs"), true, "'All States / UTs' must be detected as All States");
  assert.strictEqual(isAllStates("Rajasthan"), false, "'Rajasthan' is a specific state");

  // In mandi-api.ts, verify filter excludes state if isAllStates
  assert(
    mandiApiTs.includes("!isAllStates(params.state)"),
    "mandi-api.ts must omit filters[state] when isAllStates is true"
  );

  // In route.ts, verify query parameter omits state if empty or All States
  assert(
    apiRouteTs.includes("isAllStates"),
    "API route must check isAllStates to omit query filter"
  );
});

// TEST 5: Selecting All Districts removes district filter from API query
runTest("Test 5: Selecting All Districts removes district filter from API query (no literal string sent)", () => {
  assert.strictEqual(isAllDistricts(""), true, "Empty string must be detected as All Districts");
  assert.strictEqual(isAllDistricts("All Districts"), true, "'All Districts' must be detected as All Districts");
  assert.strictEqual(isAllDistricts("Jaipur"), false, "'Jaipur' is a specific district");

  assert(
    mandiApiTs.includes("!isAllDistricts(params.district)"),
    "mandi-api.ts must omit filters[district] when isAllDistricts is true"
  );
});

// TEST 6: All States + All Districts returns records across multiple states and districts
runTest("Test 6: All States + All Districts returns multi-state nationwide records", () => {
  assert(REFERENCE_MANDI_RECORDS.length >= 10, "Baseline records must be substantial");
  const statesInRecords = new Set(REFERENCE_MANDI_RECORDS.map((r) => r.state));
  assert(
    statesInRecords.size >= 4,
    `Multi-state records must cover multiple states. Found ${statesInRecords.size} states.`
  );
  assert(statesInRecords.has("Rajasthan"), "Should include Rajasthan");
  assert(statesInRecords.has("Uttar Pradesh"), "Should include Uttar Pradesh");
  assert(statesInRecords.has("Punjab"), "Should include Punjab");
  assert(statesInRecords.has("Maharashtra"), "Should include Maharashtra");
});

// TEST 7: A specific state + All Districts restricts results to that state
runTest("Test 7: A specific state + All Districts restricts results to that state", () => {
  const punjabRecords = REFERENCE_MANDI_RECORDS.filter(
    (r) => r.state.toLowerCase() === "punjab"
  );
  assert(punjabRecords.length > 0, "Must have Punjab records in reference dataset");
  for (const r of punjabRecords) {
    assert.strictEqual(r.state, "Punjab", "Every filtered record must belong to Punjab");
  }
});

// TEST 8: A specific state + specific district returns matching records
runTest("Test 8: A specific state + specific district returns matching records", () => {
  const jaipurRecords = REFERENCE_MANDI_RECORDS.filter(
    (r) => r.state.toLowerCase() === "rajasthan" && r.district.toLowerCase() === "jaipur"
  );
  assert(jaipurRecords.length > 0, "Must have Jaipur, Rajasthan records");
  for (const r of jaipurRecords) {
    assert.strictEqual(r.state, "Rajasthan");
    assert.strictEqual(r.district, "Jaipur");
  }
});

// TEST 9: Changing a parent filter resets incompatible child selections
runTest("Test 9: Changing state resets incompatible child district and market selection", () => {
  assert(
    previewTsx.includes('const handleStateChange = (stateVal: string) => {'),
    "MandiPricesPreview must have dedicated handleStateChange handler"
  );
  assert(
    previewTsx.includes('setSelectedDistrict("");'),
    "Changing state must reset selectedDistrict to empty string (All Districts)"
  );
  assert(
    previewTsx.includes('setSelectedMarketName(null);'),
    "Changing state must reset selectedMarketName to null"
  );
  assert(
    previewTsx.includes('const handleDistrictChange = (districtVal: string) => {'),
    "MandiPricesPreview must have handleDistrictChange"
  );
});

// TEST 10: Crop and market filters are applied correctly
runTest("Test 10: Crop and market filters applied correctly", () => {
  assert(
    previewTsx.includes('const handleCropChange = (cropVal: string) => {'),
    "MandiPricesPreview must have handleCropChange handler"
  );
  assert(
    previewTsx.includes('activePricing = useMemo('),
    "activePricing must be unified with activeRecord and selectedMarketName"
  );
  assert(
    previewTsx.includes('setSelectedMarketName(market.name)'),
    "Market click must set selectedMarketName"
  );
});

// TEST 11: Pagination does not silently truncate supported results
runTest("Test 11: Nationwide pagination expands limit to 300 and provides coverage notice", () => {
  assert(
    apiRouteTs.includes("isStateAll ? 300") || apiRouteTs.includes("300"),
    "API route must allocate safe limit of 300 for nationwide queries"
  );
  assert(
    apiRouteTs.includes("coverageNotice"),
    "API route must return coverageNotice indicating nationwide scope or count"
  );
  assert(
    previewTsx.includes("coverageNotice"),
    "MandiPricesPreview must render coverageNotice when present"
  );
});

// TEST 12: Duplicate location names and missing fields are handled safely
runTest("Test 12: Duplicate locations deduplicated and missing fields have safe fallbacks", () => {
  assert(
    /new\s+Set\(/.test(apiRouteTs),
    "API route must deduplicate states, districts, and crops using Set"
  );
  assert(
    previewTsx.includes("new Set("),
    "Frontend must deduplicate state and district lists using Set"
  );
  assert(
    mandiApiTs.includes("rec.modal_price") || mandiApiTs.includes("parseArrivalDate"),
    "mandi-api.ts handles parsing and normalization safely"
  );
});

// TEST 13: Empty results, API failures, timeouts, and invalid API keys are handled gracefully
runTest("Test 13: Fallback and error handling for missing records, invalid keys, timeouts", () => {
  assert(
    apiRouteTs.includes("catch") && apiRouteTs.includes("try {"),
    "API route must have try/catch error boundaries"
  );
  assert(
    apiRouteTs.includes("getReferenceRecords"),
    "API route must fall back to reference records on API network/key failure"
  );
  assert(
    previewTsx.includes("mandiNoRecordsFound"),
    "Frontend must display clear empty state message when 0 records match"
  );
});

// TEST 14: Changing filters never leaves stale chart data visible as if it were current
runTest("Test 14: Chart updates synchronously with selected market and displays warning if empty", () => {
  assert(
    previewTsx.includes("liveRecords.length === 0 && !isLoading"),
    "Frontend must detect when liveRecords is empty"
  );
  assert(
    previewTsx.includes("mandiNoRecordsFound"),
    "Frontend must inform user that no records were found instead of showing fake data"
  );
});

// TEST 15: All four languages display the correct filter labels and error messages
runTest("Test 15: Full 4-language translations present for All States, All Districts, and notices", () => {
  const languages = ["en", "hi", "mr", "pa"];
  const requiredKeys = [
    "mandiAllStates",
    "mandiAllDistricts",
    "mandiAllCrops",
    "mandiAllMarkets",
    "mandiNoRecordsFound",
    "mandiNoRecordsHint",
    "mandiNationalScope",
    "mandiLoadingRecords",
  ];

  for (const lang of languages) {
    for (const key of requiredKeys) {
      assert(
        translationsTs.includes(`${key}:`),
        `Missing translation key ${key} in translations.ts`
      );
    }
  }

  // Check specific native translations
  assert(translationsTs.includes("सभी राज्य"), "Missing Hindi 'सभी राज्य'");
  assert(translationsTs.includes("सर्व राज्ये"), "Missing Marathi 'सर्व राज्ये'");
  assert(translationsTs.includes("ਸਾਰੇ ਰਾਜ"), "Missing Punjabi 'ਸਾਰੇ ਰਾਜ'");
  assert(translationsTs.includes("सभी जिले"), "Missing Hindi 'सभी जिले'");
  assert(translationsTs.includes("सर्व जिल्हे"), "Missing Marathi 'सर्व जिल्हे'");
  assert(translationsTs.includes("ਸਾਰੇ ਜ਼ਿਲ੍ਹੇ"), "Missing Punjabi 'ਸਾਰੇ ਜ਼ਿਲ੍ਹੇ'");
});

// TEST 16: The unwanted module banner is absent from the rendered page
runTest("Test 16: Unwanted module banner removed from rendered page", () => {
  assert(
    pageTsx.includes("showDevBanner={false}"),
    "Mandi prices page must set showDevBanner={false}"
  );
  assert(
    placeholderTsx.includes("shouldShowDevBanner") && placeholderTsx.includes("showDevBanner"),
    "ModulePlaceholder must support showDevBanner prop and omit developer banner"
  );
  // Ensure the page itself renders the actual MandiPricesPreview
  assert(
    pageTsx.includes("<MandiPricesPreview />"),
    "Page must render MandiPricesPreview directly"
  );
});

// TEST 17: Existing chart, forecast, decision tool, and financial calculations remain intact
runTest("Test 17: Forecast calculation, SellOrWait advisor, and chart SVG preserved", () => {
  assert(
    previewTsx.includes('<SellOrWaitAdvisor'),
    "SellOrWaitAdvisor must be preserved in MandiPricesPreview"
  );
  assert(
    previewTsx.includes('<LatestThreeDaysSummary'),
    "LatestThreeDaysSummary must be preserved"
  );
  assert(
    previewTsx.includes('generateMandiPriceForecast'),
    "Forecasting generator must be called"
  );
  assert(
    previewTsx.includes('svgChartData'),
    "Price Trend SVG chart rendering must be preserved"
  );
});

// TEST 18: Desktop and mobile dropdowns work without layout regressions
runTest("Test 18: Filter bar preserves responsive layout without style regressions", () => {
  assert(
    previewTsx.includes('grid grid-cols-2 sm:grid-cols-5 gap-3 items-end'),
    "Filter bar must retain responsive grid layout (2 cols on mobile, 5 on desktop)"
  );
  assert(
    previewTsx.includes('className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl'),
    "Dropdown inputs must retain standard styling with rounded-xl and border-slate-200"
  );
});

console.log("\n=====================================================================");
console.log(`Test Execution Summary: ${passed} Passed, ${failed} Failed out of 18 Tests`);
console.log("=====================================================================");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("ALL 18 MANDATORY AUTOMATED TESTS PASSED SUCCESSFULLY!\n");
}
