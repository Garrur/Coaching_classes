import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import Course from '@/models/Course';

// PUT /api/admin/courses/[id]/schedule - Update live course schedule (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    await dbConnect();

    const { schedule } = await req.json();

    const course = await Course.findById(params.id);

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    if (course.courseType !== 'LIVE') {
      return NextResponse.json(
        { success: false, error: 'Can only update schedule for LIVE courses' },
        { status: 400 }
      );
    }

    // Update schedule
    course.schedule = schedule;
    await course.save();

    return NextResponse.json({
      success: true,
      message: 'Schedule updated successfully',
      course,
    });
  } catch (error: any) {
    if (error.message.includes('Forbidden')) {
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
