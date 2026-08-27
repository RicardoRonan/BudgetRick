# PocketBase Setup (Optional)

BudgetRick works out of the box with **localStorage** (no server required). To use PocketBase for persistent backend storage:

## 1. Download PocketBase

Download the binary for your OS from [pocketbase.io/docs](https://pocketbase.io/docs/) and place it in this folder:

```
pocketbase/
├── pocketbase.exe   (Windows)
└── pb_data/         (auto-created on first run)
```

## 2. Start PocketBase

```bash
cd pocketbase
./pocketbase serve
```

Admin UI: http://127.0.0.1:8090/_/

## 3. Create Collections

Create these collections in the admin UI with the fields below. Leave API rules open for local dev, or restrict as needed for production.

### transactions

| Field | Type |
|-------|------|
| date | Date |
| type | Select (income, expense) |
| amount | Number |
| category_id | Text |
| description | Text |
| is_recurring | Bool |
| recurring_id | Text |

### categories

| Field | Type |
|-------|------|
| name | Text |
| type | Select (income, expense) |
| color | Text |
| icon | Text |
| budget_limit | Number |
| is_active | Bool |
| sort_order | Number |

### recurring

| Field | Type |
|-------|------|
| name | Text |
| amount | Number |
| category_id | Text |
| frequency | Select (weekly, biweekly, monthly, quarterly, yearly) |
| next_date | Date |
| is_active | Bool |
| notes | Text |

### goals

| Field | Type |
|-------|------|
| name | Text |
| target_amount | Number |
| current_amount | Number |
| deadline | Date |
| color | Text |
| notes | Text |

## 4. Enable PocketBase in the App

Create a `.env` file in the project root:

```
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

Restart the dev server. The app will connect to PocketBase; if unavailable, it falls back to localStorage.
