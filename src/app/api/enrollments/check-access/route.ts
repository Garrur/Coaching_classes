import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { isExpired } from '@/utils/date';
import User from '@/models/User';
import Enrollment from '@/models/Enrollment';

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

    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Find enrollment
    const enrollment = await Enrollment.findOne({
      userId: user._id,
      courseId,
    }).populate('courseId');

    if (!enrollment) {
      return NextResponse.json(
        { success: false, hasAccess: false, message: 'Not enrolled in this course' },
        { status: 403 }
      );
    }

    // Check if expired (for RECORDED courses)
    if (enrollment.expiryDate) {
      if (isExpired(enrollment.expiryDate)) {
        // Deactivate enrollment
        enrollment.isActive = false;
        await enrollment.save();

        return NextResponse.json(
          { success: false, hasAccess: false, message: 'Course access expired' },
          { status: 403 }
        );
      }
    }

    // Check if enrollment is active
    if (!enrollment.isActive) {
      return NextResponse.json(
        { success: false, hasAccess: false, message: 'Course access inactive' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      hasAccess: true,
      enrollment,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
