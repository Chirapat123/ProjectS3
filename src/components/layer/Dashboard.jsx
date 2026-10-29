import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import "./Dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState([]);


  useEffect(() => {
    const getHistory = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/history");

        const result = await res.json();

        if (!Array.isArray(result)) {
          setData([]);
          return;
        }

        const cleanData = result.map((item) => ({
          ...item,
          time: Number(item.time),
          blue: Number(item.blue),
          yellow: Number(item.yellow),
          red: Number(item.red),
          green: Number(item.green),
        }));

        setData(cleanData);
      } catch (err) {
        console.error("Error loading history:", err);
      }
    };

    
    getHistory();


    const interval = setInterval(() => {
      getHistory();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  
  const getLatestSimulation = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      return [];
    }

    let startIndex = rows.length - 1;

    while (startIndex > 0) {

      if (rows[startIndex].time === 0) break;


      if (rows[startIndex - 1].time >= rows[startIndex].time) break;

      startIndex--;
    }

    return rows.slice(startIndex);
  };

  const latestSimulation = getLatestSimulation(data);

  const latest =
    latestSimulation.length > 0
      ? latestSimulation[latestSimulation.length - 1]
      : {
          time: 0,
          blue: 0,
          yellow: 0,
          red: 0,
          green: 0,
        };

  const total = latest.blue + latest.yellow + latest.red + latest.green;

  const averageData = latestSimulation;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>ระบบติดตามและจำลองการแพร่ระบาดของโรค</p>
        </div>

        <div className="simulation-time">
          <span>เวลาจำลอง</span>

          <strong>{latest.time / 10000} ชม.</strong>
        </div>
      </div>

      <div className="summary-container">
        <div className="summary-card total">
          <div className="card-title">ประชากรทั้งหมด</div>

          <div className="card-value">{total}</div>

          <div className="card-description">คน</div>
        </div>

        <div className="summary-card blue">
          <div className="card-title">ปกติ</div>

          <div className="card-value">{latest.blue}</div>

          <div className="card-description">คน</div>
        </div>

        <div className="summary-card yellow">
          <div className="card-title">ติดเชื้อ อาการเบา</div>

          <div className="card-value">{latest.yellow}</div>

          <div className="card-description">คน</div>
        </div>

        <div className="summary-card red">
          <div className="card-title">ติดเชื้อ อาการหนัก</div>

          <div className="card-value">{latest.red}</div>

          <div className="card-description">คน</div>
        </div>

        <div className="summary-card green">
          <div className="card-title">หายแล้ว</div>

          <div className="card-value">{latest.green}</div>

          <div className="card-description">คน</div>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h2>กราฟการระบาด</h2>

            <p>แสดงข้อมูลการจำลองล่าสุด</p>
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={averageData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="time"
                tickFormatter={(value) => `${value / 10000} ชม.`}
              />

              <YAxis />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="blue"
                name="ปกติ"
                stroke="blue"
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="yellow"
                name="ติดเชื้อ อาการเบา"
                stroke="gold"
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="red"
                name="ติดเชื้อ อาการหนัก"
                stroke="red"
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="green"
                name="หายแล้ว"
                stroke="green"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
