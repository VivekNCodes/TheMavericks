# AgroSaathi GitHub Actions CI/CD & Automation Setup Guide

> **Target Budget**: ₹0 / month (100% Free Tier)  
> **Repository**: `https://github.com/VivekNCodes/TheMavericks.git`  
> **Primary Workflows**: `ci.yml`, `maintenance.yml`  
> **Governance & Scope Policy**: `scope-policy.json`, `CODEOWNERS`

---

## 1. Workflow Architecture & Responsibilities

The AgroSaathi automation system uses two specialized, lightweight GitHub Actions workflows designed specifically for our 5-member team:

### A. Continuous Integration (`.github/workflows/ci.yml`)
- **Job 1: `validate-scope` (Fail-Closed Boundary Check)**
  - Runs on all Pull Requests targeting `main`.
  - Evaluates the exact Git diff between the PR base commit SHA and head commit SHA (`git diff --name-only $BASE_SHA $HEAD_SHA`).
  - Matches the branch prefix against authorized module directories (`mandi-prices`, `irrigation`, `marketplace`, `crop-disease`, `crop-planner`, `chatbot`, `docs`, `core`).
  - **Fails closed**: If a branch name is unrecognized or touches files outside the module's allowed path patterns, the check immediately fails and blocks the PR.
  - **Exception Override**: Bypasses scope checks only when the `scope-exception:approved` PR label has been explicitly applied by the Integration Lead (`@VivekNCodes`).
- **Job 2: `build-and-verify` (Quality & Compilation Check)**
  - Runs on all Pull Requests targeting `main` and on direct pushes to `main`.
  - Installs exact dependencies using `npm ci`.
  - Generates Prisma client types from `prisma/schema.prisma`.
  - Executes strict TypeScript type validation (`npx tsc --noEmit`).
  - Executes Next.js ESLint linting (`npm run lint`).
  - Compiles the full Next.js production build (`npm run build`).

### B. Weekly Maintenance & Health Check (`.github/workflows/maintenance.yml`)
- Runs on a scheduled cron: **Every Sunday at 00:00 UTC** (05:30 AM IST).
- Can also be dispatched manually on demand via the **Actions** tab (`workflow_dispatch`).
- Verifies that `main` continues to compile cleanly.
- Executes an informational security audit of production dependencies (`npm audit --audit-level=high`).
- Generates a concise status report in the GitHub Actions Job Summary without altering repository files or committing code.

---

## 2. Trigger Matrix & Concurrency

| Workflow | Event Trigger | Branch Filter | Concurrency Strategy |
|---|---|---|---|
| **`ci.yml`** | `pull_request` | Target: `main` | Cancels redundant in-progress runs for the same PR ref (`cancel-in-progress: true`) |
| **`ci.yml`** | `push` | Target: `main` | Queues post-merge build verification |
| **`maintenance.yml`** | `schedule` | Weekly (`0 0 * * 0`) | Single concurrent maintenance run (`cancel-in-progress: true`) |
| **`maintenance.yml`** | `workflow_dispatch` | Selected branch | Manual execution by repository administrator |

---

## 3. Running Equivalent Checks Locally (Windows 11 / PowerShell)

Before pushing a branch or opening a pull request, teammates should run the exact commands executed by CI:

```powershell
# 1. Ensure clean, synchronized dependencies
npm ci

# 2. Generate local Prisma client types
npx prisma generate

# 3. Verify strict TypeScript compilation (must exit with 0 errors)
npx tsc --noEmit

# 4. Verify ESLint rules
npm run lint

# 5. Verify Next.js production bundle compilation
npm run build
```

### Checking Your Module File Scope Locally
To see exactly what files your feature branch has changed relative to `main`:
```powershell
# Fetch latest main
git fetch origin main

# List files modified in your branch
git diff --name-only origin/main...HEAD
```
Ensure every modified file is strictly inside your assigned directory (e.g., `src/features/mandi-prices/` and `src/app/mandi-prices/`).

---

## 4. How to Inspect Workflow Logs

1. Open the repository on GitHub: `https://github.com/VivekNCodes/TheMavericks`.
2. Click the **Actions** tab in the top navigation bar.
3. Select the workflow run corresponding to your commit or pull request.
4. Click on the failing job (e.g., `validate-scope` or `build-and-verify`).
5. Expand the failed step to inspect the stdout/stderr:
   - If `validate-scope` failed, the log will output: `[SCOPE VIOLATION] Detected X out-of-scope file modifications` followed by the disallowed file paths.
   - If `build-and-verify` failed, the log will show the exact TypeScript error code or ESLint rule violation with filename and line numbers.

---

## 5. How to Retry Failed Jobs Safely

