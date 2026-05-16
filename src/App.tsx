import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { MenuProvider } from "./context/MenuContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AdminPage } from "./pages/AdminPage";
import { MenuPage } from "./pages/MenuPage";

export default function App() {
  return (
    <ThemeProvider>
      <MenuProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </MenuProvider>
    </ThemeProvider>
  );
}
