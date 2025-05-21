import { BerthMap } from "./components/BerthMap"
import { OperationEvents } from "./components/OperationEvents"
import { PortUtilizationCard } from "./components/PortUtilizationCard"
import { VesselList } from "./components/VesselList"
import DigitalTwin from "./components/anotherpage/Digitaltwin.jsx"
import Mainpage from "./components/mainpage/Mainpage.jsx"
import {Routes} from "react-router-dom";
import {BrowserRouter as Router, Route} from "react-router-dom";
import Dashboard from "./components/Dashboard.jsx"

function App() {
    return (
       <Router>
           <Routes>
                <Route path="/digitaltwin" element ={<DigitalTwin/>}></Route>
                <Route path="/" element={<Mainpage/>}></Route>
                <Route path="/dashboard" element={<Dashboard />} />
           </Routes>
       </Router>
    )
}

export default App