import { useEffect, useState } from "react";
import { Box, Button, Container, Typography, Paper } from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./locationss.css";
import { useIntersectionObserver } from "../observationin";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for default Leaflet icon not showing
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function App() {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const { ref: observerRef, isVisible } = useIntersectionObserver(0.8); // threshold = 80%

  const getLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition({ lat: latitude, lng: longitude });
        },
        (err) => {
          alert("Failed to get location: " + err.message);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <Container
      ref={observerRef}
      className={`location-wrapper overlay ${isVisible ? "visible" : ""}`}
      maxWidth="sm"
      sx={{ mt: 5 }}
    >
      <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          📍 Your Current Location
        </Typography>
        <Typography variant="body1" gutterBottom>
          ---------------------------------------------------------
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={getLocation}
          sx={{ mt: 2 }}
        >
          Refresh Location
        </Button>

        {position && (
          <>
            <Typography sx={{ mt: 3 }}>
              <strong>Latitude:</strong> {position.lat.toFixed(4)}
              <br />
              <strong>Longitude:</strong> {position.lng.toFixed(4)}
            </Typography>

            <Box sx={{ height: 400, mt: 3 }}>
              <MapContainer
                center={[position.lat, position.lng]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={[position.lat, position.lng]}>
                  <Popup>You are here!</Popup>
                </Marker>
              </MapContainer>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default App;
