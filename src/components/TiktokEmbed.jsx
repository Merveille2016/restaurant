import { useState } from "react";
import { useLang } from "../lang-context.js";
import { SITE } from "../data/site.js";
import { IconPlay, IconTiktok } from "./Icons.jsx";

// Click-to-load facade: TikTok's player (and its cookies and scripts) is only
// requested once the visitor asks for it, keeping the first load light.
export default function TiktokEmbed({ title }) {
  const { t } = useLang();
  const [active, setActive] = useState(false);
  const { handle, url, featuredVideoId } = SITE.social.tiktok;

  return (
    <figure className="video-card">
      {active ? (
        <iframe
          className="tiktok-frame"
          src={`https://www.tiktok.com/embed/v2/${featuredVideoId}`}
          title={title}
          allow="encrypted-media; fullscreen"
          allowFullScreen
        />
      ) : (
        <div className="tiktok-facade">
          <IconTiktok size={44} />
          <p className="tiktok-handle">{handle}</p>
          <button type="button" className="btn btn-accent" onClick={() => setActive(true)}>
            <IconPlay size={16} />
            {t("social.tiktokPlay")}
          </button>
          <p className="tiktok-note">{t("social.tiktokNote")}</p>
          <a href={url} className="tiktok-link" target="_blank" rel="noopener noreferrer">
            {t("social.tiktokOpen")}
          </a>
        </div>
      )}
      <figcaption className="video-caption">{title}</figcaption>
    </figure>
  );
}
