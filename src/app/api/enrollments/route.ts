import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import User from '@/models/User';
import Enrollment from '@/models/Enrollment';

// GET /api/enrollments - Get user's enrollments
export async function GET(req: NextRequest) {
  try {
    const clerkId = await requireAuth();
    await dbConnect();

    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const enrollments = await Enrollment.find({
      userId: user._id,
    })
      .populate('courseId')
      .sort({ createdAt: -1 });

    // Filter out inactive courses
    const activeEnrollments = enrollments.filter((e: any) => e.courseId && e.courseId.isActive);

    return NextResponse.json({ success: true, enrollments: activeEnrollments });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
