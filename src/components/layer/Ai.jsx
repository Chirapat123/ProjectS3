import { useState } from "react";

const AI = () => {
    const [analysis, setAnalysis] = useState("");
    const [error, setError] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    const getAnalysis = async () => {
        if (loading) return; 

        setLoading(true);
        setError("");
        setNote("");

        try {
            const res = await fetch("http://localhost:3000/api/ai-analysis");
            const data = await res.json();

            if (!res.ok) {
                
                setError(data.error || "ไม่สามารถวิเคราะห์ข้อมูลได้");
                return;
            }

            setAnalysis(data.analysis);

            if (data.stale) {
                setNote("โควต้า AI หมดชั่วคราว กำลังแสดงผลวิเคราะห์ครั้งก่อน");
            } else if (data.cached) {
                setNote("ข้อมูลยังไม่เปลี่ยน กำลังแสดงผลวิเคราะห์ล่าสุด");
            }
        } catch (err) {
            console.error("AI Error:", err);
            setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
        } finally {
            setLoading(false);
        }
    };

    const formatAnalysis = () => {
        if (!analysis) return null;

        return analysis.split("\n").map((line, index) =>
            line.trim() === "" ? (
                <br key={index} />
            ) : (
                <p key={index}>{line}</p>
            )
        );
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1> AI วิเคราะห์การระบาด</h1>

            <button onClick={getAnalysis} disabled={loading}>
                {loading ? "กำลังวิเคราะห์..." : "วิเคราะห์ข้อมูล"}
            </button>

            {error && (
                <p style={{ color: "crimson", marginTop: "16px" }}>{error}</p>
            )}

            {analysis && (
                <div
                    style={{
                        marginTop: "20px",
                        padding: "20px",
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                        maxWidth: "800px",
                    }}
                >
                    <h2>ผลการวิเคราะห์</h2>

                    {note && (
                        <p style={{ color: "#888", fontSize: "14px" }}>{note}</p>
                    )}

                    <div>{formatAnalysis()}</div>
                </div>
            )}
        </div>
    );
};

export default AI;