import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import { requireAdmin } from '@/lib/auth';
import User from '@/models/User';

// GET /api/courses - Get all courses (public with filters)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'RECORDED' or 'LIVE'
    
    const filter: any = { isActive: true };
    
    if (type) {
      filter.courseType = type;
    }

    const courses = await Course.find(filter)
      .select('-videos.url') // Hide video URLs from public
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, courses });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create new course (admin only)
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    await dbConnect();

    const body = await req.json();
    const {
      name,
      description,
      courseType,
      price,
      thumbnail,
      validity,
      duration,
      startDate,
      endDate,
      schedule,
    } = body;

    // Validate required fields
    if (!name || !description || !courseType || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get admin user
    const adminUser = await User.findOne({ clerkId: admin.id });
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Admin user not found' },
        { status: 404 }
      );
    }

    // Create course data
    const courseData: any = {
      name,
      description,
      courseType,
      price,
      thumbnail,
      createdBy: adminUser._id,
    };

    if (courseType === 'RECORDED') {
      courseData.validity = validity || 6;
      courseData.videos = [];
      courseData.modules = [];
    } else if (courseType === 'LIVE') {
      courseData.duration = duration;
      courseData.startDate = startDate ? new Date(startDate) : new Date();
      
      // Calculate end date if duration is provided
      if (duration && !endDate) {
        const start = new Date(courseData.startDate);
        courseData.endDate = new Date(start.setDate(start.getDate() + duration));
      } else if (endDate) {
        courseData.endDate = new Date(endDate);
      }
      
      courseData.schedule = schedule || [];
    }

    const course = await Course.create(courseData);

    return NextResponse.json({ success: true, course }, { status: 201 });
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
