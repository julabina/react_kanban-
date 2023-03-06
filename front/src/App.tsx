import { Routes, Route } from "react-router-dom";
import Home from "./Containers/Home";
import Log from "./Containers/Log";
import NotFound from "./Containers/NotFound";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/connexion" element={<Log />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  );
}

export default App;
