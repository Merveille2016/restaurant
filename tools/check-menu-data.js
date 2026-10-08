import { dishes, dailySpecials, drinks, CATEGORIES } from "../src/data/menu.js";
import { imageExists, ok, fail } from "./lib.js";

const DAY_COUNT = 7;

function checkDishes(errors) {
  const ids = new Set();
  for (const dish of dishes) {
    if (ids.has(dish.id)) errors.push(`dish id duplicated: ${dish.id}`);
    ids.add(dish.id);

    if (!CATEGORIES.includes(dish.category)) {
      errors.push(`dish "${dish.id}": invalid category "${dish.category}"`);
    }
    if (typeof dish.price !== "number" || dish.price < 200 || dish.price > 10000) {
      errors.push(`dish "${dish.id}": price out of range (200-10000 FCFA)`);
    }
    for (const lang of ["fr", "en"]) {
      if (typeof dish.name?.[lang] !== "string" || dish.name[lang].trim().length < 2) {
        errors.push(`dish "${dish.id}": missing name.${lang}`);
      }
      if (typeof dish.desc?.[lang] !== "string" || dish.desc[lang].trim().length < 10) {
        errors.push(`dish "${dish.id}": missing desc.${lang}`);
      }
      if (dish.region && typeof dish.region[lang] !== "string") {
        errors.push(`dish "${dish.id}": missing region.${lang}`);
      }
    }
  }
}

function checkDaily(errors) {
  if (dailySpecials.length !== DAY_COUNT) {
    errors.push(`dailySpecials: expected ${DAY_COUNT} entries, found ${dailySpecials.length}`);
  }
  const days = new Set();
  for (const day of dailySpecials) {
    if (days.has(day.day)) errors.push(`dailySpecials: duplicated day index ${day.day}`);
    days.add(day.day);
    if (!Number.isInteger(day.day) || day.day < 0 || day.day > 6) {
      errors.push(`dailySpecials: invalid day index ${day.day}`);
    }
    if (!imageExists(day.image)) {
      errors.push(`dailySpecials day ${day.day}: image not found "${day.image}"`);
    }
    for (const lang of ["fr", "en"]) {
      const meals = day.meals?.[lang];
      if (!Array.isArray(meals) || meals.length === 0) {
        errors.push(`dailySpecials day ${day.day}: missing meals.${lang}`);
      }
    }
  }
  for (let i = 0; i < DAY_COUNT; i++) {
    if (!days.has(i)) errors.push(`dailySpecials: missing day index ${i}`);
  }
}

function checkDrinks(errors) {
  const ids = new Set();
  for (const drink of drinks) {
    if (ids.has(drink.id)) errors.push(`drink id duplicated: ${drink.id}`);
    ids.add(drink.id);
    if (typeof drink.price !== "number" || drink.price < 100 || drink.price > 10000) {
      errors.push(`drink "${drink.id}": price out of range`);
    }
    for (const lang of ["fr", "en"]) {
      if (typeof drink.name?.[lang] !== "string" || drink.name[lang].trim().length < 2) {
        errors.push(`drink "${drink.id}": missing name.${lang}`);
      }
    }
    if (!imageExists(drink.image)) {
      errors.push(`drink "${drink.id}": image not found "${drink.image}"`);
    }
  }
}

export function run() {
  const errors = [];
  checkDishes(errors);
  checkDaily(errors);
  checkDrinks(errors);
  return errors.length === 0
    ? ok("check-menu-data")
    : fail("check-menu-data", errors);
}
