# B2B Reverse Auction & Real-Time Bidding Marketplace

A full-stack procurement platform where buyers post bulk requirements (RFQs) and
sellers compete with live, real-time bids. Built per the project proposal on the
specified stack: **React + Redux Toolkit + Tailwind / Node + Express / MongoDB /
Socket.IO / Stripe + Razorpay / JWT**.

This is a working development scaffold — every feature area from the proposal is
wired end-to-end, ready to extend.

---

## Project structure

```
b2b-marketplace/
├── server/                 # Node + Express + Socket.IO API
│   └── src/
│       ├── config/         # DB connection
│       ├── models/         # User, RFQ, Bid, Order, Negotiation, Notification, Review
│       ├── controllers/    # Route handlers (auth, rfq, bid, order, negotiation, payment, admin…)
│       ├── routes/         # Express routers
│       ├── middleware/     # JWT auth, role guard, validation, errors
│       ├── sockets/        # Socket.IO server + room emitters
│       ├── services/       # Notification + payment (Stripe/Razorpay) services
│       └── utils/          # Token signing, demo seed script
└── client/                 # React + Redux Toolkit + Tailwind (Vite)
    └── src/
        ├── app/            # Redux store
        ├── features/       # Redux slices (auth, notifications)
        ├── services/       # axios API client, socket.io client
        ├── components/     # Shared UI (ProtectedRoute, StatusBadge)
        ├── layouts/        # App shell with nav + live notification bell
        └── pages/          # Login, Register, Dashboard, RFQ list/create/detail,
                            #   Orders, OrderDetail, Negotiation, Admin
```

---

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) — or update `MONGO_URI`

## Setup

### 1. Backend
```bash
cd server
npm install
cp .env.example .env        # then edit secrets as needed
npm run seed                # optional: demo users + a sample RFQ
npm run dev                 # starts API on http://localhost:5000
```

### 2. Frontend
```bash
cd client
npm install
cp .env.example .env
npm run dev                 # starts app on http://localhost:5173
```

Open http://localhost:5173.

### Demo accounts (after `npm run seed`)
| Role   | Email             | Password |
|--------|-------------------|----------|
| Admin  | admin@demo.com    | password |
| Buyer  | buyer@demo.com    | password |
| Seller | seller1@demo.com  | password |
| Seller | seller2@demo.com  | password |

To see real-time bidding: open the sample RFQ as the buyer in one browser and
as a seller in another (or an incognito window). Bids placed by the seller appear
on the buyer's screen instantly — no refresh.

To leave a review: complete an order (buyer accepts a bid → pays → seller advances
through shipped/delivered → buyer marks completed). A star-rating form then appears
on the order page. Submitting it updates the seller's average rating, which links
through to their full review history from the bid list.

---

## Feature coverage (mapped to proposal §3)

| Proposal feature                | Status | Where |
|---------------------------------|--------|-------|
| JWT auth + role-based access    | ✅ | `middleware/auth.js`, `authController` |
| RFQ system (all fields)         | ✅ | `RFQ` model, `rfqController`, RFQ pages |
| Real-time bidding (WebSocket)   | ✅ | `sockets/`, `bidController`, `RFQDetailPage` |
| Lowest-bid highlight + history  | ✅ | `RFQDetailPage`, `Bid.history` |
| Negotiation + counter-offers    | ✅ | `Negotiation` model, `NegotiationPage` |
| Order management + status flow  | ✅ | `Order` model, `orderController` |
| Payments (Stripe + Razorpay)    | ✅ | `paymentService`, `paymentController` |
| Notifications (in-app + email)  | ✅ | `notificationService` (email stubbed for dev) |
| Admin panel + analytics         | ✅ | `adminController`, `AdminPage` |
| Seller ratings & reviews        | ✅ | `Review` model, `reviewController`, `OrderDetailPage`, `SellerReviewsPage` |

---

## Notes for production hardening

These are intentionally simplified for a local dev scaffold:

- **Payments** confirm via a direct endpoint. In production, verify Stripe via
  webhooks and Razorpay via signature checks before marking an order paid.
- **Email** is a `console.log` stub in `notificationService.js`. Swap in
  nodemailer or a provider (SendGrid/SES).
- **File attachments** on RFQs store URL strings; add real upload handling
  (S3/Cloudinary/multer).
- Add rate limiting, helmet, and refresh-token rotation before deploy.
