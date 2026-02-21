# Clinic Management App

A comprehensive management system for independent therapists to track meetings, customers, and payments.

## Features

### Mobile App (iPhone)
- **Fast Reporting**: Optimized for busy schedules. Quick entry for meetings (Child, Parent, Parents) and cash payments.
- **Customer Directory**: Add new customers and view core details.
- **Tracking**: Side menu for viewing history and statuses.

### Web Back-office
- **Full Administration**: Edit detailed customer fields (emails, phone, invoice names).
- **Payment Management**: Report payments of all types (Bit, Paybox, Bank Draft).
- **Reconciliation**: Match meetings to payments to ensure everything is accounted for.
- **Data Insights**: Dashboard summary of earnings and schedules.

## Tech Stack

- **Frontend (Mobile)**: SwiftUI (Native iOS)
- **Frontend (Web)**: Next.js (React Framework)
- **Database**: Supabase (PostgreSQL) - Handles relations and online synchronization.

## Database Schema Highlights

The system uses a relational PostgreSQL database with the following core entities:

- **Customers**: Names, cell phones, emails, and custom tariffs (`tariff_default` vs `tariff_parents`).
- **Meetings**: Linked to customers, tracking date, type (Child/Parent/Parents), and payment status.
- **Payments**: Linked to customers, tracking actual funds received, methods, and reference IDs.

## Development Setup

1. **Database**: Initialize a Supabase project and apply the schema (SQL provided in `implementation_plan.md`).
2. **Mobile App**: Open the `mobile/` directory (to be created) in Xcode.
3. **Web Portal**: Run `npm install` and `npm run dev` in the `web/` directory (to be created).

## Maintainability

This project uses **Primary Keys (PK)** for all records to ensure data integrity and easy reconciliation. The integration between the mobile app and the web portal is handled through Supabase's real-time API.
