'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, Users, IndianRupee, Plus, Video, Calendar, 
  BarChart, Settings, LogOut, TrendingUp 
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    recentEnrollments: 0,
  });
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch courses
      const coursesRes = await fetch('/api/courses');
      const coursesData = await coursesRes.json();
      
      // Fetch reports
      const reportsRes = await fetch('/api/admin/reports');
      const reportsData = await reportsRes.json();

      if (coursesData.success) {
        setCourses(coursesData.courses);
        setStats((prev) => ({
          ...prev,
          totalCourses: coursesData.courses.length,
        }));
      }

      if (reportsData.success) {
        setStats((prev) => ({
          ...prev,
          totalRevenue: reportsData.summary.totalRevenue,
          recentEnrollments: reportsData.summary.successfulPayments,
        }));
      }

      // Fetch students count
      const studentsRes = await fetch('/api/admin/students');
      const studentsData = await studentsRes.json();
      
      if (studentsData.success) {
        setStats((prev) => ({
          ...prev,
          totalStudents: studentsData.students.length,
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
              ClassesAdmin
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/admin/dashboard" className="text-primary-600 font-semibold">
                Dashboard
              </Link>
              <Link href="/admin/courses" className="text-gray-700 hover:text-primary-600 transition">
                Courses
              </Link>
              <Link href="/admin/students" className="text-gray-700 hover:text-primary-600 transition">
                Students
              </Link>
              <Link href="/admin/reports" className="text-gray-700 hover:text-primary-600 transition">
                Reports
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
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your courses, students, and analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Total Courses</p>
            <p className="text-3xl font-bold">{stats.totalCourses}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Total Students</p>
            <p className="text-3xl font-bold">{stats.totalStudents}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
            <p className="text-3xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart className="w-6 h-6 text-orange-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Enrollments</p>
            <p className="text-3xl font-bold">{stats.recentEnrollments}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link
            href="/admin/courses/new"
            className="card p-8 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Create New Course</h3>
                <p className="text-sm text-gray-600">Add recorded or live course</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/courses"
            className="card p-8 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Manage Courses</h3>
                <p className="text-sm text-gray-600">Edit existing courses</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/students"
            className="card p-8 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">View Students</h3>
                <p className="text-sm text-gray-600">Manage enrollments</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Courses */}
        <div className="card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Courses</h2>
            <Link href="/admin/courses" className="text-primary-600 hover:text-primary-700 font-semibold">
              View All →
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No courses created yet</p>
              <Link href="/admin/courses/new" className="btn btn-primary mt-4 inline-flex">
                Create First Course
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.slice(0, 5).map((course) => (
                <div key={course._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      course.courseType === 'RECORDED'
                        ? 'bg-primary-100'
                        : 'bg-secondary-100'
                    }`}>
                      {course.courseType === 'RECORDED' ? (
                        <Video className={`w-6 h-6 text-primary-600`} />
                      ) : (
                        <Calendar className={`w-6 h-6 text-secondary-600`} />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{course.name}</p>
                      <p className="text-sm text-gray-600">
                        {course.courseType === 'RECORDED' ? 'Pre-Recorded' : 'Live Course'} • ₹{course.price}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/courses/${course._id}/edit`}
                    className="btn btn-outline text-sm"
                  >
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
