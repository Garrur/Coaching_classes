'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Video, Calendar, Clock, IndianRupee, BookOpen, LogOut } from 'lucide-react';

export default function StudentDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchEnrollments();
    }
  }, [isLoaded, user]);

  const fetchEnrollments = async () => {
    try {
      const res = await fetch('/api/enrollments');
      const data = await res.json();
      
      if (data.success) {
        setEnrollments(data.enrollments);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gradient">
              Galaxy Classes
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/courses" className="text-gray-700 hover:text-primary-600 transition">
                Browse Courses
              </Link>
              <Link href="/student/dashboard" className="text-primary-600 font-semibold">
                My Dashboard
              </Link>
              <Link href="/student/payment-history" className="text-gray-700 hover:text-primary-600 transition">
                Payments
              </Link>
              <button
                onClick={() => router.push('/sign-out')}
                className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Dashboard Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="text-gradient">{user?.firstName || 'Student'}</span>!
          </h1>
          <p className="text-gray-600">Continue your learning journey</p>
        </div>

        {/* Enrollments */}
        {enrollments.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No courses yet</h2>
            <p className="text-gray-600 mb-6">
              Start your learning journey by enrolling in a course
            </p>
            <Link href="/courses" className="btn btn-primary inline-flex">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment: any) => {
              const course = enrollment.courseId;
              const isExpired = enrollment.expiryDate && getDaysRemaining(enrollment.expiryDate) <= 0;
              const daysLeft = enrollment.expiryDate ? getDaysRemaining(enrollment.expiryDate) : null;

              return (
                <div
                  key={enrollment._id}
                  className={`card overflow-hidden hover:shadow-xl transition-all ${
                    isExpired ? 'opacity-60' : ''
                  }`}
                >
                  <div className={`h-32 flex items-center justify-center ${
                    course.courseType === 'RECORDED'
                      ? 'bg-gradient-to-br from-primary-400 to-primary-600'
                      : 'bg-gradient-to-br from-secondary-400 to-secondary-600'
                  }`}>
                    {course.courseType === 'RECORDED' ? (
                      <Video className="w-12 h-12 text-white" />
                    ) : (
                      <Calendar className="w-12 h-12 text-white" />
                    )}
                  </div>

                  <div className="p-6">
                    <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold mb-3">
                      {course.courseType === 'RECORDED' ? 'Pre-Recorded' : 'Live Course'}
                    </div>

                    <h3 className="text-xl font-bold mb-2">{course.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    {course.courseType === 'RECORDED' && daysLeft !== null && (
                      <div className={`mb-4 text-sm ${
                        daysLeft <= 7 ? 'text-red-600' : 'text-gray-700'
                      }`}>
                        {isExpired ? (
                          <span className="font-semibold">Expired</span>
                        ) : (
                          <span>
                            <Clock className="w-4 h-4 inline mr-1" />
                            {daysLeft} days remaining
                          </span>
                        )}
                      </div>
                    )}

                    {!isExpired && (
                      <Link
                        href={`/student/courses/${course._id}`}
                        className={`btn w-full text-center ${
                          course.courseType === 'RECORDED' ? 'btn-primary' : 'btn-secondary'
                        }`}
                      >
                        {course.courseType === 'RECORDED' ? 'Watch Videos' : 'View Schedule'}
                      </Link>
                    )}

                    {isExpired && (
                      <button
                        disabled
                        className="btn w-full bg-gray-300 text-gray-600 cursor-not-allowed"
                      >
                        Access Expired
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
