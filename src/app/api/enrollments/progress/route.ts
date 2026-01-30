import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import User from '@/models/User';
import Enrollment from '@/models/Enrollment';

export async function POST(req: NextRequest) {
  try {
    const clerkId = await requireAuth();
    await dbConnect();

    const { courseId, videoId, watchedDuration, completed } = await req.json();

    if (!courseId || !videoId) {
      return NextResponse.json(
        { success: false, error: 'Course ID and Video ID are required' },
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
      isActive: true,
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Not enrolled in this course' },
        { status: 403 }
      );
    }

    // Update or create progress for this video
    const existingProgressIndex = enrollment.progress.findIndex(
      (p: any) => p.videoId === videoId
    );

    if (existingProgressIndex >= 0) {
      // Update existing progress
      enrollment.progress[existingProgressIndex].watchedDuration = watchedDuration || 0;
      enrollment.progress[existingProgressIndex].completed = completed || false;
    } else {
      // Add new progress
      enrollment.progress.push({
        videoId,
        watchedDuration: watchedDuration || 0,
        completed: completed || false,
      });
    }

    await enrollment.save();

    return NextResponse.json({
      success: true,
      message: 'Progress updated',
      progress: enrollment.progress,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
