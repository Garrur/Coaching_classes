# Classes– Full-Scale Coaching Website

> **Professional coaching platform** with dual course systems: pre-recorded courses (6-month validity) and live scheduled classes.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green) ![Razorpay](https://img.shields.io/badge/Razorpay-Integrated-blue)

---

## 🎯 Features

### **Two Distinct Course Systems**

#### 📹 Pre-Recorded Courses
- Video-based learning with module organization
- **6-month validity** from purchase date
- Auto-expire functionality
- Progress tracking
- Watch anytime access

#### 🔴 Live Courses
- Real-time daily classes with scheduled timing
- Admin-controlled class schedule
- Students can view timetable (read-only)
- Time-based "Join Live Class" button
- Zoom/Google Meet integration

### **Role-Based Access Control**

#### 👤 Students
- Browse and purchase courses
- Watch pre-recorded videos
- Join live classes
- Track learning progress
- View payment history

#### 🛠️ Admin
- Full CRUD for courses
- Upload and manage videos
- Schedule and reschedule live classes
- View student enrollments
- Access payment reports and analytics

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Authentication**: Clerk
- **Payments**: Razorpay
- **Styling**: Tailwind CSS with custom design system

---

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account
- Clerk account
- Razorpay account

### 1. Clone and Install

```bash
cd d:/Apppsss
npm install
```

### 2. Environment Setup

Create `.env.local` in the root directory:

```env
# Database
MONGODB_URI=your_mongodb_atlas_connection_string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Razorpay Payment
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configure MongoDB

1. Create a MongoDB Atlas cluster
2. Get your connection string
3. Replace `MONGODB_URI` in `.env.local`

### 4. Configure Clerk

1. Create a Clerk application
2. Get API keys from the dashboard
3. Add webhook endpoint: `https://yourdomain.com/api/auth/webhook`
4. Set up custom metadata field `role` (STUDENT/ADMIN)

**To create an admin user:**
- Sign up normally
- Go to Clerk Dashboard → Users → Select your user
- Add to Metadata → Public: `{ "role": "ADMIN" }`

### 5. Configure Razorpay

1. Create a Razorpay account
2. Get API keys from Settings
3. Enable test mode for development
4. Add webhook: `https://yourdomain.com/api/payments/webhook`

---

## 🚀 Running the Application

### Development

```bash
npm run dev
```

Visit `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

---

## 📂 Project Structure

```
d:/Apppsss/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Homepage
│   │   ├── courses/                    # Course listing
│   │   ├── course/[id]/                # Course detail
│   │   ├── student/
│   │   │   ├── dashboard/              # Student dashboard
│   │   │   └── courses/[id]/           # Course viewer
│   │   ├── admin/
│   │   │   ├── dashboard/              # Admin dashboard
│   │   │   ├── courses/                # Course management
│   │   │   ├── students/               # Student management
│   │   │   └── reports/                # Analytics
│   │   └── api/
│   │       ├── auth/webhook/           # Clerk sync
│   │       ├── courses/                # Course APIs
│   │       ├── enrollments/            # Enrollment APIs
│   │       ├── payments/               # Payment APIs
│   │       └── admin/                  # Admin APIs
│   ├── components/                     # Reusable components
│   ├── lib/
│   │   ├── db.ts                       # MongoDB connection
│   │   ├── auth.ts                     # Auth utilities
│   │   └── razorpay.ts                 # Payment utilities
│   ├── models/
│   │   ├── User.ts                     # User model
│   │   ├── Course.ts                   # Course model
│   │   ├── Enrollment.ts               # Enrollment model
│   │   └── Payment.ts                  # Payment model
│   ├── utils/
│   │   └── date.ts                     # Date utilities
│   └── middleware.ts                   # Route protection
├── scripts/
│   └── cron-expiry-check.js            # Expiry automation
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## 🎨 Key Workflows

### Student Flow
1. Browse courses on `/courses`
2. Click course → View details
3. Click "Buy Now" → Razorpay checkout
4. Auto-enrollment on payment success
5. Access course from student dashboard
6. Watch videos (recorded) or join live classes

### Admin Flow
1. Login with admin account
2. Navigate to `/admin/dashboard`
3. Create new course (recorded or live)
4. For recorded: Add modules, upload videos later
5. For live: Set schedule with meeting links
6. View enrollments and revenue reports

---

## 🔧 Customization

### Change Validity Period
Edit `src/utils/date.ts`:
```typescript
export function calculateExpiryDate(purchaseDate: Date): Date {
  return addMonths(purchaseDate, 6); // Change 6 to your desired months
}
```

### Styling
- Colors: `tailwind.config.ts`
- Global styles: `src/app/globals.css`

---

## 📅 Automation

### Expiry Check Cron Job

Run manually:
```bash
npm run cron:check-expiry
```

#### Set up with Vercel Cron

Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/check-expiry",
    "schedule": "0 0 * * *"
  }]
}
```

Create API route `src/app/api/cron/check-expiry/route.ts`:
```typescript
import checkExpiry from '@/scripts/cron-expiry-check';

export async function GET() {
  const result = await checkExpiry();
  return Response.json(result);
}
```

---

## 🚢 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables
Add all `.env.local` variables to Vercel dashboard

### Post-Deployment
1. Update Clerk webhook URL
2. Update Razorpay webhook URL
3. Update `NEXT_PUBLIC_APP_URL`

---

## 🔐 Security Features

- ✅ Role-based access control
- ✅ Protected API routes
- ✅ Signed URLs for video streaming (planned)
- ✅ Payment signature verification
- ✅ HTTPS enforcement
- ✅ No direct video download

---

## 📊 Database Schema

### Users
```
{
  clerkId: String (unique),
  email: String,
  name: String,
  phone: String,
  role: 'STUDENT' | 'ADMIN'
}
```

### Courses
```
{
  name: String,
  description: String,
  courseType: 'RECORDED' | 'LIVE',
  price: Number,
  validity: Number (for RECORDED),
  videos: Array,
  modules: Array,
  schedule: Array (for LIVE),
  duration: Number (for LIVE),
  startDate: Date (for LIVE),
  endDate: Date (for LIVE)
}
```

### Enrollments
```
{
  userId: ObjectId,
  courseId: ObjectId,
  purchaseDate: Date,
  expiryDate: Date (for RECORDED),
  isActive: Boolean,
  progress: Array,
  paymentId: ObjectId
}
```

---

## 🐛 Troubleshooting

### Payment not working
- Check Razorpay test mode enabled
- Verify API keys in `.env.local`
- Check webhook URL configured

### Videos not showing
- Ensure enrollment is active
- Check course has videos array
- Verify expiry date for recorded courses

### Can't access admin panel
- Check user role in Clerk metadata
- Ensure role is exactly "ADMIN" (case-sensitive)

---

## 📝 License

© 2026  Classes. All rights reserved.

---

## 🤝 Support

For issues or questions, contact the development team.

**Built with ❤️ for  Classes**
