"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

type Notification = {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: string;
  relatedId?: string;
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  const checkAuth = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/auth/me");
      if (res.data && res.data.user) {
        setUser(res.data.user);
        // Fetch notifications for authenticated users
        fetchNotifications();
      }
    } catch (error) {
      // User is not authenticated
      console.log("Not authenticated");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/api/notifications");
      setNotifications(res.data.notifications || []);
      const unread = res.data.notifications?.filter((n: Notification) => !n.isRead).length || 0;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await axios.put("/api/notifications", { notificationId });
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    await markAsRead(notification._id);
    
    // Handle navigation based on notification type
    switch (notification.type) {
      case 'job_invitation':
        // Navigate to freelancer invitations page
        if (user?.role === 'freelancer') {
          router.push('/freelancer/invitations');
        }
        break;
      case 'invitation_accepted':
      case 'invitation_rejected':
        // Navigate to client view jobs page
        if (user?.role === 'client') {
          router.push('/client/view-jobs');
        }
        break;
      case 'bid_received':
        // Navigate to client dashboard where recent bids are displayed
        if (user?.role === 'client') {
          router.push('/client/dashboard');
        }
        break;
      case 'bid_accepted':
        // Navigate to freelancer accepted jobs page
        if (user?.role === 'freelancer') {
          router.push('/freelancer/accepted-jobs');
        }
        break;
      case 'bid_rejected':
        // Navigate to freelancer dashboard to see all projects/bids
        if (user?.role === 'freelancer') {
          router.push('/freelancer/dashboard');
        }
        break;
      case 'project_completed':
        // Navigate to client ongoing projects page
        if (user?.role === 'client') {
          router.push('/client/ongoing-projects');
        }
        break;
      case 'project_confirmed':
        // Navigate to freelancer accepted jobs page
        if (user?.role === 'freelancer') {
          router.push('/freelancer/accepted-jobs');
        }
        break;
      case 'revision_requested':
        // Navigate to freelancer ongoing projects page
        if (user?.role === 'freelancer') {
          router.push('/freelancer/ongoing-projects');
        }
        break;
      default:
        // For other notification types, navigate to dashboard
        if (user?.role === 'client') {
          router.push('/client/dashboard');
        } else if (user?.role === 'freelancer') {
          router.push('/freelancer/dashboard');
        }
        break;
    }
    
    setShowNotifications(false);
  };

  const markAllAsRead = async () => {
    try {
      await axios.put("/api/notifications", { markAllAsRead: true });
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [pathname]); // Re-check auth when pathname changes

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout");
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Close notifications when opening mobile menu
    if (!mobileMenuOpen) {
      setShowNotifications(false);
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 cursor-pointer select-none">
                Blocklance
              </h1>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {loading ? (
              <span className="text-gray-500">Loading...</span>
            ) : user ? (
              <>
                <span className="mr-4 text-gray-700 hidden lg:inline">
                  Welcome, {user.name}
                </span>
                {user.role === "client" && (
                  <>
                    <Link href="/client/dashboard">
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-100 transition">
                        Dashboard
                      </button>
                    </Link>
                    <Link href="/client/messages">
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-100 transition">
                        Messages
                      </button>
                    </Link>
                    <div className="relative">
                      <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-100 transition relative"
                      >
                        Notifications
                        {unreadCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                      {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                          <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                              <button
                                onClick={markAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                Mark all as read
                              </button>
                            )}
                          </div>
                          {notifications.length === 0 ? (
                            <div className="p-4 text-gray-500 text-center">
                              No notifications
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification._id}
                                className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                  !notification.isRead ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => handleNotificationClick(notification)}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 text-sm">
                                      {notification.title}
                                    </h4>
                                    <p className="text-gray-600 text-sm mt-1">
                                      {notification.message}
                                    </p>
                                    <p className="text-gray-400 text-xs mt-1">
                                      {new Date(notification.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  {!notification.isRead && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
                {user.role === "freelancer" && (
                  <>
                    <Link href="/freelancer/dashboard">
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-100 transition">
                        Dashboard
                      </button>
                    </Link>
                    <Link href="/freelancer/messages">
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-100 transition">
                        Messages
                      </button>
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-100 transition">
                    Log In
                  </button>
                </Link>
                <Link href="/user">
                  <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {user && unreadCount > 0 && (
              <div className="relative mr-4">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setMobileMenuOpen(false);
                  }}
                  className="p-2 rounded-md text-gray-700 hover:bg-gray-100 relative"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-gray-500 text-center">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            !notification.isRead ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm">
                                {notification.title}
                              </h4>
                              <p className="text-gray-600 text-sm mt-1">
                                {notification.message}
                              </p>
                              <p className="text-gray-400 text-xs mt-1">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {loading ? (
              <span className="text-gray-500">Loading...</span>
            ) : user ? (
              <>
                <div className="px-3 py-2 text-gray-700 font-medium">
                  Welcome, {user.name}
                </div>
                {user.role === "client" && (
                  <>
                    <Link href="/client/dashboard">
                      <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">
                        Dashboard
                      </div>
                    </Link>
                    <Link href="/client/messages">
                      <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">
                        Messages
                      </div>
                    </Link>
                  </>
                )}

                {user.role === "freelancer" && (
                  <>
                    <Link href="/freelancer/dashboard">
                      <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">
                        Dashboard
                      </div>
                    </Link>
                    <Link href="/freelancer/messages">
                      <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">
                        Messages
                      </div>
                    </Link>
                  </>
                )}
                // Inside the Navbar component, find the user menu dropdown and add this:
{user && user.role === "admin" && (
  <Link href="/admin/dashboard">
    <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
      Admin Dashboard
    </div>
  </Link>
)}
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">
                    Log In
                  </div>
                </Link>
                <Link href="/user">
                  <div className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-gray-100">
                    Sign Up
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

