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
import loadService from '@/services/api/loadService';

const Weighbridge = () => {
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    weight: '',
    source: '',
    driver: '',
    truckNumber: '',
    loadNumber: '',
    chemistry: {
      iron: '',
      calcium: '',
      silicon: '',
      aluminum: '',
      magnesium: ''
    }
  });

  useEffect(() => {
    fetchLoads();
  }, []);

  const fetchLoads = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await loadService.getAll();
      setLoads(data.sort((a, b) => new Date(b.arrivalTime) - new Date(a.arrivalTime)));
    } catch (err) {
      setError('Failed to fetch loads');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.weight || !formData.source || !formData.driver || !formData.truckNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const loadData = {
        ...formData,
        weight: parseFloat(formData.weight),
        chemistry: {
          iron: parseFloat(formData.chemistry.iron) || 0,
          calcium: parseFloat(formData.chemistry.calcium) || 0,
          silicon: parseFloat(formData.chemistry.silicon) || 0,
          aluminum: parseFloat(formData.chemistry.aluminum) || 0,
          magnesium: parseFloat(formData.chemistry.magnesium) || 0
        }
      };

      const newLoad = await loadService.create(loadData);
      setLoads(prev => [newLoad, ...prev]);
      
      // Reset form
      setFormData({
        weight: '',
        source: '',
        driver: '',
        truckNumber: '',
        loadNumber: '',
        chemistry: {
          iron: '',
          calcium: '',
          silicon: '',
          aluminum: '',
          magnesium: ''
        }
      });

      toast.success('Load entry created successfully');
    } catch (err) {
      toast.error('Failed to create load entry');
    } finally {
      setSubmitting(false);
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
  if (error) return <Error message={error} onRetry={fetchLoads} />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Weighbridge</h1>
          <p className="text-gray-600 mt-1">Record incoming waste loads and track chemistry data</p>
        </div>
        <div className="flex items-center space-x-2">
          <ApperIcon name="Scale" className="w-5 h-5 text-primary" />
          <span className="text-sm text-gray-500">Live Scale Connected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry Form */}
        <Card className="p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Load Entry</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Weight (tonnes)" required>
              <Input
                name="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="25.5"
                required
              />
            </FormField>

            <FormField label="Source" required>
              <Select
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                required
              >
                <option value="">Select source</option>
                <option value="Steel Mill A">Steel Mill A</option>
                <option value="Steel Mill B">Steel Mill B</option>
                <option value="Steel Mill C">Steel Mill C</option>
                <option value="Foundry Works">Foundry Works</option>
              </Select>
            </FormField>

            <FormField label="Driver Name" required>
              <Input
                name="driver"
                value={formData.driver}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
              />
            </FormField>

            <FormField label="Truck Number" required>
              <Input
                name="truckNumber"
                value={formData.truckNumber}
                onChange={handleInputChange}
                placeholder="TR-001"
                required
              />
            </FormField>

            <FormField label="Load Number">
              <Input
                name="loadNumber"
                value={formData.loadNumber}
                onChange={handleInputChange}
                placeholder="LD-2024-001"
              />
            </FormField>

            {/* Chemistry Section */}
            <div className="pt-4 border-t">
              <h3 className="text-md font-medium text-gray-900 mb-3">Chemistry Analysis (%)</h3>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Iron">
                  <Input
                    name="chemistry.iron"
                    type="number"
                    step="0.1"
                    value={formData.chemistry.iron}
                    onChange={handleInputChange}
                    placeholder="45.2"
                  />
                </FormField>

                <FormField label="Calcium">
                  <Input
                    name="chemistry.calcium"
                    type="number"
                    step="0.1"
                    value={formData.chemistry.calcium}
                    onChange={handleInputChange}
                    placeholder="32.1"
                  />
                </FormField>

                <FormField label="Silicon">
                  <Input
                    name="chemistry.silicon"
                    type="number"
                    step="0.1"
                    value={formData.chemistry.silicon}
                    onChange={handleInputChange}
                    placeholder="15.8"
                  />
                </FormField>

                <FormField label="Aluminum">
                  <Input
                    name="chemistry.aluminum"
                    type="number"
                    step="0.1"
                    value={formData.chemistry.aluminum}
                    onChange={handleInputChange}
                    placeholder="4.2"
                  />
                </FormField>

                <FormField label="Magnesium" className="col-span-2">
                  <Input
                    name="chemistry.magnesium"
                    type="number"
                    step="0.1"
                    value={formData.chemistry.magnesium}
                    onChange={handleInputChange}
                    placeholder="2.7"
                  />
                </FormField>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                  Record Load
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Recent Loads */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Loads</h2>
            <Button variant="outline" size="sm">
              <ApperIcon name="Download" className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {loads.length === 0 ? (
            <Empty
              title="No loads recorded"
              description="Start by recording your first load entry using the form on the left."
              icon="Scale"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Load #</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Weight</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Source</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Driver</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Truck</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Arrival</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loads.map((load, index) => (
                    <tr key={load.Id} className={`table-row ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {load.loadNumber || `LD-${load.Id}`}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {load.weight.toFixed(1)}t
                      </td>
                      <td className="py-3 px-4 text-gray-600">{load.source}</td>
                      <td className="py-3 px-4 text-gray-600">{load.driver}</td>
                      <td className="py-3 px-4 text-gray-600">{load.truckNumber}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDateTime(load.arrivalTime)}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(load.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Weighbridge;