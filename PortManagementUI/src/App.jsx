import { OperationEvents } from "./components/OperationEvents"
import { PortUtilizationCard } from "./components/PortUtilizationCard"
import DigitalTwin from "./components/anotherpage/Digitaltwin.jsx"
import Mainpage from "./components/mainpage/Mainpage.jsx"
import {Routes} from "react-router-dom";
import {BrowserRouter as Router, Route} from "react-router-dom";
import { VesselList, BerthMap } from "@/components"

function App() {
    return (
       <Router>
           <Routes>
                <Route path="/digitaltwin" element ={<DigitalTwin/>}></Route>
                <Route path="/" element={<Mainpage/>}></Route>

           </Routes>
       </Router>
    )
}

export default App