import { MapContainer, TileLayer, useMap, Popup, Marker } from "react-leaflet";
import { useState, useEffect } from "react";
import Simulation from "./layer/Simulation";

export function Map() {
  const [speed, setSpeed] = useState(0);
  const [reduceInfection, setReduceInfection] = useState(false);
  const [limitMovement, setLimitMovement] = useState(false);
  const [closeRiskArea, setCloseRiskArea] = useState(false);

  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/province")
      .then((res) => res.json())
      .then((data) => {
        setProvinces(data);
        setSelectedProvince(data[0]);
      });
  }, []);

  const speedSet = (n) => {
    if (n === 0) {
      setSpeed(0);
    }
    if (n === 1) {
      setSpeed(0.00025);
    }
    if (n === 2) {
      setSpeed(0.0005);
    }
    if (n === 3) {
      setSpeed(0.001);
    }
  };
  const [reset, setReset] = useState(false);

  const resetSimulation = () => {
    setReset(true);

    setTimeout(() => {
      setReset(false);
    }, 1000);
  };
  return (
    <div className="map-container">
      <select
        value={selectedProvince?.province_id || ""}
        onChange={(e) => {
          const province = provinces.find(
            (p) => p.province_id === Number(e.target.value),
          );

          setSelectedProvince(province);
        }}
      >
        {provinces.map((province) => (
          <option key={province.province_id} value={province.province_id}>
            {province.province_name}
          </option>
        ))}
      </select>

      <button onClick={() => speedSet(0)}>หยุด</button>
      <button onClick={() => speedSet(2)}>เริ่ม</button>
      <button onClick={() => speedSet(1)}>ช้า</button>
      <button onClick={() => speedSet(2)}>ปกติ</button>
      <button onClick={() => speedSet(3)}>เร็ว</button>
      <button onClick={resetSimulation}>Reset</button>
      <label>
        <input
          type="checkbox"
          checked={reduceInfection}
          onChange={() => setReduceInfection(!reduceInfection)}
        />
        ลดโอกาสติดเชื้อ
      </label>
      <label>
        <input
          type="checkbox"
          checked={limitMovement}
          onChange={() => setLimitMovement(!limitMovement)}
        />
        จำกัดการเคลื่อนที่
      </label>
      <label>
        <input
          type="checkbox"
          checked={closeRiskArea}
          onChange={() => setCloseRiskArea(!closeRiskArea)}
        />
        ปิดพื้นที่เสี่ยง
      </label>

      <MapContainer
        style={{ width: "100%", height: "100vh" }}
        center={[
          selectedProvince?.latitude || 13.7278956,
          selectedProvince?.longitude || 100.52412349999997,
        ]}
        zoom={13}
        zoomAnimation={6}
      >
        <Simulation
          speed={speed}
          reset={reset}
          reduceInfection={reduceInfection}
          limitMovement={limitMovement}
          closeRiskArea={closeRiskArea}
          selectedProvince={selectedProvince}
        />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
}
export default Map;
