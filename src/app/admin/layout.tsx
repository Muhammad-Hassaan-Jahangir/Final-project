'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const res = await axios.get('/api/auth/me');
        if (res.data && res.data.user && res.data.user.role === 'admin') {
          setLoading(false);
        } else {
          // Not an admin, redirect to unauthorized
          router.push('/unauthorized');
        }
      } catch (error) {
        // Not authenticated at all
        router.push('/login');
      }
    };

    checkAdminAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 md:ml-64 p-6">{children}</div>
    </div>
  );
}