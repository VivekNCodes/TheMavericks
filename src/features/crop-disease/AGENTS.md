# AGENTS.md - Crop Disease Detection Module

**Owner**: Integration Lead & Architect  
**Directory Scope**: `src/features/crop-disease/`  
**Route**: `/crop-disease`

---

## 1. Module Scope

The Crop Disease Detection module enables farmers to upload or photograph affected crop foliage to receive an instant, AI-assisted diagnosis with confidence scoring, symptom description, and actionable agronomic remedies.

### Key Visual & Functional Elements (from Master Reference):
- **Breadcrumb**: `Crop Health > Disease Detection`
- **Supported Crops Action**: Quick reference guide to supported species (Tomato, Wheat, Potato, Rice, Cotton, Chili).
- **Upload Card**: Drag-and-drop file upload zone (JPG, PNG, WEBP max 5MB) with leaf illustration and "+ Upload Image" action.
- **Sample Images Strip**: Instant 1-click test cases for farmers to test diagnoses without having to upload immediately.
- **Diagnosis Card**:
  - Disease Title: e.g., `Tomato - Early Blight`
  - Confidence Indicator: e.g., `Confidence: 92%` with visual green progress bar
  - About this disease summary
  - Actionable treatment checklist (e.g., remove infected leaves, fungicide spray recommendation, water management)
  - "View Detailed Guide" action
  - Mandatory disclaimer: "Disclaimer: This is an AI-assisted prediction. For critical decisions, consult a local agricultural expert."

---

## 2. Boundaries & Rules

- **Allowed Changes**: Files inside `src/features/crop-disease/` and `src/app/crop-disease/page.tsx`.
- **Prohibited Changes**: Modifying other feature folders or altering global layout styles without lead approval.
- **Model Storage**: Do not commit heavy ML model binaries (`.h5`, `.onnx`, `.pt`) to Git. Use external inference or serverless API endpoints.
