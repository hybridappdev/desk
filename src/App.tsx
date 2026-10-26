import { Route, Routes } from "react-router";
import { DeskPage } from "./DeskPage";
import { PublishedPage } from "./PublishedPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<DeskPage />} />
      <Route path="/published" element={<PublishedPage />} />
    </Routes>
  );
}
