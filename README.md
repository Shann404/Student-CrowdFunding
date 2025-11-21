# Student Crowdfunding Web Application (MERN Stack)

A secure, scalable, and transparent student crowdfunding platform where students can request financial support for school fees, and donors/well-wishers can safely contribute from anywhere in the world.

---

## Features

### Student Portal
- Secure registration and login (email/password or Google OAuth)
- Create and manage fundraising campaigns (upload student ID, admission letter, proof of fees)
- Add personal details, school info, course, year of study, and total fee required
- Track funding progress with visual progress bars
- Receive updates/notifications when donors contribute
- Edit or close campaigns when goal is reached
- Withdraw funds (admin-verified only)

### Donor Portal
- Create an account or donate as a guest
- Browse verified student campaigns by filters (location, school, category, urgency, or goal amount)
- View full student profiles and documents (after verification)
- Make secure online payments (Stripe, PayPal, Flutterwave)
- Option to donate anonymously
- View donation history and receipts
- Get email confirmations after donating

### Admin Dashboard
- Manage all users (students and donors)
- Approve/reject student campaign applications after verifying uploaded documents
- Track and manage all donations and withdrawals
- Generate reports (total donations, active campaigns, verified vs unverified students)
- Flag or suspend suspicious users or campaigns
- View analytics dashboard (total raised, most funded students, top donors)

### Security Features
- Two-step student verification (ID + fee structure + admission letter)
- Admin document review & approval before campaigns go live
- JWT authentication + role-based access control
- Server-side validation for all requests
- HTTPS & SSL encryption for sensitive transactions

### Additional Features
- Email & SMS notifications for donations and withdrawals
- Comment section for donors to send encouragement
- Support for multiple currencies (USD, EUR, KES, etc.)

---

## Tech Stack

- **Frontend:** React + Redux Toolkit / Context API, Tailwind CSS / Material UI  
- **Backend:** Node.js + Express.js  
- **Database:** MongoDB + Mongoose  
- **Authentication:** JWT + bcrypt  
- **Payments:** Stripe / PayPal / Flutterwave  
- **Hosting:** Vercel (Frontend), Render/Heroku (Backend), MongoDB Atlas  

---

## Future Enhancements

- Mobile app version (React Native)

- Blockchain-based verification for transparency

- AI-powered fraud detection

- Scholarship matching feature

## Getting Started

# Prerequisites

Node.js v18+

MongoDB Atlas account or local MongoDB

Stripe / PayPal / Flutterwave accounts for payments

# Installation

1. Clone the repository

git clone https://github.com/yourusername/student-crowdfunding.git

cd student-crowdfunding

2. Install backend dependencies

cd server

npm install

3. Install frontend dependencies

cd client

cd CrowdFunding

npm install

4. Set up environment variables

- Create a .env file in the server folder:

NODE_ENV=development

PORT=5000

MONGODB_URI=mongodb://localhost:27017/student-crowdfunding

JWT_SECRET=your_super_secret_jwt_key_here

STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

STRIPE_CONNECT_ACCOUNT_ID=acct_your_connect_account_id

CLOUDINARY_CLOUD_NAME=your_cloudinary_name

CLOUDINARY_API_KEY=your_cloudinary_api_key

CLOUDINARY_API_SECRET=your_cloudinary_api_secret

EMAIL_SERVICE=gmail

EMAIL_USER=your_email@gmail.com

EMAIL_PASS=your_app_password

- Create a .env file in the client folder:

VITE_API_URL=http://localhost:5000/api

REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

6. Start the backend server

cd sever

npm run dev


7.  Start the frontend

cd client

npm run dev

## Screenshots

# Homepage

<img width="1861" height="934" alt="Screenshot 2025-11-12 004140" src="https://github.com/user-attachments/assets/43d20f5d-889a-4ac1-bcb8-90465b2c7253" />

 # Student Dashboard

<img width="1715" height="730" alt="Screenshot 2025-11-12 004220" src="https://github.com/user-attachments/assets/718f118d-151c-4ca0-911c-2e202e7789a0" />

# Donor Dashboard

<img width="1675" height="930" alt="Screenshot 2025-11-12 004201" src="https://github.com/user-attachments/assets/b25426b0-0878-4517-b59b-2094e90869c5" />

# Admin Dashboard

<img width="1255" height="899" alt="Screenshot 2025-11-12 004254" src="https://github.com/user-attachments/assets/7a966d70-c9b0-449f-9a72-a77175c87962" />









