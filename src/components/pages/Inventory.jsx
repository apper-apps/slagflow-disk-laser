import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import inventoryService from '@/services/api/inventoryService';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('all');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryService.getAll();
      setInventory(data);
    } catch (err) {
      setError('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const getCapacityColor = (quantity, capacity) => {
    const percentage = (quantity / capacity) * 100;
    if (percentage >= 90) return 'text-error';
    if (percentage >= 75) return 'text-warning';
    if (percentage <= 30) return 'text-error';
    return 'text-success';
  };

  const getCapacityBadge = (quantity, capacity) => {
    const percentage = (quantity / capacity) * 100;
    if (percentage >= 90) return <Badge variant="error">Near Full</Badge>;
    if (percentage >= 75) return <Badge variant="warning">High</Badge>;
    if (percentage <= 30) return <Badge variant="error">Low Stock</Badge>;
    return <Badge variant="success">Optimal</Badge>;
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

  const getFilteredInventory = () => {
    switch (selectedView) {
      case 'low':
        return inventory.filter(item => (item.quantity / item.capacity) <= 0.3);
      case 'high':
        return inventory.filter(item => (item.quantity / item.capacity) >= 0.75);
      case 'products':
        return inventory.filter(item => item.material.includes('Aggregate'));
      case 'raw':
        return inventory.filter(item => item.material.includes('Slag') || item.material.includes('Raw'));
      default:
        return inventory;
    }
  };

  const getTotalValue = () => {
    return inventory.reduce((total, item) => total + (item.quantity * item.pricePerTonne), 0);
  };

  const getLowStockCount = () => {
    return inventory.filter(item => (item.quantity / item.capacity) <= 0.3).length;
  };

  const getHighStockCount = () => {
    return inventory.filter(item => (item.quantity / item.capacity) >= 0.75).length;
  };

  if (loading) return <Loading rows={5} />;
  if (error) return <Error message={error} onRetry={fetchInventory} />;

  const filteredInventory = getFilteredInventory();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Track bin levels and material movements in real-time</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <ApperIcon name="Download" className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="primary" size="sm">
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Material
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bins</p>
              <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
            </div>
            <ApperIcon name="Package" className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-success">${getTotalValue().toLocaleString()}</p>
            </div>
            <ApperIcon name="DollarSign" className="w-8 h-8 text-success" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-error">{getLowStockCount()}</p>
            </div>
            <ApperIcon name="AlertTriangle" className="w-8 h-8 text-error" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Near Full</p>
              <p className="text-2xl font-bold text-warning">{getHighStockCount()}</p>
            </div>
            <ApperIcon name="TrendingUp" className="w-8 h-8 text-warning" />
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Bin Status</h2>
          <div className="flex items-center space-x-2">
            {[
              { key: 'all', label: 'All Bins', count: inventory.length },
              { key: 'low', label: 'Low Stock', count: getLowStockCount() },
              { key: 'high', label: 'Near Full', count: getHighStockCount() },
              { key: 'products', label: 'Products', count: inventory.filter(i => i.material.includes('Aggregate')).length },
              { key: 'raw', label: 'Raw Materials', count: inventory.filter(i => i.material.includes('Slag') || i.material.includes('Raw')).length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedView(tab.key)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  selectedView === tab.key
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {filteredInventory.length === 0 ? (
          <Empty
            title="No inventory items found"
            description="No items match the current filter criteria."
            icon="Package"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInventory.map((item) => {
              const fillPercentage = (item.quantity / item.capacity) * 100;
              return (
                <Card key={item.Id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="Package" className="w-5 h-5 text-primary" />
                      <h3 className="font-medium text-gray-900">{item.binId}</h3>
                    </div>
                    {getCapacityBadge(item.quantity, item.capacity)}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.material}</p>
                      <p className="text-xs text-gray-600">{item.location}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Quantity</span>
                      <span className={`text-sm font-medium ${getCapacityColor(item.quantity, item.capacity)}`}>
                        {item.quantity.toFixed(1)}t / {item.capacity}t
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Fill Level</span>
                      <span className={`text-sm font-medium ${getCapacityColor(item.quantity, item.capacity)}`}>
                        {fillPercentage.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Quality</span>
                      <Badge variant={item.quality === 'Grade A' ? 'success' : item.quality === 'Grade B' ? 'warning' : 'default'} size="sm">
                        {item.quality}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Value</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${(item.quantity * item.pricePerTonne).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Updated</span>
                      <span className="text-sm text-gray-500">
                        {formatDateTime(item.lastUpdated)}
                      </span>
                    </div>
                  </div>

                  {/* Fill Level Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          fillPercentage >= 90 ? 'bg-error' :
                          fillPercentage >= 75 ? 'bg-warning' :
                          fillPercentage <= 30 ? 'bg-error' : 'bg-success'
                        }`}
                        style={{ width: `${fillPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      <ApperIcon name="TrendingUp" className="w-3 h-3 mr-1" />
                      History
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <ApperIcon name="RefreshCw" className="w-3 h-3 mr-1" />
                      Update
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Inventory;