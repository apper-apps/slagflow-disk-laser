import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import { cn } from '@/utils/cn';

const Header = () => {
  const [userRole, setUserRole] = useState('Manager');
  const [notifications, setNotifications] = useState(3);
  const navigate = useNavigate();

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/weighbridge', label: 'Weighbridge', icon: 'Scale' },
    { path: '/processing', label: 'Processing', icon: 'Cog' },
    { path: '/inventory', label: 'Inventory', icon: 'Package' },
    { path: '/reports', label: 'Reports', icon: 'FileText' },
    { path: '/settings', label: 'Settings', icon: 'Settings' }
  ];

  const roleOptions = ['Manager', 'Yard Staff', 'Maintenance'];

  const handleRoleChange = (role) => {
    setUserRole(role);
    // In a real app, this would update user context and potentially redirect
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ApperIcon name="Factory" className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 font-display">SlagFlow Pro</h1>
                <p className="text-xs text-gray-500">Industrial ERP System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 hover:text-primary hover:bg-primary/10'
                )}
              >
                <ApperIcon name={item.icon} className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Role Switcher */}
            <div className="relative">
              <select 
                value={userRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" className="relative">
                <ApperIcon name="Bell" className="w-5 h-5" />
                {notifications > 0 && (
                  <Badge 
                    variant="error" 
                    size="sm"
                    className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center"
                  >
                    {notifications}
                  </Badge>
                )}
              </Button>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <ApperIcon name="User" className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
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