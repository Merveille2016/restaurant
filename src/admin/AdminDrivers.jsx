import { useEffect, useState } from "react";
import { useLang } from "../lang-context.js";
import { api } from "./api.js";
import { IconCheck, IconTrash } from "../components/Icons.jsx";

function phoneDigits(phone) {
  return phone.replace(/[^\d]/g, "").replace(/^\+/, "");
}

function DriverRow({ driver, onSaved, onError }) {
  const { t } = useLang();
  const [draft, setDraft] = useState(driver);
  const [saving, setSaving] = useState(false);
  const set = (field) => (event) => setDraft((current) => ({ ...current, [field]: event.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      const { id, ...patch } = draft;
      await api.updateDriver(id, patch);
      onSaved();
    } catch (error) {
      onError(error);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(t("admin.drivers.confirmRemove"))) return;
    try {
      await api.deleteDriver(driver.id);
      onSaved();
    } catch (error) {
      onError(error);
    }
  };

  return (
    <div className="admin-menu-row">
      <div className="admin-row-head">
        <input
          className="admin-inline-input"
          value={draft.name}
          onChange={set("name")}
          aria-label={t("admin.drivers.name")}
        />
        <input
          className="admin-inline-input"
          value={draft.phone}
          onChange={set("phone")}
          inputMode="tel"
          aria-label={t("admin.drivers.phone")}
        />
        <label className="admin-check">
          <input
            type="checkbox"
            checked={Boolean(draft.is_active)}
            onChange={(event) => setDraft((current) => ({ ...current, is_active: event.target.checked }))}
          />
          <span>{t("admin.drivers.active")}</span>
        </label>
        <button type="button" className="admin-btn" disabled={saving} onClick={save}>
          {saving ? t("admin.menu.saving") : t("admin.drivers.save")}
        </button>
        <button type="button" className="admin-btn admin-btn-danger" onClick={remove} aria-label={t("admin.drivers.remove")}>
          <IconTrash size={16} />
        </button>
      </div>
    </div>
  );
}

export default function AdminDrivers() {
  const { t } = useLang();
  const [drivers, setDrivers] = useState(null);
  const [error, setError] = useState(null);
  const [newDriver, setNewDriver] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  const load = () => api.listDrivers().then(setDrivers).catch((err) => setError(err.message));

  useEffect(() => {
    load();
  }, []);

  const add = async (event) => {
    event.preventDefault();
    if (newDriver.name.trim().length < 2 || phoneDigits(newDriver.phone).length < 8) {
      setError(t("admin.drivers.formError"));
      return;
    }
    setSaving(true);
    try {
      await api.createDriver({ name: newDriver.name.trim(), phone: phoneDigits(newDriver.phone), is_active: true });
      setNewDriver({ name: "", phone: "" });
      setError(null);
      setSavedAt(Date.now());
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-drivers">
      {error ? (
        <p className="admin-error" role="alert">
          {error}
        </p>
      ) : null}

      <form className="admin-menu-row admin-driver-add" onSubmit={add}>
        <div className="admin-row-head">
          <input
            className="admin-inline-input"
            placeholder={t("admin.drivers.name")}
            value={newDriver.name}
            onChange={(event) => setNewDriver((current) => ({ ...current, name: event.target.value }))}
            aria-label={t("admin.drivers.name")}
          />
          <input
            className="admin-inline-input"
            placeholder={t("admin.drivers.phone")}
            value={newDriver.phone}
            onChange={(event) => setNewDriver((current) => ({ ...current, phone: event.target.value }))}
            inputMode="tel"
            aria-label={t("admin.drivers.phone")}
          />
          <button type="submit" className="admin-btn" disabled={saving}>
            {t("admin.drivers.add")}
          </button>
        </div>
      </form>

      {drivers === null ? (
        <p className="admin-loading">{t("admin.loading")}</p>
      ) : drivers.length === 0 ? (
        <p className="admin-empty">{t("admin.drivers.empty")}</p>
      ) : (
        <div className="admin-menu-list">
          {drivers.map((driver) => (
            <DriverRow
              key={driver.id}
              driver={driver}
              onSaved={() => {
                setSavedAt(Date.now());
                load();
              }}
              onError={(err) => setError(err.message)}
            />
          ))}
        </div>
      )}

      {savedAt ? (
        <p className="admin-saved">
          <IconCheck size={15} /> {t("admin.saved")}
        </p>
      ) : null}
    </div>
  );
}
