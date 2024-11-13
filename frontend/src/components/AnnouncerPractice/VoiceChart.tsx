import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface VoiceComparisonProps {
  userF0Data: number[];
  announcerF0Data: number[];
}

const VoiceComparisonChart: React.FC<VoiceComparisonProps> = ({ userF0Data, announcerF0Data }) => {
  const labels = Array.from({ length: Math.max(userF0Data.length, announcerF0Data.length) }, (_, i) => i + 1);

  const data = {
    labels,
    datasets: [
      {
        label: 'User Voice Pitch (f0)',
        data: userF0Data,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
      },
      {
        label: 'Announcer Voice Pitch (f0)',
        data: announcerF0Data,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'User vs Announcer Voice Pitch Comparison',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Sample Index',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Frequency (Hz)',
        },
        min: 0,
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default VoiceComparisonChart;
