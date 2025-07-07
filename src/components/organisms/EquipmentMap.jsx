import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import StatusIndicator from '@/components/molecules/StatusIndicator';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import equipmentService from '@/services/api/equipmentService';
import { cn } from '@/utils/cn';
import 'leaflet/dist/leaflet.css';

// Custom marker icons
const createCustomIcon = (status) => {
  const colors = {
    online: '#27ae60',
    warning: '#f39c12', 
    error: '#e74c3c',
    offline: '#94a3b8'
  };
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${colors[status] || colors.offline};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
          ${status === 'error' ? 'animation: pulse 1s infinite;' : ''}
        "></div>
      </div>
    `,
    className: 'custom-equipment-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const EquipmentMap = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const mapRef = useRef(null);

  const fetchEquipmentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await equipmentService.getEquipmentWithSensorData();
      setEquipment(data);
    } catch (err) {
      setError('Failed to load equipment data');
      console.error('Equipment data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipmentData();
    
    // Update sensor data every 30 seconds
    const interval = setInterval(fetchEquipmentData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      case 'offline': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getEquipmentIcon = (type) => {
    switch (type) {
      case 'Crusher': return 'Hammer';
      case 'Screen': return 'Filter';
      case 'Conveyor': return 'MoveRight';
      case 'Grinder': return 'Disc';
      default: return 'Cog';
    }
  };

  const getDustLevelColor = (dustLevel) => {
    if (dustLevel > 75) return 'text-error';
    if (dustLevel > 50) return 'text-warning';
    return 'text-success';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Equipment Location Map</h3>
        </div>
        <Loading rows={8} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Equipment Location Map</h3>
        </div>
        <Error message={error} onRetry={fetchEquipmentData} />
      </Card>
    );
  }

  // Calculate map center from equipment coordinates
  const center = equipment.length > 0 
    ? [
        equipment.reduce((sum, eq) => sum + eq.coordinates[0], 0) / equipment.length,
        equipment.reduce((sum, eq) => sum + eq.coordinates[1], 0) / equipment.length
      ]
    : [40.7128, -74.0060];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Equipment Location Map</h3>
          <p className="text-sm text-gray-600 mt-1">Real-time equipment status and sensor data</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <StatusIndicator status="online" label={`${equipment.filter(e => e.status === 'online').length} Online`} />
            <StatusIndicator status="warning" label={`${equipment.filter(e => e.status === 'warning').length} Warning`} />
            <StatusIndicator status="error" label={`${equipment.filter(e => e.status === 'error').length} Error`} />
          </div>
        </div>
      </div>

      <div className="relative h-96 w-full rounded-lg overflow-hidden border">
        <MapContainer
          ref={mapRef}
          center={center}
          zoom={17}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {equipment.map((item) => (
            <Marker
              key={item.Id}
              position={item.coordinates}
              icon={createCustomIcon(item.status)}
              eventHandlers={{
                click: () => setSelectedEquipment(item)
              }}
            >
              <Popup className="equipment-popup">
                <div className="p-2 min-w-64">
                  <div className="flex items-center space-x-2 mb-3">
                    <ApperIcon 
                      name={getEquipmentIcon(item.type)} 
                      className="w-5 h-5 text-gray-600" 
                    />
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <StatusIndicator status={item.status} showIcon={false} />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{item.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temperature:</span>
                      <span className={cn('font-medium', getStatusColor(item.status))}>
                        {item.temperature}°C
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dust Level:</span>
                      <span className={cn('font-medium', getDustLevelColor(item.dustLevel))}>
                        {item.dustLevel} μg/m³
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vibration:</span>
                      <span className="font-medium text-gray-900">{item.vibration} Hz</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Efficiency:</span>
                      <span className="font-medium text-gray-900">{item.efficiency}%</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="text-xs text-gray-500">
                        Last updated: {new Date(item.lastSensorUpdate).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="mt-4 text-xs text-gray-500 flex items-center justify-between">
        <span>Click on markers to view detailed sensor data</span>
        <span>Updates every 30 seconds</span>
      </div>
    </Card>
  );
};

export default EquipmentMap;