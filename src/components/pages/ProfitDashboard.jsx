import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import Input from '@/components/atoms/Input';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import StatCard from '@/components/molecules/StatCard';
import ApperIcon from '@/components/ApperIcon';
import profitAnalyticsService from '@/services/api/profitAnalyticsService';
import ReactApexChart from 'react-apexcharts';

const ProfitDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profitData, setProfitData] = useState([]);
  const [costBreakdown, setCostBreakdown] = useState(null);
  const [revenueBreakdown, setRevenueBreakdown] = useState(null);
  const [profitTrends, setProfitTrends] = useState({});
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [selectedStage, setSelectedStage] = useState('crushing');

  useEffect(() => {
    fetchProfitData();
  }, [dateRange, selectedPeriod]);

  const fetchProfitData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [data, costs, revenue, trends] = await Promise.all([
        profitAnalyticsService.getByDateRange(dateRange.start, dateRange.end),
        profitAnalyticsService.getCostBreakdown(),
        profitAnalyticsService.getRevenueBreakdown(),
        profitAnalyticsService.getProfitTrends(selectedPeriod)
      ]);
      
      setProfitData(data);
      setCostBreakdown(costs);
      setRevenueBreakdown(revenue);
      setProfitTrends(trends);
      
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load profit data');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummaryStats = () => {
    if (!profitData.length) return { totalProfit: 0, avgProfitPerTonne: 0, profitMargin: 0, totalVolume: 0 };
    
    const totalProfit = profitData.reduce((sum, record) => sum + record.profit, 0);
    const totalRevenue = profitData.reduce((sum, record) => sum + record.totalRevenue, 0);
    const totalVolume = profitData.reduce((sum, record) => sum + record.weight, 0);
    const avgProfitPerTonne = totalProfit / totalVolume;
    const profitMargin = (totalProfit / totalRevenue) * 100;
    
    return { totalProfit, avgProfitPerTonne, profitMargin, totalVolume };
  };

  const generateProfitTrendChart = () => {
    const sortedTrends = Object.entries(profitTrends).sort(([a], [b]) => a.localeCompare(b));
    
    return {
      series: [{
        name: 'Profit per Tonne',
        data: sortedTrends.map(([, trend]) => trend.avgProfitPerTonne.toFixed(2))
      }, {
        name: 'Profit Margin %',
        data: sortedTrends.map(([, trend]) => trend.profitMargin.toFixed(1))
      }],
      options: {
        chart: {
          type: 'line',
          height: 350,
          toolbar: { show: true }
        },
        colors: ['#1e3a5f', '#4a6fa5'],
        stroke: {
          width: 3,
          curve: 'smooth'
        },
        xaxis: {
          categories: sortedTrends.map(([date]) => date),
          title: { text: 'Date' }
        },
        yaxis: [{
          title: { text: 'Profit per Tonne ($)' },
          labels: { formatter: (val) => `$${val}` }
        }, {
          opposite: true,
          title: { text: 'Profit Margin (%)' },
          labels: { formatter: (val) => `${val}%` }
        }],
        tooltip: {
          shared: true,
          intersect: false
        },
        legend: {
          position: 'top'
        }
      }
    };
  };

  const generateCostBreakdownChart = () => {
    if (!costBreakdown) return null;
    
    const processingData = Object.entries(costBreakdown.processing.stages);
    const operationalData = Object.entries(costBreakdown.operational.categories);
    
    return {
      series: [...processingData.map(([, value]) => value), ...operationalData.map(([, value]) => value)],
      options: {
        chart: {
          type: 'donut',
          height: 350
        },
        labels: [...processingData.map(([key]) => `Processing: ${key}`), ...operationalData.map(([key]) => `Operational: ${key}`)],
        colors: ['#1e3a5f', '#4a6fa5', '#ff6b35', '#27ae60', '#f39c12', '#e74c3c', '#3498db', '#9b59b6'],
        legend: {
          position: 'bottom'
        },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                total: {
                  show: true,
                  label: 'Total Cost',
                  formatter: () => `$${(costBreakdown.processing.total + costBreakdown.operational.total).toLocaleString()}`
                }
              }
            }
          }
        },
        tooltip: {
          y: {
            formatter: (val) => `$${val.toLocaleString()}`
          }
        }
      }
    };
  };

  const generateRevenueBreakdownChart = () => {
    if (!revenueBreakdown) return null;
    
    return {
      series: [{
        name: 'Revenue',
        data: [
          revenueBreakdown.primaryProduct,
          revenueBreakdown.aggregateProduct,
          revenueBreakdown.byproducts
        ]
      }],
      options: {
        chart: {
          type: 'bar',
          height: 350
        },
        colors: ['#1e3a5f'],
        xaxis: {
          categories: ['Primary Products', 'Aggregate Products', 'Byproducts']
        },
        yaxis: {
          title: { text: 'Revenue ($)' },
          labels: { formatter: (val) => `$${val.toLocaleString()}` }
        },
        plotOptions: {
          bar: {
            borderRadius: 4,
            horizontal: false
          }
        },
        tooltip: {
          y: {
            formatter: (val) => `$${val.toLocaleString()}`
          }
        }
      }
    };
  };

  const handleExport = () => {
    const csvData = profitData.map(record => ({
      'Load Number': record.loadNumber,
      'Date': new Date(record.date).toLocaleDateString(),
      'Source': record.source,
      'Weight (tonnes)': record.weight,
      'Total Revenue': record.totalRevenue,
      'Total Cost': record.totalCost,
      'Profit': record.profit,
      'Profit per Tonne': record.profitPerTonne.toFixed(2),
      'Profit Margin %': record.profitMargin.toFixed(1)
    }));
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profit-analysis-${dateRange.start}-to-${dateRange.end}.csv`;
    a.click();
    
    toast.success('Data exported successfully');
  };

  if (loading) {
    return (
      <div className="p-6">
        <Loading rows={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Error message={error} onRetry={fetchProfitData} />
      </div>
    );
  }

  const summaryStats = calculateSummaryStats();
  const profitTrendChart = generateProfitTrendChart();
  const costChart = generateCostBreakdownChart();
  const revenueChart = generateRevenueBreakdownChart();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">
            Profit Analysis Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Interactive visualization of profit per tonne with cost and revenue breakdowns
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Download" size={16} />
            Export Data
          </Button>
          <Button onClick={fetchProfitData} className="flex items-center gap-2">
            <ApperIcon name="RefreshCw" size={16} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <Select
              value={selectedPeriod}
              onValueChange={setSelectedPeriod}
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' }
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Processing Stage</label>
            <Select
              value={selectedStage}
              onValueChange={setSelectedStage}
              options={[
                { value: 'crushing', label: 'Crushing' },
                { value: 'screening', label: 'Screening' },
                { value: 'washing', label: 'Washing' },
                { value: 'secondary', label: 'Secondary Processing' }
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Profit"
          value={`$${summaryStats.totalProfit.toLocaleString()}`}
          change="+12.5%"
          changeType="positive"
          icon="DollarSign"
        />
        <StatCard
          title="Avg Profit/Tonne"
          value={`$${summaryStats.avgProfitPerTonne.toFixed(2)}`}
          change="+8.3%"
          changeType="positive"
          icon="TrendingUp"
        />
        <StatCard
          title="Profit Margin"
          value={`${summaryStats.profitMargin.toFixed(1)}%`}
          change="+2.1%"
          changeType="positive"
          icon="Percent"
        />
        <StatCard
          title="Total Volume"
          value={`${summaryStats.totalVolume.toFixed(1)} t`}
          change="+15.2%"
          changeType="positive"
          icon="Package"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Trends Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Profit Trends</h3>
            <ApperIcon name="TrendingUp" size={20} className="text-gray-600" />
          </div>
          {Object.keys(profitTrends).length > 0 && (
            <ReactApexChart
              options={profitTrendChart.options}
              series={profitTrendChart.series}
              type="line"
              height={350}
            />
          )}
        </Card>

        {/* Cost Breakdown Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cost Breakdown</h3>
            <ApperIcon name="PieChart" size={20} className="text-gray-600" />
          </div>
          {costChart && (
            <ReactApexChart
              options={costChart.options}
              series={costChart.series}
              type="donut"
              height={350}
            />
          )}
        </Card>

        {/* Revenue Breakdown Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Streams</h3>
            <ApperIcon name="BarChart3" size={20} className="text-gray-600" />
          </div>
          {revenueChart && (
            <ReactApexChart
              options={revenueChart.options}
              series={revenueChart.series}
              type="bar"
              height={350}
            />
          )}
        </Card>

        {/* Processing Stage Analysis */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedStage.charAt(0).toUpperCase() + selectedStage.slice(1)} Stage Analysis
            </h3>
            <ApperIcon name="Settings" size={20} className="text-gray-600" />
          </div>
          
          <div className="space-y-4">
            {costBreakdown?.processing.stages[selectedStage] && (
              <>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Stage Cost</span>
                  <span className="font-semibold text-lg">
                    ${costBreakdown.processing.stages[selectedStage].toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Cost per Tonne</span>
                  <span className="font-semibold">
                    ${(costBreakdown.processing.stages[selectedStage] / summaryStats.totalVolume).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">% of Total Costs</span>
                  <span className="font-semibold">
                    {((costBreakdown.processing.stages[selectedStage] / (costBreakdown.processing.total + costBreakdown.operational.total)) * 100).toFixed(1)}%
                  </span>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Profit Records</h3>
          <span className="text-sm text-gray-600">{profitData.length} records</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Load #</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Source</th>
                <th className="text-right p-3">Weight (t)</th>
                <th className="text-right p-3">Revenue</th>
                <th className="text-right p-3">Cost</th>
                <th className="text-right p-3">Profit</th>
                <th className="text-right p-3">Profit/t</th>
                <th className="text-right p-3">Margin %</th>
              </tr>
            </thead>
            <tbody>
              {profitData.slice(0, 10).map((record) => (
                <tr key={record.Id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{record.loadNumber}</td>
                  <td className="p-3">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="p-3">{record.source}</td>
                  <td className="p-3 text-right">{record.weight.toFixed(1)}</td>
                  <td className="p-3 text-right text-success">${record.totalRevenue.toLocaleString()}</td>
                  <td className="p-3 text-right text-error">${record.totalCost.toLocaleString()}</td>
                  <td className="p-3 text-right font-semibold">
                    <span className={record.profit >= 0 ? 'text-success' : 'text-error'}>
                      ${record.profit.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-3 text-right">${record.profitPerTonne.toFixed(2)}</td>
                  <td className="p-3 text-right">
                    <span className={record.profitMargin >= 0 ? 'text-success' : 'text-error'}>
                      {record.profitMargin.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ProfitDashboard;