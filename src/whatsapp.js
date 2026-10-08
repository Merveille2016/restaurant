import { SITE, formatPrice } from "./data/site.js";

export function waLink(number, message) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function dishOrderMessage(lang, dish) {
  if (lang === "fr") {
    return `Bonjour Mialine Gifted Hands ! Je voudrais commander : ${dish.name.fr} (${formatPrice(dish.price)}).`;
  }
  return `Hello Mialine Gifted Hands! I would like to order: ${dish.name.en} (${formatPrice(dish.price)}).`;
}

export function deliveryOrderMessage(lang, { name, phone, order, location }) {
  if (lang === "fr") {
    return [
      "Bonjour Mialine Gifted Hands !",
      "Je souhaite commander en livraison :",
      "",
      `Commande : ${order}`,
      `Lieu de livraison : ${location}`,
      "",
      `Nom : ${name}`,
      `Téléphone : ${phone}`,
    ].join("\n");
  }
  return [
    "Hello Mialine Gifted Hands!",
    "I would like to place a delivery order:",
    "",
    `Order: ${order}`,
    `Delivery location: ${location}`,
    "",
    `Name: ${name}`,
    `Phone: ${phone}`,
  ].join("\n");
}

export function reservationMessage(lang) {
  if (lang === "fr") {
    return [
      "Bonjour Mialine Gifted Hands !",
      "Je souhaite réserver :",
      "",
      "Date : ",
      "Heure : ",
      "Nombre de personnes : ",
      "Occasion (anniversaire, njangi, bureau…) : ",
      "Sur place ou à livrer : ",
    ].join("\n");
  }
  return [
    "Hello Mialine Gifted Hands!",
    "I would like to book:",
    "",
    "Date: ",
    "Time: ",
    "Number of people: ",
    "Occasion (birthday, njangi, office…): ",
    "Dine in or delivered: ",
  ].join("\n");
}

export function primaryWhatsApp() {
  return SITE.whatsapp[0];
}
