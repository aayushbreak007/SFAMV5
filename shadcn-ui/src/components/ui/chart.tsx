import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

type ChartData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
};

interface ChartProps {
  data: ChartData;
}

export function PieChart({ data }: ChartProps) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Pie
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 15,
              },
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              padding: 10,
              cornerRadius: 4,
              boxPadding: 3,
            },
          },
        }}
      />
    </div>
  );
}

export function BarChart({ data }: ChartProps) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Bar
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 15,
              },
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              padding: 10,
              cornerRadius: 4,
              boxPadding: 3,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  );
}