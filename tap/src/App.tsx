
import { Container } from "@mui/material";
import Locationss from "./components/location/locationss";
import NetworkStatus from "./components/network/networkss";
import ActivityCanvas from "./components/canvas/canvasss";
import "./App.css";

function App() {
  return (
    <Container maxWidth="md">
      <h1 className="app-title">GeoLive: A Real-Time Activity & Network Dashboard</h1>

      <Locationss></Locationss>
      
      <NetworkStatus></NetworkStatus>
      <ActivityCanvas></ActivityCanvas>
 
    </Container>
  );
}

export default App;
