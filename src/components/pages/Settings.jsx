import { useState } from 'react';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import FormField from '@/components/molecules/FormField';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      plantName: 'SlagFlow Processing Plant',
      location: 'Industrial District, Steel City',
      timezone: 'UTC-5',
      currency: 'USD',
      units: 'metric'
    },
    processing: {
      maxTemperature: 100,
      processingHours: 16,
      qualityThreshold: 95,
      batchSize: 25,
      coolingTime: 30
    },
    alerts: {
      temperatureAlerts: true,
      equipmentAlerts: true,
      inventoryAlerts: true,
      emailNotifications: true,
      smsNotifications: false
    },
    compliance: {
      co2Reporting: true,
      dustMonitoring: true,
      wasteTracking: true,
      reportingFrequency: 'daily',
      retentionPeriod: 7
    }
  });

  const tabs = [
    { id: 'general', label: 'General', icon: 'Settings' },
    { id: 'processing', label: 'Processing', icon: 'Cog' },
    { id: 'alerts', label: 'Alerts', icon: 'Bell' },
    { id: 'compliance', label: 'Compliance', icon: 'Shield' }
  ];

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Plant Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Plant Name">
            <Input
              value={settings.general.plantName}
              onChange={(e) => handleInputChange('general', 'plantName', e.target.value)}
            />
          </FormField>
          <FormField label="Location">
            <Input
              value={settings.general.location}
              onChange={(e) => handleInputChange('general', 'location', e.target.value)}
            />
          </FormField>
          <FormField label="Timezone">
            <Select
              value={settings.general.timezone}
              onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
            >
              <option value="UTC-5">UTC-5 (EST)</option>
              <option value="UTC-6">UTC-6 (CST)</option>
              <option value="UTC-7">UTC-7 (MST)</option>
              <option value="UTC-8">UTC-8 (PST)</option>
            </Select>
          </FormField>
          <FormField label="Currency">
            <Select
              value={settings.general.currency}
              onChange={(e) => handleInputChange('general', 'currency', e.target.value)}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD ($)</option>
            </Select>
          </FormField>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Display Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Units">
            <Select
              value={settings.general.units}
              onChange={(e) => handleInputChange('general', 'units', e.target.value)}
            >
              <option value="metric">Metric (tonnes, °C)</option>
              <option value="imperial">Imperial (tons, °F)</option>
            </Select>
          </FormField>
        </div>
      </div>
    </div>
  );

  const renderProcessingSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Processing Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Max Temperature (°C)">
            <Input
              type="number"
              value={settings.processing.maxTemperature}
              onChange={(e) => handleInputChange('processing', 'maxTemperature', parseInt(e.target.value))}
            />
          </FormField>
          <FormField label="Processing Hours/Day">
            <Input
              type="number"
              value={settings.processing.processingHours}
              onChange={(e) => handleInputChange('processing', 'processingHours', parseInt(e.target.value))}
            />
          </FormField>
          <FormField label="Quality Threshold (%)">
            <Input
              type="number"
              value={settings.processing.qualityThreshold}
              onChange={(e) => handleInputChange('processing', 'qualityThreshold', parseInt(e.target.value))}
            />
          </FormField>
          <FormField label="Standard Batch Size (tonnes)">
            <Input
              type="number"
              value={settings.processing.batchSize}
              onChange={(e) => handleInputChange('processing', 'batchSize', parseInt(e.target.value))}
            />
          </FormField>
          <FormField label="Cooling Time (minutes)">
            <Input
              type="number"
              value={settings.processing.coolingTime}
              onChange={(e) => handleInputChange('processing', 'coolingTime', parseInt(e.target.value))}
            />
          </FormField>
        </div>
      </div>
    </div>
  );

  const renderAlertsSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Alert Types</h3>
        <div className="space-y-4">
          {Object.entries(settings.alerts).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <p className="text-sm text-gray-600">
                  {key === 'temperatureAlerts' && 'Monitor equipment temperature limits'}
                  {key === 'equipmentAlerts' && 'Track equipment status and maintenance needs'}
                  {key === 'inventoryAlerts' && 'Monitor bin levels and stock thresholds'}
                  {key === 'emailNotifications' && 'Send alerts via email'}
                  {key === 'smsNotifications' && 'Send alerts via SMS'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleInputChange('alerts', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderComplianceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Monitoring</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">CO₂ Reporting</h4>
              <p className="text-sm text-gray-600">Track and report carbon emissions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.compliance.co2Reporting}
                onChange={(e) => handleInputChange('compliance', 'co2Reporting', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Dust Monitoring</h4>
              <p className="text-sm text-gray-600">Monitor air quality and dust levels</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.compliance.dustMonitoring}
                onChange={(e) => handleInputChange('compliance', 'dustMonitoring', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Waste Tracking</h4>
              <p className="text-sm text-gray-600">Track waste processing and disposal</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.compliance.wasteTracking}
                onChange={(e) => handleInputChange('compliance', 'wasteTracking', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Reporting Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Reporting Frequency">
            <Select
              value={settings.compliance.reportingFrequency}
              onChange={(e) => handleInputChange('compliance', 'reportingFrequency', e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </Select>
          </FormField>
          <FormField label="Data Retention (years)">
            <Input
              type="number"
              value={settings.compliance.retentionPeriod}
              onChange={(e) => handleInputChange('compliance', 'retentionPeriod', parseInt(e.target.value))}
            />
          </FormField>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Settings</h1>
          <p className="text-gray-600 mt-1">Configure system preferences and parameters</p>
        </div>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <ApperIcon name="Save" className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ApperIcon name={tab.icon} className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'processing' && renderProcessingSettings()}
            {activeTab === 'alerts' && renderAlertsSettings()}
            {activeTab === 'compliance' && renderComplianceSettings()}
          </Card>
        </div>
      </div>

      {/* System Status */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-success/5 rounded-lg border border-success/20">
            <div className="flex items-center space-x-3">
              <ApperIcon name="CheckCircle" className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium text-gray-900">Database</p>
                <p className="text-sm text-gray-600">Connected</p>
              </div>
            </div>
            <Badge variant="success">Online</Badge>
          </div>

          <div className="flex items-center justify-between p-4 bg-success/5 rounded-lg border border-success/20">
            <div className="flex items-center space-x-3">
              <ApperIcon name="Wifi" className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium text-gray-900">Network</p>
                <p className="text-sm text-gray-600">Stable</p>
              </div>
            </div>
            <Badge variant="success">Connected</Badge>
          </div>

          <div className="flex items-center justify-between p-4 bg-warning/5 rounded-lg border border-warning/20">
            <div className="flex items-center space-x-3">
              <ApperIcon name="HardDrive" className="w-5 h-5 text-warning" />
              <div>
                <p className="font-medium text-gray-900">Storage</p>
                <p className="text-sm text-gray-600">78% used</p>
              </div>
            </div>
            <Badge variant="warning">Monitor</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;