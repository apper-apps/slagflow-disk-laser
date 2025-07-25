import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";

const Header = () => {
  const [userRole, setUserRole] = useState('Manager');
  const [notifications, setNotifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const notificationsRef = useRef(null);

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/weighbridge', label: 'Weighbridge', icon: 'Scale' },
    { path: '/processing', label: 'Processing', icon: 'Cog' },
    { path: '/inventory', label: 'Inventory', icon: 'Package' },
    { path: '/reports', label: 'Reports', icon: 'FileText' },
    { path: '/maintenance', label: 'Maintenance', icon: 'Wrench' },
    { path: '/settings', label: 'Settings', icon: 'Settings' },
  ];

  const roleOptions = ['Manager', 'Yard Staff', 'Maintenance'];

  // Mock notification data
  const mockNotifications = [
    {
      id: 1,
      title: 'Equipment Maintenance Due',
      message: 'Loader #3 requires scheduled maintenance',
      time: '2 minutes ago',
      type: 'warning',
      read: false
    },
    {
      id: 2,
      title: 'Load Processing Complete',
      message: 'Batch #2024-001 has been processed successfully',
      time: '15 minutes ago',
      type: 'success',
      read: false
    },
    {
      id: 3,
      title: 'Inventory Alert',
      message: 'Raw material stock is running low',
      time: '1 hour ago',
      type: 'error',
      read: false
    }
  ];

  const handleRoleChange = (role) => {
    setUserRole(role);
    // In a real app, this would update user context and potentially redirect
    navigate('/');
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleClearNotifications = () => {
    setNotifications(0);
    setShowNotifications(false);
  };

  const handleNotificationItemClick = (notificationId) => {
    // In a real app, this would mark the notification as read
    console.log('Notification clicked:', notificationId);
  };

// Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const mobileMenu = document.getElementById('mobile-menu');
      const hamburgerButton = document.getElementById('hamburger-button');
      
      if (isMenuOpen && mobileMenu && !mobileMenu.contains(event.target) && 
          hamburgerButton && !hamburgerButton.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent body scroll when menu is open
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

// Handle escape key to close notifications and mobile menu
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setIsMenuOpen(false);
      }
    };

    if (showNotifications || isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showNotifications, isMenuOpen]);
