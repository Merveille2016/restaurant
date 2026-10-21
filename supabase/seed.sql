-- Mialine Gifted Hands — seed data
-- GENERATED FILE — do not edit by hand.
-- Regenerate with: node tools/generate-seed.js
-- Source of truth: src/data/menu.js, site.js, testimonials.js, glossary.js

begin;

-- Categories
insert into public.categories (slug, name_fr, name_en, sort_order) values ('breakfast', 'Petit-déjeuner', 'Breakfast', 0) on conflict (slug) do nothing;
insert into public.categories (slug, name_fr, name_en, sort_order) values ('traditional', 'Plats traditionnels', 'Traditional dishes', 1) on conflict (slug) do nothing;
insert into public.categories (slug, name_fr, name_en, sort_order) values ('popular', 'Plats populaires', 'Popular dishes', 2) on conflict (slug) do nothing;

-- Dishes (confirmed: false = suggestion not shown on the site)
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'bhb', 'breakfast', 500, false, true, false,
  array[]::text[], 'Partout au Cameroun', 'All over Cameroon',
  'Beignets, haricots & bouillie (BHB)', 'Puff-puff, beans & pap (BHB)', 'Le petit-déjeuner de Yaoundé : beignets chauds, haricots rouges en sauce et bouillie de maïs.', 'Yaoundé''s breakfast: hot puff-puff, red beans in sauce and corn pap.',
  null, 0
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'spaghetti-omelette', 'breakfast', 700, false, true, false,
  array[]::text[], null, null,
  'Spaghetti-omelette', 'Spaghetti omelette', 'Spaghetti sautés à la tomate et aux oignons, servis avec une omelette.', 'Spaghetti tossed with tomato and onions, served with an omelette.',
  null, 1
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'bouillie', 'breakfast', 300, false, true, false,
  array[]::text[], null, null,
  'Bouillie de maïs', 'Corn pap', 'Bouillie chaude de maïs, légèrement sucrée.', 'Warm corn porridge, lightly sweetened.',
  null, 2
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'eru', 'traditional', 2000, true, false, true,
  array['fish']::text[], 'Sud-Ouest (Manyu)', 'South-West (Manyu)',
  'Eru & water fufu', 'Eru & water fufu', 'Feuilles de gnetum finement émincées, mijotées à l''huile de palme rouge avec viande et poisson fumé.', 'Finely shredded gnetum leaves simmered in red palm oil with meat and smoked fish.',
  '/img/waterfufu-eru.jpg', 3
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'achu', 'traditional', 2000, true, false, true,
  array[]::text[], 'Nord-Ouest', 'North-West',
  'Achu & soupe jaune', 'Achu & yellow soup', 'Pâte de taro écrasée servie avec la célèbre soupe jaune épicée, poulet et tripes.', 'Pounded taro paste served with the famous spicy yellow limestone soup, chicken and tripe.',
  '/img/achu.jpg', 4
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'ndole', 'traditional', 2000, false, false, true,
  array['peanut', 'shellfish']::text[], 'Littoral', 'Littoral',
  'Ndolé & igname', 'Ndolé & yam', 'Le plat national : feuilles de ndolé amères mijotées aux arachides, crevettes et bœuf.', 'Cameroon''s national dish: bitter ndolé leaves stewed with groundnuts, shrimp and beef.',
  '/img/ndole.jpg', 5
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'ekwang', 'traditional', 2000, true, false, true,
  array['fish']::text[], 'Sud-Ouest', 'South-West',
  'Ekwang', 'Ekwang', 'Râpes de cocoyam roulées à la main, mijotées lentement dans une sauce épicée au poisson fumé.', 'Hand-rolled grated cocoyam, slowly simmered in a spicy smoked-fish sauce.',
  '/img/ekwang.jpg', 6
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'khati-khati', 'traditional', 1500, true, false, true,
  array[]::text[], 'Nord-Ouest', 'North-West',
  'Khati khati & fufu de maïs', 'Khati khati & corn fufu', 'Poulet sauté aux épices du Grassfields, servi avec fufu de maïs.', 'Chicken sautéed in Grassfields spices, served with corn fufu.',
  null, 7
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'mbongo-tchobi', 'traditional', 2500, true, false, true,
  array['fish']::text[], 'Centre (Bassa)', 'Centre (Bassa)',
  'Mbongo tchobi & igname blanche', 'Mbongo tchobi & white yam', 'Ragoût noir épais aux épices mbongo, viande et poisson, servi avec igname blanche.', 'Thick black mbongo-spice stew with meat and fish, served with white yam.',
  null, 8
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'koki', 'traditional', 1000, false, true, true,
  array[]::text[], 'Centre & Sud', 'Centre & South',
  'Koki & plantain mûr', 'Koki & ripe plantain', 'Gâteau de haricots cuit à la vapeur dans des feuilles de bananier, servi avec plantain mûr.', 'Steamed bean cake wrapped in banana leaves, served with ripe plantain.',
  null, 9
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'okro', 'traditional', 1500, false, false, true,
  array['fish']::text[], 'Partout au Cameroun', 'All over Cameroon',
  'Soupe d''okra & garri', 'Okra soup & garri', 'Gombo frais coupé, mijoté avec poisson fumé et viande, servi avec garri ou fufu.', 'Fresh sliced okra stewed with smoked fish and meat, served with garri or fufu.',
  '/img/okro.jpg', 10
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'ogbono', 'traditional', 1500, false, false, true,
  array['fish']::text[], 'Partout au Cameroun', 'All over Cameroon',
  'Soupe ogbono & garri', 'Ogbono soup & garri', 'Soupe veloutée aux graines d''ogbono moulues, avec poisson et viande.', 'Velvety soup of ground ogbono seeds with fish and meat.',
  '/img/ogbono-soup.jpg', 11
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'egusi', 'traditional', 1500, true, false, true,
  array[]::text[], 'Nord-Ouest', 'North-West',
  'Soupe egusi & kumkum', 'Egusi soup & kumkum', 'Soupe aux graines de courge grillées et épicées, servie avec kumkum (pâte de maïs).', 'Spiced roasted melon-seed soup served with kumkum (corn fufu).',
  null, 12
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'okomobong', 'traditional', 1500, true, false, true,
  array[]::text[], 'Centre', 'Centre',
  'Okomobong & plantain', 'Okomobong & plantain', 'Ragoût traditionnel du Centre : viande fondante, épices locales et plantain.', 'Traditional Centre-region stew: tender meat, local spices and plantain.',
  null, 13
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'pepper-soup', 'traditional', 1500, true, false, true,
  array['fish']::text[], 'Partout au Cameroun', 'All over Cameroon',
  'Pepper soup', 'Pepper soup', 'Bouillon chaud et parfumé au poisson, à la chèvre ou au bœuf.', 'Hot, fragrant broth with fish, goat or beef.',
  null, 14
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'porridge-cocoyam', 'traditional', 1000, false, true, true,
  array['fish']::text[], 'Nord-Ouest', 'North-West',
  'Porridge de cocoyam', 'Cocoyam porridge', 'Cocoyam fondant mijoté aux épices douces, avec poisson fumé (option végétarienne).', 'Soft cocoyam slow-cooked in mild spices with smoked fish (vegetarian option).',
  null, 15
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'beans', 'traditional', 1000, false, true, true,
  array[]::text[], 'Partout au Cameroun', 'All over Cameroon',
  'Haricots blancs & riz ou plantain', 'White beans & rice or plantain', 'Haricots blancs mijotés à l''huile de palme, servis avec riz ou plantain.', 'White beans stewed in palm oil, served with rice or plantain.',
  null, 16
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'poulet-dg', 'traditional', 2500, false, false, true,
  array[]::text[], 'Cameroun', 'Cameroon',
  'Poulet DG', 'Poulet DG (Directeur Général chicken)', 'Poulet sauté aux plantains doux, légumes et épices — le favori des grandes occasions.', 'Chicken sautéed with sweet plantains, vegetables and spices — the celebration favourite.',
  null, 17
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'plantain-malaxe', 'traditional', 1500, false, true, true,
  array[]::text[], 'Partout au Cameroun', 'All over Cameroon',
  'Plantain malaxé', 'Mashed plantain (malaxé)', 'Plantains mûrs écrasés et mijotés à l''huile de palme, oignons et épices.', 'Mashed ripe plantains simmered in palm oil with onions and spices.',
  null, 18
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'fried-rice', 'popular', 2000, false, false, true,
  array[]::text[], null, null,
  'Riz sauté & poulet frit', 'Fried rice & fried chicken', 'Riz sauté aux légumes, servi avec poulet frit et salade fraîche.', 'Vegetable fried rice served with fried chicken and fresh salad.',
  '/img/friedrice-chicken.jpg', 19
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'rice-stew', 'popular', 1000, false, false, true,
  array[]::text[], null, null,
  'Riz & sauce tomate', 'Rice & tomato stew', 'Riz blanc accompagné d''une sauce tomate mijotée à la viande.', 'White rice with a slow-cooked meat tomato stew.',
  '/img/rice-stew.jpg', 20
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'snails', 'popular', 2000, true, false, true,
  array['mollusc']::text[], null, null,
  'Escargots & riz ou dodo', 'Snails & rice or dodo', 'Escargots sautés aux épices, servis avec riz ou plantain frit (dodo).', 'Spiced sautéed snails served with rice or fried plantain (dodo).',
  '/img/snails.jpg', 21
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'grilled-fish', 'popular', 2500, true, false, true,
  array['fish']::text[], null, null,
  'Poisson braisé & plantain', 'Grilled fish & plantain', 'Poisson entier braisé, mariné aux épices du terroir, servi avec plantain ou dodo.', 'Whole grilled fish marinated in local spices, served with plantain or dodo.',
  null, 22
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'fried-fish', 'popular', 2500, false, false, true,
  array['fish']::text[], null, null,
  'Poisson frit & dodo', 'Fried fish & dodo', 'Poisson frit croustillant servi avec plantain frit (dodo).', 'Crispy fried fish served with fried plantain (dodo).',
  null, 23
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'goat', 'popular', 2500, false, false, true,
  array[]::text[], null, null,
  'Viande de chèvre', 'Goat meat', 'Chèvre tendre servie mijotée ou grillée, selon votre préférence.', 'Tender goat meat served stewed or grilled, your choice.',
  null, 24
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'beefsteak', 'popular', 2000, false, false, true,
  array[]::text[], null, null,
  'Beefsteak & pommes ou plantain', 'Beefsteak & potatoes or plantain', 'Steak de bœuf sauté, servi avec pommes de terre sautées ou dodo.', 'Sautéed beef steak served with sautéed potatoes or dodo.',
  null, 25
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'pork', 'popular', 2000, false, false, true,
  array[]::text[], null, null,
  'Porc frit & pommes ou plantain', 'Fried pork & potatoes or plantain', 'Porc frit croustillant, servi avec pommes de terre sautées ou dodo.', 'Crispy fried pork served with sautéed potatoes or dodo.',
  null, 26
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'chicken', 'popular', 2000, false, false, true,
  array[]::text[], null, null,
  'Poulet frit & pommes ou plantain', 'Fried chicken & potatoes or plantain', 'Poulet frit doré et croustillant, servi avec pommes de terre ou dodo.', 'Golden crispy fried chicken served with potatoes or fried plantain.',
  null, 27
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'liver', 'popular', 1500, false, false, true,
  array[]::text[], null, null,
  'Sauce de foie & riz ou plantain', 'Liver sauce & rice or plantain', 'Foie sauté aux oignons et épices, servi avec riz ou plantain mûr.', 'Liver sautéed with onions and spices, served with rice or ripe plantain.',
  null, 28
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'hotpot', 'popular', 2500, true, false, true,
  array[]::text[], null, null,
  'Hotpot', 'Hotpot', 'Assortiment de viandes mijoté lentement aux épices du terroir.', 'An assortment of meats slow-cooked in local spices.',
  null, 29
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'seafood', 'popular', 2500, false, false, true,
  array['shellfish', 'mollusc']::text[], null, null,
  'Fruits de mer', 'Seafood', 'Assortiment de fruits de mer sautés aux épices douces.', 'An assortment of seafood sautéed in mild spices.',
  null, 30
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'soya', 'popular', 500, true, false, true,
  array[]::text[], 'Street food', 'Street food',
  'Soya (brochette de bœuf)', 'Soya (beef skewer)', 'Brochettes de bœuf grillées aux épices — la reine du street food camerounais.', 'Spiced grilled beef skewers — the queen of Cameroonian street food.',
  null, 31
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'taro-sauce-jaune', 'traditional', 2000, true, false, false,
  array[]::text[], 'Ouest', 'West',
  'Taro & sauce jaune', 'Taro & yellow sauce', 'Taro pilé servi avec la sauce jaune de l''Ouest, viande et peau de bœuf.', 'Pounded taro with the West''s yellow sauce, meat and cow skin.',
  null, 32
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'kondre', 'traditional', 2500, true, false, false,
  array[]::text[], 'Ouest', 'West',
  'Kondrè', 'Kondrè', 'Ragoût de plantain mûr et de viande aux épices de l''Ouest, le plat des fêtes bamiléké.', 'Ripe plantain and meat stew with West-region spices, the Bamiléké celebration dish.',
  null, 33
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'kwem', 'traditional', 1500, false, false, false,
  array['peanut']::text[], 'Est', 'East',
  'Kwem & bâton de manioc', 'Kwem & cassava stick', 'Feuilles de manioc pilées, mijotées à l''huile de palme et aux arachides, avec bâton de manioc.', 'Pounded cassava leaves simmered in palm oil and groundnuts, with cassava stick.',
  null, 34
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'couscous-gombo', 'traditional', 1500, false, false, false,
  array[]::text[], 'Nord & Adamaoua', 'North & Adamawa',
  'Couscous de maïs & sauce gombo', 'Corn couscous & okra sauce', 'Couscous de maïs du Nord servi avec une sauce gombo gluante à la viande séchée.', 'Northern corn couscous served with a silky okra sauce and dried meat.',
  null, 35
) on conflict (slug) do nothing;
insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (
  'nyamagoro', 'traditional', 2000, false, false, false,
  array[]::text[], null, null,
  'Nyamagoro', 'Nyamagoro', 'Description à compléter avec la cuisine (plat servi le samedi).', 'Description to be completed with the kitchen (served on Saturdays).',
  null, 36
) on conflict (slug) do nothing;

