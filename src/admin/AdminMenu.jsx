import { useEffect, useState } from "react";
import { useLang } from "../lang-context.js";
import { api } from "./api.js";
import { IconCheck } from "../components/Icons.jsx";

const ALLERGEN_KEYS = ["peanut", "fish", "shellfish", "mollusc"];

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function AdminField({ label, children, wide }) {
  return (
    <label className={wide ? "admin-field wide" : "admin-field"}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function AdminCheck({ label, checked, onChange, hint }) {
  return (
    <label className="admin-check">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>
        {label}
        {hint ? <em>{hint}</em> : null}
      </span>
    </label>
  );
}

function DishForm({ initial, categories, onSave, onCancel, saving, saveLabel }) {
  const { t } = useLang();
  const [draft, setDraft] = useState(initial);
  const set = (field) => (event) => setDraft((current) => ({ ...current, [field]: event.target.value }));

  return (
    <form
      className="admin-edit-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(draft);
      }}
    >
      <div className="admin-field-row">
        <AdminField label={t("admin.menu.nameFr")}>
          <input value={draft.name_fr} onChange={set("name_fr")} required />
        </AdminField>
        <AdminField label={t("admin.menu.nameEn")}>
          <input value={draft.name_en} onChange={set("name_en")} required />
        </AdminField>
      </div>
      <div className="admin-field-row">
        <AdminField label={t("admin.menu.descFr")} wide>
          <textarea rows="2" value={draft.desc_fr} onChange={set("desc_fr")} required />
        </AdminField>
      </div>
      <div className="admin-field-row">
        <AdminField label={t("admin.menu.descEn")} wide>
          <textarea rows="2" value={draft.desc_en} onChange={set("desc_en")} required />
        </AdminField>
      </div>
      <div className="admin-field-row">
        <AdminField label={t("admin.menu.price")}>
          <input type="number" min="0" step="50" value={draft.price_fcfa} onChange={set("price_fcfa")} required />
        </AdminField>
        <AdminField label={t("admin.menu.category")}>
          <select value={draft.category} onChange={set("category")}>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name_fr}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label={t("admin.menu.sort")}>
          <input type="number" min="0" value={draft.sort_order ?? 0} onChange={set("sort_order")} />
        </AdminField>
      </div>
      <div className="admin-field-row">
        <AdminField label={t("admin.menu.image")}>
          <input value={draft.image ?? ""} onChange={set("image")} placeholder="/img/…" />
        </AdminField>
        <AdminField label={t("admin.menu.regionFr")}>
          <input value={draft.region_fr ?? ""} onChange={set("region_fr")} />
        </AdminField>
        <AdminField label={t("admin.menu.regionEn")}>
          <input value={draft.region_en ?? ""} onChange={set("region_en")} />
        </AdminField>
      </div>
      <div className="admin-field-row">
        <AdminField label={t("admin.menu.allergens")} wide>
          <span className="admin-check-row">
            {ALLERGEN_KEYS.map((key) => {
              const list = draft.allergens ?? [];
              return (
                <AdminCheck
                  key={key}
                  label={t(`allergens.${key}`)}
                  checked={list.includes(key)}
                  onChange={(checked) =>
                    setDraft((current) => ({
                      ...current,
                      allergens: checked
                        ? [...(current.allergens ?? []), key]
                        : (current.allergens ?? []).filter((item) => item !== key),
                    }))
                  }
                />
              );
            })}
          </span>
        </AdminField>
      </div>
      <div className="admin-check-row">
        <AdminCheck
          label={t("admin.menu.spicy")}
          checked={Boolean(draft.spicy)}
          onChange={(checked) => setDraft((current) => ({ ...current, spicy: checked }))}
        />
        <AdminCheck
          label={t("admin.menu.veg")}
          checked={Boolean(draft.veg)}
          onChange={(checked) => setDraft((current) => ({ ...current, veg: checked }))}
        />
        <AdminCheck
          label={t("admin.menu.confirmed")}
          hint={t("admin.menu.confirmedHint")}
          checked={Boolean(draft.confirmed)}
          onChange={(checked) => setDraft((current) => ({ ...current, confirmed: checked }))}
        />
        <AdminCheck
          label={t("admin.menu.active")}
          hint={t("admin.menu.activeHint")}
          checked={Boolean(draft.is_active)}
          onChange={(checked) => setDraft((current) => ({ ...current, is_active: checked }))}
        />
      </div>
      <div className="admin-actions">
        <button type="submit" className="admin-btn" disabled={saving}>
          {saveLabel}
        </button>
        <button type="button" className="admin-btn admin-btn-ghost" onClick={onCancel}>
          {t("admin.menu.close")}
        </button>
      </div>
    </form>
  );
}

