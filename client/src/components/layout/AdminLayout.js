import React from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  QrCodeIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon, current: location.pathname === '/admin' },
    { name: 'User Management', href: '/admin/users', icon: UserGroupIcon, current: location.pathname === '/admin/users' },
    { name: 'Event Management', href: '/admin/events', icon: CalendarIcon, current: location.pathname === '/admin/events' },
    { name: 'Applications', href: '/admin/applications', icon: DocumentTextIcon, current: location.pathname === '/admin/applications' },
    { name: 'QR Management', href: '/admin/qr', icon: QrCodeIcon, current: location.pathname === '/admin/qr' },
    { name: 'Settings', href: '/admin/settings', icon: CogIcon, current: location.pathname === '/admin/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? 'bg-white' : 'bg-gray-900'}`}>
      <div className={`flex items-center h-16 flex-shrink-0 px-4 ${mobile ? 'bg-gray-900' : ''}`}>
        <img
          className="h-8 w-auto"
          src="/logo.svg"
          alt="Vibeathon"
        />
        <span className="ml-2 text-white font-bold text-lg">Admin Portal</span>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className={`flex-1 px-2 py-4 space-y-1 ${mobile ? 'bg-white' : ''}`}>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => mobile && setSidebarOpen(false)}
                className={`${
                  item.current
                    ? mobile
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-gray-800 text-white'
                    : mobile
                      ? 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
              >
                <Icon
                  className={`${
                    item.current
                      ? mobile
                        ? 'text-gray-500'
                        : 'text-gray-300'
                      : mobile
                        ? 'text-gray-400'
                        : 'text-gray-400 group-hover:text-gray-300'
                  } mr-3 flex-shrink-0 h-6 w-6`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className={`flex-shrink-0 p-4 border-t ${mobile ? 'border-gray-200' : 'border-gray-700'}`}>
        <div className={`flex items-center ${mobile ? '' : 'text-white'}`}>
          <div className="flex-shrink-0">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${mobile ? 'bg-gray-200' : 'bg-gray-700'}`}>
              <span className={`text-sm font-medium ${mobile ? 'text-gray-700' : 'text-gray-300'}`}>
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${mobile ? 'text-gray-900' : 'text-white'}`}>
              {user?.name || 'Admin'}
            </p>
            <p className={`text-xs ${mobile ? 'text-gray-500' : 'text-gray-300'}`}>
              Administrator
            </p>
          </div>
          <button
            onClick={handleLogout}
            className={`ml-3 flex-shrink-0 p-1 rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white ${mobile ? 'text-gray-400 hover:text-gray-500' : 'text-gray-400 hover:text-white'}`}
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full transform transition ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <Sidebar mobile={true} />
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <Sidebar />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;