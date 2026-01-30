import { auth, currentUser } from '@clerk/nextjs/server';

export async function requireAuth() {
  const { userId } = auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}

export async function requireAdmin() {
  const user = await currentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  const role = user.publicMetadata?.role as string;
  
  if (role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required');
  }

  return user;
}

export async function getRole() {
  const user = await currentUser();
  if (!user) return null;
  
  return (user.publicMetadata?.role as string) || 'STUDENT';
}

export async function isAdmin() {
  const role = await getRole();
  return role === 'ADMIN';
}
