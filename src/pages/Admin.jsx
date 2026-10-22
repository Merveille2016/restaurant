import { useEffect, useState } from "react";
import { useLang } from "../lang-context.js";
import {
  adminEmail,
  adminRequestReset,
  adminSession,
  adminSignIn,
  adminSignOut,
  adminUpdatePassword,
  consumeAuthRedirect,
} from "../admin/auth.js";
import { supabaseConfigured } from "../supabase.js";
import { waLink } from "../whatsapp.js";
import { SITE } from "../data/site.js";
import AdminOrders from "../admin/AdminOrders.jsx";
import AdminMenu from "../admin/AdminMenu.jsx";
import AdminDrivers from "../admin/AdminDrivers.jsx";
import AdminSettings from "../admin/AdminSettings.jsx";
import { IconChat } from "../components/Icons.jsx";

const MIN_PASSWORD_LENGTH = 8;

function ForgotPassword({ onBack }) {
  const { t, path } = useLang();
  const [email, setEmail] = useState("");
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setState("invalid");
      return;
    }
    setBusy(true);
    try {
      const sent = await adminRequestReset(email.trim(), window.location.origin + path("admin"));
      setState(sent ? "sent" : "rateLimited");
    } catch {
      setState("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={submit} noValidate>
        <h2>{t("admin.forgotTitle")}</h2>
        <p className="admin-login-hint">{t("admin.forgotHint")}</p>
        {state === "sent" ? (
          <p className="form-success" role="status">
            {t("admin.forgotSent")}
          </p>
        ) : (
          <>
            <div className="form-field">
              <label htmlFor="reset-email">{t("admin.loginEmail")}</label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
              />
            </div>
            {state && state !== "sent" ? (
              <p className="form-error" role="alert">
                {t(`admin.forgot.${state}`)}
              </p>
            ) : null}
            <button type="submit" className="btn btn-accent btn-block" disabled={busy}>
              {busy ? t("admin.loading") : t("admin.forgotSubmit")}
            </button>
          </>
        )}
        <button type="button" className="admin-login-link" onClick={onBack}>
          {t("admin.backToLogin")}
        </button>
      </form>
    </div>
  );
}

function SetPassword({ invited, onDone }) {
  const { t } = useLang();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t("admin.setPassword.tooShort"));
      return;
    }
    if (password !== confirm) {
      setError(t("admin.setPassword.mismatch"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await adminUpdatePassword(password);
      onDone();
    } catch (err) {
      if (err.code === "same_password") setError(t("admin.setPassword.same"));
      else if (err.code === "weak_password") setError(t("admin.setPassword.weak"));
      else if (err.message === "No session") setError(t("admin.setPassword.expired"));
      else setError(t("admin.setPassword.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={submit} noValidate>
        <h2>{invited ? t("admin.setPassword.inviteTitle") : t("admin.setPassword.title")}</h2>
        <p className="admin-login-hint">{t("admin.setPassword.hint")}</p>
        <div className="form-field">
          <label htmlFor="new-password">{t("admin.setPassword.new")}</label>
          <input
            id="new-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
          />
        </div>
        <div className="form-field">
          <label htmlFor="confirm-password">{t("admin.setPassword.confirm")}</label>
          <input
            id="confirm-password"
            type="password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            autoComplete="new-password"
          />
        </div>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn btn-accent btn-block" disabled={busy}>
          {busy ? t("admin.loading") : t("admin.setPassword.submit")}
        </button>
      </form>
    </div>
  );
}

function Login({ onSignedIn, onForgot, notice }) {
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
        {notice ? (
          <p className={notice.kind === "error" ? "form-error" : "form-success"} role="status">
            {notice.text}
          </p>
        ) : null}
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
        <button type="button" className="admin-login-link" onClick={onForgot}>
          {t("admin.forgotLink")}
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
  // "login" | "forgot" | "recovery" | "invite"
  const [view, setView] = useState("login");
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!supabaseConfigured()) return;
    (async () => {
      // A recovery or invite link lands here with a one-time sign-in in the
      // URL hash: the person must choose a password before going further.
      const redirect = await consumeAuthRedirect();
      if (redirect?.error) {
        setNotice({ kind: "error", text: t("admin.linkExpired") });
      } else if (redirect?.type === "recovery" || redirect?.type === "invite") {
        setView(redirect.type);
        setChecked(true);
        return;
      }
      const session = await adminSession();
      if (session) setEmail(session.user?.email ?? adminEmail());
      setChecked(true);
    })();
    // Runs once on load; `t` only formats the notice text.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (view === "recovery" || view === "invite") {
    return (
      <div className="page-admin">
        <SetPassword
          invited={view === "invite"}
          onDone={() => {
            setEmail(adminEmail());
            setView("login");
          }}
        />
      </div>
    );
  }

  if (!email) {
    return (
      <div className="page-admin">
        {view === "forgot" ? (
          <ForgotPassword onBack={() => setView("login")} />
        ) : (
          <Login
            onSignedIn={(value) => {
              setNotice(null);
              setEmail(value);
            }}
            onForgot={() => {
              setNotice(null);
              setView("forgot");
            }}
            notice={notice}
          />
        )}
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
