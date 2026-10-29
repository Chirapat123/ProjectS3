import { useEffect, useState } from "react";
import { Circle, Marker, Popup, CircleMarker } from "react-leaflet";

const Simulation = ({
  speed,
  reset,
  reduceInfection,
  limitMovement,
  closeRiskArea,
  selectedProvince,
}) => {
  const [hospital, setHospital] = useState([]);
  const history = [];
  let stime = 0;
  let moveSpeed = speed * 0.5;

  if (limitMovement) {
    moveSpeed = speed * 0.3;
  }

  const riskArea = {
    lat: Number(selectedProvince?.latitude) || 13.7278956,
    lon: Number(selectedProvince?.longitude) || 100.5241235,
    radius: 1000,
  };

  const getRandomPoint = (lat, lon, radius) => {
    lat = Number(lat);
    lon = Number(lon);

    radius = radius / 111320;

    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.sqrt(Math.random()) * radius;

    const Lat = lat + distance * Math.cos(angle);
    const Lon =
      lon + (distance * Math.sin(angle)) / Math.cos((lat * Math.PI) / 180);

    return { Lat, Lon };
  };

  const getDistance = (x1, x2, y1, y2) => {
    const sx = x2 - x1;
    const sy = y2 - y1;
    const s = Math.sqrt(sx * sx + sy * sy);

    return s;
  };

  const getRoute = async (startLat, startLon, endLat, endLon) => {
    try {
      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${startLon},${startLat};${endLon},${endLat}` +
        `?overview=full&geometries=geojson`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== "Ok") {
        return [];
      }

      return data.routes[0].geometry.coordinates;
    } catch (error) {
      console.error("Route error:", error);
      return [];
    }
  };

  const pcolor = [];
  for (let i = 0; i <= 20; i++) {
    if (i <= 5) {
      pcolor[i] = "Red";
    } else {
      pcolor[i] = "Blue";
    }
  }

  useEffect(() => {
    if (!selectedProvince) return;

    setHospital([]);

    fetch("/hospital.json")
      .then((response) => response.json())
      .then((data) => {
        const provinceHospital = data.elements.filter(
          (h) =>
            h.lat &&
            h.lon &&
            getDistance(
              h.lat,
              selectedProvince.latitude,
              h.lon,
              selectedProvince.longitude,
            ) <= 0.045,
        );

        setHospital(provinceHospital);
      });
  }, [selectedProvince]);

  const [points, setPoints] = useState([]);

  useEffect(() => {
    if (!selectedProvince) return;

    const Point = [];

    for (let i = 0; i < 20; i++) {
      const p = getRandomPoint(
        selectedProvince.latitude,
        selectedProvince.longitude,
        5000,
      );

      let s;

      if (i < 5) {
        s = "red";
      } else {
        s = "blue";
      }

      Point.push({
        Lat: p.Lat,
        Lon: p.Lon,
        hospital: null,
        status: s,
        firstLat: p.Lat,
        firstLon: p.Lon,
        Times: 0,
        firstStatus: s,
        route: [],
        routeIndex: 0,
      });
    }

    setPoints(Point);
  }, [selectedProvince]);

  useEffect(() => {
    if (hospital.length === 0) return;

    const interval = setInterval(() => {
      setPoints((prevPoints) => {

        stime = stime + 100;

        const newPoints = prevPoints.map((p) => {

          if (p.hospital === null) {
            const randomHospital =
              hospital[Math.floor(Math.random() * hospital.length)];

            getRoute(p.Lat, p.Lon, randomHospital.lat, randomHospital.lon).then(
              (route) => {
                setPoints((currentPoints) => {
                  return currentPoints.map((person) => {
                    if (
                      person.firstLat === p.firstLat &&
                      person.firstLon === p.firstLon
                    ) {
                      return {
                        Lat: person.Lat,
                        Lon: person.Lon,
                        hospital: randomHospital,
                        status: person.status,
                        firstLat: person.firstLat,
                        firstLon: person.firstLon,
                        Times: person.Times,
                        firstStatus: person.firstStatus,
                        route: route,
                        routeIndex: 0,
                      };
                    }

                    return {
                      Lat: person.Lat,
                      Lon: person.Lon,
                      hospital: person.hospital,
                      status: person.status,
                      firstLat: person.firstLat,
                      firstLon: person.firstLon,
                      Times: person.Times,
                      firstStatus: person.firstStatus,
                      route: person.route,
                      routeIndex: person.routeIndex,
                    };
                  });
                });
              },
            );

            return {
              Lat: p.Lat,
              Lon: p.Lon,
              hospital: randomHospital,
              status: p.status,
              firstLat: p.firstLat,
              firstLon: p.firstLon,
              Times: p.Times,
              firstStatus: p.firstStatus,
              route: [],
              routeIndex: 0,
            };
          }

          if (!p.hospital.lat || !p.hospital.lon) {
            return {
              Lat: p.Lat,
              Lon: p.Lon,
              hospital: null,
              status: p.status,
              firstLat: p.firstLat,
              firstLon: p.firstLon,
              Times: p.Times,
              firstStatus: p.firstStatus,
            };
          }

          let x;
          let y;

          if (p.status === "yellow") {
            x = p.firstLat - p.Lat;
            y = p.firstLon - p.Lon;
          } else {
            x = p.hospital.lat - p.Lat;
            y = p.hospital.lon - p.Lon;
          }

          if (p.status === "green") {
            p.Times = p.Times + 100;
            const r = Math.random();
            if (r < 0.9 && p.Times > 3000) {
              p.status = "blue";
              p.Times = 0;
            }
          }

          const distance = Math.sqrt(x * x + y * y);

          if (
            (p.status === "yellow" || p.status === "red") &&
            distance < moveSpeed
          ) {
            if (p.status === "yellow") {
              p.Times = p.Times + 100;
              const r = Math.random();
              if (r < 0.7 && p.Times > 100000) {
                p.status = "green";
                p.Times = 0;
              } else if (p.Times > 5000) {
                p.status = "red";
                p.Times = 0;
              }
            }

            if (p.status === "red") {
              p.Times = p.Times + 100;
              const r = Math.random();
              if (r < 0.9 && p.Times > 5000) {
                p.status = "green";
                p.Times = 0;
              }
            }
          }

          if (distance < moveSpeed) {
            if (p.status === "red") {
              return {
                Lat: p.Lat,
                Lon: p.Lon,
                hospital: p.hospital,
                status: p.status,
                firstLat: p.firstLat,
                firstLon: p.firstLon,
                Times: p.Times,
                firstStatus: p.firstStatus,
              };
            }
            if (p.status === "yellow") {
              return {
                Lat: p.Lat,
                Lon: p.Lon,
                hospital: null,
                status: p.status,
                firstLat: p.firstLat,
                firstLon: p.firstLon,
                Times: p.Times,
                firstStatus: p.firstStatus,
              };
            }
            return {
              Lat: p.Lat,
              Lon: p.Lon,
              hospital: null,
              status: p.status,
              firstLat: p.firstLat,
              firstLon: p.firstLon,
              Times: p.Times,
              firstStatus: p.firstStatus,
            };
          }

          const riskDistance =
            getDistance(p.Lat, riskArea.lat, p.Lon, riskArea.lon) * 111320;

          if (closeRiskArea && riskDistance < riskArea.radius) {
            return {
              Lat: p.Lat,
              Lon: p.Lon,
              hospital: p.hospital,
              status: p.status,
              firstLat: p.firstLat,
              firstLon: p.firstLon,
              Times: p.Times,
              firstStatus: p.firstStatus,
            };
          }

          let newLat = p.Lat;
          let newLon = p.Lon;

          if (p.status !== "yellow" && p.route && p.route.length > 0) {
            let targetLon = p.route[p.routeIndex][0];
            let targetLat = p.route[p.routeIndex][1];

            let routeX = targetLat - p.Lat;
            let routeY = targetLon - p.Lon;

            let routeDistance = Math.sqrt(routeX * routeX + routeY * routeY);

            if (routeDistance < moveSpeed) {
              if (p.routeIndex < p.route.length - 1) {
                p.routeIndex = p.routeIndex + 1;

                targetLon = p.route[p.routeIndex][0];
                targetLat = p.route[p.routeIndex][1];

                routeX = targetLat - p.Lat;
                routeY = targetLon - p.Lon;

                routeDistance = Math.sqrt(routeX * routeX + routeY * routeY);
              }
            }

            if (routeDistance > 0) {
              newLat = p.Lat + (routeX / routeDistance) * moveSpeed;

              newLon = p.Lon + (routeY / routeDistance) * moveSpeed;
            }
          } else {
            newLat = p.Lat + (x / distance) * moveSpeed;
            newLon = p.Lon + (y / distance) * moveSpeed;
          }

          if (reset === true) {
            stime = 0;
            return {
              Lat: p.firstLat,
              Lon: p.firstLon,
              hospital: null,
              status: p.firstStatus,
              firstLat: p.firstLat,
              firstLon: p.firstLon,
              Times: 0,
              firstStatus: p.firstStatus,
            };
          }

          return {
            Lat: newLat,
            Lon: newLon,
            hospital: p.hospital,
            status: p.status,
            firstLat: p.firstLat,
            firstLon: p.firstLon,
            Times: p.Times,
            firstStatus: p.firstStatus,
            route: p.route,
            routeIndex: p.routeIndex,
          };
        });

        for (let i = 0; i < newPoints.length; i++) {
          for (let j = i + 1; j < newPoints.length; j++) {

            const d = getDistance(
              newPoints[i].Lat,
              newPoints[j].Lat,
              newPoints[i].Lon,
              newPoints[j].Lon,
            );

            if (111320 * d < 50 && newPoints[i].status === "red") {
              if (newPoints[j].status === "blue") {
                let infectionRate = 0.8;

                if (reduceInfection) {
                  infectionRate = 0.3;
                }
                let r = Math.random();

                if (reduceInfection) {
                  r = r * 0.3;
                }
                if (r < 0.2) {
                  newPoints[j].status = "blue";
                } else if (r < 0.9) {
                  newPoints[j].status = "yellow";
                } else {
                  newPoints[j].status = "red";
                }
              }
            }

            if (111320 * d < 50 && newPoints[j].status === "red") {
              if (newPoints[i].status === "blue") {
                let infectionRate = 0.8;

                if (reduceInfection) {
                  infectionRate = 0.3;
                }
                let r = Math.random();

                if (reduceInfection) {
                  r = r * 0.3;
                }
                if (r < 0.2) {
                  newPoints[i].status = "blue";
                } else if (r < 0.9) {
                  newPoints[i].status = "yellow";
                } else {
                  newPoints[i].status = "red";
                }
              }
            }
          }
        }

        const blue = newPoints.filter((p) => p.status === "blue").length;
        const yellow = newPoints.filter((p) => p.status === "yellow").length;
        const red = newPoints.filter((p) => p.status === "red").length;
        const green = newPoints.filter((p) => p.status === "green").length;

        history.push({
          time: stime,
          blue: blue,
          yellow: yellow,
          red: red,
          green: green,
        });

        if (stime % 10000 === 0) {
          fetch("http://localhost:3000/api/insert", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              time: stime,
              blue,
              yellow,
              red,
              green,
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log("History saved:", data);
            })
            .catch((error) => {
              console.error("Error saving history:", error);
            });
        }

        return newPoints;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [
    hospital,
    speed,
    reset,
    reduceInfection,
    limitMovement,
    closeRiskArea,
    selectedProvince,
  ]);

  return (
    <>
      {selectedProvince && (
        <Marker
          position={[selectedProvince.latitude, selectedProvince.longitude]}
        >
          <Popup>{selectedProvince.province_name}</Popup>

          <Circle
            center={[selectedProvince.latitude, selectedProvince.longitude]}
            radius={5000}
            color="red"
          />
        </Marker>
      )}

      {hospital.map((h) => (
        <Marker key={h.id} position={{ lat: h.lat, lon: h.lon }}>
          <Popup>{h.tags?.name}</Popup>
        </Marker>
      ))}

      {points.map((p, i) => (
        <CircleMarker
          key={i}
          center={[p.Lat, p.Lon]}
          radius={2}
          pathOptions={{ color: p.status }}
        />
      ))}

      {closeRiskArea && (
        <Circle
          center={[riskArea.lat, riskArea.lon]}
          radius={riskArea.radius}
          color="red"
          fillOpacity={0.2}
        />
      )}
    </>
  );
};
export default Simulation;
