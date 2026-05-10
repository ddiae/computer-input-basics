import { Routes, Route } from "react-router-dom";
import IntroPage from "./pages/IntroPage";
import MouseControlPage from "./pages/MouseControl";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<IntroPage />} />
      <Route path="/mouse-control" element={<MouseControlPage />} />
    </Routes>
  );
}
