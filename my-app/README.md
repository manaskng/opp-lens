# DevEvent Sync

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Site-2ea44f?style=for-the-badge&logo=vercel)](https://dev-event-sync.vercel.app/)

**DevEvent Sync** is a modern, full-stack platform designed to connect developers through tech events. It goes beyond simple CRUD, offering an intelligent, personalized, and highly interactive experience for discovering, hosting, and managing developer meetups and hackathons.

##  Key Features

### Authentication and Authorisation
security is handled via **Next-Auth v5**, implementing a robust, role-aware authentication system.

- **Multi-Provider Login**: Supports OAuth sign-in via **GitHub** and **Google**, as well as traditional Email/Password credentials.
- **Role-Based Access Control (RBAC)**:
  - **Guests**: Can view public events and landing pages.
  - **Users**: Can book tickets, manage their personal profile, and view their booking history.
  - **Organizers**: Have exclusive rights to edit or delete the events they created. The system verifies ownership at the database level before allowing any mutation.
- **Session Management**: Uses secure, encrypted sessions to persist user state across the application.
- **Protected Routes**: Middleware and server-side checks ensure that private pages (like `/create-event` or `/profile`) are inaccessible without a valid session.

###  System Integrity & Concurrency (New v2.0)
- **Atomic Booking Engine**: Engineered a race-condition-free booking system using **MongoDB Atomic Operations** (`$inc`, `$expr`). This prevents overselling by handling capacity checks and updates in a single, indivisible database transaction.
- **Smart Inventory Management**: Real-time "Sold Out" and "Almost Full" states are enforced at the database level, ensuring 100% data consistency even under high-concurrency load.

###  Intelligence & Personalization
- **Smart Recommendation Engine**: A content-based filtering system that curates a "For You" sidebar based on the user's specific technical interests (e.g., "React", "AI").
- **Time-Aware Feed**: The homepage intelligently separates "Happening Soon" (Urgent) events from general discovery, adapting to the user's local time.
- **Dynamic Greetings**: Personalized welcome messages that change based on the time of day.

###  Performance & UX
- **Optimistic Bookmarking**: Implemented **React 19's `useOptimistic` hook** to provide a zero-latency "Save for Later" experience, ensuring the UI updates instantly while the server processes in the background.
- **Client-Side Validation**: Instant file size checks (4MB limit) prevents unnecessary server load and improves upload UX.
- **Skeleton Loading**: Custom shimmer effects preventing layout shifts (CLS) during data fetching.

###  The Attendee Experience
- **Dynamic Social Cards**: Automated Open Graph (OG) image generation ensures every event link shared on Twitter/LinkedIn looks professional with dynamic titles and dates.

### 👤 Professional Identity
- **Developer Profiles**: A comprehensive profile system acting as a mini-portfolio, showcasing the user's bio, institution, location, GitHub/Portfolio links, and confirmed event schedule.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose)
- **Authentication**: Next-Auth v5 (Google, GitHub, Credentials)
- **Styling**: Tailwind CSS, Shadcn/ui
- **State Management**: Server Actions & React Hooks (`useOptimistic`, `useTransition`)
- **Visuals**: Framer Motion (Animations), OGL (WebGL Effects)
- **Utilities**: `qrcode` (Ticket generation), `date-fns`, `zod`
- **Analytics**: PostHog

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v20 or later)
- `npm`
- A MongoDB database instance

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/manaskng/Dev-Event_Sync.git](https://github.com/manaskng/Dev-Event_Sync.git)
Navigate to the project directory:
Bash
cd Dev-Event_Sync
Install dependencies:
Bash
npm install
Set up environment variables: Create a .env.local file in the root of the project and add the following variables.
Code snippet

# Database
MONGODB_URI=your_mongodb_connection_string

# Auth (Generate with `openssl rand -base64 32`)
AUTH_SECRET=your_next_auth_secret
# OAuth Providers
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
# Image Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
# Base URL (Set to your Vercel URL in production)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=your_key
Run the development server:
Bash
npm run dev
Open http://localhost:3000 in your browser to see the result.

📂 Project Structure
app/: Next.js 15 App Router structure.
(auth)/: Login/Register logic.
events/: Event details, creation, and editing flows.
profile/: User dashboard and settings.
components/: Reusable UI components (EventCard, TicketCard, etc.).
database/: Mongoose schemas for User, Event, and Booking.
lib/:
actions/: Server Actions responsible for all data mutations.
mongodb.ts: Cached database connection for performance.

Built with ❤️ by Manas Raj
