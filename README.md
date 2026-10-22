# Mialine Gifted Hands — Site vitrine + commande en ligne

Site bilingue (français / anglais) du restaurant **Mialine Gifted Hands**,
cuisine traditionnelle camerounaise à **Carrefour Obili, Yaoundé (Cameroun)**.

Technologies : **React 19 + Vite 8** (aucune dépendance au-delà de React) et
**Supabase** (Postgres + Auth + Edge Functions) pour la commande en ligne, le
paiement Mobile Money et le back-office.

La plateforme couvre :

- **Site vitrine** — accueil, menu, à propos, contact (routage par chemin,
  prérendu statique pour le SEO) ;
- **Commande en ligne** (`/commande`) — panier, zones de livraison avec frais,
  paiement **MTN Mobile Money**, **Orange Money** ou **à la livraison** ;
- **Back-office** (`/admin`) — commandes en direct (sonnerie + statuts),
  assignation des livreurs, édition du menu et des prix, réglages ;
- **Flux WhatsApp historique** — inchangé, toujours actif comme canal de secours.

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
  App.jsx                   Routeur + coquille (header/footer)
  i18n.jsx                  Fournisseur de langue (LangProvider, useLang)
  translations.js           Dictionnaire FR / EN (tout le texte du site)
  cart.js                   Panier (localStorage + événement)
  supabase.js               REST Supabase : RPC, zones, Edge Functions
  whatsapp.js               Construction des liens et messages WhatsApp
  data/
    site.js                 CONFIGURATION : nom, adresse, numéros WhatsApp
    menu.js                 Plats, plats du jour, boissons (FR/EN + prix)
    menu-store.js           Menu public : Supabase si configuré, sinon statique
  components/
    Header.jsx, Footer.jsx, CtaBand.jsx, DishCard.jsx, Icons.jsx,
    MobileOrderBar.jsx, Picture.jsx, OpenStatus.jsx
  pages/
    Home.jsx, Menu.jsx, About.jsx, Contact.jsx
    Checkout.jsx            Commande en ligne + paiement
    Admin.jsx               Back-office (connexion + onglets)
  admin/
    auth.js                 Connexion Supabase Auth (REST, sans supabase-js)
    api.js                  Appels authentifiés du back-office
    AdminOrders.jsx         Commandes en direct, dispatch livreurs
    AdminMenu.jsx           Édition plats / boissons / plats du jour
    AdminDrivers.jsx        Gestion des livreurs
    AdminSettings.jsx       Zones, frais, horaires, paiements
  index.css                 Reset + variables de design
  App.css                   Styles des composants
supabase/
  migrations/               Schéma, fonctions, RLS, commande en ligne
  functions/                Edge Functions (Deno) : paiements + notifications
  seed.sql                  Généré par node tools/generate-seed.js
  config.toml               Configuration de la pile locale
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

La page Contact construit un message pré-rempli (nom, téléphone, commande,
lieu de livraison) que le client envoie lui-même via WhatsApp — c'est le canal
historique, aucun compte n'est requis. Un bouton « Copier le message » sert de
solution de secours si l'ouverture de WhatsApp est bloquée.

En parallèle, la commande est enregistrée (au mieux, sans jamais bloquer le
client) dans la table `orders` via la fonction `public.place_order()` de
Supabase. Sans variables d'environnement Supabase, ou en cas d'échec de
l'appel, le site retrouve exactement son comportement WhatsApp seul.

## Commande en ligne (`/commande`)

Le client compose son panier depuis la page Menu (bouton « Ajouter » sur les
plats et les boissons), puis remplit le formulaire : nom, téléphone, zone de
livraison (frais automatiques depuis la table `delivery_zones`), lieu exact,
moyen de paiement.

Le panier n'envoie que des identifiants et des quantités : la fonction
`public.place_online_order()` **recalcule tout côté serveur** (prix, frais,
total) à partir des tables `dishes` / `drinks` / `delivery_zones` — un client
falsifié ne peut pas changer le montant. La fonction applique les mêmes
limites anti-spam que `place_order()` (3 commandes par numéro et par
10 minutes).

Moyens de paiement :

- **Espèces à la livraison** — fonctionne dès que Supabase est configuré ;
- **MTN Mobile Money** — le client saisit son numéro MoMo, reçoit une demande
  de paiement (USSD) et confirme avec son code PIN ;
