# 🏦 Loan Management System

Full-stack MERN + Next.js + TypeScript loan management system.

## Live URLs
- **Frontend:** https://lms-frontend.vercel.app *(update after deploy)*
- **Backend:**  https://lms-backend.onrender.com  *(update after deploy)*

## Tech Stack
| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | Next.js 14 · TypeScript · Tailwind CSS  |
| Backend  | Node.js · Express · TypeScript          |
| Database | MongoDB Atlas · Mongoose                |
| Auth     | JWT · bcrypt                            |
| Upload   | Multer (local)                          |

## Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas URI

### Backend
```bash
cd server
cp ../.env.example .env
# Fill MONGODB_URI and JWT_SECRET in .env
npm install
npm run seed     # creates 6 role accounts
npm run dev      # http://localhost:5000
```

### Frontend
```bash
cd client
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
npm install
npm run dev      # http://localhost:3000
```

## Seed Credentials

| Role         | Email              | Password      |
|--------------|--------------------|---------------|
| Admin        | admin@lms.com      | Admin@123     |
| Sales        | sales@lms.com      | Sales@123     |
| Sanction     | sanction@lms.com   | Sanction@123  |
| Disbursement | disburse@lms.com   | Disburse@123  |
| Collection   | collect@lms.com    | Collect@123   |
| Borrower     | borrower@lms.com   | Borrower@123  |

## Loan Lifecycle
```
LEAD → APPLIED → SANCTIONED → DISBURSED → CLOSED
```

## BRE Rules
- Age between 23–50
- Monthly salary ≥ ₹25,000
- Valid PAN format (ABCDE1234F)
- Employment mode ≠ unemployed

## Loan Formula
```
Simple Interest = (P × R × T) / (365 × 100)
Total Repayment = Principal + Simple Interest
Interest Rate   = 12% p.a. (fixed)
```