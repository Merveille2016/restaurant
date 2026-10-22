import { useEffect, useState } from "react";
import { useLang } from "../lang-context.js";
import { getMenu, loadMenu, subscribeToMenu } from "../data/menu-store.js";
import { glossary } from "../data/glossary.js";
import {
  getDailySpecials,
  loadDailySpecialsFromSheet,
  subscribeToDailySpecials,
} from "../data/daily-specials.js";
import { formatPrice } from "../data/site.js";
import { addToCart } from "../cart.js";
import DishCard from "../components/DishCard.jsx";
import CtaBand from "../components/CtaBand.jsx";
import Picture from "../components/Picture.jsx";
import { IconCart, IconCheck } from "../components/Icons.jsx";

function DrinkCard({ drink }) {
  const { lang, t } = useLang();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart({ type: "drink", slug: drink.id, name: drink.name, price: drink.price, image: drink.image ?? null });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article className="drink-card">
      <Picture
        src={drink.image}
        alt={drink.name[lang]}
        className="drink-image"
        sizes="(max-width: 640px) 50vw, 260px"
      />
      <div className="drink-content">
        <h3>{drink.name[lang]}</h3>
        <p className="drink-price">{formatPrice(drink.price)}</p>
        <button type="button" className="drink-add" onClick={handleAdd}>
          {added ? <IconCheck size={16} /> : <IconCart size={16} />}
          {added ? t("cart.added") : t("cart.add")}
        </button>
      </div>
    </article>
  );
}

export default function Menu() {
  const { lang, t } = useLang();
  const dayNames = t("days");
  const [menu, setMenu] = useState(getMenu);
  const [sheetSpecials, setSheetSpecials] = useState(getDailySpecials);

  useEffect(() => {
    const unsubscribeMenu = subscribeToMenu(() => setMenu(getMenu()));
    loadMenu();
    const unsubscribeSpecials = subscribeToDailySpecials(() => setSheetSpecials(getDailySpecials()));
    loadDailySpecialsFromSheet();
    return () => {
      unsubscribeMenu();
      unsubscribeSpecials();
    };
  }, []);

  // Remote daily specials (edited in the back-office) take precedence over
  // the Google Sheet, which itself overrides the static defaults.
  const dailySpecials = menu.specials ?? sheetSpecials;

  const visibleDishes = menu.dishes;
  const visibleCategories = menu.categories.filter((category) =>
    visibleDishes.some((dish) => dish.category === category)
  );

  const mondayIndex = (new Date().getDay() + 6) % 7;

  const jumpLinks = [
    ["today", t("menu.jumpToday")],
    ...visibleCategories.map((category) => [category, t(`menu.${category}`)]),
    ["drinks", t("menu.drinksTitle")],
    ["glossary", t("menu.glossaryTitle")],
  ];

  return (
    <div className="page-menu">
      <header className="page-hero">
        <h1>{t("menu.title")}</h1>
        <p>{t("menu.tagline")}</p>
      </header>

      <nav className="menu-jump" aria-label={t("menu.jumpLabel")}>
        <div className="menu-jump-inner">
          {jumpLinks.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="menu-chip">
              {label}
            </a>
          ))}
        </div>
      </nav>

      <section className="menu-section" id="today">
        <div className="container">
          <h2>{t("menu.dailyTitle")}</h2>
          <p className="section-subtitle">{t("menu.dailyNote")}</p>
          <div className="daily-grid">
            {dailySpecials.map((day, index) => (
              <article
                key={day.day}
                className={index === mondayIndex ? "day-card today" : "day-card"}
              >
                <div className="day-card-image-wrap">
                  <Picture
                    src={day.image}
                    alt={`${t("menu.dayPhotoAlt")} — ${dayNames[day.day]}`}
                    className="day-card-image"
                    sizes="(max-width: 640px) 100vw, 370px"
                  />
                  {index === mondayIndex && (
                    <span className="day-card-today-badge">{t("menu.todayBadge")}</span>
                  )}
                </div>
                <div className="day-card-content">
                  <h3>{dayNames[day.day]}</h3>
                  <ul>
                    {day.meals[lang].map((meal) => (
                      <li key={meal}>{meal}</li>
                    ))}
                  </ul>
                  <p className="day-card-price">{t("menu.dayRange")}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="menu-section menu-section-alt">
        <div className="container">
          <h2>{t("menu.fullTitle")}</h2>
          <p className="section-subtitle">{t("menu.fullNote")}</p>
          {visibleCategories.map((category) => (
            <div key={category} id={category} className="menu-category">
              <h3>{t(`menu.${category}`)}</h3>
              <div className="dishes-grid">
                {visibleDishes
                  .filter((dish) => dish.category === category)
                  .map((dish) => (
                    <DishCard key={dish.id} dish={dish} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="menu-section" id="drinks">
        <div className="container">
          <h2>{t("menu.drinksTitle")}</h2>
          <p className="section-subtitle">{t("menu.drinksNote")}</p>
          <div className="drinks-grid">
            {menu.drinks.map((drink) => (
              <DrinkCard key={drink.id} drink={drink} />
            ))}
          </div>
        </div>
      </section>

      <section className="menu-section menu-section-alt" id="glossary">
        <div className="container">
          <h2>{t("menu.glossaryTitle")}</h2>
          <p className="section-subtitle">{t("menu.glossaryNote")}</p>
          <dl className="glossary">
            {glossary.map((entry) => (
              <div key={entry.term} className="glossary-entry">
                <dt>{entry.term}</dt>
                <dd>{entry[lang]}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <CtaBand />
    </div>
  );
}
