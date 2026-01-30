import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { requireAdmin, requireAuth } from '@/lib/auth';
import User from '@/models/User';

// GET /api/courses/[id] - Get single course
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const course = await Course.findById(params.id);

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if user is enrolled to show videos
    try {
      const clerkId = await requireAuth();
      const user = await User.findOne({ clerkId });
      
      if (user) {
        const enrollment = await Enrollment.findOne({
          userId: user._id,
          courseId: course._id,
          isActive: true,
        });

        if (enrollment) {
          // User is enrolled, return full course data
          return NextResponse.json({ success: true, course, enrolled: true, enrollment });
        }
      }
    } catch (error) {
      // User not authenticated, continue with public data
    }

    // Return course without video URLs
    const publicCourse = course.toObject();
    if (publicCourse.videos) {
      publicCourse.videos = publicCourse.videos.map((v: any) => ({
        ...v,
        url: undefined, // Hide URL
      }));
    }

    return NextResponse.json({ success: true, course: publicCourse, enrolled: false });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id] - Update course (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    await dbConnect();

    const body = await req.json();
    
    const course = await Course.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, course });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Delete course (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    await dbConnect();

    // Soft delete by setting isActive to false
    const course = await Course.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Course deleted' });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
