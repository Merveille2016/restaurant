# Content to confirm with the restaurant

Items published on the site that still need the owner's approval.

## Manager (About page — `src/data/site.js` → `cook`)
- Name and role: **Nana Caroline, Gérante / Manager**.
- Origin: **Tombel, South-West**, taken from her public Facebook profile.
- Story text: short and factual. Ask her whether she wants to add how she learned to cook, or her favourite dish.
- No photo is shown. To add one, set `cook.image` to a file in `public/img/` and run `npm run images`.

## Videos (home page — `public/video/`)
- `presentation.mp4` comes from `video_res.mp4` (133 s). Its caption is "Bienvenue chez Mialine Gifted Hands".
- `message.mp4` comes from `video_res1.mp4` (59 s). Its caption is "Un mot de l'équipe".
- The captions were written without the audio being checked. Confirm who is speaking and adjust `videos.*` in `src/translations.js`.

## Ceremonies / catering (home page "Vos cérémonies", Contact)
- Source: the official flyer (`public/img/affiche.jpg`, taken from `video_res2.mp4`). It says "Contact us for your ceremonies" and "EST. 2026".
- The listed event types (birthdays, weddings, gatherings) are examples. Confirm them.
- The flyer shows a portrait. Confirm it can be published on the site.

## Still pending from before
- Final domain (`SITE.url`), delivery zones and fees, offers, testimonials.