-- Drinks
insert into public.drinks (slug, name_fr, name_en, price_fcfa, image, sort_order) values (
  'castel', 'Castel', 'Castel', 800, '/img/castel.jpg', 0
) on conflict (slug) do nothing;
insert into public.drinks (slug, name_fr, name_en, price_fcfa, image, sort_order) values (
  '33-export', '33 Export', '33 Export', 800, '/img/33-export.jpg', 1
) on conflict (slug) do nothing;
insert into public.drinks (slug, name_fr, name_en, price_fcfa, image, sort_order) values (
  'mutzig', 'Mutzig', 'Mutzig', 800, '/img/mutzig.jpg', 2
) on conflict (slug) do nothing;
insert into public.drinks (slug, name_fr, name_en, price_fcfa, image, sort_order) values (
  'beaufort', 'Beaufort', 'Beaufort', 800, '/img/beaufort.jpg', 3
) on conflict (slug) do nothing;
insert into public.drinks (slug, name_fr, name_en, price_fcfa, image, sort_order) values (
  'kadji', 'Kadji', 'Kadji', 800, '/img/kadji.jpg', 4
) on conflict (slug) do nothing;
insert into public.drinks (slug, name_fr, name_en, price_fcfa, image, sort_order) values (
  'doppel', 'Doppel', 'Doppel', 800, '/img/doppel.jpg', 5
) on conflict (slug) do nothing;
insert into public.drinks (slug, name_fr, name_en, price_fcfa, image, sort_order) values (
  'guinness-smooth', 'Guinness Smooth', 'Guinness Smooth', 1000, '/img/smooth.jpg', 6
) on conflict (slug) do nothing;
insert into public.drinks (slug, name_fr, name_en, price_fcfa, image, sort_order) values (
  'guinness-small', 'Petit Guinness', 'Small Guinness', 900, '/img/guinness-small.jpg', 7
) on conflict (slug) do nothing;
insert into public.drinks (slug, name_fr, name_en, price_fcfa, image, sort_order) values (
  'guinness-grand', 'Grand Guinness', 'Large Guinness', 1400, '/img/guinness-grand.jpg', 8
) on conflict (slug) do nothing;
insert into public.drinks (slug, name_fr, name_en, price_fcfa, image, sort_order) values (
  'malta', 'Malta', 'Malta', 750, '/img/malta.jpg', 9
) on conflict (slug) do nothing;
insert into public.drinks (slug, name_fr, name_en, price_fcfa, image, sort_order) values (
  'smirnoff', 'Smirnoff Ice', 'Smirnoff Ice', 800, '/img/ice.jpg', 10
) on conflict (slug) do nothing;
insert into public.drinks (slug, name_fr, name_en, price_fcfa, image, sort_order) values (
  'vimto', 'Vimto', 'Vimto', 1000, '/img/vimto.jpg', 11
) on conflict (slug) do nothing;
insert into public.drinks (slug, name_fr, name_en, price_fcfa, image, sort_order) values (
  'orangina', 'Orangina', 'Orangina', 1000, '/img/orangina.jpg', 12
) on conflict (slug) do nothing;
insert into public.drinks (slug, name_fr, name_en, price_fcfa, image, sort_order) values (
  'djino', 'Djino', 'Djino', 750, '/img/djino.jpg', 13
) on conflict (slug) do nothing;
insert into public.drinks (slug, name_fr, name_en, price_fcfa, image, sort_order) values (
  'big-juice', 'Big Juice', 'Big Juice', 600, '/img/big-juice.jpg', 14
) on conflict (slug) do nothing;
insert into public.drinks (slug, name_fr, name_en, price_fcfa, image, sort_order) values (
  'water', 'Eau minérale', 'Mineral water', 500, '/img/water.jpg', 15
) on conflict (slug) do nothing;

