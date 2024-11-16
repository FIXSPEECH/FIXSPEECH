import React from 'react';
import { Line } from 'recharts';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Data {
  userF0Data: number[];
  announcerF0Data: number[];
}

const VoiceComparisonChart = ({ userF0Data, announcerF0Data }: Data) => {
  // Ensure we have arrays to work with
  const userValues = React.useMemo(() => {
    if (!userF0Data) return [];
    return typeof userF0Data === 'string' ? JSON.parse(userF0Data) : userF0Data;
  }, [userF0Data]);

  const announcerValues = React.useMemo(() => {
    if (!announcerF0Data) return [];
    return typeof announcerF0Data === 'string' ? JSON.parse(announcerF0Data) : announcerF0Data;
  }, [announcerF0Data]);

   // Calculate min and max values for dynamic Y-axis domain
   const yMin = Math.min(...userValues, ...announcerValues, 0); // 최소값은 데이터의 최소값 또는 0
   const yMax = Math.max(...userValues, ...announcerValues,200); // 최대값은 데이터의 최대값 또는 200

  // Create data array for the chart
  const data = React.useMemo(() => {
    const maxLength = Math.max(userValues.length, announcerValues.length);
    return Array.from({ length: maxLength }, (_, index) => ({
      index: index + 1,
      user: userValues[index] || 0,
      announcer: announcerValues[index] || 0,
    }));
  }, [userValues, announcerValues]);

  return (
    <div className="w-full h-[400px] bg-black p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis 
            dataKey="index" 
            stroke="#666"
            tickLine={{ stroke: '#666' }}
            label={{ value: '샘플링 단위', position: 'insideBottom', offset: -10, fill: '#666' }} // X축 레이블 추가
          />
          <YAxis 
            stroke="#666"
            tickLine={{ stroke: '#666' }}
            domain={[yMin, yMax]}
            // ticks={[ 0, 50, 100, 150, 200, 250, 300, 350]}
            tickFormatter={(value: any) => Math.abs(value).toString()}
            label={{ value: '기본 주파수 [HZ]', angle: -90, position: 'insideLeft', fill: '#666' }} // Y축 레이블 추가
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }}
            labelStyle={{ color: '#fff' }}
            formatter={(value: any, name: any) => [value, name]}
          />
          {/* 범례 추가 */}
           <Legend 
            verticalAlign="top" 
            wrapperStyle={{ color: '#fff' }} 
          />
          
          {/* Announcer's line */}
          <Line
            type="monotone"
            dataKey="announcer"
            stroke="#ff69b4"
            strokeWidth={2}
            dot={false}
            name="Announcer"
          />
          
          {/* User's line (on the same axis as announcer) */}
          <Line
            type="monotone"
            dataKey="user"
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