If a job fails due to an intermittent network hiccup during package download:
1. In the GitHub Actions run view, click the **Re-run jobs** button in the upper-right corner.
2. Select **Re-run failed jobs** (recommended) or **Re-run all jobs**.
3. If a failure was due to a code issue:
   - Do **NOT** force-push or rewrite history.
   - Fix the issue locally on your feature branch.
   - Commit the fix (`git commit -m "fix(mandi-prices): resolve type mismatch"`).
   - Push to your branch (`git push origin feature/your-branch`).
   - GitHub Actions will automatically cancel any superseded run and start a fresh verification on the new commit.

---

## 6. Environment & Secret Management Policy

### Strict Zero-Secret Rule in CI Workflows
- AgroSaathi's CI workflow does **NOT** require real production database credentials or private API keys to build and verify code.
- Next.js compiles all pages cleanly using offline fallback mock modes and placeholder connection strings.
- **Never store real production secrets in workflow files or commit them to Git.**

### If an Approved Integration Later Requires Repository Secrets:
1. Navigate to: **Settings** > **Secrets and variables** > **Actions**.
2. Click **New repository secret**.
3. Name the secret using standard uppercase naming (e.g., `GEMINI_API_KEY`).
4. Paste the value and click **Add secret**.
5. Secrets are only accessible to workflows running on `push` or `pull_request` from authorized collaborators, and are masked automatically in all logs.

---

## 7. How to Enable GitHub Branch Protection & Required Status Checks

To ensure that direct pushes to `main` are blocked and that no PR can merge without passing CI, the repository owner (`@VivekNCodes`) should configure GitHub repository settings:

### Step-by-Step Configuration:
1. Go to repository **Settings** > **Branches**.
2. Click **Add branch protection rule** (or **Add ruleset**).
3. Set **Branch name pattern** to `main`.
4. Enable the following checkboxes:
   - [x] **Require a pull request before merging**
     - Require at least **1 approving review**.
     - [x] **Require review from Code Owners** (enforces `.github/CODEOWNERS`).
     - [x] **Dismiss stale pull request approvals when new commits are pushed**.
   - [x] **Require status checks to pass before merging**
     - [x] **Require branches to be up to date before merging**.
     - In the search bar, search for and select the required check:
       - `validate-scope` (or `Module Scope Boundary Check`)
       - `build-and-verify` (or `Quality Checks & Production Build`)
   - [x] **Do not allow bypassing the above settings** (applies rules strictly to administrators as well).
5. Click **Create** or **Save changes**.

Once enabled, direct pushes to `main` via `git push origin main` will be rejected by GitHub.

---

## 8. Free-Tier Budget & Limitations (What the System Can & Cannot Do)

### What the System CAN Do for Free (₹0 / Month):
1. **Public Repository Advantage**: Because `TheMavericks` is a public repository, standard Linux runners (`ubuntu-latest`) have **unlimited free GitHub Actions minutes**.
2. **Deterministic Quality Gate**: Every pull request is strictly verified for linting, type errors, buildability, and module boundary compliance.
3. **Weekly Scheduled Health Audits**: Automatic verification that dependencies and builds remain functional without manual intervention.
4. **Concurrency Management**: Automatically terminates redundant builds when developers push rapid commits.

### Limitations & Caveats:
1. **Private Repository Fallback**: If the repository visibility is ever changed to Private, GitHub Free grants **2,000 minutes/month** of Linux runner time. With our CI taking ~1.5 to 2.5 minutes per run, this still supports ~800 to 1,000 PR runs per month.
2. **Execution Time Limits**: A single job has a hard timeout of 6 hours (our jobs complete in under 3 minutes).
3. **Cron Delays**: GitHub Actions scheduled cron runs are queued with other public jobs. A job scheduled for 00:00 UTC may begin between 00:05 and 00:30 UTC during periods of high platform load.
4. **Ephemeral Runners (Not 24/7 Autonomous Agents)**: GitHub Actions runners are temporary virtual machines spawned on-demand for the duration of a job. They do **not** provide a persistent, autonomous coding agent that monitors and refactors code continuously.

---

## 9. Future AI Coding Agent Integration (Safe Extension Point)

While deterministic CI is fully implemented, an automated AI coding assistant (e.g. creating PRs from tagged GitHub issues) can be integrated in the future **without weakening branch protection** by adhering to these architectural requirements:

1. **Dedicated AI Trigger**: Use `workflow_dispatch` or `issues: [labeled]` with an explicit authorization check (e.g., only issues labeled `ai:approved` by `@VivekNCodes`).
2. **Isolated Environment & Free Model**: Use the free tier of the Google Gemini API (`gemini-1.5-flash` or `gemini-2.0-flash` from Google AI Studio) via repository secret `GEMINI_API_KEY`.
3. **Dedicated Feature Branch**: The AI agent must checkout a dedicated branch (e.g., `feature/ai-<issue-id>`), modify code strictly within the authorized module, and open a pull request.
4. **Never Auto-Merge**: The pull request must pass `validate-scope` and `build-and-verify`, and requires manual human review and approval before merging into `main`.
5. **No Arbitrary Shell Execution**: The agent must never run arbitrary user-submitted shell commands.
