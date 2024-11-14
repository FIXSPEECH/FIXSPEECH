interface Data {
  userF0Data: number[];
  announcerF0Data : number[];
}


import React from 'react';
import { Line } from 'recharts';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const VoiceComparisonChart = ({ userF0Data, announcerF0Data}: Data) => {
  // Ensure we have arrays to work with
  const userValues = React.useMemo(() => {
    if (!userF0Data) return [];
    return typeof userF0Data === 'string' ? JSON.parse(userF0Data) : userF0Data;
  }, [userF0Data]);

  const announcerValues = React.useMemo(() => {
    if (!announcerF0Data) return [];
    return typeof announcerF0Data === 'string' ? JSON.parse(announcerF0Data) : announcerF0Data;
  }, [announcerF0Data]);

  // Create data array for the chart
  const data = React.useMemo(() => {
    const maxLength = Math.max(userValues.length, announcerValues.length);
    return Array.from({ length: maxLength }, (_, index) => ({
      index: index + 1,
      user: userValues[index] || 0,
      announcer: announcerValues[index] || 0,
      // Negate user values for mirroring effect
      userMirrored: -(userValues[index] || 0)
    }));
  }, [userValues, announcerValues]);

  // if (!data.length) {
  //   return <div className="w-full h-[400px] bg-black p-4 text-white flex items-center justify-center">
  //     No data available
  //   </div>;
  // }

  return (
    <div className="w-full h-[400px] bg-black p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis 
            dataKey="index" 
            stroke="#666"
            tickLine={{ stroke: '#666' }}
          />
          <YAxis 
            stroke="#666"
            tickLine={{ stroke: '#666' }}
            domain={[-200, 200]}
            ticks={[-150, -100, -50, 0, 50, 100, 150]}
            tickFormatter={(value: any) => Math.abs(value).toString()}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }}
            labelStyle={{ color: '#fff' }}
            formatter={(value: any, name: any) => {
              if (name === 'userMirrored') {
                return [Math.abs(value), 'User'];
              }
              return [value, name];
            }}
          />
          
          {/* Announcer's line (top) */}
          <Line
            type="monotone"
            dataKey="announcer"
            stroke="#ff69b4"
            strokeWidth={2}
            dot={false}
            name="Announcer"
          />
          
          {/* User's line (bottom, mirrored) */}
          <Line
            type="monotone"
            dataKey="userMirrored"
            stroke="#00bfff"
            strokeWidth={2}
            dot={false}
            name="User"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VoiceComparisonChart;