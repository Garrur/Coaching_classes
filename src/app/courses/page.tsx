'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Video, Calendar, Clock, IndianRupee, ArrowRight } from 'lucide-react';

interface Course {
  _id: string;
  name: string;
  description: string;
  courseType: 'RECORDED' | 'LIVE';
  price: number;
  validity?: number;
  duration?: number;
  startDate?: string;
  endDate?: string;
  videos?: any[];
  modules?: any[];
  schedule?: any[];
  thumbnail?: string;
}

export default function CoursesPage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<'recorded' | 'live'>('recorded');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check URL params for default tab
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'live') setActiveTab('live');

    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
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

  const recordedCourses = courses.filter((c) => c.courseType === 'RECORDED');
  const liveCourses = courses.filter((c) => c.courseType === 'LIVE');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gradient">
              Classes
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/courses" className="text-primary-600 font-semibold">
                Courses
              </Link>
              {isLoaded && user ? (
                // Logged in navigation
                <>
                  <Link href="/student/dashboard" className="text-gray-700 hover:text-primary-600 transition">
                    Dashboard
                  </Link>
                  <Link href="/student/profile" className="btn btn-primary">
                    Profile
                  </Link>
                </>
              ) : (
                // Logged out navigation
                <>
                  <Link href="/sign-in" className="text-gray-700 hover:text-primary-600 transition">
                    Sign In
                  </Link>
                  <Link href="/sign-up" className="btn btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-16 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Explore Our Courses</h1>
          <p className="text-xl opacity-90">
            Choose between pre-recorded courses or live interactive classes
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab('recorded')}
            className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
              activeTab === 'recorded'
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Pre-Recorded Courses
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('live')}
            className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
              activeTab === 'live'
                ? 'bg-gradient-to-r from-secondary-600 to-secondary-700 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Live Courses
            </div>
          </button>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-600">Loading courses...</p>
          </div>
        ) : (
          <>
            {/* Pre-Recorded Courses */}
            {activeTab === 'recorded' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recordedCourses.length === 0 ? (
                  <div className="col-span-full text-center py-20">
                    <p className="text-gray-500 text-lg">No courses available yet</p>
                  </div>
                ) : (
                  recordedCourses.map((course) => (
                    <div key={course._id} className="card overflow-hidden group hover:shadow-2xl transition-all duration-300">
                      <div className="h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                        <Video className="w-20 h-20 text-white opacity-80" />
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-2xl font-bold mb-2 group-hover:text-primary-600 transition">
                          {course.name}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                        
                        <div className="space-y-2 mb-6">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Video className="w-4 h-4 text-primary-600" />
                            <span>{course.modules?.length || 0} Modules • {course.videos?.length || 0} Videos</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Clock className="w-4 h-4 text-primary-600" />
                            <span>Valid for {course.validity || 6} months</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <IndianRupee className="w-6 h-6 text-gray-900" />
                            <span className="text-3xl font-bold">{course.price}</span>
                          </div>
                          <Link 
                            href={`/course/${course._id}`}
                            className="btn btn-primary flex items-center gap-2"
                          >
                            Buy Now <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Live Courses */}
            {activeTab === 'live' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {liveCourses.length === 0 ? (
                  <div className="col-span-full text-center py-20">
                    <p className="text-gray-500 text-lg">No live courses available yet</p>
                  </div>
                ) : (
                  liveCourses.map((course) => (
                    <div key={course._id} className="card overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2 border-secondary-200">
                      <div className="h-48 bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center">
                        <Calendar className="w-20 h-20 text-white opacity-80" />
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-2xl font-bold mb-2 group-hover:text-secondary-600 transition">
                          {course.name}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                        
                        <div className="space-y-2 mb-6">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Clock className="w-4 h-4 text-secondary-600" />
                            <span>Duration: {course.duration} days</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Calendar className="w-4 h-4 text-secondary-600" />
                            <span>{course.schedule?.length || 0} classes per week</span>
                          </div>
                          {course.startDate && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <ArrowRight className="w-4 h-4 text-secondary-600" />
                              <span>Starts: {new Date(course.startDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <IndianRupee className="w-6 h-6 text-gray-900" />
                            <span className="text-3xl font-bold">{course.price}</span>
                          </div>
                          <Link 
                            href={`/course/${course._id}`}
                            className="btn btn-secondary flex items-center gap-2"
                          >
                            Enroll Now <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6 mt-20">
        <div className="container mx-auto text-center">
          <p className="text-2xl font-bold text-gradient mb-4">Classes</p>
          <p className="text-gray-400">© 2026 Classes. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
