const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  "AQ.Ab8RN6K1BESMMW7Q_oJ9HPKly38dQogjYE3wvLptBjF-YXSTdA",
);

const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "2359",
  database: "simulation",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connection to Mysql", err);
  }
  console.error("connection to Mysql Successfully");
});

app.post("/api/insert", (req, res) => {
  const { time, blue, yellow, red, green } = req.body || {};

  const query =
    "INSERT INTO simulation_history(time, blue, yellow, red, green) VALUES(?, ?, ?, ?, ?)";
  connection.query(query, [time, blue, yellow, red, green], (err, results) => {
    if (err) {
      console.error("Error inserting data: ", err);
      res.status(500).json({ error: err.message });
    }

    res.json({
      msg: "Data inserted successfully",
      insertedId: results.insertId,
    });
  });
});



app.listen(port, () => {
  console.log(`Server is running on port : ${port}`);
});

app.get("/api/history/latest", (req, res) => {
  const query = `
        SELECT time, blue, yellow, red, green
        FROM simulation_history
        ORDER BY id DESC
        LIMIT 1
    `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error getting history: ", err);
      return res.status(500).json({
        error: err.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "ไม่มีข้อมูล",
      });
    }

    res.json(results[0]);
  });
});

app.get("/api/history", (req, res) => {
  const query = `
        SELECT time, blue, yellow, red, green
        FROM simulation_history
        ORDER BY id ASC
    `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error getting history: ", err);
      return res.status(500).json({
        error: err.message,
      });
    }

    res.json(results);
  });
});

app.get("/api/ai-analysis", async (req, res) => {
  const query = `
        SELECT time, blue, yellow, red, green
        FROM simulation_history
        ORDER BY time ASC
    `;

  connection.query(query, async (err, results) => {
    if (err) {
      console.error("Error getting data:", err);

      return res.status(500).json({
        error: err.message,
      });
    }

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-3.8-flash",
      });

      const prompt = `
คุณเป็น AI วิเคราะห์การระบาดของโรค

ข้อมูลจากระบบจำลอง:
${JSON.stringify(results)}

ช่วยวิเคราะห์ข้อมูลเป็นภาษาไทย โดยบอก:

1. สถานการณ์การระบาด
2. แนวโน้มผู้ติดเชื้อ
3. แนวโน้มผู้ติดเชื้ออาการหนัก
4. แนวโน้มผู้หายแล้ว
5. คำแนะนำในการควบคุมการระบาด

ตอบให้เข้าใจง่ายและไม่ยาวเกินไป
`;

      const result = await model.generateContent(prompt);

      const response = result.response;

      res.json({
        analysis: response.text(),
      });
    } catch (error) {
      console.error("Gemini Error:", error);

      res.status(500).json({
        error: error.message,
      });
    }
  });
});

app.get("/api/province", (req, res) => {
  const query = "SELECT * FROM province";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error getting province:", err);
      return res.status(500).json({
        error: err.message,
      });
    }

    res.json(results);
  });
});
