# Mialine Gifted Hands — Site vitrine

Site vitrine bilingue (français / anglais) du restaurant **Mialine Gifted Hands**,
cuisine traditionnelle camerounaise à **Carrefour Obili, Yaoundé (Cameroun)**.

Technologies : **React 19 + Vite 8**, aucune dépendance au-delà de React.
Routage par hash (`#/`, `#/menu`, `#/about`, `#/contact`) — fonctionne sur
n'importe quel hébergement statique, sans configuration serveur.

## Commandes

| Commande | Description |
|---|---|
| `npm install` | Installe les dépendances |
| `npm run dev` | Serveur de développement (http://localhost:5173) |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Prévisualise le build de production |
| `npm run lint` | Vérification ESLint |
| `npm run check` | Contrôles qualité (données du menu, images, HTML, i18n, texte, CSS) |

## Structure

```
index.html                  Point d'entrée : SEO, JSON-LD, polices Google
public/
  favicon.svg               Favicon (assiette verte & or)
  img/                      Toutes les photos (plats, boissons, salle)
src/
  main.jsx                  Point d'entrée React
  App.jsx                   Routeur par hash + coquille (header/footer)
  i18n.js                   Fournisseur de langue (LangProvider, useLang)
  translations.js           Dictionnaire FR / EN (tout le texte du site)
  whatsapp.js               Construction des liens et messages WhatsApp
  data/
    site.js                 CONFIGURATION : nom, adresse, numéros WhatsApp
    menu.js                 Plats, plats du jour, boissons (FR/EN + prix)
  components/
    Header.jsx, Footer.jsx, CtaBand.jsx, DishCard.jsx, Icons.jsx
  pages/
    Home.jsx, Menu.jsx, About.jsx, Contact.jsx
  index.css                 Reset + variables de design
  App.css                   Styles des composants
tools/                      Scripts de contrôle qualité (Node, zéro dépendance)
```

## Mise en production — à modifier

Tout passe par **`src/data/site.js`** :

- `whatsapp` : les numéros WhatsApp (format international, chiffres uniquement,
  sans `+`). Le premier numéro est celui utilisé par le bouton « Commander ».
- `mapQuery` : requête Google Maps pour la carte et le lien itinéraire.

Les **prix des plats** et les **plats du jour** se modifient dans
`src/data/menu.js` (chaque plat a un `id`, des prix en FCFA, des noms et
descriptions FR/EN, des indicateurs `spicy` / `veg` et une région d'origine).

Le texte de l'interface (horaires, offres, témoignages, histoire…) se modifie
dans `src/translations.js` — les clés FR et EN doivent rester identiques
(vérifié par `npm run check`).

## Commande via WhatsApp

Le site n'enregistre **aucune commande** : la page Contact construit un message
pré-rempli (nom, téléphone, commande, lieu de livraison) que le client envoie
lui-même via WhatsApp. Un bouton « Copier le message » sert de solution de
secours si l'ouverture de WhatsApp est bloquée.

## Bilinguisme

Français par défaut (marché de Yaoundé). Le sélecteur FR/EN de l'en-tête
change la langue de toute l'interface ; le choix est mémorisé dans
`localStorage` (`mgh-lang`). La balise `<html lang>` et le `<title>` sont mis
à jour automatiquement.

## Accessibilité

Navigation au clavier, lien d'évitement vers le contenu principal,
`aria-current` sur la page active, menu mobile avec `aria-expanded`,
contrastes conformes, `prefers-reduced-motion` respecté, textes alternatifs
explicites sur toutes les images.

## Contrôles qualité

`npm run check` exécute six vérifications (dossier `tools/`, Node sans
dépendance) :

- `check-menu-data` : ids uniques, 7 jours sans doublon, prix cohérents,
  noms/descriptions FR+EN présents, images existantes.
- `check-images` : chaque image référencée existe dans `public/img/`,
  aucun nom de fichier avec espace, images orphelines signalées.
- `check-html` : `lang`, viewport, title, meta description, JSON-LD,
  un seul `<h1>` par page.
- `check-i18n` : parité des clés FR/EN, aucune valeur vide, 7 noms de jours.
- `check-text` : caractères corrompus et coquilles interdits
  (« aand », « guiness », « Malaxèe », « bushmeat »…).
- `check-css` : chaque classe utilisée dans le JSX existe dans le CSS,
  toutes les variables CSS sont définies.

## Déploiement

`npm run build` produit un dossier `dist/` statique :

- **Netlify** : glisser-déposer `dist/`, ou `npx netlify-cli deploy`
- **Vercel** : `npx vercel`
- Tout hébergement statique (Apache, Nginx, GitHub Pages…) fonctionne :
  le routage par hash ne nécessite aucune règle de réécriture.

HTTPS automatique sur Netlify/Vercel.

## Avertissement

Les prix affichés sont **indicatifs** (mention légale en pied de page) et
doivent être confirmés par le restaurant. Les photos sont celles fournies
par le client ; un reportage photo professionnel est recommandé.
