import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

/**
 * Manual user sync endpoint
 * Visit this endpoint while logged in to sync your Clerk user to MongoDB
 */
export async function GET() {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();

    // Check if user already exists
    let user = await User.findOne({ clerkId: clerkUser.id });

    if (user) {
      return NextResponse.json({ 
        message: 'User already exists in database',
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        }
      });
    }

    // Get role from Clerk public metadata
    const role = (clerkUser.publicMetadata?.role as string) || 'STUDENT';

    // Create new user
    user = await User.create({
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
      phone: clerkUser.phoneNumbers[0]?.phoneNumber,
      role: role,
    });

    return NextResponse.json({ 
      message: 'User synced successfully!',
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error: any) {
    console.error('Error syncing user:', error);
    return NextResponse.json({ 
      error: 'Failed to sync user',
      details: error.message 
    }, { status: 500 });
  }
}
