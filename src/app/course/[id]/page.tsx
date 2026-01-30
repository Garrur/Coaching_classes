'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Video, Calendar, Clock, IndianRupee, ArrowLeft, CheckCircle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  
  const [course, setCourse] = useState<any>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchCourse();
    loadRazorpayScript();
  }, [params.id]);

  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${params.id}`);
      const data = await res.json();
      
      if (data.success) {
        setCourse(data.course);
        setEnrolled(data.enrolled || false);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    try {
      setPurchasing(true);

      // Create order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course._id }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        alert('Failed to create order');
        return;
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Galaxy Classes',
        description: course.name,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Verify payment
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            alert('Payment successful! You are now enrolled.');
            router.push('/student/dashboard');
          } else {
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: user?.fullName || '',
          email: user?.emailAddresses[0]?.emailAddress || '',
        },
        theme: {
          color: '#0ea5e9',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to process purchase');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Course not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gradient">
              Galaxy Classes
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/courses" className="text-gray-700 hover:text-primary-600 transition">
                Courses
              </Link>
              <Link href="/student/dashboard" className="btn btn-primary">
                Dashboard
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Course Details */}
      <div className="container mx-auto px-6 py-12">
        <Link href="/courses" className="flex items-center gap-2 text-primary-600 hover:gap-3 transition-all mb-8">
          <ArrowLeft className="w-5 h-5" />
          Back to Courses
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            <div className="card p-8">
              <div className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
                {course.courseType === 'RECORDED' ? 'Pre-Recorded Course' : 'Live Course'}
              </div>
              
              <h1 className="text-4xl font-bold mb-4">{course.name}</h1>
              <p className="text-gray-600 text-lg mb-8">{course.description}</p>

              {course.courseType === 'RECORDED' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
                  <div className="grid gap-3">
                    {course.modules?.map((module: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                        <div>
                          <p className="font-semibold">{module.name}</p>
                          <p className="text-sm text-gray-600">
                            {course.videos?.filter((v: any) => v.moduleId === module._id).length || 0} videos
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {course.courseType === 'LIVE' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4">Class Schedule</h2>
                  
                  {enrolled ? (
                    // Show schedule to enrolled students
                    <div className="grid gap-3">
                      {course.schedule?.map((slot: any, idx: number) => {
                        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        return (
                          <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <Calendar className="w-5 h-5 text-secondary-600" />
                            <div>
                              <p className="font-semibold">{days[slot.dayOfWeek]}</p>
                              <p className="text-sm text-gray-600">{slot.time}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // Show locked message to non-enrolled users
                    <div className="p-8 bg-gray-50 rounded-lg text-center border-2 border-dashed border-gray-300">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Schedule Locked</h3>
                      <p className="text-gray-600 mb-4">
                        Enroll in this course to view the complete class schedule and meeting details
                      </p>
                      <p className="text-sm text-gray-500">
                        📅 {course.schedule?.length || 0} classes per week
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="card p-6 sticky top-6">
              <div className="h-48 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center mb-6">
                {course.courseType === 'RECORDED' ? (
                  <Video className="w-20 h-20 text-white opacity-80" />
                ) : (
                  <Calendar className="w-20 h-20 text-white opacity-80" />
                )}
              </div>

              <div className="flex items-center gap-2 mb-6">
                <IndianRupee className="w-8 h-8 text-gray-900" />
                <span className="text-4xl font-bold">{course.price}</span>
              </div>

              {enrolled ? (
                <Link href="/student/dashboard" className="btn btn-primary w-full text-center">
                  Go to Dashboard
                </Link>
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="btn btn-primary w-full disabled:opacity-50"
                >
                  {purchasing ? 'Processing...' : 'Buy Now'}
                </button>
              )}

              <div className="mt-6 pt-6 border-t space-y-3">
                {course.courseType === 'RECORDED' && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Video className="w-4 h-4" />
                      <span>{course.videos?.length || 0} Videos</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4" />
                      <span>Valid for {course.validity || 6} months</span>
                    </div>
                  </>
                )}
                {course.courseType === 'LIVE' && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4" />
                      <span>Duration: {course.duration} days</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="w-4 h-4" />
                      <span>Starts: {new Date(course.startDate).toLocaleDateString()}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