-- Daily specials (day 0 = Monday)
insert into public.daily_specials (day_of_week, meals_fr, meals_en, image) values (
  0, array['Achu / taro', 'Eru & water fufu', 'Riz sauté & poulet', 'Khati khati & fufu de maïs']::text[], array['Achu / taro', 'Eru & water fufu', 'Fried rice & chicken', 'Khati khati & corn fufu']::text[], '/img/friedrice-chicken.jpg'
) on conflict (day_of_week) do nothing;
insert into public.daily_specials (day_of_week, meals_fr, meals_en, image) values (
  1, array['Achu / taro', 'Eru & water fufu', 'Riz sauté & poulet', 'Khati khati & fufu de maïs', 'Ekwang']::text[], array['Achu / taro', 'Eru & water fufu', 'Fried rice & chicken', 'Khati khati & corn fufu', 'Ekwang']::text[], '/img/ekwang.jpg'
) on conflict (day_of_week) do nothing;
insert into public.daily_specials (day_of_week, meals_fr, meals_en, image) values (
  2, array['Achu / taro', 'Eru & water fufu', 'Plantain malaxé', 'Soupe d''okra & garri']::text[], array['Achu / taro', 'Eru & water fufu', 'Mashed plantain (malaxé)', 'Okra soup & garri']::text[], '/img/okro.jpg'
) on conflict (day_of_week) do nothing;
insert into public.daily_specials (day_of_week, meals_fr, meals_en, image) values (
  3, array['Achu / taro', 'Eru & water fufu', 'Riz sauté & poulet', 'Soupe ogbono & garri', 'Ekwang', 'Poulet frit & plantain']::text[], array['Achu / taro', 'Eru & water fufu', 'Fried rice & chicken', 'Ogbono soup & garri', 'Ekwang', 'Fried chicken & plantain']::text[], '/img/ogbono-soup.jpg'
) on conflict (day_of_week) do nothing;
insert into public.daily_specials (day_of_week, meals_fr, meals_en, image) values (
  4, array['Achu / taro', 'Eru & water fufu', 'Riz sauté & poulet', 'Ndolé & igname', 'Khati khati & fufu de maïs']::text[], array['Achu / taro', 'Eru & water fufu', 'Fried rice & chicken', 'Ndolé & yam', 'Khati khati & corn fufu']::text[], '/img/ndole.jpg'
) on conflict (day_of_week) do nothing;
insert into public.daily_specials (day_of_week, meals_fr, meals_en, image) values (
  5, array['Achu / taro', 'Eru & water fufu', 'Riz sauté & poulet', 'Khati khati & fufu de maïs', 'Nyamagoro']::text[], array['Achu / taro', 'Eru & water fufu', 'Fried rice & chicken', 'Khati khati & corn fufu', 'Nyamagoro']::text[], '/img/snails.jpg'
) on conflict (day_of_week) do nothing;
insert into public.daily_specials (day_of_week, meals_fr, meals_en, image) values (
  6, array['Achu / taro', 'Khati khati & fufu de maïs', 'Eru & water fufu', 'Riz & sauce tomate', 'Riz sauté & poulet']::text[], array['Achu / taro', 'Khati khati & corn fufu', 'Eru & water fufu', 'Rice & tomato stew', 'Fried rice & chicken']::text[], '/img/rice-stew.jpg'
) on conflict (day_of_week) do nothing;

