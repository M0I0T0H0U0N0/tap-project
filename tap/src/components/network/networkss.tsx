import React, { useEffect, useState } from "react";
import { useIntersectionObserver } from "../observationin";// Adjust path as needed
import "./networkss.css";

interface NetworkInfo {
  downlink: number;
  effectiveType: string;
  rtt: number;
  status: string;
}

const NetworkStatus: React.FC = () => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const { ref: observerRef, isVisible } = useIntersectionObserver(0.8);

  useEffect(() => {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    const getStatus = (): NetworkInfo => {
      if (!navigator.onLine) {
        return {
          downlink: 0,
          effectiveType: "Offline",
          rtt: 0,
          status: "❌ You are offline",
        };
      }

      if (connection) {
        return {
          downlink: connection.downlink,
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
          status:
            connection.downlink < 1 || connection.effectiveType.includes("2g")
              ? "⚠️ Poor network connection"
              : "✅ Network looks good",
        };
      }

      return {
        downlink: 0,
        effectiveType: "Unknown",
        rtt: 0,
        status: "❌ Network Information API not supported",
      };
    };

    const handleConnectionChange = () => {
      setNetworkInfo(getStatus());
    };

    setNetworkInfo(getStatus());

    window.addEventListener("online", handleConnectionChange);
    window.addEventListener("offline", handleConnectionChange);

    if (connection) {
      connection.addEventListener("change", handleConnectionChange);
    }

    return () => {
      window.removeEventListener("online", handleConnectionChange);
      window.removeEventListener("offline", handleConnectionChange);

      if (connection) {
        connection.removeEventListener("change", handleConnectionChange);
      }
    };
  }, []);

  return (
    <div
      ref={observerRef}
      className={`network-container blackout ${isVisible ? "visible" : ""}`}
    >
      <h2 className="network-title">🌐 Network Status</h2>
      {networkInfo ? (
        <div className="network-card">
          <p><strong>Type:</strong> {networkInfo.effectiveType}</p>
          <p><strong>Speed:</strong> {networkInfo.downlink} Mbps</p>
          <p><strong>RTT:</strong> {networkInfo.rtt} ms</p>
          <p
            className={`network-status ${
              networkInfo.status.includes("Poor")
                ? "poor"
                : networkInfo.status.includes("offline") ||
                  networkInfo.status.includes("❌")
                ? "offline"
                : "good"
            }`}
          >
            {networkInfo.status}
          </p>
        </div>
      ) : (
        <p>Loading network info...</p>
      )}
    </div>
  );
};

export default NetworkStatus;
