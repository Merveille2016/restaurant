import { useEffect, useState } from "react";
import { useLang } from "../lang-context.js";
import { SITE, formatPrice } from "../data/site.js";
import { waLink } from "../whatsapp.js";
import { cartCount, cartSubtotal, subscribeToCart } from "../cart.js";
import { IconCart, IconChat } from "./Icons.jsx";

/** Bottom bar on phones: the cart when it has items, WhatsApp otherwise. */
export default function MobileOrderBar() {
  const { t, path } = useLang();
  const [count, setCount] = useState(cartCount);

  useEffect(() => subscribeToCart(() => setCount(cartCount())), []);

  if (count > 0) {
    return (
      <div className="mobile-order-bar">
        <a href={path("commande")} className="mobile-cart-link">
          <IconCart size={18} />
          <span>
            {count} {count === 1 ? t("cart.item") : t("cart.items")} · {formatPrice(cartSubtotal())}
          </span>
          <span className="mobile-cart-cta">{t("cart.checkout")}</span>
        </a>
      </div>
    );
  }

  return (
    <div className="mobile-order-bar">
      <a
        href={waLink(SITE.whatsapp[0].number, t("hero.waMessage"))}
        className="btn btn-whatsapp btn-block"
        target="_blank"
        rel="noopener noreferrer"
      >
        <IconChat size={18} />
        {t("mobileBar.order")}
      </a>
    </div>
  );
}
