# AGENTS.md - Multi-Agent & Contributor Protocol for AgroSaathi

Welcome AI Agents and Developers working on **AgroSaathi (TheMavericks)**.

You must follow these strict collaboration guidelines to maintain code quality, prevent merge conflicts, and preserve architectural integrity.

---

## 1. Directory Ownership & Boundaries

Strictly respect module ownership:
- **Integration Lead**:
  - `src/app/`
  - `src/components/`
  - `src/lib/`
  - `src/types/`
  - `src/config/`
  - `src/features/crop-disease/`
  - `prisma/`
  - Root configuration (`package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.mjs`)
- **Member 2**:
  - `src/features/mandi-prices/`
- **Member 3**:
  - `src/features/irrigation/`
- **Member 4**:
  - `src/features/marketplace/`

> **CRITICAL RULE**: If you are acting on behalf of Member 2, 3, or 4, you **MUST NOT** edit files outside your assigned feature folder without explicit instruction. Do not alter `src/app/layout.tsx`, `src/components/layout/AppShell.tsx`, or global styles.

---

## 2. Shared File Change Protocol

If a feature implementation requires changes to shared types (`src/types/`), shared UI components (`src/components/ui/`), or database schema (`prisma/schema.prisma`):
1. **Never edit directly without coordination**.
2. Document the exact type or component addition needed in your feature folder's local types/notes.
3. Propose the change to the Integration Lead via a pull request comment.

---

## 3. Engineering Guidelines for AI Agents

- **TypeScript Strictness**: No `any` types. All models must be fully typed.
- **Server Components by Default**: Only add `'use client'` when state, effects, or browser event listeners are strictly necessary.
- **Tailwind Tokens**: Use the `krishi-*` color palette tokens defined in `tailwind.config.ts`. Avoid arbitrary hex codes in JSX classNames.
- **Data Honesty**: Never output fabricated "live" telemetry or mock data masquerading as real API responses. Clearly mark sample preview data.
- **No Heavy ML Model Bundling**: Do not download gigabyte-sized ONNX or PyTorch weights directly into the Next.js bundle. Use cloud inference endpoints.
- **Reporting Requirement**: In every turn summary, explicitly list:
  1. All files created or modified.
  2. Any shared dependencies touched.
  3. Tests and validation commands executed (`tsc`, `lint`, `build`).
