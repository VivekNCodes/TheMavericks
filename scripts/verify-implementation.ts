/**
 * AgroSaathi Feature Verification Suite
 * Tests:
 * 1. Google OAuth user upsert and profile management
 * 2. Strict user crop persistence and cross-account isolation (security boundary)
 * 3. User agricultural context generation for Gemini personalization
 * 4. Text-to-speech markdown cleaner (speech synthesis safety)
 * 5. Voice navigation command detection
 */

import {
  upsertGoogleUser,
  getUserById,
  updateUserProfile,
  getUserCrops,
  createCrop,
  updateCrop,
  deleteCrop,
  getUserAgriculturalContext,
  deleteUserAccount,
} from "../src/lib/user-store";

import { detectVoiceCommand } from "../src/features/chatbot/services/gemini-service";
import { cleanTextForSpeech } from "../src/features/chatbot/hooks/useVoiceAssistant";

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

async function runTests() {
  console.log("\n=======================================================");
  console.log(" AgroSaathi Verification Test Suite");
  console.log("=======================================================\n");

  // -------------------------------------------------------------
  // Test 1: User Profile Management & Google OAuth Upsert
  // -------------------------------------------------------------
  console.log("1. Testing Google OAuth User Management & Profiles...");
  const testUserEmail = `test.farmer.${Date.now()}@gmail.com`;
  const createdUser = await upsertGoogleUser({
    email: testUserEmail,
    name: "Vikramaditya Singh",
    googleId: `google-sub-${Date.now()}`,
    avatarUrl: "/images/test-avatar.webp",
  });

  assert(!!createdUser.id, "User ID generated successfully");
  assert(createdUser.email === testUserEmail, "User email matches Google identity");
  assert(createdUser.name === "Vikramaditya Singh", "User full name recorded correctly");

  const fetchedUser = await getUserById(createdUser.id);
  assert(!!fetchedUser && fetchedUser.id === createdUser.id, "Retrieved user from store by ID");

  const updatedProfile = await updateUserProfile(createdUser.id, {
    preferredName: "Vikram",
    district: "Kota",
    state: "Rajasthan",
    farmSize: 5.2,
    soilType: "Black Cotton Soil",
    irrigationMethod: "Drip Irrigation",
    farmingExperience: 12,
  });
  assert(updatedProfile?.preferredName === "Vikram", "Updated preferred farmer name");
  assert(updatedProfile?.acres === 5.2, "Updated farm acreage");
  assert(updatedProfile?.soilType === "Black Cotton Soil", "Updated soil classification");

  // -------------------------------------------------------------
  // Test 2: Persistent Crops & Strict Multi-User Isolation
  // -------------------------------------------------------------
  console.log("\n2. Testing Persistent Crops & Multi-User Isolation...");
  const user1 = createdUser;
  const user2 = await upsertGoogleUser({
    email: `other.farmer.${Date.now()}@gmail.com`,
    name: "Suresh Patel",
    googleId: `google-sub-other-${Date.now()}`,
  });

  // User 1 adds Wheat and Mustard
  const crop1 = await createCrop(user1.id, {
    cropName: "Wheat",
    variety: "HD-2967",
    acreage: 3.0,
    growthStage: "FLOWERING",
    fieldLocation: "East Plot",
  });
  assert(!!crop1.id, "User 1 created crop successfully");
  assert(crop1.userId === user1.id, "Crop is associated with User 1's ID");

  const crop2 = await createCrop(user1.id, {
    cropName: "Mustard",
    variety: "Pusa Bold",
    acreage: 2.2,
    growthStage: "VEGETATIVE",
  });

  const user1Crops = await getUserCrops(user1.id);
  assert(user1Crops.length >= 2, `User 1 has ${user1Crops.length} crops saved`);

  // Verify User 2 has isolated empty list, cannot see User 1's crops
  const user2Crops = await getUserCrops(user2.id);
  assert(user2Crops.length === 0, "User 2 cannot see User 1's crops (Isolation verified)");

  // Verify User 2 CANNOT update or delete User 1's crop
  const unauthorizedUpdate = await updateCrop(user2.id, crop1.id, { cropName: "Hacked Crop" });
  assert(unauthorizedUpdate === null, "Cross-account crop update strictly rejected (404/Null)");

  const unauthorizedDelete = await deleteCrop(user2.id, crop1.id);
  assert(unauthorizedDelete === false, "Cross-account crop deletion strictly rejected (False)");

  // Authorized update by owner
  const authorizedUpdate = await updateCrop(user1.id, crop1.id, { growthStage: "GRAIN_FILLING" });
  assert(authorizedUpdate?.growthStage === "GRAIN_FILLING", "Owner successfully updated crop stage");

  // Authorized deletion by owner
  const authorizedDelete = await deleteCrop(user1.id, crop2.id);
  assert(authorizedDelete === true, "Owner successfully deleted crop");

  // -------------------------------------------------------------
  // Test 3: Agricultural Context Extraction for Gemini
  // -------------------------------------------------------------
  console.log("\n3. Testing Agricultural Context Generation for Gemini...");
  const agContext = await getUserAgriculturalContext(user1.id);
  assert(!!agContext, "Generated agricultural context for authenticated farmer");
  assert(agContext?.farmerName === "Vikram", "Context captures updated preferred farmer name");
  assert(agContext?.crops.length === 1, "Context accurately includes User 1's active crops");
  assert(agContext?.crops[0].cropName === "Wheat", "Context identifies correct active crop name");
  assert(agContext?.soilType === "Black Cotton Soil", "Context includes farmer's soil type");

  // -------------------------------------------------------------
  // Test 4: Voice Synthesis Text Cleaner (Audio Safety)
  // -------------------------------------------------------------
  console.log("\n4. Testing Text-to-Speech Markdown Stripper...");
  const markdownText = `### Crop Disease Advisory 🌾
Here is the **recommended** action for [Early Blight](https://agrosaathi.in):
- Apply \`Mancozeb 75 WP\` @ 2g/L.
• Remove diseased foliage.
1. Maintain soil aeration.`;

  const cleanSpeech = cleanTextForSpeech(markdownText);
  assert(!cleanSpeech.includes("###"), "Headers removed from speech output");
  assert(!cleanSpeech.includes("**"), "Bold asterisks removed from speech output");
  assert(!cleanSpeech.includes("`"), "Backticks removed from speech output");
  assert(!cleanSpeech.includes("https://"), "Raw URLs removed from speech output");
  assert(!cleanSpeech.includes("🌾"), "Emojis stripped from speech output");
  assert(cleanSpeech.includes("Mancozeb 75 WP"), "Preserved clinical treatment text");

  // -------------------------------------------------------------
  // Test 5: Voice Navigation Command Detection
  // -------------------------------------------------------------
  console.log("\n5. Testing Voice Navigation Commands...");
  const cmdDashboard = detectVoiceCommand("Open my dashboard please");
  assert(cmdDashboard?.type === "navigate" && cmdDashboard.target === "/", "Recognized 'Open my dashboard' command");

  const cmdCrops = detectVoiceCommand("Show my saved crops");
  assert(cmdCrops?.type === "navigate" && cmdCrops.target === "/#crops", "Recognized 'Show my saved crops' command");

  const cmdAddCrop = detectVoiceCommand("Add a new crop");
  assert(cmdAddCrop?.type === "open_modal" && cmdAddCrop.target === "add_crop", "Recognized 'Add a new crop' command");

  const cmdDisease = detectVoiceCommand("Open disease detection");
  assert(cmdDisease?.type === "navigate" && cmdDisease.target === "/crop-disease", "Recognized 'Open disease detection' command");

  const cmdProfile = detectVoiceCommand("मेरी प्रोफाइल खोलो");
  assert(cmdProfile?.type === "navigate" && cmdProfile.target === "/profile", "Recognized Hindi 'मेरी प्रोफाइल खोलो' command");

  const cmdMute = detectVoiceCommand("stop speaking now");
  assert(cmdMute?.type === "stop_speech", "Recognized 'Stop speaking' command");

  // -------------------------------------------------------------
  // Test 6: Server Audio Transcription Endpoint Logic
  // -------------------------------------------------------------
  console.log("\n6. Testing Audio Transcription Endpoint Logic & Fallback...");
  const { POST: transcribeHandler } = await import("../src/app/api/assistant/transcribe/route");
  const { NextRequest } = await import("next/server");

  // Subtest 6A: Missing audio payload returns 400
  const emptyFormReq = new NextRequest("http://localhost:3000/api/assistant/transcribe", {
    method: "POST",
    body: new FormData(),
  });
  const resEmpty = await transcribeHandler(emptyFormReq);
  const jsonEmpty = await resEmpty.json();
  assert(resEmpty.status === 400, "Missing audio returns 400 Bad Request");
  assert(jsonEmpty.error === "MISSING_AUDIO", "Returns MISSING_AUDIO error code");

  // Subtest 6B: Empty audio buffer (< 400 bytes) returns empty string without error
  const tinyBlob = new Blob([new Uint8Array(100)], { type: "audio/webm" });
  const tinyForm = new FormData();
  tinyForm.append("audio", tinyBlob, "empty.webm");
  const tinyReq = new NextRequest("http://localhost:3000/api/assistant/transcribe", {
    method: "POST",
    body: tinyForm,
  });
  const resTiny = await transcribeHandler(tinyReq);
  const jsonTiny = await resTiny.json();
  assert(resTiny.status === 200, "Empty audio buffer returns 200 OK");
  assert(jsonTiny.text === "", "Empty audio produces empty transcription safely");

  // Subtest 6C: Oversized audio (> 12MB) rejected with 413
  const fakeHugeBuffer = new Uint8Array(13 * 1024 * 1024);
  const hugeBlob = new Blob([fakeHugeBuffer], { type: "audio/webm" });
  const hugeForm = new FormData();
  hugeForm.append("audio", hugeBlob, "huge.webm");
  const hugeReq = new NextRequest("http://localhost:3000/api/assistant/transcribe", {
    method: "POST",
    body: hugeForm,
  });
  const resHuge = await transcribeHandler(hugeReq);
  assert(resHuge.status === 413, "Oversized audio rejected with 413 Payload Too Large");

  // Subtest 6D: Informative diagnostic when Gemini key not set in dev
  const testAudioBlob = new Blob([new Uint8Array(2048)], { type: "audio/webm;codecs=opus" });
  const testForm = new FormData();
  testForm.append("audio", testAudioBlob, "voice.webm");
  testForm.append("language", "hi");
  const testReq = new NextRequest("http://localhost:3000/api/assistant/transcribe", {
    method: "POST",
    body: testForm,
  });
  const resVoice = await transcribeHandler(testReq);
  const jsonVoice = await resVoice.json();
  // Either successful transcription or clean diagnostic response without unhandled crash
  assert(
    resVoice.status === 200 || resVoice.status === 502,
    "Audio transcription endpoint responds cleanly without server crashes"
  );
  assert(
    jsonVoice.success === true || typeof jsonVoice.message === "string",
    "Provides structured success text or actionable diagnostic message"
  );

  // Clean up test accounts
  await deleteUserAccount(user1.id);
  await deleteUserAccount(user2.id);

  console.log("\n=======================================================");
  console.log(` Test Results: ${passedTests} passed, ${failedTests} failed`);
  console.log("=======================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