-- Glossary
insert into public.glossary_terms (term, definition_fr, definition_en, sort_order) values ('Water fufu', 'Pâte souple de manioc fermenté, du Sud-Ouest. On la mange à la main avec l''eru.', 'Soft, stretchy dough of fermented cassava from the South-West, eaten by hand with eru.', 0) on conflict (term) do nothing;
insert into public.glossary_terms (term, definition_fr, definition_en, sort_order) values ('Fufu corn', 'Pâte ferme de farine de maïs, l''accompagnement du Nord-Ouest pour le khati khati et les sauces.', 'Firm corn-flour dough, the North-West''s side for khati khati and soups.', 1) on conflict (term) do nothing;
insert into public.glossary_terms (term, definition_fr, definition_en, sort_order) values ('Garri', 'Semoule de manioc fermentée et grillée, préparée en pâte avec de l''eau chaude.', 'Fermented, roasted cassava grains, stirred into a dough with hot water.', 2) on conflict (term) do nothing;
insert into public.glossary_terms (term, definition_fr, definition_en, sort_order) values ('Achu', 'Taro pilé en pâte lisse, servi en puits avec la soupe jaune à l''huile de palme et au sel gemme.', 'Taro pounded smooth, served in a well with the yellow soup of palm oil and limestone salt.', 3) on conflict (term) do nothing;
insert into public.glossary_terms (term, definition_fr, definition_en, sort_order) values ('Eru', 'Feuilles de gnetum (okok) très finement coupées, cuites avec du waterleaf et de l''huile de palme.', 'Gnetum (okok) leaves sliced very fine, cooked with waterleaf and palm oil.', 4) on conflict (term) do nothing;
insert into public.glossary_terms (term, definition_fr, definition_en, sort_order) values ('Ndolé', 'Feuilles amères lavées et cuites dans une pâte d''arachides, le plat emblématique de Douala.', 'Washed bitter leaves cooked in a groundnut paste, Douala''s emblematic dish.', 5) on conflict (term) do nothing;
insert into public.glossary_terms (term, definition_fr, definition_en, sort_order) values ('Mbongo', 'Épices grillées jusqu''au noir, qui donnent au mbongo tchobi sa couleur et son goût fumé.', 'Spices roasted until black, which give mbongo tchobi its colour and smoky taste.', 6) on conflict (term) do nothing;
insert into public.glossary_terms (term, definition_fr, definition_en, sort_order) values ('Koki', 'Pâte de haricots niébé à l''huile de palme, cuite à la vapeur dans des feuilles de bananier.', 'Black-eyed bean paste with palm oil, steamed in banana leaves.', 7) on conflict (term) do nothing;
insert into public.glossary_terms (term, definition_fr, definition_en, sort_order) values ('Egusi', 'Graines de courge (pistache) moulues, qui épaississent la sauce.', 'Ground melon seeds that thicken the soup.', 8) on conflict (term) do nothing;
insert into public.glossary_terms (term, definition_fr, definition_en, sort_order) values ('Ogbono', 'Amandes de mangue sauvage moulues, qui donnent une sauce veloutée et filante.', 'Ground wild-mango kernels that make a smooth, drawing soup.', 9) on conflict (term) do nothing;
insert into public.glossary_terms (term, definition_fr, definition_en, sort_order) values ('Dodo', 'Plantain mûr coupé et frit.', 'Ripe plantain, sliced and fried.', 10) on conflict (term) do nothing;
insert into public.glossary_terms (term, definition_fr, definition_en, sort_order) values ('Poulet DG', '« Poulet du Directeur Général » : poulet sauté au plantain et aux légumes, le plat des grandes occasions.', '"Managing Director''s chicken": chicken sautéed with plantain and vegetables, the dish for big occasions.', 11) on conflict (term) do nothing;

