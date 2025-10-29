import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/Register";
import BaselineSign from "./pages/BaselineSign";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/baseline" element={<BaselineSign />} />
      </Routes>
    </Router>
  );
}

export default App;
