# AgroSaathi - Team Git Workflow & Branching Strategy

## 1. Branch Strategy

The repository follows a clean trunk-based workflow with protected `main` branch.

- **`main`**: Production-ready branch. Must always build cleanly and pass all lint checks.
- **`feat/<module>-<description>`**: Feature branches for assigned members.
  - Examples:
    - `feat/lead-crop-disease-ui`
    - `feat/mandi-prices-chart`
    - `feat/irrigation-wizard`
    - `feat/marketplace-catalog`
- **`fix/<issue-description>`**: Bug fix branches.

---

## 2. Step-by-Step Instructions for Team Members

### Step 1: Clone the Repository
```bash
git clone https://github.com/VivekNCodes/TheMavericks.git
cd TheMavericks
```

### Step 2: Create Your Assigned Branch
- **Integration Lead**:
  ```bash
  git checkout -b feat/lead-crop-disease-detection
  ```
- **Member 2 (Mandi Prices)**:
  ```bash
  git checkout -b feat/mandi-prices-feature
  ```
- **Member 3 (Irrigation Advisor)**:
  ```bash
  git checkout -b feat/irrigation-advisor-feature
  ```
- **Member 4 (Marketplace)**:
  ```bash
  git checkout -b feat/marketplace-feature
  ```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Configure Local Environment
```bash
cp .env.example .env.local
```

### Step 5: Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

### Step 6: Commit and Push
```bash
git add src/features/<your-module>/
git commit -m "feat(<your-module>): implement core component flow"
git push -u origin feat/<your-branch-name>
```

### Step 7: Open Pull Request
- Target branch: `main`.
- Fill in the PR template, tag the Integration Lead for review.
- Never force push (`git push -f`) or merge without CI checks passing.
