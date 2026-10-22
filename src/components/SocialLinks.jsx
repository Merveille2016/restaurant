import { useLang } from "../lang-context.js";
import { SITE } from "../data/site.js";
import { IconFacebook, IconTiktok } from "./Icons.jsx";

export default function SocialLinks({ className = "social-links" }) {
  const { t } = useLang();
  const { tiktok, facebook } = SITE.social;

  return (
    <div className={className}>
      <a href={tiktok.url} className="social-link" target="_blank" rel="noopener noreferrer">
        <IconTiktok size={18} />
        <span>
          {t("social.tiktok")} <span className="social-handle">{tiktok.handle}</span>
        </span>
      </a>
      <a href={facebook.url} className="social-link" target="_blank" rel="noopener noreferrer">
        <IconFacebook size={18} />
        <span>{t("social.facebook")}</span>
      </a>
    </div>
  );
}
