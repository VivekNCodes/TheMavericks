import { SellOrWaitInput, SellOrWaitResult } from "../types";

/**
 * Calculates net financial difference between selling today vs waiting up to 4 days.
 * 1 Quintal = 100 Kilograms.
 */
export function calculateSellOrWaitDecision(input: SellOrWaitInput): SellOrWaitResult {
  // Validate and normalize quantity in Quintals
  const rawQty = Math.max(0.01, input.quantity || 10);
  const quantityQuintals =
    input.unit === "kg" ? Math.round((rawQty / 100) * 1000) / 1000 : rawQty;

  const currentPrice = Math.max(0, input.currentPrice || 0);
  const futureForecastPrice = Math.max(0, input.futureForecastPrice || 0);
  const holdingDays = Math.max(1, Math.min(4, input.selectedHorizonDay || 1));

  // Current gross proceeds
  const saleValueToday = Math.round(quantityQuintals * currentPrice);

  // Spoilage / shrinkage calculation
  const spoilagePercent = Math.max(0, Math.min(50, input.spoilagePercent || 0));
  const effectiveFutureQuantity =
    quantityQuintals * (1 - spoilagePercent / 100);
  const spoilageLossKg =
    Math.round((quantityQuintals - effectiveFutureQuantity) * 100 * 10) / 10;

  // Expected gross proceeds in future
  const futureGrossValue = Math.round(effectiveFutureQuantity * futureForecastPrice);

  // Holding costs breakdown
  const storageRatePerQDay = Math.max(0, input.storageCostPerQuintalPerDay || 0);
  const storageCostTotal = Math.round(storageRatePerQDay * quantityQuintals * holdingDays);
  const extraTransportCost = Math.max(0, input.extraTransportCost || 0);
  const otherHoldingCosts = Math.max(0, input.otherHoldingCosts || 0);

  const holdingCostsTotal = Math.round(
    storageCostTotal + extraTransportCost + otherHoldingCosts
  );

  // Estimated net proceeds waiting
  const estimatedNetProceedsWaiting = Math.round(futureGrossValue - holdingCostsTotal);

  // Net Gain/Loss difference = Net Proceeds Waiting - Sale Today
  const netGainLoss = Math.round(estimatedNetProceedsWaiting - saleValueToday);
  const netPerQuintal =
    quantityQuintals > 0 ? Math.round((netGainLoss / quantityQuintals) * 10) / 10 : 0;

  // Recommendation logic
  let recommendation: "Consider waiting" | "Consider selling now" | "Insufficient evidence" =
    "Consider selling now";
  let recommendationReason = "";
  const priceDiffPerQ = futureForecastPrice - currentPrice;

  // If price is completely flat or missing
  if (currentPrice === 0 || futureForecastPrice === 0) {
    recommendation = "Insufficient evidence";
    recommendationReason =
      "Unable to compute valid recommendation due to missing price quote for this commodity/market.";
  } else if (netGainLoss > 100) {
    recommendation = "Consider waiting";
    recommendationReason = `Waiting ${holdingDays} day${
      holdingDays === 1 ? "" : "s"
    } is projected to generate +₹${netGainLoss.toLocaleString(
      "en-IN"
    )} (+₹${netPerQuintal}/q) in net earnings. The predicted price rise from ₹${currentPrice.toLocaleString(
      "en-IN"
    )} to ₹${futureForecastPrice.toLocaleString(
      "en-IN"
    )}/q exceeds the estimated holding expenses (₹${holdingCostsTotal.toLocaleString(
      "en-IN"
    )}) and ${spoilagePercent}% shrinkage.`;
  } else if (netGainLoss >= -50 && netGainLoss <= 100) {
    recommendation = "Consider selling now";
    recommendationReason = `Marginal financial difference (₹${netGainLoss.toLocaleString(
      "en-IN"
    )}). Holding costs (₹${holdingCostsTotal.toLocaleString(
      "en-IN"
    )}) absorb most or all of the expected price change. Selling today secures known revenue without holding risk.`;
  } else {
    recommendation = "Consider selling now";
    if (priceDiffPerQ < 0) {
      recommendationReason = `Predicted market softening by -₹${Math.abs(
        priceDiffPerQ
      )}/q combined with holding costs (₹${holdingCostsTotal.toLocaleString(
        "en-IN"
      )}) causes an estimated net loss of -₹${Math.abs(
        netGainLoss
      ).toLocaleString("en-IN")}. Selling today yields higher net proceeds.`;
    } else {
      recommendationReason = `Although wholesale rate may edge up by +₹${priceDiffPerQ}/q, the accumulated holding costs (₹${holdingCostsTotal.toLocaleString(
        "en-IN"
      )}) and storage shrinkage exceed the price increase by -₹${Math.abs(
        netGainLoss
      ).toLocaleString("en-IN")}. Selling today is recommended.`;
    }
  }

  const riskNote =
    "Disclaimer: Agricultural price predictions are probabilistic estimates derived from historical trend patterns. They do not constitute a financial guarantee. Weather changes, sudden supply gluts, and local APMC arrivals may cause actual prices to diverge.";

  return {
    quantityQuintals: Math.round(quantityQuintals * 100) / 100,
    unit: input.unit,
    saleValueToday,
    effectiveFutureQuantity: Math.round(effectiveFutureQuantity * 100) / 100,
    spoilageLossKg,
    futureGrossValue,
    storageCostTotal,
    holdingCostsTotal,
    estimatedNetProceedsWaiting,
    netGainLoss,
    netPerQuintal,
    recommendation,
    recommendationReason,
    holdingDays,
    riskNote,
  };
}
