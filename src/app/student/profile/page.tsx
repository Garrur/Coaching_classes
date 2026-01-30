'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Calendar, Award, BookOpen, User as UserIcon } from 'lucide-react';
import MobileNav from '@/components/MobileNav';

interface UserProfile {
  _id: string;
  clerkId: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  createdAt: string;
  enrollmentCount: number;
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchProfile();
    }
  }, [isLoaded, user]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/student/profile');
      const data = await res.json();
      
      if (data.success) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const mobileNavLinks = [
    { href: '/courses', label: 'Courses' },
    { href: '/student/dashboard', label: 'Dashboard' },
    { href: '/student/profile', label: 'Profile', primary: true },
  ];

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b relative z-60">
        <nav className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl sm:text-2xl font-bold text-gradient">
              Classes
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              <Link href="/courses" className="text-gray-700 hover:text-primary-600 transition">
                Courses
              </Link>
              <Link href="/student/dashboard" className="text-gray-700 hover:text-primary-600 transition">
                Dashboard
              </Link>
              <Link href="/student/profile" className="text-primary-600 font-semibold">
                Profile
              </Link>
            </div>

            {/* Mobile Navigation */}
            <MobileNav links={mobileNavLinks} />
          </div>
        </nav>
      </header>


      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link
          href="/student/dashboard"
          className="flex items-center gap-2 text-primary-600 hover:gap-3 transition-all mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Back to Dashboard</span>
        </Link>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">My Profile</h1>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {/* Profile Card */}
            <div className="md:col-span-1">
              <div className="card p-8 text-center">
                {/* Profile Image */}
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.fullName || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-16 h-16 text-white" />
                  )}
                </div>

                <h2 className="text-2xl font-bold mb-2">{user?.fullName || profile?.name}</h2>
                <p className="text-gray-600 mb-4">
                  {profile?.role === 'ADMIN' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                      <Award className="w-4 h-4" />
                      Administrator
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      <BookOpen className="w-4 h-4" />
                      Student
                    </span>
                  )}
                </p>

                <div className="pt-6 border-t">
                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-primary-600">{profile?.enrollmentCount || 0}</p>
                    <p className="text-sm text-gray-600">Enrolled Courses</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Card */}
            <div className="md:col-span-2">
              <div className="card p-8">
                <h3 className="text-2xl font-bold mb-6">Account Details</h3>

                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Email Address</p>
                      <p className="text-lg font-semibold">{profile?.email || user?.primaryEmailAddress?.emailAddress}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                      <p className="text-lg font-semibold">
                        {profile?.phone || user?.primaryPhoneNumber?.phoneNumber || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  {/* Join Date */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Member Since</p>
                      <p className="text-lg font-semibold">
                        {profile?.createdAt 
                          ? new Date(profile.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Account ID */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">User ID</p>
                      <p className="text-sm font-mono text-gray-700 break-all">
                        {profile?._id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t space-y-3">
                  <a 
                    href={`https://accounts.clerk.dev/user`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary w-full text-center block"
                  >
                    Edit Profile in Clerk
                  </a>
                  {profile?.role === 'ADMIN' && (
                    <Link href="/admin/dashboard" className="btn btn-secondary w-full text-center block">
                      Admin Dashboard
                    </Link>
                  )}
                  <Link href="/sign-out" className="btn bg-red-500 text-white hover:bg-red-600 w-full text-center block">
                    Sign Out
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
