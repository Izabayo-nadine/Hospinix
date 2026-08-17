import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title
);

interface PieChartProps {
  data: {
    labels: string[];
    values: number[];
  };
  title: string;
}

const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',  // Indigo
          'rgba(16, 185, 129, 0.8)', // Emerald
          'rgba(245, 158, 11, 0.8)', // Amber
          'rgba(239, 68, 68, 0.8)',  // Red
          'rgba(59, 130, 246, 0.8)', // Blue
          'rgba(139, 92, 246, 0.8)', // Violet
        ],
        borderColor: [
          'rgba(255, 255, 255, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 4
      },

    ],
  };

  const options = {
    responsive: true,
    cutout: '60%', // Makes it a doughnut
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        padding: 12,
        cornerRadius: 8,
        displayColors: true
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow h-80 flex items-center justify-center">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default PieChart;