'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Video, Calendar, Trash2, Edit } from 'lucide-react';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        alert('Course deleted successfully');
        fetchCourses();
      } else {
        alert('Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" className="text-2xl font-bold text-gradient">
              Galaxy Classes Admin
            </Link>
            <Link href="/admin/courses/new" className="btn btn-primary">
              Create New Course
            </Link>
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">Manage Courses</h1>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-500 mb-4">No courses created yet</p>
            <Link href="/admin/courses/new" className="btn btn-primary inline-flex">
              Create First Course
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="card overflow-hidden">
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
                    {course.courseType}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{course.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  
                  <p className="text-2xl font-bold mb-6">₹{course.price}</p>

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/courses/${course._id}/edit`}
                      className="btn btn-outline flex-1 flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="btn bg-red-500 text-white hover:bg-red-600 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
