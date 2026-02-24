# Clinic Management PWA

A unified, mobile-first Progressive Web App (PWA) for independent therapists to track meetings, customers, and payments. This solution provides a native-like experience on all devices while maintaining a powerful interface for administrative tasks.

## Features

### Unified Experience
- **Mobile-First Design**: Optimized for small screens with thumb-friendly navigation and quick-action modals.
- **Fast Reporting**: Quick entry for meetings (Child, Parent, Parents) and cash payments, ideal for busy schedules.
- **Customer Directory**: Add new customers, view core details, and manage contact information.
- **Reconciliation**: Match meetings to payments on-the-go or from a desktop.
- **Data Insights**: Dashboard summary of earnings, pending items, and schedules.
- **Cross-Platform**: Install the app directly on your iPhone, Android, or desktop for a standalone experience.

## Tech Stack

- **Unified Frontend**: Next.js (React Framework) with Tailwind CSS.
- **PWA Integration**: Service Workers and Web Manifest for offline reliability and home-screen installation.
- **Database**: Supabase (PostgreSQL) - Handles relations and real-time synchronization.

## Database Schema Highlights

The system uses a relational PostgreSQL database with the following core entities:

- **Customers**: Names, cell phones, emails, and custom tariffs (`tariff_default` vs `tariff_parents`).
- **Meetings**: Linked to customers, tracking date, type (Child/Parent/Parents), and payment status.
- **Payments**: Linked to customers, tracking actual funds received, methods, and reference IDs.

## Development Setup

1. **Database**: Initialize a Supabase project and apply the schema in `supabase/migrations/`.
2. **Setup Environment**:
   - Create a `web/.env.local` file with your Supabase credentials:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     ```
3. **Run Application**:
   - Navigate to the `web/` directory.
   - Run `npm install` and `npm run dev`.

## Getting Started

For a detailed guide on how to install the app on your phone and manage the clinic, see the [Walkthrough](file:///Users/ido1/.gemini/antigravity/brain/acd6b7e2-0b64-45e3-a872-cb1e49c4ef3b/walkthrough.md).

## Maintainability

This project strictly follows **DevOps and IaC principles**:
- **Single Codebase**: One unified project for all platforms.
- **Database as Code**: All schema changes are managed via migrations.
- **CI/CD**: Build validation and automated deployment handled via GitHub Actions.
- **Live Sync**: Real-time integration via Supabase.
