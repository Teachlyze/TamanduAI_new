import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from 'recharts';

export function ResponsiveBarChart({ data = [], xKey, yKey, title }) {
  return (
    <div className="w-full h-[400px]">
      {title ? <h3 className="text-lg font-semibold mb-4">{title}</h3> : null}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={yKey} fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ResponsiveBarChart;
