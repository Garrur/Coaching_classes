import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { razorpay } from '@/lib/razorpay';
import { requireAuth } from '@/lib/auth';
import User from '@/models/User';
import Course from '@/models/Course';
import Payment from '@/models/Payment';

export async function POST(req: NextRequest) {
  try {
    const clerkId = await requireAuth();
    await dbConnect();

    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get course
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Create Razorpay order
    const options = {
      amount: course.price * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        courseId: course._id.toString(),
        userId: user._id.toString(),
        courseName: course.name,
      },
    };

    const order = await razorpay.orders.create(options);

    // Create payment record
    const payment = await Payment.create({
      userId: user._id,
      courseId: course._id,
      amount: course.price,
      currency: 'INR',
      razorpayOrderId: order.id,
      status: 'PENDING',
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id,
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
