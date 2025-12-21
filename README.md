# Nexus CRM | Intelligent Revenue Operating System

Nexus CRM is a modern, AI-powered customer relationship management platform designed to help sales teams close more deals, faster. Built with performance and user experience in mind, it combines robust pipeline management with predictive intelligence.

![Nexus CRM Dashboard](public/window.svg)

## 🚀 Features

- **Intelligent Dashboard**: Real-time overview of revenue, active deals, and conversion rates.
- **Visual Pipeline**: Drag-and-drop Kanban board for managing deal stages.
- **AI Assistant**: Built-in Gemini-powered sales assistant to analyze data, draft emails, and provide insights.
- **Lead Management**: Comprehensive lead scoring and tracking.
- **Forecasting**: Predictive analytics to estimate future revenue.
- **Communication Hub**: Integrated messaging for team collaboration.
- **Task Management**: To-do lists and activity tracking.

### ✨ What We've Built Recently
- **Production-Ready Landing Page**: A high-impact, 8-section landing page with:
    -   Dynamic Hero Section with Dashboard Preview
    -   "Trusted by" Social Proof
    -   Detailed Feature Breakdowns (Pipeline, Analytics)
    -   Pricing Tiers & FAQ
- **Enhanced Sidebar**: Dynamic user profile integration with "Sign Out" functionality.
- **In-App Test Runner**: A "Verify System" feature that allows running unit/integration tests directly from the dashboard interface (requires dev environment).
- **Global Error Handling**: Robust error boundaries to catch and handle UI crashes gracefully.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **AI**: Google Gemini API
- **Testing**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/)

## 🧪 Testing

We use **Vitest** and **React Testing Library** for a robust, production-grade testing environment (JSX-compatible).

### Running Tests
To run the full test suite:

```bash
npm test
```

### Writing Tests
- **Unit Tests**: Located alongside components (e.g., `components/ui/button.test.jsx`).
- **Integration Tests**: Verify component interactions (e.g., `components/layout/AppSidebar.test.jsx`).

### System Verification (In-App)
We have implemented a **"Verify System"** feature that allows you to run these tests directly from the dashboard:
1.  Navigate to the Dashboard Sidebar.
2.  Click the **"Verify System"** button (flask icon) located just above your user profile.
3.  A diagnostics dialog will open, executing the full test suite via a server-side API.
4.  View real-time pass/fail results for all unit and integration tests.

> **Note**: This feature relies on the server-side `vitest` process and requires the development environment (node_modules) to be present.

## ⚡ Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- A Supabase project
- A Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Suraj231194/Nexus-CRM.git
   cd revenue-os-next
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and add the following keys:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
revenue-os-next/
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Authentication pages (login, signup)
│   ├── (dashboard)/      # Protected dashboard pages
│   ├── error.jsx         # Global Error Boundary
│   └── layout.js         # Root layout
├── components/           # Reusable React components
│   ├── layout/           # Sidebar, Header, etc.
│   └── ui/               # Shadcn UI components
├── lib/                  # Utilities and Supabase client
└── public/               # Static assets
```

## 🚀 Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

1. Push your code to GitHub.
2. Import the project in Vercel.
3. Add your environment variables in the Vercel dashboard.
4. Deploy!

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