function DishRow({ dish, categories, onSaved, onError }) {
  const { t } = useLang();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async (draft) => {
    setSaving(true);
    try {
      const { slug, ...patch } = draft;
      await api.updateDish(slug, patch);
      setEditing(false);
      onSaved();
    } catch (error) {
      onError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-menu-row">
      <div className="admin-row-head">
        <strong>{dish.name_fr}</strong>
        <span className="admin-row-price">{dish.price_fcfa} FCFA</span>
        <span className="admin-badges">
          {dish.confirmed ? null : <span className="admin-badge warn">{t("admin.menu.draft")}</span>}
          {dish.is_active ? null : <span className="admin-badge off">{t("admin.menu.inactive")}</span>}
        </span>
        <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setEditing((open) => !open)}>
          {editing ? t("admin.menu.close") : t("admin.menu.edit")}
        </button>
      </div>
      {editing ? (
        <DishForm
          initial={{ ...dish, allergens: dish.allergens ?? [] }}
          categories={categories}
          onSave={save}
          onCancel={() => setEditing(false)}
          saving={saving}
          saveLabel={t("admin.menu.save")}
        />
      ) : null}
    </div>
  );
}

function DrinkRow({ drink, onSaved, onError }) {
  const { t } = useLang();
  const [draft, setDraft] = useState(drink);
  const [saving, setSaving] = useState(false);
  const set = (field) => (event) => setDraft((current) => ({ ...current, [field]: event.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      const { slug, ...patch } = draft;
      await api.updateDrink(slug, patch);
      onSaved();
    } catch (error) {
      onError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-menu-row">
      <div className="admin-row-head">
        <input className="admin-inline-input" value={draft.name_fr} onChange={set("name_fr")} aria-label={t("admin.menu.nameFr")} />
        <input className="admin-inline-input" value={draft.name_en} onChange={set("name_en")} aria-label={t("admin.menu.nameEn")} />
        <input
          className="admin-inline-input price"
          type="number"
          min="0"
          step="25"
          value={draft.price_fcfa}
          onChange={set("price_fcfa")}
          aria-label={t("admin.menu.price")}
        />
        <label className="admin-check">
          <input
            type="checkbox"
            checked={Boolean(draft.is_active)}
            onChange={(event) => setDraft((current) => ({ ...current, is_active: event.target.checked }))}
          />
          <span>{t("admin.menu.active")}</span>
        </label>
        <button type="button" className="admin-btn" disabled={saving} onClick={save}>
          {saving ? t("admin.menu.saving") : t("admin.menu.save")}
        </button>
      </div>
    </div>
  );
}

function SpecialsEditor({ onError }) {
  const { t } = useLang();
  const dayNames = t("days");
  const [rows, setRows] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    api
      .listSpecials()
      .then((specials) => {
        const byDay = new Map(specials.map((special) => [special.day_of_week, special]));
        setRows(
          Array.from({ length: 7 }, (_, day) => ({
            day_of_week: day,
            meals_fr: (byDay.get(day)?.meals_fr ?? []).join("\n"),
            meals_en: (byDay.get(day)?.meals_en ?? []).join("\n"),
            image: byDay.get(day)?.image ?? "",
          }))
        );
      })
      .catch(onError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!rows) return <p className="admin-loading">{t("admin.loading")}</p>;

  const setRow = (day, field) => (event) =>
    setRows((current) => current.map((row) => (row.day_of_week === day ? { ...row, [field]: event.target.value } : row)));

  const save = async () => {
    setSaving(true);
    try {
      await api.saveSpecials(
        rows.map((row) => ({
          day_of_week: row.day_of_week,
          meals_fr: row.meals_fr.split("\n").map((meal) => meal.trim()).filter(Boolean),
          meals_en: row.meals_en.split("\n").map((meal) => meal.trim()).filter(Boolean),
          image: row.image.trim() || null,
        }))
      );
      setSavedAt(Date.now());
    } catch (error) {
      onError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-specials">
      <div className="admin-specials-grid">
        {rows.map((row) => (
          <div key={row.day_of_week} className="admin-special-card">
            <h4>{dayNames[row.day_of_week]}</h4>
            <AdminField label={t("admin.menu.mealsFr")}>
              <textarea rows="3" value={row.meals_fr} onChange={setRow(row.day_of_week, "meals_fr")} />
            </AdminField>
            <AdminField label={t("admin.menu.mealsEn")}>
              <textarea rows="3" value={row.meals_en} onChange={setRow(row.day_of_week, "meals_en")} />
            </AdminField>
            <AdminField label={t("admin.menu.specialImage")}>
              <input value={row.image} onChange={setRow(row.day_of_week, "image")} placeholder="/img/…" />
            </AdminField>
          </div>
        ))}
      </div>
      <div className="admin-actions">
        <button type="button" className="admin-btn" disabled={saving} onClick={save}>
          {saving ? t("admin.menu.saving") : t("admin.menu.saveAll")}
        </button>
        {savedAt ? (
          <span className="admin-saved">
            <IconCheck size={15} /> {t("admin.saved")}
          </span>
        ) : null}
      </div>
      <p className="admin-hint">{t("admin.menu.specialsHint")}</p>
    </div>
  );
}

export default function AdminMenu() {
  const { t } = useLang();
  const [sub, setSub] = useState("dishes");
  const [dishes, setDishes] = useState(null);
  const [drinks, setDrinks] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api
      .listDishes()
      .then(setDishes)
      .catch((err) => setError(err.message));
    api
      .listDrinks()
      .then(setDrinks)
      .catch((err) => setError(err.message));
    api
      .listCategories()
      .then(setCategories)
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const reload = () => {
    setError(null);
    load();
  };

  const addDish = async (draft) => {
    setSaving(true);
    try {
      const slug = draft.slug?.trim() || slugify(draft.name_fr);
      await api.createDish({
        slug,
        category: draft.category,
        price_fcfa: Number(draft.price_fcfa) || 0,
        spicy: Boolean(draft.spicy),
        veg: Boolean(draft.veg),
        confirmed: Boolean(draft.confirmed),
        is_active: Boolean(draft.is_active),
        allergens: draft.allergens ?? [],
        region_fr: draft.region_fr || null,
        region_en: draft.region_en || null,
        name_fr: draft.name_fr,
        name_en: draft.name_en,
        desc_fr: draft.desc_fr,
        desc_en: draft.desc_en,
        image: draft.image || null,
        sort_order: Number(draft.sort_order) || 0,
      });
      setAdding(false);
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addDrink = async (draft) => {
    setSaving(true);
    try {
      await api.createDrink({
        slug: slugify(draft.name_fr),
        name_fr: draft.name_fr,
        name_en: draft.name_en,
        price_fcfa: Number(draft.price_fcfa) || 0,
        image: draft.image || null,
        is_active: true,
        sort_order: 100,
      });
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-menu">
      <div className="admin-filter" role="group" aria-label={t("admin.tabs.menu")}>
        {[
          ["dishes", t("admin.menu.dishes")],
          ["drinks", t("admin.menu.drinks")],
          ["specials", t("admin.menu.specials")],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={sub === value ? "admin-tab active" : "admin-tab"}
            aria-pressed={sub === value}
            onClick={() => setSub(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="admin-error" role="alert">
          {error}
        </p>
      ) : null}

      {sub === "dishes" ? (
        <div className="admin-menu-list">
          <div className="admin-add">
            <button type="button" className="admin-btn" onClick={() => setAdding((open) => !open)}>
              {adding ? t("admin.menu.close") : t("admin.menu.addDish")}
            </button>
          </div>
          {adding ? (
            <div className="admin-menu-row">
              <DishForm
                initial={{
                  slug: "",
                  category: categories[0]?.slug ?? "traditional",
                  price_fcfa: 1000,
                  spicy: false,
                  veg: false,
                  confirmed: false,
                  is_active: true,
                  allergens: [],
                  region_fr: "",
                  region_en: "",
                  name_fr: "",
                  name_en: "",
                  desc_fr: "",
                  desc_en: "",
                  image: "",
                  sort_order: 100,
                }}
                categories={categories}
                onSave={addDish}
                onCancel={() => setAdding(false)}
                saving={saving}
                saveLabel={t("admin.menu.addDish")}
              />
            </div>
          ) : null}
          {dishes === null ? (
            <p className="admin-loading">{t("admin.loading")}</p>
          ) : (
            dishes.map((dish) => (
              <DishRow key={dish.slug} dish={dish} categories={categories} onSaved={reload} onError={(err) => setError(err.message)} />
            ))
          )}
        </div>
      ) : null}

      {sub === "drinks" ? (
        <div className="admin-menu-list">
          <div className="admin-add">
            <button
              type="button"
              className="admin-btn"
              onClick={() =>
                addDrink({ name_fr: t("admin.menu.newDrink"), name_en: t("admin.menu.newDrink"), price_fcfa: 500, image: "" })
              }
            >
              {t("admin.menu.addDrink")}
            </button>
          </div>
          {drinks === null ? (
            <p className="admin-loading">{t("admin.loading")}</p>
          ) : (
            drinks.map((drink) => (
              <DrinkRow key={drink.slug} drink={drink} onSaved={reload} onError={(err) => setError(err.message)} />
            ))
          )}
        </div>
      ) : null}

      {sub === "specials" ? <SpecialsEditor onError={(err) => setError(err.message)} /> : null}
    </div>
  );
}
