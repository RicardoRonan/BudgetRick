# BudgetRick

A privacy-first personal budget app built with Vue 3, Tailwind CSS, and optional PocketBase backend. Manual expense/income entry, category-based budgeting, no bank connections required.

## Features

- **Manual entry** - Add income and expenses without linking bank accounts
- **Category budgeting** - Custom categories with per-category limits
- **Remaining balance** - See what's left after all expenses
- **Dashboard** - Summary cards, pie/bar charts, 6-month trends
- **Transactions** - Searchable, filterable table with CSV export
- **Recurring bills** - Track subscriptions with auto-generated transactions
- **Savings goals** - Progress bars toward financial targets
- **Dark/light mode** - Theme toggle in header and settings
- **Local-first** - Data stored in localStorage by default

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

No backend setup needed. Data persists in your browser's localStorage.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vue 3 + Vite |
| Styling | Tailwind CSS v4 |
| State | Pinia |
| Router | Vue Router |
| Charts | Chart.js + vue-chartjs |
| Backend (optional) | PocketBase |

## Project Structure

```
src/
├── components/     # UI, layout, budget, transactions, charts, goals, recurring
├── composables/    # useBudget, useTransactions, usePocketBase
├── design/         # Design tokens (colors, typography, components)
├── router/         # Vue Router config
├── services/       # Data layer (localStorage + export)
├── stores/         # Pinia stores
└── views/          # Page components
```

## Optional: PocketBase Backend

See [pocketbase/README.md](pocketbase/README.md) for setup instructions. Set `VITE_POCKETBASE_URL=http://127.0.0.1:8090` in `.env` to enable.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Design

Notion-inspired design system. See [DESIGN.md](DESIGN.md) for tokens and component rules.

## Default Categories

**Income:** Salary, Freelance, Investments, Other Income

**Expenses:** Housing/Rent, Utilities, Groceries, Transportation, Insurance, Healthcare, Entertainment, Dining Out, Subscriptions, Clothing, Education, Personal Care, Debt Payments, Savings, Other
