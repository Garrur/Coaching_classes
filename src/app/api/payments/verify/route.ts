import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { calculateExpiryDate } from '@/utils/date';
import { requireAuth } from '@/lib/auth';
import User from '@/models/User';
import Course from '@/models/Course';
import Payment from '@/models/Payment';
import Enrollment from '@/models/Enrollment';

export async function POST(req: NextRequest) {
  try {
    const clerkId = await requireAuth();
    await dbConnect();

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = await req.json();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment details' },
        { status: 400 }
      );
    }

    // Verify signature
    const isValid = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Find payment record
    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment record not found' },
        { status: 404 }
      );
    }

    // Update payment status
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = 'SUCCESS';
    await payment.save();

    // Get course to determine expiry
    const course = await Course.findById(payment.courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      userId: payment.userId,
      courseId: payment.courseId,
    });

    if (existingEnrollment) {
      return NextResponse.json({
        success: true,
        message: 'Already enrolled',
        enrollment: existingEnrollment,
      });
    }

    // Create enrollment
    const enrollmentData: any = {
      userId: payment.userId,
      courseId: payment.courseId,
      purchaseDate: new Date(),
      isActive: true,
      progress: [],
      paymentId: payment._id,
    };

    // Set expiry for RECORDED courses
    if (course.courseType === 'RECORDED') {
      enrollmentData.expiryDate = calculateExpiryDate(new Date());
    }

    const enrollment = await Enrollment.create(enrollmentData);

    return NextResponse.json({
      success: true,
      message: 'Payment verified and enrolled successfully',
      enrollment,
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
