import React, { useEffect, useRef, useState } from "react";
import { useIntersectionObserver } from "../observationin";// Adjust path as needed
import "./canvasss.css";

interface Position {
  latitude: number;
  longitude: number;
  timestamp: number;
  speed: number;
}

const toRadians = (deg: number) => (deg * Math.PI) / 180;

const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // meters
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
};

const ActivityCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [speed, setSpeed] = useState(0);

  const MIN_DISTANCE_THRESHOLD = 10; // meters
  const MAX_REALISTIC_SPEED = 15; // m/s (~54 km/h)
  const MIN_REALISTIC_SPEED = 0.3; // m/s (~1 km/h)
  const AVG_STEP_LENGTH = 0.78; // meters

  const { ref: observerRef, isVisible } = useIntersectionObserver(0.8);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos: Position = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          timestamp: pos.timestamp,
          speed: pos.coords.speed ?? 0,
        };

        setPositions((prev) => {
          if (prev.length === 0) return [newPos];

          const prevPos = prev[prev.length - 1];
          const dist = haversineDistance(
            prevPos.latitude,
            prevPos.longitude,
            newPos.latitude,
            newPos.longitude
          );

          const timeDiff = (newPos.timestamp - prevPos.timestamp) / 1000;
          const speedCalc = dist / timeDiff;

          if (
            dist >= MIN_DISTANCE_THRESHOLD &&
            speedCalc < MAX_REALISTIC_SPEED &&
            speedCalc > MIN_REALISTIC_SPEED
          ) {
            setTotalDistance((d) => d + dist);
            setSpeed(speedCalc);
            return [...prev, newPos];
          }

          return prev;
        });
      },
      (err) => console.error("Geolocation error:", err),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 1000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || positions.length < 1) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const lats = positions.map((p) => p.latitude);
    const lons = positions.map((p) => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const latRange = maxLat - minLat || 0.0001;
    const lonRange = maxLon - minLon || 0.0001;

    const padding = 20;
    const scaleX = (canvas.width - 2 * padding) / lonRange;
    const scaleY = (canvas.height - 2 * padding) / latRange;

    const scale = Math.min(scaleX, scaleY);

    if (positions.length > 1) {
      ctx.strokeStyle = "#1976d2";
      ctx.lineWidth = 2;
      ctx.beginPath();

      positions.forEach((p, i) => {
        const x = (p.longitude - minLon) * scale + padding;
        const y = canvas.height - ((p.latitude - minLat) * scale + padding);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.stroke();
    }

    const start = positions[0];
    const startX = (start.longitude - minLon) * scale + padding;
    const startY = canvas.height - ((start.latitude - minLat) * scale + padding);

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(startX, startY, 6, 0, 2 * Math.PI);
    ctx.fill();
  }, [positions]);

  const steps = totalDistance / AVG_STEP_LENGTH;

  return (
    <div
      ref={observerRef}
      className={`activity-wrapper blackout ${isVisible ? "visible" : ""}`}
    >
      <h2>🏃‍♂️ Live Activity Tracker</h2>
      <canvas ref={canvasRef} width={400} height={300} />
      <div className="activity-stats">
        <p>
          <strong>Speed:</strong> {speed.toFixed(2)} m/s
        </p>
        <p>
          <strong>Distance:</strong> {totalDistance.toFixed(2)} meters
        </p>
        <p>
          <strong>Steps (est.):</strong> {Math.floor(steps)}
        </p>
      </div>
    </div>
  );
};

export default ActivityCanvas;
