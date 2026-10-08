import { useLang } from "../lang-context.js";
import { SITE } from "../data/site.js";
import CtaBand from "../components/CtaBand.jsx";
import Picture from "../components/Picture.jsx";

export default function About() {
  const { lang, t } = useLang();
  const { cook } = SITE;

  return (
    <div className="page-about">
      <header className="page-hero">
        <h1>{t("about.title")}</h1>
        <p>{t("about.tagline")}</p>
      </header>

      <section className="about-section">
        <div className="container about-story">
          <div className="about-story-text">
            <h2>{t("about.storyTitle")}</h2>
            <p>{t("about.storyP1")}</p>
            <p>{t("about.storyP2")}</p>
          </div>
          <Picture
            src="/img/restaurant.jpg"
            alt={t("about.storyImgAlt")}
            className="about-story-img"
            sizes="(max-width: 1020px) 100vw, 460px"
          />
        </div>
      </section>

      {cook.confirmed ? (
        <section className="about-section">
          <div className={cook.image ? "container cook-block has-image" : "container cook-block"}>
            {cook.image ? (
              <Picture src={cook.image} alt={cook.name} className="cook-image" sizes="320px" />
            ) : null}
            <div className="cook-text">
              <h2>{t("about.cookTitle")}</h2>
              <p className="cook-name">{cook.name}</p>
              <p>{cook.story[lang]}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="about-section about-section-alt">
        <div className="container">
          <h2>{t("about.originsTitle")}</h2>
          <p className="section-subtitle">{t("about.originsSubtitle")}</p>
          <div className="origins-grid">
            {t("about.origins").map((origin) => (
              <article key={origin.region} className="origin-card">
                <p className="origin-region">{origin.region}</p>
                <h3 className="origin-dish">{origin.dish}</h3>
                <p className="origin-text">{origin.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="container">
          <h2>{t("about.valuesTitle")}</h2>
          <div className="values-grid">
            {t("about.values").map((value, index) => (
              <article key={value.title} className="value-card">
                <p className="value-number">{String(index + 1).padStart(2, "0")}</p>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </div>
  );
}
