import { Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./context/AuthContext";
import { PublicLayout } from "./components/layout/PublicLayout";
import { AdminLayout } from "./routes/admin/AdminLayout";
import { Dashboard } from "./routes/admin/Dashboard";
import { ContentEditor } from "./routes/admin/ContentEditor";
import { MenusAdmin } from "./routes/admin/MenusAdmin";
import { SiteSettingsAdmin } from "./routes/admin/SiteSettingsAdmin";
import { HomeEditor } from "./routes/admin/HomeEditor";
import { AdminLogin } from "./routes/admin/Login";
import { Home } from "./routes/public/Home";
import { Projects } from "./routes/public/Projects";
import { Contact } from "./routes/public/Contact";
import { PublicPage } from "./routes/public/PublicPage";
import { QuemSomos } from "./routes/public/QuemSomos";

function App() {
  const StaticPage = ({ slug }: { slug: string }) => <PublicPage slugOverride={slug} />;

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/projetos" element={<Projects />} />
        <Route path="/contato" element={<Contact />} />
        <Route path="/quem-somos" element={<QuemSomos />} />
        <Route path="/noticias" element={<StaticPage slug="noticias" />} />
        <Route path="/portfolio" element={<StaticPage slug="portfolio" />} />
        <Route path="/doacao" element={<StaticPage slug="doacao" />} />
        <Route path="/pages/:slug" element={<PublicPage />} />
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
        <Route path="home" element={<HomeEditor />} />
        <Route path="paginas" element={<ContentEditor />} />
        <Route path="menus" element={<MenusAdmin />} />
        <Route path="settings" element={<SiteSettingsAdmin />} />
      </Route>

      <Route path="*" element={<div className="container">Página não encontrada.</div>} />
    </Routes>
  );
}

export default App;
