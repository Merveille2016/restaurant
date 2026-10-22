import { useEffect, useState } from "react";
import { useLang } from "../lang-context.js";
import { api } from "./api.js";
import { IconCheck, IconTrash } from "../components/Icons.jsx";

const PAYMENT_KEYS = ["cash", "mtn", "orange"];

function ZoneRow({ zone, onSaved, onError }) {
  const { t } = useLang();
  const [draft, setDraft] = useState(zone);
  const [saving, setSaving] = useState(false);
  const set = (field) => (event) => setDraft((current) => ({ ...current, [field]: event.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      const { id, ...patch } = {
        ...draft,
        fee_fcfa: Number(draft.fee_fcfa) || 0,
        sort_order: Number(draft.sort_order) || 0,
      };
      await api.updateZone(id, patch);
      onSaved();
    } catch (error) {
      onError(error);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(t("admin.settings.confirmRemoveZone"))) return;
    try {
      await api.deleteZone(zone.id);
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
          value={draft.name_fr}
          onChange={set("name_fr")}
          aria-label={t("admin.settings.zoneFr")}
        />
        <input
          className="admin-inline-input"
          value={draft.name_en}
          onChange={set("name_en")}
          aria-label={t("admin.settings.zoneEn")}
        />
        <input
          className="admin-inline-input price"
          type="number"
          min="0"
          step="100"
          value={draft.fee_fcfa}
          onChange={set("fee_fcfa")}
          aria-label={t("admin.settings.fee")}
        />
        <input
          className="admin-inline-input price"
          type="number"
          min="0"
          value={draft.sort_order}
          onChange={set("sort_order")}
          aria-label={t("admin.settings.sort")}
        />
        <button type="button" className="admin-btn" disabled={saving} onClick={save}>
          {saving ? t("admin.menu.saving") : t("admin.settings.save")}
        </button>
        <button
          type="button"
          className="admin-btn admin-btn-danger"
          onClick={remove}
          aria-label={t("admin.settings.remove")}
        >
          <IconTrash size={16} />
        </button>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const { t } = useLang();
  const [zones, setZones] = useState(null);
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(null);
  const [newZone, setNewZone] = useState({ name_fr: "", name_en: "", fee_fcfa: 0 });
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  const load = () => {
    api.listZones().then(setZones).catch((err) => setError(err.message));
    api
      .getSettings()
      .then((rows) => setSettings(rows?.[0] ?? null))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  const addZone = async (event) => {
    event.preventDefault();
    if (newZone.name_fr.trim().length < 2) {
      setError(t("admin.settings.zoneError"));
      return;
    }
    try {
      await api.createZone({
        name_fr: newZone.name_fr.trim(),
        name_en: newZone.name_en.trim() || newZone.name_fr.trim(),
        fee_fcfa: Number(newZone.fee_fcfa) || 0,
        sort_order: (zones?.length ?? 0) + 1,
      });
      setNewZone({ name_fr: "", name_en: "", fee_fcfa: 0 });
      setError(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings({
        opening_hour: Number(settings.opening_hour) || 0,
        closing_hour: Number(settings.closing_hour) || 23,
        delivery_payments: settings.delivery_payments ?? ["cash"],
        whatsapp_numbers: settings.whatsapp_numbers ?? [],
        delivery_confirmed: Boolean(settings.delivery_confirmed),
      });
      setSavedAt(Date.now());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const togglePayment = (key, checked) =>
    setSettings((current) => ({
      ...current,
      delivery_payments: checked
        ? [...(current.delivery_payments ?? []), key]
        : (current.delivery_payments ?? []).filter((item) => item !== key),
    }));

  const setWhatsapp = (value) =>
    setSettings((current) => ({
      ...current,
      whatsapp_numbers: value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [label, number] = line.split(/[:;]/).map((part) => part.trim());
          return { label: label || number, number: (number || label).replace(/[^\d]/g, "") };
        })
        .filter((entry) => entry.number.length >= 8),
    }));

  return (
    <div className="admin-settings">
      {error ? (
        <p className="admin-error" role="alert">
          {error}
        </p>
      ) : null}

      <h3 className="admin-section-title">{t("admin.settings.zonesTitle")}</h3>
      {zones === null ? (
        <p className="admin-loading">{t("admin.loading")}</p>
      ) : (
        <div className="admin-menu-list">
          {zones.map((zone) => (
            <ZoneRow
              key={zone.id}
              zone={zone}
              onSaved={() => {
                setSavedAt(Date.now());
                load();
              }}
              onError={(err) => setError(err.message)}
            />
          ))}
          <form className="admin-menu-row" onSubmit={addZone}>
            <div className="admin-row-head">
              <input
                className="admin-inline-input"
                placeholder={t("admin.settings.zoneFr")}
                value={newZone.name_fr}
                onChange={(event) => setNewZone((current) => ({ ...current, name_fr: event.target.value }))}
                aria-label={t("admin.settings.zoneFr")}
              />
              <input
                className="admin-inline-input"
                placeholder={t("admin.settings.zoneEn")}
                value={newZone.name_en}
                onChange={(event) => setNewZone((current) => ({ ...current, name_en: event.target.value }))}
                aria-label={t("admin.settings.zoneEn")}
              />
              <input
                className="admin-inline-input price"
                type="number"
                min="0"
                step="100"
                value={newZone.fee_fcfa}
                onChange={(event) => setNewZone((current) => ({ ...current, fee_fcfa: event.target.value }))}
                aria-label={t("admin.settings.fee")}
              />
              <button type="submit" className="admin-btn">
                {t("admin.settings.addZone")}
              </button>
            </div>
          </form>
        </div>
      )}

      <h3 className="admin-section-title">{t("admin.settings.hoursTitle")}</h3>
      {settings === null ? (
        <p className="admin-loading">{t("admin.loading")}</p>
      ) : (
        <form className="admin-menu-row admin-settings-form" onSubmit={saveSettings}>
          <div className="admin-row-head">
            <label className="admin-field">
              <span>{t("admin.settings.opensAt")}</span>
              <input
                type="number"
                min="0"
                max="23"
                value={settings.opening_hour}
                onChange={(event) => setSettings((current) => ({ ...current, opening_hour: event.target.value }))}
              />
            </label>
            <label className="admin-field">
              <span>{t("admin.settings.closesAt")}</span>
              <input
                type="number"
                min="1"
                max="23"
                value={settings.closing_hour}
                onChange={(event) => setSettings((current) => ({ ...current, closing_hour: event.target.value }))}
              />
            </label>
          </div>

          <div className="admin-field-row">
            <label className="admin-field wide">
              <span>{t("admin.settings.paymentsTitle")}</span>
              <span className="admin-check-row">
                {PAYMENT_KEYS.map((key) => (
                  <label key={key} className="admin-check">
                    <input
                      type="checkbox"
                      checked={(settings.delivery_payments ?? []).includes(key)}
                      onChange={(event) => togglePayment(key, event.target.checked)}
                    />
                    <span>{t(`checkout.payMethod.${key}`)}</span>
                  </label>
                ))}
              </span>
            </label>
          </div>

          <div className="admin-field-row">
            <label className="admin-field wide">
              <span>{t("admin.settings.whatsappTitle")}</span>
              <textarea
                rows="2"
                value={(settings.whatsapp_numbers ?? []).map((wa) => `${wa.label}: ${wa.number}`).join("\n")}
                onChange={(event) => setWhatsapp(event.target.value)}
              />
              <em className="admin-hint">{t("admin.settings.whatsappHint")}</em>
            </label>
          </div>

          <div className="admin-check-row">
            <label className="admin-check">
              <input
                type="checkbox"
                checked={Boolean(settings.delivery_confirmed)}
                onChange={(event) => setSettings((current) => ({ ...current, delivery_confirmed: event.target.checked }))}
              />
              <span>{t("admin.settings.deliveryConfirmed")}</span>
            </label>
          </div>

          <div className="admin-actions">
            <button type="submit" className="admin-btn" disabled={saving}>
              {saving ? t("admin.menu.saving") : t("admin.settings.saveSettings")}
            </button>
            {savedAt ? (
              <span className="admin-saved">
                <IconCheck size={15} /> {t("admin.saved")}
              </span>
            ) : null}
          </div>
        </form>
      )}
    </div>
  );
}
