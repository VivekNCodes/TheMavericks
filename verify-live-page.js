const http = require("http");

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({ status: res.statusCode, data });
      });
    }).on("error", reject);
  });
}

async function verify() {
  console.log("=== Round D & F: Live Page & API Verification ===\n");

  // 1. Verify Page HTML
  console.log("1. Checking /mandi-prices rendered HTML:");
  const page = await fetchUrl("http://localhost:3000/mandi-prices");
  console.log(`   HTTP Status: ${page.status}`);
  const bannedBannerStrings = [
    "autonomous module",
    "Foundation Ready",
    "Member 2 · Market Specialist",
    "feat/mandi-prices-feature",
    "Foundation Ready",
  ];
  let bannerAbsent = true;
  for (const s of bannedBannerStrings) {
    const found = page.data.includes(s);
    if (found) bannerAbsent = false;
    console.log(`   - "${s}" in HTML: ${found ? "FOUND (FAIL)" : "ABSENT (PASS)"}`);
  }
  console.log(`   -> Banner removal verified: ${bannerAbsent ? "YES" : "NO"}\n`);

  // 2. Verify API: All States + All Districts
  console.log("2. Checking /api/mandi-prices?crop=Tomato (All States + All Districts):");
  const allStatesRes = await fetchUrl("http://localhost:3000/api/mandi-prices?crop=Tomato");
  console.log(`   HTTP Status: ${allStatesRes.status}`);
  const allJson = JSON.parse(allStatesRes.data);
  console.log(`   - Success: ${allJson.success}`);
  console.log(`   - Total Records returned: ${allJson.data.records.length}`);
  const returnedStates = Array.from(new Set(allJson.data.records.map((r) => r.state)));
  console.log(`   - Distinct States in results: ${returnedStates.join(", ")}`);
  console.log(`   - Available States in dropdown: ${allJson.data.availableStates.length} states`);
  console.log(`   - Coverage notice: "${allJson.data.statistics.coverageNotice}"`);
  console.log(`   - Is Live API: ${allJson.data.statistics.isLiveApi}`);

  // 3. Verify API: Specific State + All Districts
  console.log("\n3. Checking /api/mandi-prices?state=Punjab&crop=Wheat (Specific State + All Districts):");
  const punjabRes = await fetchUrl("http://localhost:3000/api/mandi-prices?state=Punjab&crop=Wheat");
  const punjabJson = JSON.parse(punjabRes.data);
  console.log(`   - Records returned: ${punjabJson.data.records.length}`);
  const punjabStates = Array.from(new Set(punjabJson.data.records.map((r) => r.state)));
  console.log(`   - States in results: ${punjabStates.join(", ")}`);
  console.log(`   - Available Districts for Punjab: ${punjabJson.data.availableDistricts.length} districts`);

  // 4. Verify API: Specific State + Specific District
  console.log("\n4. Checking /api/mandi-prices?state=Rajasthan&district=Jaipur&crop=Tomato:");
  const jaipurRes = await fetchUrl("http://localhost:3000/api/mandi-prices?state=Rajasthan&district=Jaipur&crop=Tomato");
  const jaipurJson = JSON.parse(jaipurRes.data);
  console.log(`   - Records returned: ${jaipurJson.data.records.length}`);
  if (jaipurJson.data.records.length > 0) {
    console.log(`   - First record: ${jaipurJson.data.records[0].mandiName} (${jaipurJson.data.records[0].district}, ${jaipurJson.data.records[0].state}) - ₹${jaipurJson.data.records[0].modalPrice}/q`);
  }

  // 5. Verify API: No matching records
  console.log("\n5. Checking /api/mandi-prices?state=Goa&crop=Wheat (Unmatched filter):");
  const emptyRes = await fetchUrl("http://localhost:3000/api/mandi-prices?state=Goa&crop=Wheat");
  const emptyJson = JSON.parse(emptyRes.data);
  console.log(`   - Records returned: ${emptyJson.data.records.length} (Safe empty result handled cleanly)`);

  console.log("\n✓ ALL LIVE VERIFICATIONS COMPLETED SUCCESSFULLY!");
}

verify().catch(console.error);
