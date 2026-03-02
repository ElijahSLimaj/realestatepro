-- Seed data — mirrors current siteConfig.js (Belgian Dutch market)

-- Site Settings
insert into site_settings (company_name, tagline, phone, email, address, kvk, btw, default_lang, primary_color, accent_color, years_active, properties_sold, happy_clients, team_members, google_rating, valuation_rates)
values (
  'VastGoed Elite', 'Vastgoed & Makelaardij', '+32 3 123 45 67', 'info@vastgoedelite.be',
  'Meir 50, 2000 Antwerpen', '0123.456.789', 'BE0123.456.789', 'nl',
  '#0C1D2E', '#C8944A', 15, 1200, 950, 18, 4.8,
  '{"apartment": {"min": 2800, "max": 4500}, "house": {"min": 2400, "max": 4000}, "villa": {"min": 3200, "max": 5500}, "penthouse": {"min": 4000, "max": 7000}}'
);

-- Properties
insert into properties (type, category, status, is_featured, is_new, price, address, city, beds, baths, area, year_built, title_nl, title_fr, title_en, description_nl, description_fr, description_en, images) values
('sale', 'apartment', 'active', true, true, 385000, 'Groenplaats 12', 'Antwerpen', 3, 2, 95, 1920,
 'Stijlvol Appartement Centrum', 'Appartement Élégant au Centre', 'Stylish City Centre Apartment',
 'Prachtig gerenoveerd appartement op de Groenplaats met authentieke details en uitzicht op de Onze-Lieve-Vrouwekathedraal.',
 'Appartement magnifiquement rénové sur la Groenplaats avec des détails authentiques et vue sur la Cathédrale Notre-Dame.',
 'Beautifully renovated apartment on the Groenplaats with authentic details and views of the Cathedral of Our Lady.',
 '["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80"]'),

('sale', 'house', 'active', true, false, 650000, 'Cogels-Osylei 28', 'Antwerpen', 5, 3, 210, 1905,
 'Imposant Herenhuis Zurenborg', 'Imposante Maison de Maître Zurenborg', 'Imposing Townhouse Zurenborg',
 'Schitterend herenhuis in de befaamde Cogels-Osylei in de art-nouveauwijk Zurenborg met originele elementen.',
 'Magnifique maison de maître dans la célèbre Cogels-Osylei du quartier Art Nouveau de Zurenborg avec éléments d''origine.',
 'Magnificent townhouse on the renowned Cogels-Osylei in the Art Nouveau district of Zurenborg with original features.',
 '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"]'),

('rent', 'apartment', 'active', true, false, 1800, 'Eilandje Tower 8', 'Antwerpen', 2, 1, 75, 2021,
 'Modern Appartement Eilandje', 'Appartement Moderne Eilandje', 'Modern Eilandje Apartment',
 'Luxe appartement met panoramisch uitzicht over de Schelde in het trendy Eilandje.',
 'Appartement de luxe avec vue panoramique sur l''Escaut dans le quartier branché de l''Eilandje.',
 'Luxury apartment with panoramic views over the Scheldt in the trendy Eilandje district.',
 '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80"]'),

('sale', 'villa', 'active', true, true, 1150000, 'Kapelsesteenweg 180', 'Brasschaat', 6, 4, 350, 2019,
 'Luxe Villa met Zwembad', 'Villa de Luxe avec Piscine', 'Luxury Villa with Pool',
 'Schitterende moderne villa in het groene Brasschaat met verwarmd zwembad en ruime tuin.',
 'Magnifique villa moderne dans le verdoyant Brasschaat avec piscine chauffée et grand jardin.',
 'Stunning modern villa in leafy Brasschaat with heated pool and spacious garden.',
 '["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80"]'),

('rent', 'house', 'active', true, false, 2800, 'Coupure Links 45', 'Gent', 4, 2, 160, 1890,
 'Charmante Woning aan de Coupure', 'Maison Charmante sur la Coupure', 'Charming Home on the Coupure',
 'Karakteristieke woning aan de pittoreske Coupure met tuin en zicht op het water.',
 'Maison caractéristique sur la pittoresque Coupure avec jardin et vue sur l''eau.',
 'Characteristic home on the picturesque Coupure with garden and water views.',
 '["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80"]'),

