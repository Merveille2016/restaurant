export const SITE = {
  name: "Mialine Gifted Hands",
  // Final domain, without a trailing slash. Used for canonical URLs, the
  // sitemap and social previews. PLACEHOLDER — see CONTENT-TO-CONFIRM.md.
  url: "https://mialinegiftedhands.com",
  city: "Yaoundé",
  country: { fr: "Cameroun", en: "Cameroon" },
  mapQuery: "Carrefour Obili, Yaoundé, Cameroun",
  whatsapp: [
    { label: "671 131 006", number: "237671131006" },
    { label: "672 464 364", number: "237672464364" },
  ],

  // Official accounts. The TikTok video is the one featured on the home page.
  social: {
    tiktok: {
      handle: "@caro.gifted.hands",
      url: "https://www.tiktok.com/@caro.gifted.hands",
      featuredVideoId: "7697506389287128340",
    },
    facebook: {
      name: "Mialine Gifted hands Restaurant & Bar",
      url: "https://www.facebook.com/profile.php?id=61584699217591",
    },
  },

  // Opening hours in Yaoundé time (24h clock), used for the "open now" status.
  hours: { opens: 7, closes: 23, timeZone: "Africa/Douala" },

  // Published Google Sheet (CSV) holding the daily specials. Leave empty to use
  // the defaults from menu.js. See README → « Plats du jour ».
  specialsSheetCsvUrl: "",

  // Set to true once the owner confirms the « Nos offres » deals, to show the
  // offers band on the home page again.
  offersConfirmed: false,

  // Delivery & payment panel on the Contact page. Hidden until confirmed.
  delivery: {
    confirmed: false,
    time: { fr: "30 à 45 minutes en moyenne", en: "30 to 45 minutes on average" },
    zones: [
      { name: "Obili, Ngoa-Ekellé", fee: 0 },
      { name: "Melen, Mendong, Biyem-Assi", fee: 500 },
      { name: "Centre-ville, Bastos, Essos", fee: 1000 },
    ],
    payments: ["cash", "mtn", "orange"],
  },

  // The manager's story on the About page. Name, role and home town only —
  // no photo or other personal details (see CONTENT-TO-CONFIRM.md).
  cook: {
    confirmed: true,
    name: "Nana Caroline",
    image: "",
    role: { fr: "Gérante", en: "Manager" },
    story: {
      fr: "Nana Caroline dirige Mialine Gifted Hands. Originaire de Tombel, dans le Sud-Ouest du Cameroun, elle met à l'honneur les saveurs de sa région — eru, ekwang, water fufu — aux côtés des grands classiques du pays : achu, kati-kati, ndolé, sauce escargots et soupe egusi.",
      en: "Nana Caroline runs Mialine Gifted Hands. Originally from Tombel, in Cameroon's South-West, she puts the flavours of her home region in the spotlight — eru, ekwang, water fufu — alongside the country's great classics: achu, kati-kati, ndolé, snail sauce and egusi soup.",
    },
  },
};

export function formatPrice(amount) {
  const rounded = Math.round(amount);
  const grouped = String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${grouped} FCFA`;
}

/** True when the restaurant is open right now, in Yaoundé time. */
export function isOpenNow(date = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone: SITE.hours.timeZone,
    }).format(date)
  );
  return hour >= SITE.hours.opens && hour < SITE.hours.closes;
}
