# Running the Application

This guide explains how to run the Clinic Management PWA and access its unified features.

## Prerequisites

1.  **Supabase Setup**: Ensure you have a Supabase project and the environment variables are set in `web/.env.local`:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    ```
2.  **Dependencies**: Install dependencies in the `web` directory.
    ```bash
    cd web
    npm install
    ```

## Development Mode

Run the following command to start the development server:
```bash
npm run dev
```
The app will be available at [http://localhost:3000](http://localhost:3000).

## Accessing Different Modes

The application distinguishes between **Therapist Reporting** and **Backoffice** based on screen size.

### 1. Therapist Reporting (Mobile View)
Designed for on-the-go use by the therapist.
- **How to access**: Open the app on a mobile device or use Browser DevTools (F12) to toggle "Device Toolbar" and select a mobile screen size.
- **Features**:
  - Quick reporting of Meetings and Payments via Dashboard.
  - Adding new customers.
  - *Restricted*: No editing/deleting of customers. No reconciliation (marking meetings as paid).

### 2. Backoffice (Desktop View)
Comprehensive management interface.
- **How to access**: Open the app on a desktop browser.
- **Features**:
  - Sidebar navigation.
  - Full customer management (Edit/Delete).
  - Reconciliation (Match payments to meetings).
  - Full dashboards and stats.

## PWA Installation

To install as a standalone app on your device:
- **iPhone (Safari)**: Tap "Share" icon -> "Add to Home Screen".
- **Android (Chrome)**: Tap menu (three dots) -> "Install app".
- **Desktop (Chrome)**: Click the "Install" icon in the address bar.
