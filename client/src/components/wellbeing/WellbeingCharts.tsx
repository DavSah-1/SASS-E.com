/**
 * Reusable chart components for Wellbeing data visualization
 */

import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WorkoutTrendsChartProps {
  data: Array<{
    date: string;
    duration: number;
    calories: number;
  }>;
}

export function WorkoutTrendsChart({ data }: WorkoutTrendsChartProps) {
  const chartData = {
    labels: data.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Duration (min)',
        data: data.map(d => d.duration),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        yAxisID: 'y',
        fill: true,
      },
      {
        label: 'Calories Burned',
        data: data.map(d => d.calories),
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        yAxisID: 'y1',
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(203, 213, 225)',
        },
      },
      title: {
        display: true,
        text: 'Workout Trends',
        color: 'rgb(226, 232, 240)',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'rgb(148, 163, 184)',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        ticks: {
          color: 'rgb(147, 51, 234)',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        title: {
          display: true,
          text: 'Duration (min)',
          color: 'rgb(147, 51, 234)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        ticks: {
          color: 'rgb(236, 72, 153)',
        },
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Calories',
          color: 'rgb(236, 72, 153)',
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

interface CalorieTrackingChartProps {
  data: Array<{
    date: string;
    calories: number;
  }>;
  goal?: number;
}

export function CalorieTrackingChart({ data, goal = 2000 }: CalorieTrackingChartProps) {
  const chartData = {
    labels: data.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Calories Consumed',
        data: data.map(d => d.calories),
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ] as any,
  };

  // Add goal line as separate dataset
  chartData.datasets.push({
    label: 'Daily Goal',
    data: data.map(() => goal),
    type: 'line',
    borderColor: 'rgb(239, 68, 68)',
    borderWidth: 2,
    borderDash: [5, 5],
    pointRadius: 0,
    fill: false,
  } as any);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(203, 213, 225)',
        },
      },
      title: {
        display: true,
        text: 'Daily Calorie Intake',
        color: 'rgb(226, 232, 240)',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'rgb(148, 163, 184)',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
      y: {
        ticks: {
          color: 'rgb(148, 163, 184)',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        title: {
          display: true,
          text: 'Calories',
          color: 'rgb(148, 163, 184)',
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

interface MoodPatternsChartProps {
  data: Array<{
    date: string;
    mood: string;
    energy: number;
    stress: number;
  }>;
}

export function MoodPatternsChart({ data }: MoodPatternsChartProps) {
  // Convert mood to numeric scale
  const moodToNumber = (mood: string): number => {
    const map: Record<string, number> = {
      'terrible': 1,
      'bad': 3,
      'okay': 5,
      'good': 7,
      'great': 9,
    };
    return map[mood] || 5;
  };

  const chartData = {
    labels: data.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Mood',
        data: data.map(d => moodToNumber(d.mood)),
        borderColor: 'rgb(251, 191, 36)',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        fill: true,
      },
      {
        label: 'Energy',
        data: data.map(d => d.energy),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
      {
        label: 'Stress',
        data: data.map(d => d.stress),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(203, 213, 225)',
        },
      },
      title: {
        display: true,
        text: 'Mood & Energy Patterns',
        color: 'rgb(226, 232, 240)',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.dataset.label === 'Mood') {
                const moodLabels = ['', 'Terrible', '', 'Bad', '', 'Okay', '', 'Good', '', 'Great'];
                label += moodLabels[context.parsed.y] || context.parsed.y;
              } else {
                label += context.parsed.y + '/10';
              }
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'rgb(148, 163, 184)',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
      y: {
        min: 0,
        max: 10,
        ticks: {
          color: 'rgb(148, 163, 184)',
          stepSize: 2,
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        title: {
          display: true,
          text: 'Scale (1-10)',
          color: 'rgb(148, 163, 184)',
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

interface WeightProgressChartProps {
  data: Array<{
    date: string;
    weight: number; // in kg
  }>;
  goal?: number;
}

export function WeightProgressChart({ data, goal }: WeightProgressChartProps) {
  const chartData = {
    labels: data.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Weight (kg)',
        data: data.map(d => d.weight),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: true,
        tension: 0.4,
      },
      ...(goal ? [{
        label: 'Goal Weight',
        data: data.map(() => goal),
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      }] : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(203, 213, 225)',
        },
      },
      title: {
        display: true,
        text: 'Weight Progress',
        color: 'rgb(226, 232, 240)',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'rgb(148, 163, 184)',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
      y: {
        ticks: {
          color: 'rgb(148, 163, 184)',
          callback: function(value: any) {
            return value + ' kg';
          }
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        title: {
          display: true,
          text: 'Weight (kg)',
          color: 'rgb(148, 163, 184)',
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
