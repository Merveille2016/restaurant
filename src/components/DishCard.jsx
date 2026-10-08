import { useLang } from "../lang-context.js";
import { formatPrice } from "../data/site.js";
import { waLink, dishOrderMessage } from "../whatsapp.js";
import { SITE } from "../data/site.js";
import { IconChat, IconFlame, IconLeaf, IconPin } from "./Icons.jsx";
import Picture from "./Picture.jsx";

export default function DishCard({ dish }) {
  const { lang, t } = useLang();
  const allergens = dish.allergens ?? [];
  const sep = lang === "fr" ? " : " : ": ";

  return (
    <article className={dish.image ? "dish-card has-image" : "dish-card"}>
      {dish.image ? (
        <Picture
          src={dish.image}
          alt={dish.name[lang]}
          className="dish-image"
          sizes="(max-width: 640px) 100vw, 360px"
        />
      ) : null}
      <div className="dish-head">
        <h3 className="dish-name">{dish.name[lang]}</h3>
        <p className="dish-price">{formatPrice(dish.price)}</p>
      </div>
      <p className="dish-desc">{dish.desc[lang]}</p>
      <div className="dish-meta">
        {dish.spicy ? (
          <span className="dish-tag spicy">
            <IconFlame size={14} />
            {t("menu.spicy")}
          </span>
        ) : null}
        {dish.veg ? (
          <span className="dish-tag veg">
            <IconLeaf size={14} />
            {t("menu.veg")}
          </span>
        ) : null}
        {dish.region ? (
          <span className="dish-tag region">
            <IconPin size={14} />
            {t("menu.region")}
            {sep}
            {dish.region[lang]}
          </span>
        ) : null}
      </div>
      {allergens.length > 0 ? (
        <p className="dish-allergens">
          {t("allergens.label")}
          {sep}
          {allergens.map((key) => t(`allergens.${key}`)).join(", ")}
        </p>
      ) : null}
      <a
        href={waLink(SITE.whatsapp[0].number, dishOrderMessage(lang, dish))}
        className="dish-order"
        target="_blank"
        rel="noopener noreferrer"
      >
        <IconChat size={16} />
        {t("menu.orderDish")}
      </a>
    </article>
  );
}
