// import React from 'react';
// import { Line } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

// interface VoiceComparisonProps {
//   userF0Data: number[];
//   announcerF0Data: number[];
// }

// const VoiceComparisonChart: React.FC<VoiceComparisonProps> = ({ userF0Data, announcerF0Data }) => {
//   const labels = Array.from({ length: Math.max(userF0Data.length, announcerF0Data.length) }, (_, i) => i + 1);

//   const data = {
//     labels,
//     datasets: [
//       {
//         label: 'User Voice Pitch (f0)',
//         data: userF0Data,
//         borderColor: 'rgba(75, 192, 192, 1)',
//         backgroundColor: 'rgba(75, 192, 192, 0.2)',
//         borderWidth: 2,
//       },
//       {
//         label: 'Announcer Voice Pitch (f0)',
//         data: announcerF0Data,
//         borderColor: 'rgba(255, 99, 132, 1)',
//         backgroundColor: 'rgba(255, 99, 132, 0.2)',
//         borderWidth: 2,
//       },
//     ],
//   };

//   const options = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'top' as const,
//       },
//       title: {
//         display: true,
//         text: 'User vs Announcer Voice Pitch Comparison',
//       },
//     },
//     scales: {
//       x: {
//         title: {
//           display: true,
//           text: 'Sample Index',
//         },
//       },
//       y: {
//         title: {
//           display: true,
//           text: 'Frequency (Hz)',
//         },
//         min: 0
//       },
//     },
//   };

//   return <Line data={data} options={options} />;
// };

// export default VoiceComparisonChart;

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

  if (!data.length) {
    return <div className="w-full h-[400px] bg-black p-4 text-white flex items-center justify-center">
      No data available
    </div>;
  }

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