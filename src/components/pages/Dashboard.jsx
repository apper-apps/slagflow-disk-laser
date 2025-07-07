import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import KPIGrid from "@/components/organisms/KPIGrid";
import EquipmentStatus from "@/components/organisms/EquipmentStatus";
import AlertsPanel from "@/components/organisms/AlertsPanel";
import EquipmentMap from "@/components/organisms/EquipmentMap";
import Loading from "@/components/ui/Loading";
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
{/* Equipment Location Map */}
      <div className="w-full">
        <EquipmentMap />
      </div>
    </div>
  );
};

export default Dashboard;