-- Testimonials (confirmed: false = not shown on the site)
insert into public.testimonials (author, text_fr, text_en, confirmed, sort_order) values (
  'Marie K.', 'Le meilleur achu que j''aie jamais goûté ! Les saveurs sont authentiques et les portions généreuses. Mialine Gifted Hands porte bien son nom.', 'The best achu I have ever tasted! The flavours are authentic and the portions generous. Mialine Gifted Hands truly lives up to its name.', false, 0
);
insert into public.testimonials (author, text_fr, text_en, confirmed, sort_order) values (
  'Jean-Pierre T.', 'Je commande chaque semaine pour mon bureau. La livraison est toujours à l''heure et les plats sont délicieux, jour après jour.', 'I order every week for my office. Delivery is always on time and the food is consistently delicious.', false, 1
);
insert into public.testimonials (author, text_fr, text_en, confirmed, sort_order) values (
  'Amina B.', 'Enfin un vrai restaurant camerounais à Yaoundé. L''eru et le fufu me rappellent la cuisine de la maison. Fantastique !', 'Finally, a real Cameroonian restaurant in Yaoundé. The eru and fufu remind me of home cooking. Absolutely fantastic!', false, 2
);

-- Site settings
insert into public.site_settings (id, site_name, site_url, city, country_fr, country_en, map_query, whatsapp_numbers, opening_hour, closing_hour, timezone, specials_sheet_csv_url, offers_confirmed, delivery_confirmed, delivery_time_fr, delivery_time_en, delivery_payments, cook_confirmed, cook_name, cook_image, cook_story_fr, cook_story_en) values (
  1, 'Mialine Gifted Hands', 'https://mialinegiftedhands.com', 'Yaoundé', 'Cameroun', 'Cameroon',
  'Carrefour Obili, Yaoundé, Cameroun', '[{"label":"671 131 006","number":"237671131006"},{"label":"672 464 364","number":"237672464364"}]'::jsonb, 7, 23,
  'Africa/Douala', '', false,
  false, '30 à 45 minutes en moyenne', '30 to 45 minutes on average',
  array['cash', 'mtn', 'orange']::text[], false, 'Mialine',
  '', 'À compléter avec la cuisine : où la recette a été apprise, le plat de famille le plus cher à la maison.', 'To be completed with the kitchen: where the cooking was learned, the family dish the house is proudest of.'
) on conflict (id) do nothing;

