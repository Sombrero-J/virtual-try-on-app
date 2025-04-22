# Virtual Try On & Digital Wardrobe - Final Year Project - by Weng Chan

This is a Final Year Project built with SvelteKit and Supabase, designed to provide users with a seamless experience for managing their clothing items digitally and visualising how outfits might look using virtual try-on technology.

## Features

*   **Digital Wardrobe:** Upload, categorise, view, and manage your clothing items.
*   **Outfit Creation:** Combine items from your wardrobe to create and save outfits.
*   **Virtual Try-On (VTO):** Utilises the HeyBeauty API to visualise clothing items on a user-provided model.
*   **User Authentication:** Secure login, sign-up, and session management powered by Supabase Auth.
*   **Real time Updates:** Using Supabase Realtime subscriptions for a dynamic user experience.

## Tech Stack

*   **Framework:** SvelteKit
*   **Backend & Database:** Supabase (Authentication, Postgres Database, Storage, Edge Functions)
*   **Styling:** Tailwind CSS (Configured in `src/app.css`)
*   **UI Components:** Primarily custom components, with some utility from `melt-ui` (located in `src/lib/components/melt`).
*   **APIs:**
    *   HeyBeauty API: Core Virtual Try-On functionality.
    *   OpenAI API: Used for specific features (generating descriptions, brands, materials and colours).
*   **Libraries:**
    * Browser image compression.
    * Qrcode (for uploading via phones)
*   **Testing APIs (Non-Production):**
    *   Hugging Face API
    *   AWS Rekognition

## Project Structure

Here's an overall map of the main project directories and their purposes:
.
├── .env # Environment variables (API keys, Supabase credentials)
├── node_modules/ # Project dependencies (managed by npm)
├── supabase/
│ └── functions/ # Supabase Edge Functions
│ ├── gen-outfit/ # Edge function for generating multi-clothing outfits VTO
│ └── try-on/ # Edge function for single clothing item VTO
├── src/
│ ├── app.css # Tailwind CSS configuration
│ ├── app.d.ts # TypeScript type definitions
│ ├── app.html # Main HTML template shell for SvelteKit
│ ├── hooks.server.ts # Server-side hooks (Supabase client init, Auth guards)
│ ├── lib/
│ │ ├── assets/ # Static image assets
│ │ ├── clientUtil/ # Utility functions safe to run in the browser (e.g., image compression)
│ │ ├── components/ # Reusable Svelte components
│ │ ├── server/ # Server-only utility functions (Database, external API calls - OpenAI, AWS, HF)
│ │ ├── state/ # Svelte stores for state management (VTO state, filters, delete confirmations)
│ │ ├── svg/ # SVG icons and illustrations
│ │ └── type/ # Auto-generated Supabase DB types
│ ├── routes/ # Pages and API endpoints (File-based routing)
│ │ ├── +layout.server.ts # fetches user/session
│ │ ├── +layout.ts # creates Supabase browser/server clients
│ │ ├── +layout.svelte # Navbar, global layout, Realtime subscriptions
│ │ ├── +page.server.ts # server load functions & actions
│ │ ├── +page.svelte # UI and main logic
│ │ │
│ │ ├── (app)/ # Route group (e.g., /home, /wardrobe, /outfits)
│ │ │
│ │ ├── (auth)/ # Route group for authentication pages
│ │ │ ├── login/
│ │ │ ├── sign-up/
│ │ │ ├── logout/
│ │ │ └── beta/ # TESTING AREA: Isolated component/API tests (not production)
│ │ │
│ │ ├── (vto)/ # Route group for the Virtual Try-On interface
│ │ │
│ │ └── api/ # Custom server-side API endpoints
│ │ ├── queryTask/
│ │ ├── saveTryOn/
│ │ └── submitTask/
└── ... # Other config files (package.json, svelte.config.js, tailwind.config.js, etc.)

## Key Functionality Breakdown

*   **Core Application Logic (`src/`):**
    *   `hooks.server.ts`: Populating locals variables with supabase init and enforces auth guards on specific routes.

    *   `lib/`: Contains the building blocks of the application. Code is organised into client-side (`clientUtil`), server-side (`server`), UI (`components`), state management (`state`), type definitions (`type`), and assets (`assets`, `svg`).
    
    *   `routes/`: Defines the application's pages and API endpoints.
        *   **Layouts (`+layout.*`):** Provide consistent structure. The root layout handles user session loading, Supabase client availability, the main navigation bar, and initialises real-time database subscriptions.
        *   **Pages (`+page.*`):** Represent individual views. `.svelte` files contain the UI markup and client-side logic (including form handling that often triggers server `actions`). `.server.ts` files handle data loading (`load` function) for the page and process form submissions (`actions`).
        *   **Layout Groups (`(app)`, `(auth)`, `(vto)`):** Organise routes into logical sections without affecting the URL path, allowing for different layouts or logic for distinct parts of the app.
        *   **API Routes (`routes/api/`):** Custom backend endpoints built within SvelteKit using `+server.ts` files. These handle specific server side tasks like querying VTO task status (`queryTask`), saving results (`saveTryOn`), and initiating VTO jobs (`submitTask`).

## Environment Variables

To streamline the setup and evaluation process for markers, the `.env` file containing necessary API keys and configuration variables is included within this submitted codebase zip file. **Please be aware:** This is strictly an exception made for the convenience of academic assessment. In any standard development or production environment, committing or directly sharing `.env` files containing sensitive credentials poses a significant security risk and violates best practices.

## 🧪 Testing

The project includes a dedicated area for testing components, API interactions, and functions in isolation:

*   **Location:** `src/routes/(auth)/beta/`
*   **Purpose:** Contains pages and components used solely for development testing. These are **not** part of the final production application flow and may contain dummy data or direct API call tests.

## 🚀 Getting Started

1.  **Extract the Zip:**
    Extract the Zip file contents into a directory and navigate into it using your terminal.

2.  **Install dependencies:**
    ```
    npm install
    ```

3.  **Environment Variables Setup:**
    *   The `.env` file is included in the submission. Ensure this file is present in the root directory of the extracted project.

4.  **Run the development server:**
    ```
    npm run dev -- --open
    ```
    This will start the SvelteKit development server, typically accessible at `http://localhost:5173`.