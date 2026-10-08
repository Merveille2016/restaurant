import { useLang } from "../lang-context.js";
import { SITE } from "../data/site.js";
import { waLink } from "../whatsapp.js";
import { IconChat } from "./Icons.jsx";

/** Bottom "Order on WhatsApp" bar, shown on phones only (see App.css). */
export default function MobileOrderBar() {
  const { t } = useLang();

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
