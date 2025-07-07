import { useState, useEffect } from 'react';
import StatCard from '@/components/molecules/StatCard';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import ChemistryChart from '@/components/organisms/ChemistryChart';
const KPIGrid = ({ userRole }) => {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChemistry, setShowChemistry] = useState(false);
  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Role-based KPIs
        const roleKPIs = {
          'Manager': [
            { title: 'Daily Revenue', value: '$24,500', change: '+12.5%', changeType: 'positive', icon: 'DollarSign' },
            { title: 'Processing Rate', value: '85%', change: '+5.2%', changeType: 'positive', icon: 'TrendingUp' },
            { title: 'Recovery Rate', value: '92.3%', change: '+2.1%', changeType: 'positive', icon: 'Recycle' },
            { title: 'CO₂ Footprint', value: '1.2T', change: '-8.3%', changeType: 'positive', icon: 'Leaf' },
            { title: 'Profit/Tonne', value: '$45.20', change: '+15.8%', changeType: 'positive', icon: 'Target' },
            { title: 'Equipment Uptime', value: '94.7%', change: '+3.1%', changeType: 'positive', icon: 'Gauge' }
          ],
          'Yard Staff': [
            { title: 'Loads Processed', value: '142', change: '+8', changeType: 'positive', icon: 'Truck' },
            { title: 'Queue Length', value: '3', change: '-2', changeType: 'positive', icon: 'Clock' },
            { title: 'Average Load Time', value: '12 min', change: '-1.5 min', changeType: 'positive', icon: 'Timer' },
            { title: 'Quality Issues', value: '2', change: '-1', changeType: 'positive', icon: 'AlertTriangle' }
          ],
          'Maintenance': [
            { title: 'Critical Alerts', value: '1', change: '-2', changeType: 'positive', icon: 'AlertCircle' },
            { title: 'Avg Temperature', value: '82°C', change: '+2°C', changeType: 'neutral', icon: 'Thermometer' },
            { title: 'Equipment Status', value: '95%', change: '+1%', changeType: 'positive', icon: 'CheckCircle' },
            { title: 'Maintenance Due', value: '3', change: '0', changeType: 'neutral', icon: 'Wrench' }
          ]
        };

        setKpis(roleKPIs[userRole] || roleKPIs['Manager']);
      } catch (err) {
        setError('Failed to load KPIs');
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, [userRole]);

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={() => window.location.reload()} />;

return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {kpis.map((kpi, index) => (
          <StatCard
            key={index}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            changeType={kpi.changeType}
            icon={kpi.icon}
            className="hover:shadow-lg transition-shadow"
          />
        ))}
      </div>
      
      {userRole === 'Manager' && (
        <div className="w-full">
          <ChemistryChart />
        </div>
      )}
    </div>
  );
};

export default KPIGrid;