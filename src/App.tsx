import { Routes, Route } from "react-router-dom";
import IntroPage from "./pages/IntroPage";
import MouseControlPage from "./pages/MouseControl";
import KeyboardPage from "./pages/KeyboardPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<IntroPage />} />
      <Route path="/mouse-control" element={<MouseControlPage />} />
      <Route path="/keyboard" element={<KeyboardPage />} />
    </Routes>
  );
}
