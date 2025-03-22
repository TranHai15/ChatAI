import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import axiosClient from "../../../../api/axiosClient";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const timeRangeMapping = {
  day: 1,
  threeDays: 3,
  week: 7,
  month: 30,
  sixMonths: 180,
  all: 365
};

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState("day");
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Số câu hỏi",
        data: [],
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.2)",
        tension: 0.4
      }
    ]
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const days = timeRangeMapping[timeRange] || 1;
        const res = await axiosClient.get(`/api/dashboard?days=${days}`);

        // Format dữ liệu từ API
        const labels = res.data.map((item) => item.date);
        const data = res.data.map((item) => item.total_questions);
        const total = data.reduce((sum, value) => sum + value, 0);

        setTotalQuestions(total);
        setChartData({
          labels,
          datasets: [{ ...chartData.datasets[0], data }]
        });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    }

    fetchData();
  }, [timeRange]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Bộ lọc thời gian */}
      <div className="flex justify-end mb-6">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="p-3 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="day">Trong ngày</option>
          <option value="threeDays">3 ngày qua</option>
          <option value="week">1 tuần qua</option>
          <option value="month">Trong tháng</option>
          <option value="sixMonths">6 tháng qua</option>
          <option value="all">1 năm qua</option>
        </select>
      </div>

      {/* Tổng số câu hỏi */}
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold mb-2">Tổng số câu hỏi</h2>
        <p className="text-3xl font-bold">{totalQuestions}</p>
      </div>

      {/* Biểu đồ */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4">Biểu đồ câu hỏi</h2>
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" },
              title: { display: true, text: "Số lượng câu hỏi theo thời gian" }
            }
          }}
        />
      </div>
    </div>
  );
};

export default Dashboard;
