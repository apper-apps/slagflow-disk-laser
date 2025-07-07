import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import KPIGrid from '@/components/organisms/KPIGrid';
import AlertsPanel from '@/components/organisms/AlertsPanel';
import EquipmentStatus from '@/components/organisms/EquipmentStatus';
import Loading from '@/components/ui/Loading';

const Dashboard = () => {
  const location = useLocation();
  const [userRole, setUserRole] = useState('Manager');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user role from header component or URL params
    const urlParams = new URLSearchParams(location.search);
    const roleParam = urlParams.get('role');
    if (roleParam) {
      setUserRole(roleParam);
    }

    // Simulate dashboard loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [location]);

  if (loading) {
    return (
      <div className="p-6">
        <Loading rows={6} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">
            {userRole} Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening at your plant today.
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Today</div>
          <div className="text-lg font-semibold text-gray-900">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* KPIs Grid */}
      <KPIGrid userRole={userRole} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equipment Status - Takes up 2 columns */}
        <div className="lg:col-span-2">
          <EquipmentStatus />
        </div>

        {/* Alerts Panel - Takes up 1 column */}
        <div className="lg:col-span-1">
          <AlertsPanel />
        </div>
      </div>

      {/* Role-specific additional content */}
      {userRole === 'Manager' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Loads Processed</span>
                <span className="font-semibold">142</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Material Produced</span>
                <span className="font-semibold">3,245 tonnes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue Generated</span>
                <span className="font-semibold text-success">$147,025</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Environmental Impact</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">CO₂ Saved</span>
                <span className="font-semibold text-success">8.4 tonnes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Waste Recycled</span>
                <span className="font-semibold">98.7%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Energy Efficiency</span>
                <span className="font-semibold">94.2%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Screen #3 Maintenance</span>
                <span className="text-sm bg-warning/10 text-warning px-2 py-1 rounded">Tomorrow</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Quality Inspection</span>
                <span className="text-sm bg-info/10 text-info px-2 py-1 rounded">2 days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Compliance Report</span>
                <span className="text-sm bg-success/10 text-success px-2 py-1 rounded">On track</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;