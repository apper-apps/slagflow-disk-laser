import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
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

  useEffect(() => {
    fetchReports();
  }, []);

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