('sale', 'penthouse', 'active', true, true, 1450000, 'Louizalaan 200', 'Brussel', 4, 3, 240, 2023,
 'Exclusief Penthouse Louizalaan', 'Penthouse Exclusif Avenue Louise', 'Exclusive Penthouse Avenue Louise',
 'Spectaculair penthouse met 360° uitzicht over Brussel op de prestigieuze Louizalaan.',
 'Penthouse spectaculaire avec vue à 360° sur Bruxelles sur la prestigieuse Avenue Louise.',
 'Spectacular penthouse with 360° views over Brussels on the prestigious Avenue Louise.',
 '["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80"]');

-- Neighborhoods
insert into neighborhoods (name, image_url, avg_price, listing_count, sort_order, description_nl, description_fr, description_en) values
('Antwerpen Centrum', 'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?w=800&q=80', 350000, 48, 1, 'Het bruisende hart van Antwerpen met de Meir, de kathedraal en een rijke diamanttraditie.', 'Le cœur vibrant d''Anvers avec le Meir, la cathédrale et une riche tradition diamantaire.', 'The vibrant heart of Antwerp with the Meir, the cathedral, and a rich diamond tradition.'),
('Brussel', 'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?w=800&q=80', 420000, 35, 2, 'De Europese hoofdstad met een kosmopolitische uitstraling en diverse architectuur.', 'La capitale européenne avec un rayonnement cosmopolite et une architecture diverse.', 'The European capital with a cosmopolitan allure and diverse architecture.'),
('Gent', 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800&q=80', 320000, 32, 3, 'Historische universiteitsstad met een levendige cultuurscene en prachtige middeleeuwse architectuur.', 'Ville universitaire historique avec une scène culturelle animée et une magnifique architecture médiévale.', 'Historic university city with a vibrant cultural scene and beautiful medieval architecture.'),
('Leuven', 'https://images.unsplash.com/photo-1555109307-f7d9da25c244?w=800&q=80', 310000, 26, 4, 'Dynamische studentenstad met het beroemde Groot Begijnhof en een groeiende vastgoedmarkt.', 'Ville étudiante dynamique avec le célèbre Grand Béguinage et un marché immobilier en croissance.', 'Dynamic student city with the famous Great Beguinage and a growing real estate market.'),
('Brasschaat', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', 680000, 15, 5, 'Exclusieve villawijk ten noorden van Antwerpen, geliefd bij families en professionals.', 'Quartier de villas exclusif au nord d''Anvers, prisé par les familles et les professionnels.', 'Exclusive villa district north of Antwerp, beloved by families and professionals.'),
('Knokke-Heist', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80', 750000, 22, 6, 'De meest prestigieuze badplaats van België met exclusief vastgoed aan de kust.', 'La station balnéaire la plus prestigieuse de Belgique avec un immobilier exclusif en bord de mer.', 'Belgium''s most prestigious seaside resort with exclusive coastal real estate.');

-- Testimonials
insert into testimonials (name, location, rating, property_type_nl, property_type_fr, property_type_en, text_nl, text_fr, text_en) values
('Sophie Peeters', 'Antwerpen', 5, 'Koper — Appartement', 'Acheteur — Appartement', 'Buyer — Apartment', 'Fantastische begeleiding van begin tot eind. Ze vonden precies wat we zochten binnen ons budget.', 'Un accompagnement fantastique du début à la fin. Ils ont trouvé exactement ce que nous cherchions dans notre budget.', 'Fantastic guidance from start to finish. They found exactly what we were looking for within our budget.'),
('Thomas Willems', 'Brasschaat', 5, 'Verkoper — Villa', 'Vendeur — Villa', 'Seller — Villa', 'Onze woning werd binnen 3 weken verkocht, boven de vraagprijs. Uitstekende service en communicatie.', 'Notre maison a été vendue en 3 semaines, au-dessus du prix demandé. Service et communication excellents.', 'Our home was sold within 3 weeks, above asking price. Excellent service and communication.'),
('Marie Janssens', 'Gent', 5, 'Koper — Herenhuis', 'Acheteur — Maison de Ville', 'Buyer — Townhouse', 'Professioneel, eerlijk en altijd bereikbaar. Ze maakten het hele proces stressvrij.', 'Professionnels, honnêtes et toujours joignables. Ils ont rendu tout le processus sans stress.', 'Professional, honest, and always available. They made the entire process stress-free.'),
('Jan Claes', 'Brussel', 5, 'Verkoper — Penthouse', 'Vendeur — Penthouse', 'Seller — Penthouse', 'De marketing van ons penthouse was van topkwaliteit. Professionele fotografie en een prachtige presentatie.', 'Le marketing de notre penthouse était de première qualité. Photographie professionnelle et une présentation magnifique.', 'The marketing of our penthouse was top quality. Professional photography and a beautiful presentation.');

-- Blog Posts
insert into blog_posts (slug, status, image_url, read_time, title_nl, title_fr, title_en, excerpt_nl, excerpt_fr, excerpt_en, content_nl, content_fr, content_en, published_at) values
('vastgoedmarkt-2026', 'published', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80', 5, 'Vastgoedmarkt 2026: Wat Kunt U Verwachten?', 'Marché Immobilier 2026 : À Quoi S''Attendre ?', 'Housing Market 2026: What to Expect?', 'Een analyse van de belangrijkste trends op de Belgische vastgoedmarkt dit jaar.', 'Une analyse des principales tendances du marché immobilier belge cette année.', 'An analysis of the key trends in the Belgian housing market this year.', 'Volledige inhoud hier...', 'Contenu complet ici...', 'Full content here...', '2026-02-15'),
('tips-verkopen', 'published', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80', 4, '7 Tips voor het Verkopen van Uw Woning', '7 Conseils pour Vendre Votre Maison', '7 Tips for Selling Your Home', 'Maximaliseer de waarde van uw woning met deze bewezen verkoopstrategieën.', 'Maximisez la valeur de votre maison avec ces stratégies de vente éprouvées.', 'Maximize the value of your home with these proven selling strategies.', 'Volledige inhoud hier...', 'Contenu complet ici...', 'Full content here...', '2026-01-28'),
('beste-regios-investeren', 'published', 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80', 6, 'De Beste Regio''s om te Investeren in 2026', 'Les Meilleures Régions pour Investir en 2026', 'Best Regions to Invest in 2026', 'Ontdek welke regio''s het meeste groeipotentieel hebben voor vastgoedinvesteerders.', 'Découvrez quelles régions ont le plus de potentiel de croissance pour les investisseurs immobiliers.', 'Discover which regions have the most growth potential for real estate investors.', 'Volledige inhoud hier...', 'Contenu complet ici...', 'Full content here...', '2026-01-10');

-- Services
insert into services (key, icon_name, sort_order, title_nl, title_fr, title_en, description_nl, description_fr, description_en) values
('buying', 'Home', 1, 'Aankoop Begeleiding', 'Accompagnement Achat', 'Buying Guidance', 'Wij begeleiden u bij elke stap van het aankoopproces, van bezichtiging tot sleuteloverdracht.', 'Nous vous guidons à chaque étape du processus d''achat, de la visite à la remise des clés.', 'We guide you through every step of the buying process, from viewings to key handover.'),
('selling', 'TrendingUp', 2, 'Verkoop & Marketing', 'Vente & Marketing', 'Selling & Marketing', 'Professionele fotografie, strategische prijsstelling en brede marketingcampagnes voor een optimaal resultaat.', 'Photographie professionnelle, prix stratégique et campagnes marketing étendues pour un résultat optimal.', 'Professional photography, strategic pricing, and broad marketing campaigns for optimal results.'),
('rental', 'Building2', 3, 'Verhuur & Beheer', 'Location & Gestion', 'Rental & Management', 'Volledige verhuurservice inclusief huurdersselectie, contracten en doorlopend beheer.', 'Service de location complet incluant sélection des locataires, contrats et gestion continue.', 'Full rental service including tenant selection, contracts, and ongoing management.'),
('valuation', 'ClipboardCheck', 4, 'Taxatie & Waardebepaling', 'Estimation & Évaluation', 'Valuation & Appraisal', 'Nauwkeurige taxaties door gecertificeerde taxateurs voor verkoop, aankoop of hypotheek.', 'Évaluations précises par des experts certifiés pour la vente, l''achat ou l''hypothèque.', 'Accurate appraisals by certified valuers for sale, purchase, or mortgage purposes.'),
('investment', 'PiggyBank', 5, 'Investerings Advies', 'Conseil en Investissement', 'Investment Advice', 'Strategisch advies voor vastgoedinvesteringen met focus op rendement en waardeontwikkeling.', 'Conseil stratégique pour les investissements immobiliers axé sur le rendement et la valorisation.', 'Strategic advice for real estate investments focusing on returns and value development.'),
('legal', 'Scale', 6, 'Juridische Ondersteuning', 'Support Juridique', 'Legal Support', 'Begeleiding bij notariële zaken, contracten en alle juridische aspecten van vastgoedtransacties.', 'Accompagnement pour les affaires notariales, contrats et tous les aspects juridiques des transactions immobilières.', 'Guidance with notarial matters, contracts, and all legal aspects of real estate transactions.');
