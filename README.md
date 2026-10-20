# fin map — Personal Finance Tracker

A modern, responsive personal finance dashboard for tracking expenses, income, budgets, and spending patterns. Built with React, TypeScript, Vite, Tailwind CSS, and Supabase, with a premium **Midnight Rose** interface.

🌐 **Live Demo:** [fin map](https://fin-tawny-xi.vercel.app/)

## ✨ Features

- **📊 Finance Overview** — View financial summaries, income, expenses, and cash flow.
- **💸 Expense Tracking** — Record expenses with amount, category, date, time, and optional notes.
- **💰 Income Tracking** — Record and organize income transactions.
- **🎯 Budget Management** — Create and manage monthly budgets by category.
- **📈 Financial Analytics** — Visualize cash flow, spending patterns, and category breakdowns.
- **🏷️ Expense Categories** — Organize transactions into Food & Dining, Transport, Shopping, Housing, Utilities, Health, Bills, and other categories.
- **💱 Currency Settings** — Select a supported currency for displaying monetary values.
- **🌗 Light and Dark Mode** — Switch between light and dark appearances.
- **🧭 Scrolling Navigation** — Navigate between dashboard sections on one continuous page, with the active section highlighted while scrolling.
- **🔐 Authentication** — User authentication powered by Supabase.
- **☁️ Cloud Database** — Persist financial records using Supabase and PostgreSQL.
- **📱 Responsive Interface** — A dashboard designed for desktop and smaller screens.

## 🎨 Design

fin map uses the **Midnight Rose** theme, featuring:

- Deep black and charcoal backgrounds.
- Rose-pink accents and interactive elements.
- Lavender highlights for visual hierarchy.
- Financial charts and cards designed for readability.
- A simple Light/Dark toggle.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type-safe development |
| Vite | Development server and production build |
| Tailwind CSS | Styling and responsive layouts |
| Lucide React | Interface icons |
| Recharts | Financial charts and visualizations |
| Supabase Auth | User authentication |
| Supabase PostgreSQL | Financial data storage |
| PostgreSQL Row-Level Security (RLS) | Database access control |
| Git and GitHub | Version control and source management |

## 🚀 Getting Started

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/)
- npm
- [Git](https://git-scm.com/)
- A [Supabase](https://supabase.com/) account for authentication and cloud database functionality

### 1. Clone the repository

```bash
git clone https://github.com/Aviek-25/finance-tracker.git
cd finance-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root.

Add your Supabase project credentials:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Replace the placeholder values with the appropriate values from your Supabase project's API settings.

**Security notes:**
- Never commit `.env.local` or other files containing secrets.
- Never expose a Supabase service-role key in frontend code or a `VITE_*` variable.
- Keep Row-Level Security enabled and configure appropriate policies for user-owned data.

### 4. Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173/
```

### 5. Create a production build

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## 🗄️ Database and Supabase

The application uses Supabase for authentication and persistent financial data.

The project includes transaction and budget functionality. Transaction records may contain:

- User ID
- Transaction title or description
- Amount and transaction type
- Category
- Transaction date and time
- Optional notes
- Creation timestamp

Budget records are associated with the relevant user, category, and month.

Before using a fresh Supabase project:

1. Configure the required database tables and columns.
2. Apply the required SQL migrations.
3. Enable Row-Level Security on user-owned tables.
4. Configure policies so authenticated users can access only their permitted records.
5. Configure authentication URLs for local development and any hosted environment.

If your existing database contains financial data, apply schema changes carefully and back up important data before running migrations.

## 💱 Currency Settings

Currency settings allow users to select a supported display currency.

Changing the display currency changes monetary formatting; it does not automatically convert existing transaction amounts using live exchange rates. Treat stored transaction amounts according to the currency in which they were originally recorded.

## 📁 Project Structure

The main application interface is in `src/App.tsx`.

```text
finance-tracker/
├── public/                 # Static assets
├── src/
│   ├── App.tsx             # Main dashboard and application UI
│   ├── lib/                # Supabase client and shared utilities
│   ├── components/         # Reusable UI components, if present
│   └── ...                 # Other application modules
├── .env.local              # Local environment variables (not committed)
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

The exact contents of `src/` may evolve as the application grows.

## 🔄 Development Workflow

Build and validate changes before committing them:

```bash
npm run build
git status
git add .
git commit -m "Update fin map dashboard"
git push
```

For larger changes, use a feature branch and a pull request to review modifications before merging them into the main branch.

## 🛡️ Security

- Keep private credentials out of source control.
- Use Supabase Authentication for user identity.
- Enforce database access through appropriate Row-Level Security policies.
- Validate transaction and budget data before storing it.
- Keep environment variables configured securely.
- Test authentication, data persistence, and access permissions after database changes.

## 🗺️ Future Improvements

Potential enhancements include:

- Recurring expenses and income.
- Downloadable financial reports.
- Advanced date-range filtering.
- Savings goals and progress tracking.
- Budget notifications.
- Improved mobile navigation.
- Optional currency conversion using exchange-rate data.

## 👨‍💻 Author

**Aviek Pratap Singh**

GitHub: [@Aviek-25](https://github.com/Aviek-25)

## 📄 License

Add a `LICENSE` file to the repository if you want to explicitly publish this project under an open-source license. Until a license is specified, the repository's reuse permissions are not explicitly granted.

---

*fin map — Understand your money. Plan your future.*