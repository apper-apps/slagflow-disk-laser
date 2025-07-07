import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Chart from 'react-apexcharts';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import FormField from '@/components/molecules/FormField';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    reportType: '',
    startDate: '',
    endDate: '',
    format: 'pdf'
  });

  // Dust sensor chart states
  const [dustSensorData, setDustSensorData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(null);
  const [chartType, setChartType] = useState('line');
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [chartDateRange, setChartDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });

useEffect(() => {
    fetchReports();
    fetchDustSensorData();
  }, []);

  useEffect(() => {
    fetchDustSensorData();
  }, [equipmentFilter, chartDateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Mock reports data
      setReports([
        {
          id: 1,
          name: 'Daily Production Report',
          type: 'Production',
          date: '2024-01-25',
          status: 'completed',
          size: '2.4 MB',
          format: 'PDF',
          generatedBy: 'System',
          generatedAt: '2024-01-25T08:00:00Z'
        },
        {
          id: 2,
          name: 'Environmental Compliance Report',
          type: 'Compliance',
          date: '2024-01-24',
          status: 'completed',
          size: '1.8 MB',
          format: 'PDF',
          generatedBy: 'John Smith',
          generatedAt: '2024-01-24T16:30:00Z'
        },
        {
          id: 3,
          name: 'Equipment Maintenance Report',
          type: 'Maintenance',
          date: '2024-01-23',
          status: 'processing',
          size: '-- MB',
          format: 'PDF',
          generatedBy: 'System',
          generatedAt: '2024-01-23T14:15:00Z'
        },
        {
          id: 4,
          name: 'Financial Summary Report',
          type: 'Financial',
          date: '2024-01-22',
          status: 'completed',
          size: '3.2 MB',
          format: 'Excel',
          generatedBy: 'Sarah Wilson',
          generatedAt: '2024-01-22T10:45:00Z'
        }
      ]);
    } catch (err) {
      setError('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
};

  const fetchDustSensorData = async () => {
    try {
      setChartLoading(true);
      setChartError(null);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate mock dust sensor data
      const equipmentTypes = ['Conveyor', 'Crusher', 'Separator', 'Mill'];
      const startDate = new Date(chartDateRange.startDate);
      const endDate = new Date(chartDateRange.endDate);
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      
      const mockData = [];
      for (let i = 0; i <= daysDiff; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        equipmentTypes.forEach(equipment => {
          if (equipmentFilter === 'all' || equipmentFilter === equipment.toLowerCase()) {
            // Generate realistic dust sensor readings (mg/m³)
            const baseLevel = equipment === 'Crusher' ? 45 : equipment === 'Mill' ? 35 : equipment === 'Conveyor' ? 25 : 30;
            const variance = Math.random() * 20 - 10; // ±10 variation
            const dailyPattern = Math.sin((i % 7) * Math.PI / 3.5) * 5; // Weekly pattern
            const value = Math.max(0, baseLevel + variance + dailyPattern);
            
            mockData.push({
              equipment,
              date: date.toISOString().split('T')[0],
              timestamp: date.getTime(),
              dustLevel: Math.round(value * 10) / 10,
              threshold: equipment === 'Crusher' ? 50 : 40,
              status: value > (equipment === 'Crusher' ? 50 : 40) ? 'high' : value > 30 ? 'medium' : 'low'
            });
          }
        });
      }
      
      setDustSensorData(mockData);
      toast.success('Dust sensor data updated');
    } catch (err) {
      setChartError('Failed to fetch dust sensor data');
      toast.error('Failed to load chart data');
    } finally {
      setChartLoading(false);
    }
  };

  const getChartData = () => {
    if (!dustSensorData.length) return { series: [], categories: [] };

    const equipmentTypes = [...new Set(dustSensorData.map(d => d.equipment))];
    const dates = [...new Set(dustSensorData.map(d => d.date))].sort();
    
    const series = equipmentTypes.map(equipment => ({
      name: equipment,
      data: dates.map(date => {
        const dataPoint = dustSensorData.find(d => d.equipment === equipment && d.date === date);
        return dataPoint ? dataPoint.dustLevel : 0;
      })
    }));

    return { series, categories: dates };
  };

  const chartOptions = {
    chart: {
      type: chartType,
      height: 400,
      zoom: {
        enabled: true,
        type: 'x',
        autoScaleYaxis: true
      },
      pan: {
        enabled: true,
        type: 'x'
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      }
    },
    colors: ['#1e3a5f', '#4a6fa5', '#ff6b35', '#27ae60', '#f39c12'],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: chartType === 'line' ? 3 : 1
    },
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 3
    },
    xaxis: {
      categories: getChartData().categories,
      title: {
        text: 'Date',
        style: {
          fontSize: '12px',
          fontWeight: 600,
          color: '#374151'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Dust Level (mg/m³)',
        style: {
          fontSize: '12px',
          fontWeight: 600,
          color: '#374151'
        }
      },
      labels: {
        formatter: (value) => `${value.toFixed(1)}`
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left'
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value) => `${value.toFixed(1)} mg/m³`
      }
    },
    responsive: [{
      breakpoint: 768,
      options: {
        chart: {
          height: 300
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  const handleChartDateChange = (e) => {
    const { name, value } = e.target;
    setChartDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    if (!formData.reportType || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setGenerating(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newReport = {
        id: reports.length + 1,
        name: `${formData.reportType} Report`,
        type: formData.reportType,
        date: new Date().toISOString().split('T')[0],
        status: 'processing',
        size: '-- MB',
        format: formData.format.toUpperCase(),
        generatedBy: 'Current User',
        generatedAt: new Date().toISOString()
      };

      setReports(prev => [newReport, ...prev]);
      
      // Reset form
      setFormData({
        reportType: '',
        startDate: '',
        endDate: '',
        format: 'pdf'
      });

      toast.success('Report generation started');
      
      // Simulate report completion
      setTimeout(() => {
        setReports(prev => prev.map(report => 
          report.id === newReport.id 
            ? { ...report, status: 'completed', size: '2.1 MB' }
            : report
        ));
        toast.success('Report generated successfully');
      }, 5000);

    } catch (err) {
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'processing':
        return <Badge variant="warning">Processing</Badge>;
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getReportIcon = (type) => {
    switch (type) {
      case 'Production':
        return 'BarChart3';
      case 'Compliance':
        return 'Shield';
      case 'Maintenance':
        return 'Wrench';
      case 'Financial':
        return 'DollarSign';
      default:
        return 'FileText';
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <Loading rows={5} />;
  if (error) return <Error message={error} onRetry={fetchReports} />;

return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Reports & Compliance</h1>
          <p className="text-gray-600 mt-1">Generate operational and compliance reports</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <ApperIcon name="Schedule" className="w-4 h-4 mr-2" />
            Schedule Reports
          </Button>
          <Button variant="primary" size="sm">
            <ApperIcon name="Settings" className="w-4 h-4 mr-2" />
            Templates
          </Button>
        </div>
      </div>

      {/* Dust Sensor Trends Chart */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Dust Sensor Historical Trends</h2>
            <p className="text-gray-600 mt-1">Monitor dust levels across equipment over time</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <Select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="min-w-0 sm:w-auto"
            >
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
            </Select>
            
            <Select
              value={equipmentFilter}
              onChange={(e) => setEquipmentFilter(e.target.value)}
              className="min-w-0 sm:w-auto"
            >
              <option value="all">All Equipment</option>
              <option value="conveyor">Conveyor</option>
              <option value="crusher">Crusher</option>
              <option value="separator">Separator</option>
              <option value="mill">Mill</option>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDustSensorData}
              disabled={chartLoading}
            >
              <ApperIcon name="RotateCcw" className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <FormField label="Start Date">
            <Input
              name="startDate"
              type="date"
              value={chartDateRange.startDate}
              onChange={handleChartDateChange}
            />
          </FormField>
          
          <FormField label="End Date">
            <Input
              name="endDate"
              type="date"
              value={chartDateRange.endDate}
              onChange={handleChartDateChange}
            />
          </FormField>
          
          <div className="lg:col-span-2 flex items-end">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-success rounded-full mr-2"></div>
                <span>Normal (&lt;30 mg/m³)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-warning rounded-full mr-2"></div>
                <span>Medium (30-40 mg/m³)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-error rounded-full mr-2"></div>
                <span>High (&gt;40 mg/m³)</span>
              </div>
            </div>
          </div>
        </div>

        {chartLoading ? (
          <Loading rows={8} />
        ) : chartError ? (
          <Error message={chartError} onRetry={fetchDustSensorData} />
        ) : dustSensorData.length === 0 ? (
          <Empty
            title="No dust sensor data available"
            description="Adjust your filters or date range to view data."
            icon="BarChart3"
          />
        ) : (
          <div className="bg-white rounded-lg">
            <Chart
              options={chartOptions}
              series={getChartData().series}
              type={chartType}
              height={400}
            />
          </div>
        )}

        {dustSensorData.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...new Set(dustSensorData.map(d => d.equipment))].map(equipment => {
              const equipmentData = dustSensorData.filter(d => d.equipment === equipment);
              const avgLevel = equipmentData.reduce((sum, d) => sum + d.dustLevel, 0) / equipmentData.length;
              const maxLevel = Math.max(...equipmentData.map(d => d.dustLevel));
              const alertCount = equipmentData.filter(d => d.status === 'high').length;
              
              return (
                <div key={equipment} className="text-center p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 text-sm">{equipment}</h4>
                  <p className="text-xl font-bold text-gray-900 mt-1">{avgLevel.toFixed(1)}</p>
                  <p className="text-xs text-gray-600">Avg mg/m³</p>
                  {alertCount > 0 && (
                    <Badge variant="error" size="sm" className="mt-1">
                      {alertCount} alerts
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Generator */}
        <Card className="p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Report</h2>
          
          <form onSubmit={handleGenerateReport} className="space-y-4">
            <FormField label="Report Type" required>
              <Select
                name="reportType"
                value={formData.reportType}
                onChange={handleInputChange}
                required
              >
                <option value="">Select report type</option>
                <option value="Production">Production Report</option>
                <option value="Compliance">Environmental Compliance</option>
                <option value="Maintenance">Equipment Maintenance</option>
                <option value="Financial">Financial Summary</option>
                <option value="Quality">Quality Control</option>
                <option value="Safety">Safety Report</option>
              </Select>
            </FormField>

            <FormField label="Start Date" required>
              <Input
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </FormField>

            <FormField label="End Date" required>
              <Input
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </FormField>

            <FormField label="Format">
              <Select
                name="format"
                value={formData.format}
                onChange={handleInputChange}
              >
                <option value="pdf">PDF Document</option>
                <option value="excel">Excel Spreadsheet</option>
                <option value="csv">CSV Data</option>
              </Select>
            </FormField>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={generating}
            >
              {generating ? (
                <>
                  <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ApperIcon name="FileText" className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </form>

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ApperIcon name="Calendar" className="w-4 h-4 mr-2" />
                Daily Production Report
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ApperIcon name="Shield" className="w-4 h-4 mr-2" />
                Environmental Compliance
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ApperIcon name="TrendingUp" className="w-4 h-4 mr-2" />
                Performance Summary
              </Button>
            </div>
          </div>
        </Card>

        {/* Reports List */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
            <Button variant="outline" size="sm">
              <ApperIcon name="Search" className="w-4 h-4 mr-2" />
              Search Reports
            </Button>
          </div>

          {reports.length === 0 ? (
            <Empty
              title="No reports available"
              description="Generate your first report using the form on the left."
              icon="FileText"
            />
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div 
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <ApperIcon 
                        name={getReportIcon(report.type)} 
                        className="w-5 h-5 text-primary" 
                      />
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900">{report.name}</h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-sm text-gray-600">{report.type}</span>
                        <span className="text-sm text-gray-600">•</span>
                        <span className="text-sm text-gray-600">{formatDateTime(report.generatedAt)}</span>
                        <span className="text-sm text-gray-600">•</span>
                        <span className="text-sm text-gray-600">{report.size}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getStatusBadge(report.status)}
                    <Badge variant="default" size="sm">
                      {report.format}
                    </Badge>
                    
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <ApperIcon name="Eye" className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <ApperIcon name="Download" className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <ApperIcon name="Share" className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Compliance Dashboard */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Compliance Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <ApperIcon name="CheckCircle" className="w-8 h-8 text-success" />
            </div>
            <h3 className="font-medium text-gray-900">Environmental</h3>
            <p className="text-sm text-gray-600 mt-1">All regulations met</p>
            <Badge variant="success" size="sm" className="mt-2">Compliant</Badge>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <ApperIcon name="AlertTriangle" className="w-8 h-8 text-warning" />
            </div>
            <h3 className="font-medium text-gray-900">Safety</h3>
            <p className="text-sm text-gray-600 mt-1">1 item needs attention</p>
            <Badge variant="warning" size="sm" className="mt-2">Review Required</Badge>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <ApperIcon name="FileCheck" className="w-8 h-8 text-success" />
            </div>
            <h3 className="font-medium text-gray-900">Quality</h3>
            <p className="text-sm text-gray-600 mt-1">Standards exceeded</p>
            <Badge variant="success" size="sm" className="mt-2">Excellent</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Reports;