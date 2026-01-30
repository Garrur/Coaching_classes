'use client';

import { useEffect } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function SignOutPage() {
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    const handleSignOut = async () => {
      await signOut();
      router.push('/');
    };
    
    // Auto sign out after 1 second
    const timer = setTimeout(handleSignOut, 1000);
    
    return () => clearTimeout(timer);
  }, [signOut, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <LogOut className="w-10 h-10 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Signing you out...</h1>
        <p className="text-gray-600">Please wait while we log you out securely.</p>
        
        <div className="mt-8">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
