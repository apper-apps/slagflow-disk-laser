import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import loadService from '@/services/api/loadService';

const Processing = () => {
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchLoads();
  }, []);

  const fetchLoads = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await loadService.getAll();
      setLoads(data.sort((a, b) => new Date(a.arrivalTime) - new Date(b.arrivalTime)));
    } catch (err) {
      setError('Failed to fetch loads');
    } finally {
      setLoading(false);
    }
  };

  const updateLoadStatus = async (loadId, newStatus) => {
    try {
      setUpdating(loadId);
      const updatedLoad = await loadService.update(loadId, { status: newStatus });
      setLoads(prev => prev.map(load => 
        load.Id === loadId ? updatedLoad : load
      ));
      toast.success(`Load ${newStatus} successfully`);
    } catch (err) {
      toast.error('Failed to update load status');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'processed':
        return <Badge variant="success">Processed</Badge>;
      case 'processing':
        return <Badge variant="warning">Processing</Badge>;
      case 'pending':
        return <Badge variant="info">Pending</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getPriorityIcon = (chemistry) => {
    const ironContent = chemistry?.iron || 0;
    if (ironContent > 47) return { icon: 'ArrowUp', color: 'text-error', label: 'High Priority' };
    if (ironContent > 44) return { icon: 'Minus', color: 'text-warning', label: 'Medium Priority' };
    return { icon: 'ArrowDown', color: 'text-success', label: 'Low Priority' };
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

  const getQueueTime = (arrivalTime) => {
    const now = new Date();
    const arrival = new Date(arrivalTime);
    const diffMinutes = Math.floor((now - arrival) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m`;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  if (loading) return <Loading rows={5} />;
  if (error) return <Error message={error} onRetry={fetchLoads} />;

  const pendingLoads = loads.filter(load => load.status === 'pending');
  const processingLoads = loads.filter(load => load.status === 'processing');
  const processedLoads = loads.filter(load => load.status === 'processed');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Processing Queue</h1>
          <p className="text-gray-600 mt-1">Manage load processing with AI-optimized scheduling</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">AI Scheduler Active</span>
          </div>
          <Button variant="outline" size="sm">
            <ApperIcon name="Settings" className="w-4 h-4 mr-2" />
            Configure AI
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Queue</p>
              <p className="text-2xl font-bold text-warning">{pendingLoads.length}</p>
            </div>
            <ApperIcon name="Clock" className="w-8 h-8 text-warning" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-info">{processingLoads.length}</p>
            </div>
            <ApperIcon name="Cog" className="w-8 h-8 text-info animate-spin" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processed Today</p>
              <p className="text-2xl font-bold text-success">{processedLoads.length}</p>
            </div>
            <ApperIcon name="CheckCircle" className="w-8 h-8 text-success" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Queue Time</p>
              <p className="text-2xl font-bold text-gray-900">2.3h</p>
            </div>
            <ApperIcon name="Timer" className="w-8 h-8 text-gray-600" />
          </div>
        </Card>
      </div>

      {/* Processing Queue Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Processing Queue</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <ApperIcon name="RefreshCw" className="w-4 h-4 mr-2" />
              Refresh Queue
            </Button>
            <Button variant="primary" size="sm">
              <ApperIcon name="Zap" className="w-4 h-4 mr-2" />
              Auto-Schedule
            </Button>
          </div>
        </div>

        {loads.length === 0 ? (
          <Empty
            title="No loads to process"
            description="Processing queue is empty. New loads will appear here automatically."
            icon="Cog"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Load #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Weight</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Source</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Chemistry</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Queue Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loads.map((load, index) => {
                  const priority = getPriorityIcon(load.chemistry);
                  return (
                    <tr key={load.Id} className={`table-row ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <ApperIcon name={priority.icon} className={`w-4 h-4 ${priority.color}`} />
                          <span className={`text-xs ${priority.color}`}>{priority.label}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {load.loadNumber || `LD-${load.Id}`}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {load.weight.toFixed(1)}t
                      </td>
                      <td className="py-3 px-4 text-gray-600">{load.source}</td>
                      <td className="py-3 px-4">
                        <div className="text-xs text-gray-600">
                          Fe: {load.chemistry?.iron || 0}% | Ca: {load.chemistry?.calcium || 0}%
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {getQueueTime(load.arrivalTime)}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(load.status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {load.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => updateLoadStatus(load.Id, 'processing')}
                              disabled={updating === load.Id}
                            >
                              {updating === load.Id ? (
                                <ApperIcon name="Loader2" className="w-3 h-3 animate-spin" />
                              ) : (
                                <ApperIcon name="Play" className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                          {load.status === 'processing' && (
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => updateLoadStatus(load.Id, 'processed')}
                              disabled={updating === load.Id}
                            >
                              {updating === load.Id ? (
                                <ApperIcon name="Loader2" className="w-3 h-3 animate-spin" />
                              ) : (
                                <ApperIcon name="Check" className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <ApperIcon name="MoreHorizontal" className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* AI Recommendations */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">AI Recommendations</h2>
          <Badge variant="info" size="sm">
            <ApperIcon name="Zap" className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-info/5 rounded-lg border border-info/20">
            <ApperIcon name="TrendingUp" className="w-5 h-5 text-info mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Optimize Processing Order</p>
              <p className="text-sm text-gray-600">Process high-iron loads first to maximize aggregate quality and reduce energy consumption by 8%.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-warning/5 rounded-lg border border-warning/20">
            <ApperIcon name="AlertTriangle" className="w-5 h-5 text-warning mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Equipment Maintenance Alert</p>
              <p className="text-sm text-gray-600">Schedule Crusher #2 maintenance soon. Current temperature trends suggest potential issues.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-success/5 rounded-lg border border-success/20">
            <ApperIcon name="Target" className="w-5 h-5 text-success mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Quality Optimization</p>
              <p className="text-sm text-gray-600">Current batch chemistry is optimal for Grade A aggregate production. Continue current processing parameters.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Processing;