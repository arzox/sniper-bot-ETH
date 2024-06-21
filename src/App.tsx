import "./index.css";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Ether from "./pages/ether";
import Sol from "./pages/sol";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/ethereum" element={<Ether/>}/>
                <Route path="/solana" element={<Sol/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App