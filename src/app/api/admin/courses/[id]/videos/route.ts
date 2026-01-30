import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import Course from '@/models/Course';

// PUT /api/admin/courses/[id]/videos - Update course videos (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    await dbConnect();

    const { videos, modules } = await req.json();

    const course = await Course.findById(params.id);

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    if (course.courseType !== 'RECORDED') {
      return NextResponse.json(
        { success: false, error: 'Can only add videos to RECORDED courses' },
        { status: 400 }
      );
    }

    // Update videos and modules
    if (videos !== undefined) course.videos = videos;
    if (modules !== undefined) course.modules = modules;

    await course.save();

    return NextResponse.json({
      success: true,
      message: 'Videos updated successfully',
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
