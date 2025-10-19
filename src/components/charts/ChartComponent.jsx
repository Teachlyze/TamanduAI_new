import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  LineChart,
  PieChart,
  AreaChart,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  Area,
  Pie,
  Cell,
} from 'recharts';

/**
 * Generic chart component that supports multiple chart types
 * @param {Object} props
 * @param {Array} props.data - Chart data
 * @param {string} props.type - Chart type: 'bar', 'line', 'pie', 'area', 'composed'
 * @param {string} props.title - Chart title
 * @param {number} props.height - Chart height in pixels
 * @param {Array} props.colors - Array of colors for the chart
 * @param {Object} props.config - Chart configuration options
 */
export const ChartComponent = ({
  data = [],
  type = 'bar',
  title,
  height = 400,
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
  config = {},
  ...props
}) => {
  const renderChart = () => {
    const commonProps = {
      data,
      margin: config.margin || { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xKey || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            {config.dataKeys?.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
              />
            )) || <Line type="monotone" dataKey={config.yKey || 'value'} stroke={colors[0]} strokeWidth={2} />}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xKey || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            {config.dataKeys?.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.6}
              />
            )) || <Area type="monotone" dataKey={config.yKey || 'value'} stroke={colors[0]} fill={colors[0]} fillOpacity={0.6} />}
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={config.showLabels ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : false}
              outerRadius={80}
              fill="#8884d8"
              dataKey={config.dataKey || 'value'}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            {config.showLegend !== false && <Legend />}
          </PieChart>
        );

      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xKey || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            {config.bars?.map((barConfig, index) => (
              <Bar key={barConfig.key} dataKey={barConfig.key} fill={colors[index % colors.length]} />
            )) || <Bar dataKey={config.yKey || 'value'} fill={colors[0]} />}
            {config.lines?.map((lineConfig, index) => (
              <Line key={lineConfig.key} type="monotone" dataKey={lineConfig.key} stroke={colors[index % colors.length]} strokeWidth={2} />
            ))}
          </ComposedChart>
        );

      default: // bar chart
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xKey || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            {config.dataKeys?.map((key, index) => (
              <Bar key={key} dataKey={key} fill={colors[index % colors.length]} />
            )) || <Bar dataKey={config.yKey || 'value'} fill={colors[0]} />}
          </BarChart>
        );
    }
  };

  return (
    <div className="w-full" style={{ height: `${height}px` }} {...props}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartComponent;
