'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, CheckCircle, Calendar, Clock, ExternalLink } from 'lucide-react';

export default function StudentCoursePage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  useEffect(() => {
    checkAccess();
  }, [params.id]);

  const checkAccess = async () => {
    try {
      const res = await fetch('/api/enrollments/check-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: params.id }),
      });

      const data = await res.json();

      if (data.hasAccess) {
        setHasAccess(true);
        setCourse(data.enrollment.courseId);
        setEnrollment(data.enrollment);
      } else {
        alert(data.message || 'You do not have access to this course');
        router.push('/student/dashboard');
      }
    } catch (error) {
      console.error('Error checking access:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (videoId: string, watchedDuration: number, completed: boolean) => {
    try {
      await fetch('/api/enrollments/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: params.id,
          videoId,
          watchedDuration,
          completed,
        }),
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getProgress = (videoId: string) => {
    if (!enrollment) return null;
    return enrollment.progress?.find((p: any) => p.videoId === videoId);
  };

  const isToday = (dayOfWeek: number) => {
    const today = new Date().getDay();
    return today === dayOfWeek;
  };

  const isCurrentTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const classTime = new Date();
    classTime.setHours(hours, minutes, 0);
    
    const timeDiff = classTime.getTime() - now.getTime();
    
    // Show join button 10 minutes before and during class
    return timeDiff >= -600000 && timeDiff <= 3600000; // -10 mins to +1 hour
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!hasAccess || !course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gradient">
              Classes
            </Link>
            <Link href="/student/dashboard" className="btn btn-primary">
              Dashboard
            </Link>
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-6 py-12">
        <Link
          href="/student/dashboard"
          className="flex items-center gap-2 text-primary-600 hover:gap-3 transition-all mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        <h1 className="text-4xl font-bold mb-8">{course.name}</h1>

        {/* Pre-Recorded Course Content */}
        {course.courseType === 'RECORDED' && (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Video Player */}
            <div className="md:col-span-2">
              {selectedVideo ? (
                <div className="card overflow-hidden">
                  <div className="aspect-video bg-black flex items-center justify-center">
                    <video
                      src={selectedVideo.url}
                      controls
                      className="w-full h-full"
                      onTimeUpdate={(e) => {
                        const video = e.target as HTMLVideoElement;
                        const progress = (video.currentTime / video.duration) * 100;
                        if (progress > 90) {
                          updateProgress(selectedVideo._id, video.currentTime, true);
                        } else {
                          updateProgress(selectedVideo._id, video.currentTime, false);
                        }
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-2">{selectedVideo.title}</h2>
                  </div>
                </div>
              ) : (
                <div className="card p-12 text-center">
                  <Play className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a video to start learning</p>
                </div>
              )}
            </div>

            {/* Module/Video List */}
            <div className="space-y-4">
              {course.modules?.map((module: any) => (
                <div key={module._id} className="card p-4">
                  <h3 className="font-bold mb-3">{module.name}</h3>
                  <div className="space-y-2">
                    {course.videos
                      ?.filter((v: any) => v.moduleId === module._id)
                      .map((video: any) => {
                        const progress = getProgress(video._id);
                        return (
                          <button
                            key={video._id}
                            onClick={() => setSelectedVideo(video)}
                            className={`w-full text-left p-3 rounded-lg transition-all ${
                              selectedVideo?._id === video._id
                                ? 'bg-primary-100 border-2 border-primary-500'
                                : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {progress?.completed ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Play className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="text-sm font-medium">{video.title}</span>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Course Timetable */}
        {course.courseType === 'LIVE' && (
          <div className="card p-8">
            <h2 className="text-2xl font-bold mb-6">Weekly Schedule</h2>
            <div className="space-y-4">
              {course.schedule?.map((slot: any, idx: number) => {
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const isTodayClass = isToday(slot.dayOfWeek);
                const canJoin = isTodayClass && isCurrentTime(slot.time) && slot.isActive;

                return (
                  <div
                    key={idx}
                    className={`p-6 rounded-lg border-2 ${
                      isTodayClass
                        ? 'border-secondary-500 bg-secondary-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          isTodayClass ? 'bg-secondary-600' : 'bg-gray-200'
                        }`}>
                          <Calendar className={`w-8 h-8 ${isTodayClass ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <p className="text-xl font-bold">{days[slot.dayOfWeek]}</p>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{slot.time}</span>
                          </div>
                          {isTodayClass && (
                            <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              Today's Class
                            </span>
                          )}
                        </div>
                      </div>

                      {canJoin ? (
                        <a
                          href={slot.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary flex items-center gap-2"
                        >
                          Join Live Class <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <button
                          disabled
                          className="btn bg-gray-300 text-gray-600 cursor-not-allowed"
                        >
                          {!slot.isActive ? 'Inactive' : 'Not Started'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