- **Orange Money** — le client est redirigé vers la page de paiement Orange
  et valide par OTP (`#150#` ou l'app Max it).

Les méthodes affichées sont pilotées par `VITE_PAYMENT_METHODS`
(voir `.env.example`) : n'activez `mtn` / `orange` que lorsque les secrets des
Edge Functions correspondants sont configurés.

## Paiement en ligne — Edge Functions

Le site reste statique : tout appel aux APIs de paiement passe par des
**Supabase Edge Functions** (Deno, dossier `supabase/functions/`), où les
clés marchandes ne sont jamais exposées au navigateur.

| Fonction | Rôle |
|---|---|
| `payments-mtn-create` | Lance un `requesttopay` MTN MoMo Collections |
| `payments-mtn-check` | Sonde le statut MTN, marque la commande payée |
| `payments-orange-create` | Crée une session Orange Money Web Payment |
| `payments-orange-webhook` | Reçoit la notification finale Orange (notif_token vérifié) |
| `payments-orange-check` | Sonde le statut Orange (secours du webhook) |
| `notify-order` | Email/SMS au restaurant pour une commande à la livraison |

Déploiement :

```
supabase functions deploy payments-mtn-create
supabase functions deploy payments-mtn-check
supabase functions deploy payments-orange-create
supabase functions deploy payments-orange-webhook --no-verify-jwt
supabase functions deploy payments-orange-check
supabase functions deploy notify-order
supabase secrets set --env-file ./supabase/.env.functions
```

(`--no-verify-jwt` est requis pour le webhook Orange : Orange appelle
sans JWT Supabase ; la vérification se fait par le `notif_token`.)

### Activer MTN MoMo (Collections)

1. Créer un compte sur <https://momodeveloper.mtn.com> et tester en sandbox ;
2. Signer le contrat marchand **MTN Cameroun** (produit Collections) ;
3. Renseigner les secrets : `MTN_BASE_URL`, `MTN_SUBSCRIPTION_KEY`,
   `MTN_API_USER`, `MTN_API_KEY`, `MTN_TARGET_ENVIRONMENT`, `MTN_CURRENCY`
   (sandbox : `EUR` ; production Cameroun : `XAF`) ;
4. Ajouter `mtn` à `VITE_PAYMENT_METHODS` et redéployer le site.

### Activer Orange Money (Web Payment)

1. Créer un compte sur <https://developer.orange.com> (produit om-webpay) ;
2. Signer le contrat marchand **Orange Cameroun** (KYA) ;
3. Renseigner les secrets : `ORANGE_CLIENT_ID`, `ORANGE_CLIENT_SECRET`,
   `ORANGE_MERCHANT_KEY`, `ORANGE_COUNTRY_CODE` (`dev` en sandbox, `cm` en
   production), `ORANGE_CURRENCY` (`XAF`) ;
4. Ajouter `orange` à `VITE_PAYMENT_METHODS` et redéployer le site.

### Notifications au gérant

- **Email** (Resend, gratuit jusqu'à 100/jour) : `RESEND_API_KEY` +
  `NOTIFY_EMAIL_TO` (+ `NOTIFY_EMAIL_FROM` sur un domaine vérifié) ;
- **SMS** (Termii, optionnel) : `TERMII_API_KEY` + `NOTIFY_SMS_TO` ;
- **Tableau de bord** : sonnerie + surbrillance à chaque nouvelle commande
  (polling toutes les 15 s), quoi qu'il arrive.

## Back-office (`/admin`)

Espace protégé par **Supabase Auth** (rôles `admin` / `editor` via
`public.profiles` + RLS `public.is_admin()`). En local, le seed crée
`admin@mialinegiftedhands.com` avec le mot de passe de développement
(`SUPABASE_ADMIN_PASSWORD`, par défaut `dev-admin-password`).

Sur un projet hébergé : créer l'utilisateur dans Supabase Studio
(Authentication → Users), puis le promouvoir une seule fois en SQL :

```sql
insert into public.profiles (user_id, email, role)
values ('<uuid-du-user>', '<email>', 'admin')
on conflict (user_id) do update set role = 'admin';
```

Onglets :

- **Commandes** — liste rafraîchie toutes les 15 s, filtres (en cours /
  toutes / terminées), badges de paiement, workflow
  `nouvelle → confirmée → en préparation → en livraison → livrée`
  (ou annulée), assignation d'un livreur, boutons Appel / WhatsApp client ;
- **Menu** — plats (prix, noms et descriptions FR/EN, allergènes, photos,
  confirmé/actif), boissons, plats du jour. La source de vérité du site
  devient la base : le menu public se met à jour au rechargement ;
- **Livreurs** — ajouter / modifier / retirer les livreurs (nom, téléphone) ;
- **Réglages** — zones et frais de livraison, horaires, paiements acceptés,
  numéros WhatsApp.

## Base de données (Supabase)

Le dossier `supabase/` contient le backend :

- `migrations/` — schéma, fonctions/trigger, politiques RLS + durcissement
  (limites de longueur et anti-spam sur `place_order`), puis commande en
  ligne (`order_items`, `drivers`, `place_online_order`, `get_order_public`) ;
- `functions/` — Edge Functions Deno (paiements MTN MoMo / Orange Money,
  notifications email/SMS) ;
- `seed.sql` — fichier **généré** par `node tools/generate-seed.js` depuis
  `src/data/*.js` (le menu en base sert de point de départ ; une fois le
  back-office utilisé, la base devient la source de vérité) ;
- `config.toml` — configuration de la pile locale.

Développement local :

```
supabase start          # démarre la pile locale (Docker)
supabase db reset        # applique migrations + seed
supabase status          # affiche l'URL de l'API et la clé anon locale
```

Copiez ensuite ces valeurs dans `.env.local` (voir `.env.example`) :

- `VITE_SUPABASE_URL` — URL de l'API du projet ;
- `VITE_SUPABASE_ANON_KEY` — clé publique « anon », protégée par les
  politiques RLS. **Ne jamais** mettre la clé `service_role` dans une
  variable `VITE_` : elle serait livrée à chaque navigateur ;
- `VITE_PAYMENT_METHODS` — moyens de paiement proposés au checkout
  (`cash` seul au départ, puis `cash,mtn,orange`).

Le compte administrateur local créé par le seed utilise le mot de passe de
développement `dev-admin-password` (ou la variable d'environnement
`SUPABASE_ADMIN_PASSWORD` de `generate-seed.js`). À ne jamais réutiliser sur
un projet hébergé.

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
