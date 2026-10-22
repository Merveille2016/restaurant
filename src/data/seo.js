// Per-page titles and descriptions. Shared by the app (document.title) and
// tools/prerender.js (static HTML for each route), so keep it plain JS.

export const LANGS = ["fr", "en"];
export const ROUTES = ["", "menu", "about", "contact", "commande", "admin"];

/** Routes that must not be indexed by search engines. */
export const NOINDEX_ROUTES = ["admin"];

/** "/menu" for French, "/en/menu" for English; "/" and "/en/" for home. */
export function routePath(lang, route) {
  const prefix = lang === "en" ? "/en" : "";
  if (!route) return `${prefix}/`;
  return `${prefix}/${route}`;
}

export const PAGES = {
  fr: {
    "": {
      title: "Mialine Gifted Hands — Restaurant camerounais à Carrefour Obili, Yaoundé",
      description:
        "Restaurant camerounais à Carrefour Obili, Yaoundé : eru, achu, ndolé, koki, poulet DG, mbongo tchobi, soya… Cuisine traditionnelle préparée chaque jour. Sur place, à emporter ou en livraison.",
    },
    menu: {
      title: "Menu et plats du jour — Mialine Gifted Hands, Yaoundé",
      description:
        "Le menu complet : eru & water fufu, achu & soupe jaune, ndolé, ekwang, mbongo tchobi, koki, soya, boissons. Prix en FCFA, commande sur WhatsApp. Carrefour Obili, Yaoundé.",
    },
    about: {
      title: "Notre histoire — Mialine Gifted Hands, cuisine camerounaise",
      description:
        "Une cuisine camerounaise maison à Carrefour Obili : des plats du Nord-Ouest, du Sud-Ouest, du Littoral, du Centre et du Sud, préparés chaque jour avec des produits des marchés de Yaoundé.",
    },
    contact: {
      title: "Contact, livraison et itinéraire — Mialine Gifted Hands, Yaoundé",
      description:
        "Commandez sur WhatsApp au 671 131 006 ou 672 464 364. Livraison à domicile et au bureau à Yaoundé. Ouvert 7j/7 de 7h à 23h, Carrefour Obili.",
    },
    commande: {
      title: "Commander en ligne — Mialine Gifted Hands, Yaoundé",
      description:
        "Commandez en ligne : composez votre panier, choisissez votre zone de livraison à Yaoundé et payez par MTN Mobile Money, Orange Money ou à la livraison.",
    },
    admin: {
      title: "Gestion — Mialine Gifted Hands",
      description: "Espace de gestion du restaurant : commandes, menu, livreurs et réglages.",
    },
  },
  en: {
    "": {
      title: "Mialine Gifted Hands — Cameroonian Restaurant at Carrefour Obili, Yaoundé",
      description:
        "Cameroonian restaurant at Carrefour Obili, Yaoundé: eru, achu, ndolé, koki, poulet DG, mbongo tchobi, soya… Traditional food cooked fresh every day. Dine in, take away or delivered.",
    },
    menu: {
      title: "Menu & Daily Specials — Mialine Gifted Hands, Yaoundé",
      description:
        "Full menu: eru & water fufu, achu & yellow soup, ndolé, ekwang, mbongo tchobi, koki, soya and drinks. Prices in FCFA, order on WhatsApp. Carrefour Obili, Yaoundé.",
    },
    about: {
      title: "Our Story — Mialine Gifted Hands, Cameroonian Cuisine",
      description:
        "Home-style Cameroonian food at Carrefour Obili: dishes from the North-West, South-West, Littoral, Centre and South, cooked daily with produce from Yaoundé's markets.",
    },
    contact: {
      title: "Contact, Delivery & Directions — Mialine Gifted Hands, Yaoundé",
      description:
        "Order on WhatsApp at 671 131 006 or 672 464 364. Home and office delivery in Yaoundé. Open 7 days, 7am to 11pm, Carrefour Obili.",
    },
    commande: {
      title: "Order Online — Mialine Gifted Hands, Yaoundé",
      description:
        "Order online: build your cart, pick your delivery area in Yaoundé and pay with MTN Mobile Money, Orange Money or cash on delivery.",
    },
    admin: {
      title: "Management — Mialine Gifted Hands",
      description: "Restaurant management area: orders, menu, drivers and settings.",
    },
  },
};
