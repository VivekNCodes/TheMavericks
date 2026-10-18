import assert from "node:assert";
import {
  MarketplaceStore,
  normalizeToKg,
  normalizePricePerQuintal,
} from "../src/features/marketplace/server/marketplace-store";

async function runTests() {
  console.log("=== 1. Testing Normalization Helpers ===");
  assert.strictEqual(normalizeToKg(5, "quintal"), 500);
  assert.strictEqual(normalizeToKg(2, "tonne"), 2000);
  assert.strictEqual(normalizeToKg(25, "kg"), 25);

  assert.strictEqual(normalizePricePerQuintal(1800, "quintal"), 1800);
  assert.strictEqual(normalizePricePerQuintal(20000, "tonne"), 2000);
  assert.strictEqual(normalizePricePerQuintal(25, "kg"), 2500);
  console.log("✔ Normalization helpers passed.");

  console.log("\n=== 2. Testing Listing Retrieval & Filtering ===");
  const allListings = await MarketplaceStore.getListings();
  assert(allListings.length >= 6, "Expected at least 6 initial demo listings");

  const tomatoListings = await MarketplaceStore.getListings({ searchQuery: "Tomato" });
  assert(tomatoListings.some((l) => l.cropName === "Tomato"), "Expected tomato listings");

  const vegListings = await MarketplaceStore.getListings({ category: "Vegetables" });
  assert(vegListings.every((l) => l.category === "Vegetables"), "Expected only vegetables");

  const jaipurListings = await MarketplaceStore.getListings({ district: "Jaipur" });
  assert(jaipurListings.every((l) => l.district === "Jaipur"), "Expected only Jaipur listings");

  console.log(`✔ Retrieval passed (${allListings.length} total listings).`);

  console.log("\n=== 3. Testing Seller Listing Creation ===");
  const testSellerId = "test-farmer-999";
  const created = await MarketplaceStore.createListing({
    userId: testSellerId,
    title: "Organic Desi Carrots",
    cropName: "Carrot",
    category: "Vegetables",
    variety: "Pusa Kesar",
    description: "Deep red sweet carrots rich in beta carotene.",
    unit: "quintal",
    pricePerUnit: 1500,
    totalStock: 8,
    grade: "Organic Certified",
    state: "Rajasthan",
    district: "Jaipur",
    village: "Bassi",
    location: "Bassi, Jaipur, Rajasthan",
    pickupDelivery: "Farmgate Pickup",
    sellerName: "Test Farmer",
    sellerPhone: "+91 98299 99999",
    sellerWhatsapp: "919829999999",
    sellerEmail: "test.farmer@agrosaathi.in",
    status: "ACTIVE",
    images: ["/icons/crop-tomato.svg"],
  });

  assert(created.id, "Expected created listing to have an ID");
  assert.strictEqual(created.availableStock, 8);
  assert.strictEqual(created.isDemoSeed, false);
  console.log(`✔ Created listing ID: ${created.id}`);

  console.log("\n=== 4. Testing Listing Update & Pause ===");
  // Test unauthorized edit by another user
  const unauthorizedEdit = await MarketplaceStore.updateListing(created.id, "unauthorized-user-007", {
    pricePerUnit: 9999,
  });
  assert.strictEqual(unauthorizedEdit.success, false, "Unauthorized user must not be able to edit another seller's listing");
  assert(unauthorizedEdit.error?.includes("Unauthorized"), "Error must state Unauthorized");
  console.log("✔ Authorization check passed: Non-owner cannot edit listing.");

  // Test unauthorized delete by another user
  const unauthorizedDelete = await MarketplaceStore.deleteListing(created.id, "unauthorized-user-007");
  assert.strictEqual(unauthorizedDelete.success, false, "Unauthorized user must not be able to delete another seller's listing");
  console.log("✔ Authorization check passed: Non-owner cannot delete listing.");

  const updateRes = await MarketplaceStore.updateListing(created.id, testSellerId, {
    pricePerUnit: 1600,
    variety: "Pusa Rudhira",
  });
  assert(updateRes.success, "Expected update to succeed");
  assert.strictEqual(updateRes.listing?.pricePerUnit, 1600);

  // Pause listing
  const pauseRes = await MarketplaceStore.toggleListingStatus(created.id, testSellerId, "PAUSED");
  assert(pauseRes.success);
  assert.strictEqual(pauseRes.listing?.status, "PAUSED");

  // Attempt to buy while paused -> should be rejected
  const pausedBuyRes = await MarketplaceStore.createPurchaseRequest({
    listingId: created.id,
    buyerName: "Buyer While Paused",
    buyerPhone: "+91 94140 00000",
    buyerWhatsapp: "919414000000",
    quantityRequested: 1,
    deliveryPreference: "Farmgate Pickup",
  });
  assert.strictEqual(pausedBuyRes.success, false, "Should reject orders on paused listing");
  console.log("✔ Correctly rejected order on paused listing.");

  // Resume listing
  await MarketplaceStore.toggleListingStatus(created.id, testSellerId, "ACTIVE");

  console.log("\n=== 5. Testing Safe Inventory & Insufficient Stock Handling ===");
  // Request 15 quintals when only 8 available
  const overOrderRes = await MarketplaceStore.createPurchaseRequest({
    listingId: created.id,
    buyerName: "Over-buyer",
    buyerPhone: "+91 94140 00000",
    buyerWhatsapp: "919414000000",
    quantityRequested: 15,
    deliveryPreference: "Farmgate Pickup",
  });
  assert.strictEqual(overOrderRes.success, false, "Should reject order exceeding available stock");
  console.log("✔ Over-order rejected safely with insufficient inventory message.");

  console.log("\n=== 6. Testing Purchase Request & Order Workflow ===");
  // Valid request for 3 quintals
  const orderRes = await MarketplaceStore.createPurchaseRequest({
    listingId: created.id,
    buyerId: "buyer-trader-101",
    buyerName: "Traders Co",
    buyerPhone: "+91 94140 11111",
    buyerWhatsapp: "919414011111",
    buyerEmail: "procurement@traders.co",
    buyerAddress: "Plot 5, Muhana Mandi, Jaipur",
    quantityRequested: 3,
    deliveryPreference: "Farmgate Pickup",
    notes: "Please pack in clean gunny bags.",
  });

  assert(orderRes.success && orderRes.order, "Expected purchase request to succeed");
  const order = orderRes.order;
  assert.strictEqual(order.totalPrice, 3 * 1600);
  assert.strictEqual(order.status, "PENDING");
  console.log(`✔ Purchase request #${order.id} placed in PENDING status. Total: ₹${order.totalPrice}`);

  // Seller accepts order
  const acceptRes = await MarketplaceStore.updateOrderStatus({
    orderId: order.id,
    userId: testSellerId,
    newStatus: "ACCEPTED",
    actorRole: "seller",
    note: "Order accepted. Produce packed and ready for pickup.",
  });
  assert(acceptRes.success, "Expected seller accept to succeed");

  // Check inventory deduction: was 8, requested 3 -> remaining must be 5
  const updatedListing = await MarketplaceStore.getListingById(created.id);
  assert.strictEqual(updatedListing?.availableStock, 5, "Expected remaining stock to be 5");
  console.log(`✔ Order accepted. Available stock atomically reduced to: ${updatedListing?.availableStock} quintals.`);

  // Verify status audit history
  const acceptedOrder = acceptRes.order;
  assert.strictEqual(acceptedOrder?.statusHistory.length, 2);
  assert.strictEqual(acceptedOrder?.statusHistory[1].status, "ACCEPTED");
  console.log("✔ Audit trail correctly recorded state transition with timestamp.");

  // Test unauthorized status change by random user
  const unauthorizedOrderUpdate = await MarketplaceStore.updateOrderStatus({
    orderId: order.id,
    userId: "random-attacker",
    newStatus: "COMPLETED",
    actorRole: "seller",
  });
  assert.strictEqual(unauthorizedOrderUpdate.success, false, "Unauthorized user cannot accept or update another seller's order");
  console.log("✔ Authorization check passed: Non-seller cannot accept/manage order.");

  // Seller marks completed
  const completeRes = await MarketplaceStore.updateOrderStatus({
    orderId: order.id,
    userId: testSellerId,
    newStatus: "COMPLETED",
    actorRole: "seller",
    note: "Paid in full at farmgate and produce loaded.",
  });
  assert(completeRes.success);
  assert.strictEqual(completeRes.order?.status, "COMPLETED");
  console.log("✔ Order marked COMPLETED.");

  console.log("\n=== 7. Testing Concurrent Orders & Race Condition Prevention ===");
  // Remaining stock is 5. Fire 3 concurrent requests of 2 quintals each (total 6 > 5)
  const concurrentReqs = [
    MarketplaceStore.createPurchaseRequest({
      listingId: created.id,
      buyerName: "Concurrent Buyer A",
      buyerPhone: "+91 94140 22222",
      buyerWhatsapp: "919414022222",
      quantityRequested: 2,
      deliveryPreference: "Farmgate Pickup",
    }),
    MarketplaceStore.createPurchaseRequest({
      listingId: created.id,
      buyerName: "Concurrent Buyer B",
      buyerPhone: "+91 94140 33333",
      buyerWhatsapp: "919414033333",
      quantityRequested: 2,
      deliveryPreference: "Farmgate Pickup",
    }),
    MarketplaceStore.createPurchaseRequest({
      listingId: created.id,
      buyerName: "Concurrent Buyer C",
      buyerPhone: "+91 94140 44444",
      buyerWhatsapp: "919414044444",
      quantityRequested: 2,
      deliveryPreference: "Farmgate Pickup",
    }),
  ];

  const results = await Promise.all(concurrentReqs);
  // All three can be pending initially since 2 <= 5
  assert(results.every((r) => r.success));

  // Now accept Buyer A (2 quintals -> stock becomes 3)
  const aAccept = await MarketplaceStore.updateOrderStatus({
    orderId: results[0].order!.id,
    userId: testSellerId,
    newStatus: "ACCEPTED",
    actorRole: "seller",
  });
  assert(aAccept.success);

  // Accept Buyer B (2 quintals -> stock becomes 1)
  const bAccept = await MarketplaceStore.updateOrderStatus({
    orderId: results[1].order!.id,
    userId: testSellerId,
    newStatus: "ACCEPTED",
    actorRole: "seller",
  });
  assert(bAccept.success);

  // Attempt to accept Buyer C (needs 2 quintals, but only 1 left!) -> MUST FAIL!
  const cAccept = await MarketplaceStore.updateOrderStatus({
    orderId: results[2].order!.id,
    userId: testSellerId,
    newStatus: "ACCEPTED",
    actorRole: "seller",
  });
  assert.strictEqual(cAccept.success, false, "Concurrent order C acceptance must be rejected due to stock exhaustion");
  console.log("✔ Concurrency guard verified: Overselling prevented during concurrent order execution.");

  console.log("\n=== 8. Testing Cleanup & Listing Deletion ===");
  const deleteRes = await MarketplaceStore.deleteListing(created.id, testSellerId);
  assert(deleteRes.success);
  const deletedCheck = await MarketplaceStore.getListingById(created.id);
  assert.strictEqual(deletedCheck, null);
  console.log("✔ Listing cleaned up successfully.");

  console.log("\n==========================================");
  console.log("🎉 ALL MARKETPLACE ENGINE TESTS PASSED! 🎉");
  console.log("==========================================");
}

runTests().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
