import { useLang } from "../lang-context.js";
import { SITE } from "../data/site.js";
import { testimonials } from "../data/testimonials.js";
import { waLink } from "../whatsapp.js";
import CtaBand from "../components/CtaBand.jsx";
import Picture from "../components/Picture.jsx";
import SocialLinks from "../components/SocialLinks.jsx";
import TiktokEmbed from "../components/TiktokEmbed.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { IconChat } from "../components/Icons.jsx";

const GALLERY = [
  {
    src: "/img/achu.jpg",
    title: { fr: "Achu & soupe jaune", en: "Achu & yellow soup" },
    altFr: "Assiette d'achu avec soupe jaune",
    altEn: "Plate of achu with yellow soup",
  },
  {
    src: "/img/waterfufu-eru.jpg",
    title: { fr: "Eru & water fufu", en: "Eru & water fufu" },
    altFr: "Eru et water fufu traditionnels",
    altEn: "Traditional eru and water fufu",
  },
  {
    src: "/img/friedrice-chicken.jpg",
    title: { fr: "Riz sauté & poulet", en: "Fried rice & chicken" },
    altFr: "Riz sauté aux légumes avec poulet frit",
    altEn: "Vegetable fried rice with fried chicken",
  },
  {
    src: "/img/ekwang.jpg",
    title: { fr: "Ekwang", en: "Ekwang" },
    altFr: "Ekwang, râpes de cocoyam en sauce",
    altEn: "Ekwang, cocoyam rolls in sauce",
  },
  {
    src: "/img/ogbono-soup.jpg",
    title: { fr: "Soupe ogbono", en: "Ogbono soup" },
    altFr: "Soupe ogbono servie avec garri",
    altEn: "Ogbono soup served with garri",
  },
  {
    src: "/img/ndole.jpg",
    title: { fr: "Ndolé & igname", en: "Ndolé & yam" },
    altFr: "Ndolé aux arachides avec igname",
    altEn: "Groundnut ndolé with yam",
  },
];

const SPACE = [
  {
    src: "/img/salle-3.jpg",
    title: { fr: "La grande salle", en: "The main room" },
    altFr: "Grande salle avec tables, chaises habillées de blanc et plafond lumineux",
    altEn: "Main dining room with tables, white-covered chairs and a lit ceiling",
  },
  {
    src: "/img/salle-coin.jpg",
    title: { fr: "Le coin banquettes", en: "The booth corner" },
    altFr: "Banquettes vertes et rideaux en tissu traditionnel",
    altEn: "Green booths and traditional fabric curtains",
  },
  {
    src: "/img/bar.jpg",
    title: { fr: "Le bar", en: "The bar" },
    altFr: "Comptoir du bar et salle du restaurant",
    altEn: "Bar counter and dining room",
  },
  {
    src: "/img/salle-2.jpg",
    title: { fr: "Tables dressées", en: "Tables set" },
    altFr: "Tables dressées avec sets colorés et menus",
    altEn: "Tables set with colourful placemats and menus",
  },
  {
    src: "/img/banquettes.jpg",
    title: { fr: "Un espace intime", en: "A cosy space" },
    altFr: "Espace banquettes à l'abri des rideaux",
    altEn: "Booth area tucked behind curtains",
  },
  {
    src: "/img/escalier.jpg",
    title: { fr: "L'escalier néon", en: "The neon staircase" },
    altFr: "Escalier éclairé de lumières violettes menant à la salle",
    altEn: "Staircase lit in violet leading up to the dining room",
  },
];

const VIDEOS = [
  { src: "/video/presentation.mp4", poster: "/img/video-presentation.jpg", key: "videos.presentation" },
  { src: "/video/message.mp4", poster: "/img/video-message.jpg", key: "videos.message" },
];

