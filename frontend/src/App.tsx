import { Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./context/AuthContext";
import { PublicLayout } from "./components/layout/PublicLayout";
import { AdminLayout } from "./routes/admin/AdminLayout";
import { Dashboard } from "./routes/admin/Dashboard";
import { ContentEditor } from "./routes/admin/ContentEditor";
import { OpportunitiesAdmin } from "./routes/admin/OpportunitiesAdmin";
import { MenusAdmin } from "./routes/admin/MenusAdmin";
import { BannersAdmin } from "./routes/admin/BannersAdmin";
import { SiteSettingsAdmin } from "./routes/admin/SiteSettingsAdmin";
import { AdminLogin } from "./routes/admin/Login";
import { Home } from "./routes/public/Home";
import { Projects } from "./routes/public/Projects";
import { Opportunities } from "./routes/public/Opportunities";
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
        <Route path="/oportunidades" element={<Opportunities />} />
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
        <Route path="paginas" element={<ContentEditor />} />
        <Route path="menus" element={<MenusAdmin />} />
        <Route path="oportunidades" element={<OpportunitiesAdmin />} />
        <Route path="banners" element={<BannersAdmin />} />
        <Route path="settings" element={<SiteSettingsAdmin />} />
      </Route>

      <Route path="*" element={<div className="container">Página não encontrada.</div>} />
    </Routes>
  );
}

export default App;
