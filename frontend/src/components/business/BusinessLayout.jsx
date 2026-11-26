import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { getNotifications } from '../../services/businessService.js';
import BusinessHeader from './BusinessHeader.jsx';
import BusinessSidebar from './BusinessSidebar.jsx';
import './BusinessLayout.css';

const DESKTOP_BREAKPOINT = 1100;
const UNREAD_REFRESH_MS = 60 * 1000;

const getPageTitle = (pathname) => {
  if (pathname === '/business/dashboard') return 'Dashboard Overview';
  if (pathname === '/business/products/new') return 'Add Surplus Product';
  if (pathname.startsWith('/business/products')) return 'My Products';
  if (pathname.startsWith('/business/requests')) return 'Donation Requests';
  if (pathname.startsWith('/business/history')) return 'Donation History';
  if (pathname.startsWith('/business/analytics')) return 'Analytics';
  if (pathname.startsWith('/business/ai-assistant')) return 'AI Waste Assistant';
  if (pathname.startsWith('/business/notifications')) return 'Notifications';
  if (pathname.startsWith('/business/profile')) return 'Business Profile';
  return 'Business';
};

function BusinessLayout() {
  const { logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Unread badge: loaded once, then every minute, and whenever a page asks for it
  const refreshUnread = useCallback(async () => {
    try {
      const data = await getNotifications({ limit: 1 });
      setUnreadCount(data.unreadCount);
    } catch {
      // The badge is not critical, so a failure is ignored quietly
    }
  }, []);

  useEffect(() => {
    refreshUnread();
    const timer = setInterval(refreshUnread, UNREAD_REFRESH_MS);
    return () => clearInterval(timer);
  }, [refreshUnread]);

  // Drawer: Escape closes it, a wide window closes it, and the page behind does not scroll
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth >= DESKTOP_BREAKPOINT) setSidebarOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    setSidebarOpen(false);
    navigate('/', { replace: true }); // leave the protected area first
    try {
      await logout();
      toast.success('You have been logged out.');
    } catch {
      toast.error('Could not log out. Please check your connection and try again.');
    }
  };

  return (
    <div className="bz">
      <BusinessSidebar
        open={sidebarOpen}
        onClose={closeSidebar}
        onLogout={handleLogout}
        unreadCount={unreadCount}
      />

      <div className="bz__main">
        <BusinessHeader
          title={getPageTitle(location.pathname)}
          unreadCount={unreadCount}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />
        <main className="bz__content">
          {/* Child pages read this with useOutletContext() */}
          <Outlet context={{ unreadCount, refreshUnread }} />
        </main>
      </div>
    </div>
  );
}

export default BusinessLayout;