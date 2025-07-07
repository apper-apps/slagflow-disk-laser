import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Layout from '@/components/organisms/Layout';
import Dashboard from '@/components/pages/Dashboard';
import Weighbridge from '@/components/pages/Weighbridge';
import Processing from '@/components/pages/Processing';
import Inventory from '@/components/pages/Inventory';
import Reports from '@/components/pages/Reports';
import Settings from '@/components/pages/Settings';
import MaintenanceCalendar from '@/components/pages/MaintenanceCalendar';
import ProfitDashboard from '@/components/pages/ProfitDashboard';
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Layout>
<Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/weighbridge" element={<Weighbridge />} />
            <Route path="/processing" element={<Processing />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profit" element={<ProfitDashboard />} />
            <Route path="/maintenance" element={<MaintenanceCalendar />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    </Router>
  );
}

export default App;