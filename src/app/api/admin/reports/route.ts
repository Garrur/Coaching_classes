import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import Payment from '@/models/Payment';
import Course from '@/models/Course';

// GET /api/admin/reports - Get payment and enrollment reports
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query
    const query: any = {};
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Get payments
    const payments = await Payment.find(query)
      .populate('userId', 'name email')
      .populate('courseId', 'name courseType')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalRevenue = payments
      .filter((p) => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + p.amount, 0);

    const successfulPayments = payments.filter((p) => p.status === 'SUCCESS').length;
    const failedPayments = payments.filter((p) => p.status === 'FAILED').length;
    const pendingPayments = payments.filter((p) => p.status === 'PENDING').length;

    // Get course-wise revenue
    const courseRevenue = await Payment.aggregate([
      { $match: { status: 'SUCCESS', ...query } },
      {
        $group: {
          _id: '$courseId',
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: '$course' },
      {
        $project: {
          courseName: '$course.name',
          courseType: '$course.courseType',
          totalRevenue: 1,
          count: 1,
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    return NextResponse.json({
      success: true,
      summary: {
        totalRevenue,
        successfulPayments,
        failedPayments,
        pendingPayments,
        totalPayments: payments.length,
      },
      payments,
      courseRevenue,
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