return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
    <div className="w-full max-w-full overflow-hidden">
        <div className="px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
                {/* Logo and Brand */}
                <div className="flex items-center min-w-0 flex-shrink-0">
                    {/* Mobile Hamburger Menu Button */}
                    <Button
                        id="hamburger-button"
                        variant="ghost"
                        className="lg:hidden mr-2 p-2"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle navigation menu"
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-menu">
                        <ApperIcon
                            name={isMenuOpen ? "X" : "Menu"}
                            className="w-5 h-5 text-gray-700 transition-transform duration-200" />
                    </Button>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <div
                            className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center">
                            <ApperIcon name="Factory" className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg sm:text-xl font-bold text-gray-900 font-display">SlagFlow Pro</h1>
                            <p className="text-xs text-gray-500">Industrial ERP System</p>
                        </div>
                    </div>
                </div>
                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center space-x-2 xl:space-x-4">
                    {navigationItems.map(item => <NavLink
                        key={item.path}
                        to={item.path}
                        className={(
                            {
                                isActive
                            }
                        ) => cn(
                            "flex items-center space-x-1.5 xl:space-x-2 px-2 xl:px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap",
                            isActive ? "bg-primary text-white" : "text-gray-600 hover:text-primary hover:bg-primary/10"
                        )}>
                        <ApperIcon name={item.icon} className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                        <span className="hidden xl:inline">{item.label}</span>
                    </NavLink>)}
                </nav>
                {/* User Actions */}
                <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                    {/* Role Switcher */}
                    <div className="relative hidden md:block">
                        <select
                            value={userRole}
                            onChange={e => handleRoleChange(e.target.value)}
                            className="bg-gray-50 border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20">
                            {roleOptions.map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                    </div>
                    {/* Notifications */}
                    <div className="relative" ref={notificationsRef}>
                        <Button
                            variant="ghost"
                            className="relative"
                            onClick={handleNotificationClick}
                            aria-label="Open notifications"
                            aria-expanded={showNotifications}
                            aria-haspopup="true">
                            <ApperIcon name="Bell" className="w-5 h-5" />
                            {notifications > 0 && <Badge
                                variant="error"
                                size="sm"
                                className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center">
                                {notifications}
                            </Badge>}
</Button>
                        {/* Notifications Dropdown */}
                        {showNotifications && <div
                            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999]">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                                    {notifications > 0 && <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearNotifications}
                                        className="text-sm text-gray-500 hover:text-gray-700">Clear all
                                                                  </Button>}
                                </div>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications > 0 ? <div className="divide-y divide-gray-100">
                                    {mockNotifications.map(notification => <div
                                        key={notification.id}
                                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => handleNotificationItemClick(notification.id)}>
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={cn(
                                                    "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                                                    notification.type === "success" && "bg-success",
                                                    notification.type === "warning" && "bg-warning",
                                                    notification.type === "error" && "bg-error",
                                                    notification.type === "info" && "bg-info"
                                                )} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                                <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                                            </div>
                                        </div>
                                    </div>)}
                                </div> : <div className="p-8 text-center">
                                    <ApperIcon name="Bell" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500">No notifications</p>
                                </div>}
                            </div>
                        </div>}
                    </div>
                    {/* User Profile */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <div
                            className="w-7 h-7 sm:w-8 sm:h-8 bg-secondary rounded-full flex items-center justify-center">
                            <ApperIcon name="User" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                        </div>
                        <div className="hidden lg:block">
                            <p className="text-sm font-medium text-gray-900">John Smith</p>
                            <p className="text-xs text-gray-500">{userRole}</p>
                        </div>
                    </div>
                </div>
            </div>
</div>
    </div>
    {/* Notifications Backdrop */}
    {showNotifications && <div className="fixed inset-0 bg-transparent z-[9998]" />}
    {/* Mobile Menu Overlay */}
    {isMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" />}
    {/* Mobile Navigation Menu */}
    <div
        id="mobile-menu"
        className={cn(
            "fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden",
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu">
        <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div
                className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div
                        className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <ApperIcon name="Factory" className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 font-display">SlagFlow Pro</h2>
                        <p className="text-xs text-gray-500">Industrial ERP System</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="Close navigation menu"
                    className="p-2">
                    <ApperIcon name="X" className="w-5 h-5 text-gray-700" />
                </Button>
            </div>
            {/* Mobile Navigation Items */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {navigationItems.map(item => <li key={item.path}>
                        <NavLink
                            to={item.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={(
                                {
                                    isActive
                                }
                            ) => cn(
                                "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                isActive ? "bg-primary text-white" : "text-gray-600 hover:text-primary hover:bg-primary/10"
                            )}>
                            <ApperIcon name={item.icon} className="w-5 h-5" />
                            <span>{item.label}</span>
                        </NavLink>
                    </li>)}
                </ul>
            </nav>
            {/* Mobile Menu Footer */}
            <div className="p-4 border-t border-gray-200">
                {/* Mobile Role Switcher */}
                <div className="mb-4">
                    <label
                        htmlFor="mobile-role-select"
                        className="block text-sm font-medium text-gray-700 mb-2">Current Role
                                      </label>
                    <select
                        id="mobile-role-select"
                        value={userRole}
                        onChange={e => handleRoleChange(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20">
                        {roleOptions.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                </div>
                {/* Mobile User Profile */}
                <div className="flex items-center space-x-3">
                    <div
                        className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                        <ApperIcon name="User" className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">John Smith</p>
                        <p className="text-xs text-gray-500">{userRole}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</header>
  );
};

export default Header;