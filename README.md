## Export Software Frontend

Built on top of [fe-zen-arch](git@github.com:shivamkj/fe-zen-arch.git) — the core shared architecture for B2B SaaS frontends.

### Libraries

- **React** [Docs](https://react.dev/reference/react)
- **Tailwind CSS** [Docs](https://tailwindcss.com/docs/installation)
- **React Query** [Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- **React Hook Form** [Docs](https://www.react-hook-form.com/get-started)
- **Zustand** [Docs](https://zustand.docs.pmnd.rs/)

### Setup

```bash
pnpm install   # fe-zen-arch is included as a git submodule, init it first if missing
pnpm dev       # dev server on port 5173
pnpm lint      # prettier + tsc + eslint (fe-zen-arch lint pipeline)
pnpm build     # production build
```

### Notes

- `core`, `ui`, `auth`, `icons` are fe-zen-arch workspace packages, aliased via tsconfig paths & vite aliases.
- Forms are built directly with `useForm` from `core/form` + `Form` / `SubmitButton` from `core/form/components` — no generic form templates.
- Routing uses fe-zen-arch's zustand router: routes defined in `src/shared/routes.tsx`, paths in `src/shared/route-paths.ts`.
- Auth uses the fe-zen-arch auth module (routes, interceptors, login pages) out of the box.
- API base URL comes from `PUBLIC_API_URL` (`.env`).
- Don't use react-query mutation for react-hook-form submit handler.
- For HMR (hot refresh), the file must export only react component, and not any other constant or object.
- While most input elements use `...register('name')`, custom elements like select require `<Select<T> name="name" />` instead.

---

## Shipping Bill Form Refactoring & Architecture

The Shipping Bill creation form was refactored from a monolithic 1,753-line component into a modular, testable, and maintainable architecture.

### Key Architectural Improvements

1. **Separation of Concerns & Focused Components**:
   - **`PersistentTab`**: Keeps all form tabs mounted in the DOM using CSS visibility (`hidden`) rather than unmounting them. This ensures React Hook Form preserves field state and registers all fields for whole-form validation on submission.
   - **`CargoPackageTab`**: Dedicated to Parties (Exporters, Consignees), route ports, package weights, RBI waiver, and transport marks.
   - **`InvoicesTab` & `InvoiceCard`**: Modular handling of commercial invoices, currency definitions, contract types (FOB/CIF), and buyer/third-party party mappings.
   - **`GoodsItemCard`**: Line-item level component encapsulating RITC/HSN codes, quantity/UQC, item pricing, duty drawback (DBK), RoDTEP/RoSCTL incentive rules, and AR4 central excise details.
   - **`DocumentsTab`**: Manages container specifications, packing list serial number ranges, e-Sanchit ICEGATE supporting documents, and export licences.
   - **`RateAmountInput`**: Eliminates 5x duplicated rate (%) vs amount logic across Freight, Insurance, Commission, Discount, and Other Deductions, with mutual input locking.
   - **`PartySelector`**: Handles cascading asynchronous Exporter/Consignee and Branch selection, automatically clearing orphaned branch selections when the parent party changes.
   - **`AsyncSearchSelect`**: Debounced, asynchronous search-and-select popover for e-Sanchit document type codes with loading, empty, and error state handling.

2. **API-Ready Mock Services (No Hardcoded UI Arrays)**:
   - All master data (ports, currencies, scheme codes, UQC quantity codes, document types, contract types, states, etc.) was extracted out of the UI into asynchronous Promise-based services:
     - `referenceDataService`: Simulates REST master-data endpoints with async resolution and query search.
     - `partyService`: Asynchronous service providing Exporter, Consignee, and Third-Party directory lookups and branch management.
     - `shippingBillService`: Asynchronous bill retrieval and persistence (`getBill`, `saveBill`).
   - UI components consume these services via the `useReferenceData` hook, displaying loading indicators until options are available. Real HTTP endpoints can replace these services with zero changes to the UI layer.

3. **Domain Handling & Real-Time Customs Feedback**:
   - **`useShippingBillStats` hook**: Aggregates declared value by currency across all invoices in real time.
   - **ICEGATE Customs Validation Rules**:
     - _Weight Validation_: Warns immediately if Net Weight exceeds Gross Weight.
     - _Container Consistency_: Alerts if container records exist while cargo nature indicates Bulk/Break-Bulk or container count is zero.
     - _Incentive Validation_: Flags missing drawback serial numbers when duty-drawback schemes (DBK / RoDTEP / RoSCTL) are selected.
   - **`BillSummaryBar`**: Floating summary header providing continuous situational awareness of total items, multi-currency values, and live validation status.
   - **Tab Error Badges**: Visual indicator dots on tab headers showing users exactly which tab contains field validation errors.

---

## AI Usage & Approach

### Tools Used

- **Google Antigravity AI Coding Assistant**: Used for codebase analysis, iterative refactoring, code quality enforcement, and component design.
- **TypeScript Compiler (`tsc`) & Vite**: For type checking and production bundle verification.
- **ESLint & cspell**: For style compliance and domain terminology dictionary maintenance.

### Approach & Engineering Decisions

1. **Audit & Scope Definition**:
   - Analyzed the starter repository, submodule architecture (`fe-zen-arch`), and existing form structure.
   - Identified critical friction points: direct hardcoded master array imports, massive duplicated rate/amount blocks, monolithic component bloat, and lack of visual domain validation.
2. **Strict Zero-Dependency Constraint**:
   - Did not install any new dependencies in `package.json`, strictly leveraging existing dependencies (React, React Hook Form, Tailwind CSS, Lucide icons).
3. **Incremental Decomposition**:
   - Refactored bottom-up: first built asynchronous data services and domain hooks, followed by atomic UI components (`RateAmountInput`, `PartySelector`, `AsyncSearchSelect`), composite tab containers, and finally the top-level form orchestrator.
4. **Verification & Quality Gate**:
   - Ensured clean separation between asynchronous data providers and presentation components.
   - Enforced 100% TypeScript type safety (`npx tsc --noEmit` exits with 0 errors).
   - Validated ESLint and cspell pipelines (`npx eslint` exits with 0 errors and 0 warnings).
   - Verified production build (`pnpm build`) and live dev server functionality.
