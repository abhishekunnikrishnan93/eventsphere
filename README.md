# EventSphere - Online Event Booking and Management System

## Project Overview
EventSphere is a modern, full-stack web application designed to simplify event discovery, registration, and management. It provides a seamless experience for attendees to book tickets, while offering powerful dashboard tools for organizers to create events and admins to moderate the platform.

---

## Final Deliverables Status Checklist

1. ✅ **Fully functional event booking web application:** Completed. The platform features an interactive UI, full backend API, and MongoDB integration.
2. ✅ **Source code, wireframes and documentation:** Source code is fully delivered. The modern UI serves as the high-fidelity implementation of wireframes. This README serves as the core documentation.
3. ✅ **Database schema and setup instructions:** Provided below.
4. ✅ **Test design document, test cases, and scenarios:** Completed (See `test_cases.md`).
5. ⏳ **Execution video demonstrating features:** *Pending.* (You can use a screen recorder like OBS, Loom, or Windows Snipping Tool to record yourself clicking through the UI, or let me know and I can attempt to generate an automated WebP recording for you).

---

## Technology Stack
- **Frontend:** React.js, Vite, Tailwind CSS v4, Lucide React (Icons)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ORM)
- **Authentication:** JSON Web Tokens (JWT), bcrypt.js

---

## Database Schemas

### 1. User Schema (`users` collection)
- `_id`: ObjectId
- `name`: String (Required)
- `email`: String (Required, Unique)
- `password`: String (Hashed, Required)
- `role`: String (Enum: `user`, `organizer`, `admin`) - *Default: user*

### 2. Event Schema (`events` collection)
- `_id`: ObjectId
- `title`: String (Required)
- `description`: String (Required)
- `category`: String (Default: 'General')
- `date`: Date (Required)
- `endDate`: Date (Optional, for multi-day events)
- `durationDays`: Number (Default: 1)
- `location`: String (Required)
- `price`: Number (Required)
- `totalSeats`: Number (Required)
- `availableSeats`: Number (Required)
- `imageUrl`: String
- `status`: String (Enum: `pending`, `approved`, `rejected`) - *Default: pending*
- `organizerId`: ObjectId (Ref: User)
- `seats`: Array of Objects `[{ seatNumber: String, status: String }]`

### 3. Booking Schema (`bookings` collection)
- `_id`: ObjectId
- `eventId`: ObjectId (Ref: Event)
- `userId`: ObjectId (Ref: User)
- `tickets`: Number (Required)
- `selectedSeats`: Array of Strings
- `totalAmount`: Number (Required)
- `paymentSimulationId`: String
- `status`: String (Enum: `confirmed`, `cancelled`) - *Default: confirmed*

---

## Setup & Installation Instructions

### Prerequisites
- Node.js installed (v16+)
- MongoDB running locally (default port 27017) or a MongoDB Atlas URI.

### Step 1: Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   node server.js
   ```
   *(The server will run on http://localhost:5000 and connect to the local `event_booking_db`)*

### Step 2: Frontend Setup
1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *(The app will be accessible at http://localhost:5173)*

---

## Core Features Implemented
- **3-Tier Role System:** Granular access control for Attendees, Organizers, and Admins.
- **Admin Moderation:** All new/edited events enter a `pending` state and must be approved by an admin before appearing to the public.
- **Advanced Seating System:** A dynamic, visual 20x25 grid layout allowing users to pick specific seats, with atomic reservation logic to prevent double-booking.
- **Multi-Day Events:** Organizers can span events across multiple days with automatic date-range formatting across the UI.
- **Digital Ticketing:** Generates a visually appealing, printable ticket stub upon successful payment simulation.
