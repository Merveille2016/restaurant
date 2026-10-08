import { useEffect, useState } from "react";
import { useLang } from "../lang-context.js";
import { CATEGORIES, dishes, drinks } from "../data/menu.js";
import { glossary } from "../data/glossary.js";
import {
  getDailySpecials,
  loadDailySpecialsFromSheet,
  subscribeToDailySpecials,
} from "../data/daily-specials.js";
import { formatPrice } from "../data/site.js";
import DishCard from "../components/DishCard.jsx";
import CtaBand from "../components/CtaBand.jsx";
import Picture from "../components/Picture.jsx";

const visibleDishes = dishes.filter((dish) => dish.confirmed !== false);
const visibleCategories = CATEGORIES.filter((category) =>
  visibleDishes.some((dish) => dish.category === category)
);

export default function Menu() {
  const { lang, t } = useLang();
  const dayNames = t("days");
  const [dailySpecials, setDailySpecials] = useState(getDailySpecials);

  useEffect(() => {
    const unsubscribe = subscribeToDailySpecials(() => setDailySpecials(getDailySpecials()));
    loadDailySpecialsFromSheet();
    return unsubscribe;
  }, []);

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
            {drinks.map((drink) => (
              <article key={drink.id} className="drink-card">
                <Picture
                  src={drink.image}
                  alt={drink.name[lang]}
                  className="drink-image"
                  sizes="(max-width: 640px) 50vw, 260px"
                />
                <div className="drink-content">
                  <h3>{drink.name[lang]}</h3>
                  <p className="drink-price">{formatPrice(drink.price)}</p>
                </div>
              </article>
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
