import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/Register";
<<<<<<< HEAD
import BaselineSign from "./pages/BaselineSign";
=======
>>>>>>> 6cd94f456933ce04e0c990466642c9cc92f3b3f6

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
<<<<<<< HEAD
        <Route path="/baseline" element={<BaselineSign />} />
=======
>>>>>>> 6cd94f456933ce04e0c990466642c9cc92f3b3f6
      </Routes>
    </Router>
  );
}

export default App;
