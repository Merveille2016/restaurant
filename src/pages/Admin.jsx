import { useEffect, useState } from "react";
import { useLang } from "../lang-context.js";
import { adminEmail, adminSession, adminSignIn, adminSignOut } from "../admin/auth.js";
import { supabaseConfigured } from "../supabase.js";
import { waLink } from "../whatsapp.js";
import { SITE } from "../data/site.js";
import AdminOrders from "../admin/AdminOrders.jsx";
import AdminMenu from "../admin/AdminMenu.jsx";
import AdminDrivers from "../admin/AdminDrivers.jsx";
import AdminSettings from "../admin/AdminSettings.jsx";
import { IconChat } from "../components/Icons.jsx";

function Login({ onSignedIn }) {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await adminSignIn(email.trim(), password);
      onSignedIn(email.trim());
    } catch {
      setError(t("admin.loginError"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={submit} noValidate>
        <h2>{t("admin.loginTitle")}</h2>
        <p className="admin-login-hint">{t("admin.loginHint")}</p>
        <div className="form-field">
          <label htmlFor="admin-email">{t("admin.loginEmail")}</label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
          />
        </div>
        <div className="form-field">
          <label htmlFor="admin-password">{t("admin.loginPassword")}</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </div>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn btn-accent btn-block" disabled={busy}>
          {busy ? t("admin.loading") : t("admin.loginSubmit")}
        </button>
      </form>
    </div>
  );
}

export default function Admin() {
  const { t, path } = useLang();
  const [email, setEmail] = useState(null);
  const [checked, setChecked] = useState(false);
  const [tab, setTab] = useState("orders");

  useEffect(() => {
    adminSession().then((session) => {
      if (session) setEmail(session.user?.email ?? adminEmail());
      setChecked(true);
    });
  }, []);

  if (!supabaseConfigured()) {
    return (
      <div className="page-admin">
        <section className="checkout-section">
          <div className="container narrow">
            <div className="pay-status">
              <h2>{t("admin.unconfiguredTitle")}</h2>
              <p>{t("admin.unconfiguredText")}</p>
              <a
                className="btn btn-whatsapp"
                href={waLink(SITE.whatsapp[0].number, t("hero.waMessage"))}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconChat size={18} />
                {t("mobileBar.order")}
              </a>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!checked) {
    return (
      <div className="page-admin">
        <p className="admin-loading">{t("admin.loading")}</p>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="page-admin">
        <Login onSignedIn={setEmail} />
      </div>
    );
  }

  const TABS = [
    ["orders", t("admin.tabs.orders")],
    ["menu", t("admin.tabs.menu")],
    ["drivers", t("admin.tabs.drivers")],
    ["settings", t("admin.tabs.settings")],
  ];

  return (
    <div className="page-admin">
      <header className="admin-header">
        <div className="container admin-header-inner">
          <h1>{t("admin.title")}</h1>
          <div className="admin-header-actions">
            <span className="admin-user">{email}</span>
            <a className="admin-btn admin-btn-ghost" href={path("")}>
              {t("admin.backToSite")}
            </a>
            <button
              type="button"
              className="admin-btn admin-btn-ghost"
              onClick={async () => {
                await adminSignOut();
                setEmail(null);
              }}
            >
              {t("admin.logout")}
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        <nav className="admin-tabs" aria-label={t("admin.title")}>
          {TABS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={tab === value ? "admin-tab active" : "admin-tab"}
              aria-pressed={tab === value}
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="admin-content">
          {tab === "orders" ? <AdminOrders /> : null}
          {tab === "menu" ? <AdminMenu /> : null}
          {tab === "drivers" ? <AdminDrivers /> : null}
          {tab === "settings" ? <AdminSettings /> : null}
        </div>
      </div>
    </div>
  );
}
