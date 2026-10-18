import { MandiComparisonItem, ProfitCalculationInput } from "../types";

/**
 * Calculates gross sale value, net earnings, rankings, and explanations across mandis.
 */
export function calculateMandiProfitComparison(
  input: ProfitCalculationInput
): MandiComparisonItem[] {
  const quantity = Math.max(input.quantityQuintals || 10, 0.1);
  const mandis = input.mandis || [];

  if (mandis.length === 0) {
    return [];
  }

  // 1. Compute values for each mandi
  const items: MandiComparisonItem[] = mandis.map((m, idx) => {
    const modalPrice = Math.max(m.modalPrice || 0, 0);
    const transportCost = Math.max(m.transportCost || 0, 0);
    const additionalCosts = Math.max(m.additionalCosts || 0, 0);

    const grossSaleValue = Math.round(quantity * modalPrice);
    const totalCosts = Math.round(transportCost + additionalCosts);
    const estimatedNetEarnings = Math.round(grossSaleValue - totalCosts);
    const estimatedNetPerQuintal =
      quantity > 0 ? Math.round((estimatedNetEarnings / quantity) * 100) / 100 : 0;

    return {
      mandiId: `cmp_${idx}_${m.mandiName.replace(/[^a-zA-Z0-9]/g, "_")}`,
      mandiName: m.mandiName,
      district: m.district,
      state: m.state,
      cropName: input.cropName,
      variety: "Common",
      modalPrice,
      minPrice: m.minPrice || modalPrice,
      maxPrice: m.maxPrice || modalPrice,
      reportingDate: m.reportingDate || new Date().toISOString(),
      isStale: false,
      distanceKm: m.distanceKm || 0,
      transportCost,
      additionalCosts,
      quantityQuintals: quantity,
      grossSaleValue,
      totalCosts,
      estimatedNetEarnings,
      estimatedNetPerQuintal,
      rank: 1, // Will be set after sorting
      rankBadge: "Best Choice",
      rankingExplanation: "",
    };
  });

  // 2. Sort by estimatedNetEarnings descending
  items.sort((a, b) => b.estimatedNetEarnings - a.estimatedNetEarnings);

  // 3. Assign ranks and comparative explanations
  const best = items[0];

  items.forEach((item, index) => {
    item.rank = index + 1;

    if (index === 0) {
      item.rankBadge = "Best Choice";
      if (items.length > 1) {
        const diff = item.estimatedNetEarnings - items[1].estimatedNetEarnings;
        item.rankingExplanation = `Top earner! Offers highest estimated net profit (₹${item.estimatedNetEarnings.toLocaleString(
          "en-IN"
        )}), providing ₹${diff.toLocaleString(
          "en-IN"
        )} more in hand than ${items[1].mandiName} after accounting for transport and fees.`;
      } else {
        item.rankingExplanation = `Yields ₹${item.estimatedNetEarnings.toLocaleString(
          "en-IN"
        )} estimated net proceeds for ${quantity} quintals at ₹${item.modalPrice.toLocaleString(
          "en-IN"
        )}/q.`;
      }
    } else {
      const netDiff = best.estimatedNetEarnings - item.estimatedNetEarnings;
      const priceDiff = best.modalPrice - item.modalPrice;
      const transportDiff = item.transportCost - best.transportCost;

      if (index === 1 && items.length > 2) {
        item.rankBadge = "Good Alternative";
      } else {
        item.rankBadge = "Lower Margin";
      }

      if (priceDiff > 0 && transportDiff > 0) {
        item.rankingExplanation = `Lags behind ${best.mandiName} by ₹${netDiff.toLocaleString(
          "en-IN"
        )} due to both a lower modal price (-₹${priceDiff}/q) and higher transport costs (+₹${transportDiff.toLocaleString(
          "en-IN"
        )}).`;
      } else if (priceDiff > 0) {
        item.rankingExplanation = `Provides ₹${netDiff.toLocaleString(
          "en-IN"
        )} less net profit than ${best.mandiName} primarily due to lower modal rate (₹${item.modalPrice}/q vs ₹${best.modalPrice}/q).`;
      } else if (transportDiff > 0) {
        item.rankingExplanation = `Modal rate is comparable, but higher haulage costs (+₹${transportDiff.toLocaleString(
          "en-IN"
        )}) reduce net realization by ₹${netDiff.toLocaleString("en-IN")}.`;
      } else {
        item.rankingExplanation = `Results in ₹${netDiff.toLocaleString(
          "en-IN"
        )} lower estimated profit compared to top recommendation ${best.mandiName}.`;
      }
    }
  });

  return items;
}

/**
 * Verification test matching master prompt specification:
 * Quantity: 10 quintals
 * Modal price: ₹2,500
 * Transport cost: ₹500
 * Additional costs: ₹100
 * Expected gross: ₹25,000
 * Expected net: ₹24,400
 */
export function verifyProfitCalculator(): {
  passed: boolean;
  grossSaleValue: number;
  estimatedNetEarnings: number;
  expectedGross: number;
  expectedNet: number;
} {
  const result = calculateMandiProfitComparison({
    cropName: "Wheat",
    quantityQuintals: 10,
    mandis: [
      {
        mandiName: "Test Mandi",
        district: "Agra",
        state: "Uttar Pradesh",
        modalPrice: 2500,
        transportCost: 500,
        additionalCosts: 100,
      },
    ],
  });

  const testItem = result[0];
  const passed =
    testItem &&
    testItem.grossSaleValue === 25000 &&
    testItem.estimatedNetEarnings === 24400 &&
    testItem.estimatedNetPerQuintal === 2440;

  return {
    passed,
    grossSaleValue: testItem ? testItem.grossSaleValue : 0,
    estimatedNetEarnings: testItem ? testItem.estimatedNetEarnings : 0,
    expectedGross: 25000,
    expectedNet: 24400,
  };
}
