import { Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./context/AuthContext";
import { PublicLayout } from "./components/layout/PublicLayout";
import { AdminLayout } from "./routes/admin/AdminLayout";
import { Dashboard } from "./routes/admin/Dashboard";
import { ContentEditor } from "./routes/admin/ContentEditor";
import { OpportunitiesAdmin } from "./routes/admin/OpportunitiesAdmin";
import { MenusAdmin } from "./routes/admin/MenusAdmin";
import { AdminLogin } from "./routes/admin/Login";
import { Home } from "./routes/public/Home";
import { Projects } from "./routes/public/Projects";
import { Opportunities } from "./routes/public/Opportunities";
import { Contact } from "./routes/public/Contact";

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/projetos" element={<Projects />} />
        <Route path="/oportunidades" element={<Opportunities />} />
        <Route path="/contato" element={<Contact />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="paginas" element={<ContentEditor />} />
        <Route path="menus" element={<MenusAdmin />} />
        <Route path="oportunidades" element={<OpportunitiesAdmin />} />
      </Route>

      <Route path="*" element={<div className="container">Página não encontrada.</div>} />
    </Routes>
  );
}

export default App;
