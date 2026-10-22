import { useLang } from "../lang-context.js";
import { SITE } from "../data/site.js";
import CtaBand from "../components/CtaBand.jsx";
import Picture from "../components/Picture.jsx";

const STRIP = [
  {
    src: "/img/banquettes-2.jpg",
    altFr: "Banquettes vertes et table dressée",
    altEn: "Green booths and a set table",
  },
  {
    src: "/img/salle-1.jpg",
    altFr: "Salle avec plafond lumineux et gazon au sol",
    altEn: "Dining room with a lit ceiling and turf floor",
  },
  {
    src: "/img/escalier.jpg",
    altFr: "Escalier éclairé de lumières violettes",
    altEn: "Staircase lit in violet",
  },
];

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
            src="/img/salle-coin.jpg"
            alt={t("about.storyImgAlt")}
            className="about-story-img"
            sizes="(max-width: 1020px) 100vw, 460px"
          />
        </div>
        <div className="container about-strip">
          {STRIP.map((item) => (
            <Picture
              key={item.src}
              src={item.src}
              alt={lang === "fr" ? item.altFr : item.altEn}
              className="about-strip-img"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
          ))}
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
              {cook.role ? <p className="cook-role">{cook.role[lang]}</p> : null}
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
