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
    <div className="p-4 md:p-6 h-full overflow-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 font-display">
            {userRole} Dashboard
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Welcome back! Here's what's happening at your plant today.
          </p>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-xs md:text-sm text-gray-500">Today</div>
          <div className="text-base md:text-lg font-semibold text-gray-900">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Matrix Layout Container */}
      <div className="grid grid-rows-[auto_1fr] lg:grid-rows-[auto_1fr_auto] gap-4 h-[calc(100vh-12rem)] min-h-[600px]">
        {/* KPIs Grid - Full Width Header */}
        <div className="w-full">
          <KPIGrid userRole={userRole} />
        </div>

        {/* Main Content Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full min-h-0">
          {/* Equipment Status - Takes up 2 columns */}
          <div className="lg:col-span-2 h-full min-h-0">
            <div className="h-full">
              <EquipmentStatus />
            </div>
          </div>

          {/* Alerts Panel - Takes up 1 column */}
          <div className="lg:col-span-1 h-full min-h-0">
            <div className="h-full">
              <AlertsPanel />
            </div>
          </div>
        </div>

        {/* Equipment Location Map - Bottom Row (Hidden on mobile, integrated on desktop) */}
        <div className="hidden lg:block w-full h-80 min-h-0">
          <EquipmentMap />
        </div>
      </div>

      {/* Mobile Equipment Map - Separate section for mobile */}
      <div className="lg:hidden mt-4">
        <EquipmentMap />
      </div>
    </div>
  );
};

export default Dashboard;