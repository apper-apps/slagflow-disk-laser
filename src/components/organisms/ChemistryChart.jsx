import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import Card from '@/components/atoms/Card';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import ApperIcon from '@/components/ApperIcon';
import loadService from '@/services/api/loadService';

const ChemistryChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLoad, setSelectedLoad] = useState(null);

  useEffect(() => {
    const fetchChemistryData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await loadService.getChemistryData(5);
        const tolerance = loadService.getChemistryTolerance();
        
        // Prepare data for stacked bar chart
        const categories = data.map(load => load.loadNumber);
        const elements = ['iron', 'calcium', 'silicon', 'aluminum', 'magnesium'];
        
        const series = elements.map(element => ({
          name: element.charAt(0).toUpperCase() + element.slice(1),
          data: data.map(load => {
            const value = load.chemistry[element];
            const validation = loadService.validateChemistry(load.chemistry);
            const status = validation[element]?.status || 'within';
            
            return {
              x: load.loadNumber,
              y: value,
              status: status,
              target: tolerance[element].target,
              range: tolerance[element],
              loadId: load.Id,
              source: load.source
            };
          })
        }));
        
        setChartData({
          series,
          categories,
          tolerance,
          loads: data
        });
        
      } catch (err) {
        setError('Failed to load chemistry data');
      } finally {
        setLoading(false);
      }
    };

    fetchChemistryData();
  }, []);

  const chartOptions = {
    chart: {
      type: 'bar',
      height: 400,
      stacked: true,
      stackType: '100%',
      background: 'transparent',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 2,
        columnWidth: '70%'
      }
    },
    colors: ['#1e3a5f', '#4a6fa5', '#3498db', '#f39c12', '#27ae60'],
    dataLabels: {
      enabled: false
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif'
    },
    xaxis: {
      categories: chartData?.categories || [],
      labels: {
        style: {
          fontSize: '11px',
          fontFamily: 'Inter, sans-serif'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Composition (%)',
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif'
        }
      },
      labels: {
        style: {
          fontSize: '11px',
          fontFamily: 'Inter, sans-serif'
        }
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function(val, { dataPointIndex, seriesIndex }) {
          const element = chartData?.series[seriesIndex]?.name?.toLowerCase();
          const dataPoint = chartData?.series[seriesIndex]?.data[dataPointIndex];
          
          if (dataPoint && element) {
            const tolerance = chartData.tolerance[element];
            const status = dataPoint.status;
            const statusColor = status === 'within' ? '#27ae60' : 
                              status === 'low' ? '#f39c12' : '#e74c3c';
            
            return `
              <div style="padding: 4px 0;">
                <strong>${val.toFixed(1)}%</strong><br/>
                <span style="color: ${statusColor}; font-weight: 600;">
                  ${status === 'within' ? '✓ Within Tolerance' : 
                    status === 'low' ? '⚠ Below Target' : '⚠ Above Target'}
                </span><br/>
                <small>Target: ${tolerance.target}% (${tolerance.min}-${tolerance.max}%)</small>
              </div>
            `;
          }
          return val.toFixed(1) + '%';
        }
      }
    },
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 3
    },
    theme: {
      mode: 'light'
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <Error 
          message={error} 
          onRetry={() => window.location.reload()} 
        />
      </Card>
    );
  }

  const getOverallQualityStatus = () => {
    if (!chartData) return { status: 'unknown', count: 0 };
    
    let withinTolerance = 0;
    let totalChecks = 0;
    
    chartData.loads.forEach(load => {
      const validation = loadService.validateChemistry(load.chemistry);
      Object.values(validation).forEach(result => {
        totalChecks++;
        if (result.status === 'within') withinTolerance++;
      });
    });
    
    const percentage = (withinTolerance / totalChecks) * 100;
    
    return {
      status: percentage >= 90 ? 'excellent' : percentage >= 75 ? 'good' : 'needs-attention',
      percentage: percentage.toFixed(1),
      withinTolerance,
      totalChecks
    };
  };

  const qualityStatus = getOverallQualityStatus();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Material Chemistry Composition
          </h3>
          <p className="text-sm text-gray-600">
            Real-time composition analysis with tolerance bands
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-600">Quality Status</div>
            <div className={`text-lg font-semibold flex items-center ${
              qualityStatus.status === 'excellent' ? 'text-success' :
              qualityStatus.status === 'good' ? 'text-warning' : 'text-error'
            }`}>
              <ApperIcon 
                name={qualityStatus.status === 'excellent' ? 'CheckCircle' : 
                      qualityStatus.status === 'good' ? 'AlertCircle' : 'XCircle'} 
                size={20} 
                className="mr-2"
              />
              {qualityStatus.percentage}%
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          {Object.entries(chartData?.tolerance || {}).map(([element, range]) => (
            <div key={element} className="bg-gray-50 p-3 rounded-lg">
              <div className="font-medium text-gray-900 capitalize mb-1">
                {element}
              </div>
              <div className="text-xs text-gray-600">
                Target: {range.target}%
              </div>
              <div className="text-xs text-gray-500">
                Range: {range.min}-{range.max}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-container">
        <Chart
          options={chartOptions}
          series={chartData?.series || []}
          type="bar"
          height={400}
        />
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center text-sm text-blue-800">
          <ApperIcon name="Info" size={16} className="mr-2" />
          <span>
            Chart shows composition percentages with tolerance monitoring. 
            Colors indicate different chemical elements, hover for detailed tolerance status.
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ChemistryChart;