export default function Home() {
  const { lang, t, path } = useLang();
  const reviews = testimonials.filter((item) => item.confirmed);

  return (
    <div className="page-home">
      <section className="hero">
        <Picture
          src="/img/home_page.jpg"
          alt=""
          className="hero-image"
          sizes="(max-width: 860px) 100vw, 50vw"
          loading="eager"
          fetchPriority="high"
        />
        <div className="hero-content">
          <img
            className="hero-logo"
            src="/img/logo-96.webp"
            srcSet="/img/logo-96.webp 96w, /img/logo-480.webp 480w"
            sizes="140px"
            alt={`Logo — ${SITE.name}`}
            width="140"
            height="140"
          />
          <h1>{SITE.name}</h1>
          <p className="hero-tagline">{t("hero.tagline")}</p>
          <div className="hero-actions">
            <a href={path("menu")} className="btn btn-accent">
              {t("hero.ctaMenu")}
            </a>
            <a
              href={waLink(SITE.whatsapp[0].number, t("hero.waMessage"))}
              className="btn btn-whatsapp"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconChat size={18} />
              {t("hero.ctaOrder")}
            </a>
          </div>
        </div>
      </section>

      {SITE.offersConfirmed ? (
        <section className="offers-band">
          <div className="container">
            <h2>{t("offers.title")}</h2>
            <div className="offers-grid">
              <div className="offer-card">
                <h3>{t("offers.lunch.title")}</h3>
                <p>{t("offers.lunch.text")}</p>
              </div>
              <div className="offer-card">
                <h3>{t("offers.family.title")}</h3>
                <p>{t("offers.family.text")}</p>
              </div>
              <div className="offer-card">
                <h3>{t("offers.delivery.title")}</h3>
                <p>{t("offers.delivery.text")}</p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="welcome-section">
        <div className="container narrow">
          <h2>{t("welcome.title")}</h2>
          <p>{t("welcome.text")}</p>
        </div>
      </section>

      <section className="gallery-section">
        <div className="container">
          <h2>{t("gallery.title")}</h2>
          <p className="section-subtitle">{t("gallery.subtitle")}</p>
          <div className="gallery-grid">
            {GALLERY.map((item) => (
              <figure key={item.src} className="gallery-item">
                <Picture
                  src={item.src}
                  alt={lang === "fr" ? item.altFr : item.altEn}
                  sizes="(max-width: 640px) 100vw, (max-width: 1020px) 50vw, 380px"
                />
                <figcaption className="gallery-caption">{item.title[lang]}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="space-section">
        <div className="container">
          <h2>{t("space.title")}</h2>
          <p className="section-subtitle">{t("space.subtitle")}</p>
          <div className="gallery-grid">
            {SPACE.map((item) => (
              <figure key={item.src} className="gallery-item">
                <Picture
                  src={item.src}
                  alt={lang === "fr" ? item.altFr : item.altEn}
                  sizes="(max-width: 640px) 100vw, (max-width: 1020px) 50vw, 380px"
                />
                <figcaption className="gallery-caption">{item.title[lang]}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="events-section">
        <div className="container events-block">
          <Picture
            src="/img/affiche.jpg"
            alt={t("events.imgAlt")}
            className="events-image"
            sizes="(max-width: 860px) 100vw, 420px"
          />
          <div className="events-text">
            <p className="events-kicker">{t("events.kicker")}</p>
            <h2>{t("events.title")}</h2>
            <p>{t("events.text")}</p>
            <h3>{t("events.signatureTitle")}</h3>
            <ul className="events-dishes">
              {t("events.dishes").map((dish) => (
                <li key={dish}>{dish}</li>
              ))}
            </ul>
            <a
              href={waLink(SITE.whatsapp[0].number, t("events.waMessage"))}
              className="btn btn-whatsapp"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconChat size={18} />
              {t("events.cta")}
            </a>
          </div>
        </div>
      </section>

      <section className="videos-section">
        <div className="container">
          <h2>{t("videos.title")}</h2>
          <p className="section-subtitle">{t("videos.subtitle")}</p>
          <div className="video-grid">
            {VIDEOS.map((video) => (
              <VideoCard
                key={video.src}
                src={video.src}
                poster={video.poster}
                title={t(video.key)}
                fallback={t("videos.unsupported")}
              />
            ))}
            <TiktokEmbed title={t("videos.tiktok")} />
          </div>
          <div className="videos-follow">
            <p>{t("social.title")}</p>
            <SocialLinks />
          </div>
        </div>
      </section>

      {reviews.length > 0 ? (
        <section className="testimonials-section">
          <div className="container">
            <h2>{t("testimonials.title")}</h2>
            <div className="testimonials-grid">
              {reviews.map((item) => (
                <blockquote key={item.author} className="testimonial-card">
                  <p className="stars" aria-hidden="true">★★★★★</p>
                  <p className="testimonial-text">{item.text[lang]}</p>
                  <footer className="testimonial-author">— {item.author}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand />
    </div>
  );
}
