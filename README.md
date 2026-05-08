# 🎟️ EventSphere - Online Event Booking & Management System

![EventSphere Banner](https://via.placeholder.com/1200x400/0f172a/ffffff?text=EventSphere+-+Modern+Event+Ticketing+Platform)

EventSphere is a premium, full-stack web application built to streamline the entire lifecycle of event management and ticket booking. Designed with a modern, dynamic, and fully responsive user interface, EventSphere provides distinct experiences for three types of users: Attendees, Organizers, and System Administrators.

---

## 🌟 Key Features

### 1. Robust Role-Based Access Control (RBAC)
- **Attendees:** Can browse events, view details, select seats, simulate payments, and generate digital ticket stubs.
- **Organizers:** Have a dedicated dashboard to create events, set pricing, define seat capacity, specify multi-day durations, and track their ticket sales.
- **Admins:** Have a centralized dashboard to moderate the platform. All newly created events go into a "Pending" state and must be manually approved or rejected by an admin before the public can view them. Admins can also manage user roles or delete accounts.

### 2. Advanced Interactive Seat Selection
Gone are the days of simple dropdowns. EventSphere features a highly interactive **20x25 visual seating grid**. 
- Users can click specific seats on a visual layout of the venue.
- **Atomic Reservation Engine:** The backend temporarily locks seats while a user is in checkout to prevent double-booking. If the payment is not completed, the seats are released back into the pool.

### 3. Multi-Day Event Architecture
Organizers are not restricted to single-day events. When creating an event, they can specify the duration (e.g., 3 Days) and a start date. The system automatically calculates the end date and gracefully displays beautiful, formatted date ranges (e.g., *Oct 10 - Oct 12*) across the UI and digital tickets.

### 4. Flawless Mobile Responsiveness
The entire platform is designed to look stunning on both 4K monitors and mobile phones.
- Features a mobile-first collapsible hamburger navigation menu.
- The massive interactive seating grid is wrapped in a custom horizontal-scroll container so it never breaks the page layout on small devices.
- Action buttons on dashboards intuitively stack vertically to save screen space on mobile.

### 5. Digital Ticketing & Checkout
- A simulated credit card checkout process generates a unique, finalized booking.
- Users are presented with a printable **Digital Ticket Stub** featuring a simulated QR code, booking ID, seat numbers, and venue information.

---

## 🛠️ Technology Stack

**Frontend (Client)**
- React.js (Vite)
- Tailwind CSS v4 (Modern styling, glassmorphism, responsive grids)
- Lucide React (SVG icon system)
- Axios (API requests)

**Backend (Server)**
- Node.js & Express.js (REST API architecture)
- MongoDB (Mongoose ORM)
- JSON Web Tokens (JWT) for stateless authentication
- bcrypt.js for secure password hashing

---

## 🗄️ Database Schema Architecture

### Users Collection
Stores authentication and role data.
- `name` (String, Required)
- `email` (String, Unique)
- `password` (String, Hashed)
- `role` (Enum: `user`, `organizer`, `admin`)

### Events Collection
Stores event metadata, pricing, and the generated seat map.
- `title`, `description`, `location`, `imageUrl`
- `date` (Start Date), `endDate` (Calculated for multi-day)
- `durationDays` (Number)
- `price`, `totalSeats`, `availableSeats`
- `status` (Enum: `pending`, `approved`, `rejected`)
- `organizerId` (Reference to User)
- `seats` (Array of Objects mapping exact seat letters/numbers to booking statuses)

### Bookings Collection
Tracks transactions and locks seats.
- `eventId` (Reference to Event)
- `userId` (Reference to User)
- `tickets` (Number of seats)
- `selectedSeats` (Array of seat numbers, e.g., `["A1", "A2"]`)
- `totalAmount` (Number)
- `status` (Enum: `confirmed`, `cancelled`)

---

## 🚀 Setup & Installation Guide

Follow these steps to run the platform locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (Running locally on port `27017` or an Atlas URI)

### 1. Start the Backend Server
Open a terminal and navigate to the backend folder:
```bash
cd server
npm install
```
Ensure you have a `.env` file inside the `server` folder with the following variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/eventsphere
JWT_SECRET=your_super_secret_key_here
```
Run the server:
```bash
node server.js
```
*(The backend runs on `http://localhost:5000`)*

### 2. Start the Frontend Client
Open a **new** terminal window and navigate to the frontend folder:
```bash
cd client
npm install
```
Run the Vite development server:
```bash
npm run dev
```
*(The UI runs on `http://localhost:5173`)*

---

## 👨‍💻 Standard Testing Workflow
1. **Register** a new account. By default, it will be a standard `user`.
2. To test management features, access your MongoDB database and change your user document's `role` to `"admin"`.
3. Create a second account and change its role to `"organizer"`.
4. Log in as the **Organizer**, go to the dashboard, and create a multi-day event.
5. Log in as the **Admin**, go to the Admin Dashboard, and click the green checkmark to *Approve* the pending event.
6. Log in as a standard **User**, browse the home page, select seats on the interactive map, and check out!

---
*Developed as a comprehensive showcase of modern full-stack web development, atomic database transactions, and responsive UI design.*