-- Delivery zones
insert into public.delivery_zones (name_fr, name_en, fee_fcfa, sort_order) values (
  'Obili, Ngoa-Ekellé', 'Obili, Ngoa-Ekellé', 0, 0
);
insert into public.delivery_zones (name_fr, name_en, fee_fcfa, sort_order) values (
  'Melen, Mendong, Biyem-Assi', 'Melen, Mendong, Biyem-Assi', 500, 1
);
insert into public.delivery_zones (name_fr, name_en, fee_fcfa, sort_order) values (
  'Centre-ville, Bastos, Essos', 'Centre-ville, Bastos, Essos', 1000, 2
);

-- Local-development administrator: admin@mialinegiftedhands.com / dev-admin-password
-- (created directly in auth.users; the on_auth_user_created trigger
--  adds the profile, which is then promoted to role = admin)
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, confirmation_token, recovery_token, email_change_token_new, email_change, phone, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_anonymous)
values (
  '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  'admin@mialinegiftedhands.com', extensions.crypt('dev-admin-password', extensions.gen_salt('bf')), now(), '', '', '', '', '',
  '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(), false
) on conflict do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at)
select gen_random_uuid(), u.id, jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true), 'email', u.id::text, now(), now()
  from auth.users u where u.email = 'admin@mialinegiftedhands.com'
  and not exists (select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email');

update public.profiles set role = 'admin' where email = 'admin@mialinegiftedhands.com';

commit;
