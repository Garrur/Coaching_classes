import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import User from '@/models/User';
import Enrollment from '@/models/Enrollment';

// GET /api/admin/students - Get all students with their enrollments
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    // Get all users (both students and admins)
    const students = await User.find({}).select('-__v').sort({ createdAt: -1 });

    // Get enrollment counts for each user
    const studentsWithEnrollments = await Promise.all(
      students.map(async (student) => {
        let enrollmentQuery: any = { userId: student._id };
        
        if (courseId) {
          enrollmentQuery.courseId = courseId;
        }

        const enrollmentCount = await Enrollment.countDocuments(enrollmentQuery);

        return {
          ...student.toObject(),
          enrollmentCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      students: studentsWithEnrollments,
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
