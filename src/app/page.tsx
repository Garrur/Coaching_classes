import Link from 'next/link';
import { ArrowRight, Video, Calendar, CheckCircle, Phone, MessageCircle } from 'lucide-react';
import MobileNav from '@/components/MobileNav';

export default async function HomePage() {
  const navLinks = [
    { href: '/courses', label: 'Courses' },
    { href: '/sign-in', label: 'Sign In' },
    { href: '/sign-up', label: 'Get Started', primary: true },
  ];

  return (
    <div className="min-h-screen">
      {/* Main Content - Isolated stacking context */}
      <div style={{ isolation: 'isolate', position: 'relative' }}>
        {/* Header/Navbar */}
        <header className="fixed top-0 left-0 right-0 glass border-b border-white/10 bg-white" style={{ zIndex: 50 }}>
          <nav className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-xl sm:text-2xl font-bold text-gradient">
                Classes
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-4">
                <Link href="/courses" className="text-gray-700 hover:text-primary-600 transition">
                  Courses
                </Link>
                <Link href="/sign-in" className="text-gray-700 hover:text-primary-600 transition">
                  Sign In
                </Link>
                <Link href="/sign-up" className="btn btn-primary">
                  Get Started
                </Link>
              </div>

              {/* Mobile Navigation */}
              <MobileNav links={navLinks} />
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6">
              Learn with{' '}
              <span className="text-gradient">Classes</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Expert coaching by <span className="font-semibold text-primary-600">Tutor</span>
              <br />
              Choose from pre-recorded courses or join live interactive classes
            </p>
            
            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
              <Link 
                href="/courses?tab=recorded" 
                className="group card p-8 hover:shadow-2xl transition-all duration-300 w-full sm:w-80"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Pre-Recorded Courses</h3>
                <p className="text-gray-600 mb-4">
                  Learn at your own pace with video lessons
                </p>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Watch anytime, anywhere
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    6-month access
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Comprehensive modules
                  </li>
                </ul>
                <div className="flex items-center justify-center gap-2 text-primary-600 font-semibold group-hover:gap-4 transition-all">
                  Browse Courses <ArrowRight className="w-5 h-5" />
                </div>
              </Link>

              <Link 
                href="/courses?tab=live" 
                className="group card p-8 hover:shadow-2xl transition-all duration-300 w-full sm:w-80 border-2 border-secondary-200"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Live Courses</h3>
                <p className="text-gray-600 mb-4">
                  Join real-time interactive classes
                </p>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Daily live sessions
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Direct interaction
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Structured schedule
                  </li>
                </ul>
                <div className="flex items-center justify-center gap-2 text-secondary-600 font-semibold group-hover:gap-4 transition-all">
                  View Schedule <ArrowRight className="w-5 h-5" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Why Choose <span className="text-gradient">Classes?</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Expert Instruction</h3>
              <p className="text-gray-600">
                Learn from Tutor's years of teaching experience and proven methods
              </p>
            </div>

            <div className="card p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Flexible Learning</h3>
              <p className="text-gray-600">
                Choose between self-paced courses or scheduled live classes
              </p>
            </div>

            <div className="card p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Structured Content</h3>
              <p className="text-gray-600">
                Well-organized modules and clear learning paths for success
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            What Our <span className="text-gradient">Students Say</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Excellent teaching methods and great support throughout the course. Highly recommended!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full"></div>
                  <div>
                    <p className="font-semibold">Student Name</p>
                    <p className="text-sm text-gray-500">Course Student</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-xl mb-8 opacity-90">
            Have questions? Get in touch with us
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:+919999999999" 
              className="btn bg-white text-primary-600 hover:bg-gray-100 flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Call Us
            </a>
            <a 
              href="https://wa.me/919999999999" 
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-green-500 text-white hover:bg-green-600 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="container mx-auto text-center">
          <p className="text-2xl font-bold text-gradient mb-4">Classes</p>
          <p className="text-gray-400 mb-6">
            by Tutor Name- Premium Online Coaching
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <Link href="/courses" className="hover:text-white transition">
              Courses
            </Link>
            <span>|</span>
            <Link href="/sign-in" className="hover:text-white transition">
              Student Login
            </Link>
          </div>
          <p className="text-gray-500 text-sm mt-8">
            © {new Date().getFullYear()} Classes. All rights reserved.
          </p>
        </div>
      </footer>
      </div> {/* End Main Content Wrapper */}
    </div>
  );
}
