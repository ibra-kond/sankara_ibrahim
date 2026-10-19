-- =====================================================================
--  DONNÉES DE DÉMONSTRATION (facultatif)
--  À exécuter APRÈS schema.sql. Les images pointent vers /demo/*.svg,
--  fournies avec le site. Remplacez-les ensuite par vos vraies photos depuis /admin.
-- =====================================================================

-- creations
insert into public.creations (slug, title, category, price, on_quote, badge, description, dimensions, wood, lead_time, photos, visible, position)
select slug, title, category, price, on_quote, badge, description, dimensions, wood, lead_time, photos, visible, position
from jsonb_to_recordset('[
  {
    "slug": "table-a-manger-iroko-8-places",
    "title": "Table à manger en iroko, 8 places",
    "category": "meubles",
    "price": 450000,
    "on_quote": false,
    "badge": "Populaire",
    "description": "Plateau massif de 5 cm, pieds compas, finition huile naturelle. Résiste à l’humidité et aux chocs.",
    "dimensions": "220 × 100 × 76 cm",
    "wood": "Iroko massif",
    "lead_time": "3 semaines",
    "photos": [
      {
        "src": "/demo/table.svg",
        "thumb": "/demo/table.svg"
      },
      {
        "src": "/demo/table-b.svg",
        "thumb": "/demo/table-b.svg"
      }
    ],
    "visible": true,
    "position": 0
  },
  {
    "slug": "porte-d-entree-sculptee",
    "title": "Porte d’entrée sculptée",
    "category": "portes-fenetres",
    "price": 380000,
    "on_quote": false,
    "badge": "Nouveau",
    "description": "Double vantail en bois rouge, motifs gravés à la main, serrure 3 points.",
    "dimensions": "140 × 220 cm",
    "wood": "Caïlcédrat",
    "lead_time": "4 semaines",
    "photos": [
      {
        "src": "/demo/porte.svg",
        "thumb": "/demo/porte.svg"
      },
      {
        "src": "/demo/porte-b.svg",
        "thumb": "/demo/porte-b.svg"
      }
    ],
    "visible": true,
    "position": 1
  },
  {
    "slug": "cuisine-equipee-sur-mesure",
    "title": "Cuisine équipée sur mesure",
    "category": "cuisines",
    "price": null,
    "on_quote": true,
    "badge": "",
    "description": "Caissons, plan de travail et rangements adaptés à votre pièce, au centimètre près.",
    "dimensions": "Selon votre cuisine",
    "wood": "Samba + contreplaqué marine",
    "lead_time": "5 à 6 semaines",
    "photos": [
      {
        "src": "/demo/cuisine.svg",
        "thumb": "/demo/cuisine.svg"
      },
      {
        "src": "/demo/cuisine-b.svg",
        "thumb": "/demo/cuisine-b.svg"
      }
    ],
    "visible": true,
    "position": 2
  },
  {
    "slug": "lit-deux-places-tete-de-lit",
    "title": "Lit 2 places avec tête de lit",
    "category": "chambres",
    "price": 275000,
    "on_quote": false,
    "badge": "Disponible",
    "description": "Sommier à lattes renforcé, tête de lit capitonnée en option. Livré monté.",
    "dimensions": "160 × 200 cm",
    "wood": "Acajou",
    "lead_time": "Disponible de suite",
    "photos": [
      {
        "src": "/demo/lit.svg",
        "thumb": "/demo/lit.svg"
      },
      {
        "src": "/demo/lit-b.svg",
        "thumb": "/demo/lit-b.svg"
      }
    ],
    "visible": true,
    "position": 3
  },
  {
    "slug": "bureau-direction",
    "title": "Bureau de direction",
    "category": "bureaux",
    "price": 320000,
    "on_quote": false,
    "badge": "",
    "description": "Grand plateau, caisson 3 tiroirs fermant à clé, passe-câbles intégrés.",
    "dimensions": "180 × 85 × 75 cm",
    "wood": "Noyer d’Afrique",
    "lead_time": "3 semaines",
    "photos": [
      {
        "src": "/demo/bureau.svg",
        "thumb": "/demo/bureau.svg"
      },
      {
        "src": "/demo/bureau-b.svg",
        "thumb": "/demo/bureau-b.svg"
      }
    ],
    "visible": true,
    "position": 4
  },
  {
    "slug": "armoire-3-portes",
    "title": "Armoire 3 portes avec miroir",
    "category": "chambres",
    "price": 360000,
    "on_quote": false,
    "badge": "",
    "description": "Penderie, étagères et tiroirs. Porte centrale avec miroir pleine hauteur.",
    "dimensions": "150 × 60 × 210 cm",
    "wood": "Samba teinté noyer",
    "lead_time": "3 semaines",
    "photos": [
      {
        "src": "/demo/armoire.svg",
        "thumb": "/demo/armoire.svg"
      },
      {
        "src": "/demo/armoire-b.svg",
        "thumb": "/demo/armoire-b.svg"
      }
    ],
    "visible": true,
    "position": 5
  },
  {
    "slug": "fenetre-persiennes",
    "title": "Fenêtre à persiennes",
    "category": "portes-fenetres",
    "price": 85000,
    "on_quote": false,
    "badge": "",
    "description": "Lames orientables pour l’air et l’ombre. Cadre traité contre les termites.",
    "dimensions": "120 × 140 cm",
    "wood": "Iroko",
    "lead_time": "2 semaines",
    "photos": [
      {
        "src": "/demo/fenetre.svg",
        "thumb": "/demo/fenetre.svg"
      },
      {
        "src": "/demo/fenetre-b.svg",
        "thumb": "/demo/fenetre-b.svg"
      }
    ],
    "visible": true,
    "position": 6
  },
  {
    "slug": "bibliotheque-murale",
    "title": "Bibliothèque murale",
    "category": "meubles",
    "price": 210000,
    "on_quote": false,
    "badge": "Nouveau",
    "description": "Étagères réglables, fond ajouré, fixation murale invisible.",
    "dimensions": "200 × 35 × 220 cm",
    "wood": "Chêne clair",
    "lead_time": "2 semaines",
    "photos": [
      {
        "src": "/demo/bibliotheque.svg",
        "thumb": "/demo/bibliotheque.svg"
      },
      {
        "src": "/demo/bibliotheque-b.svg",
        "thumb": "/demo/bibliotheque-b.svg"
      }
    ],
    "visible": true,
    "position": 7
  }
]'::jsonb) as x(slug text, title text, category text, price int, on_quote boolean, badge text, description text, dimensions text, wood text, lead_time text, photos jsonb, visible boolean, position int);

-- services
insert into public.services (title, icon, price_from, description, visible, position)
select title, icon, price_from, description, visible, position
from jsonb_to_recordset('[
  {
    "title": "Fabrication sur mesure",
    "icon": "ruler",
    "price_from": 50000,
    "description": "Meubles, portes, cuisines : conçus pour vos dimensions et votre usage.",
    "visible": true,
    "position": 0
  },
  {
    "title": "Réparation",
    "icon": "hammer",
    "price_from": 10000,
    "description": "Pieds cassés, tiroirs bloqués, charnières : on redonne vie à vos meubles.",
    "visible": true,
    "position": 1
  },
  {
    "title": "Rénovation",
    "icon": "refresh",
    "price_from": 25000,
    "description": "Ponçage, teinte et vernis pour un meuble comme neuf.",
    "visible": true,
    "position": 2
  },
  {
    "title": "Installation & pose",
    "icon": "drill",
    "price_from": 15000,
    "description": "Pose de portes, fenêtres, plafonds et placards, propre et de niveau.",
    "visible": true,
    "position": 3
  },
  {
    "title": "Conseil",
    "icon": "chat",
    "price_from": 0,
    "description": "Choix du bois, plans, budget : un avis honnête avant de vous lancer.",
    "visible": true,
    "position": 4
  }
]'::jsonb) as x(title text, icon text, price_from int, description text, visible boolean, position int);

-- testimonials
insert into public.testimonials (name, district, rating, text, photos, visible, position)
select name, district, rating, text, photos, visible, position
from jsonb_to_recordset('[
  {
    "name": "Aminata",
    "district": "Ouaga 2000",
    "rating": 5,
    "text": "Ma cuisine a été livrée le jour prévu, et les finitions sont parfaites. Trois ans après, rien n’a bougé.",
    "photos": [
      {
        "src": "/demo/cuisine.svg",
        "thumb": "/demo/cuisine.svg"
      }
    ],
    "visible": true,
    "position": 0
  },
  {
    "name": "Moussa",
    "district": "Tampouy",
    "rating": 5,
    "text": "Porte d’entrée magnifique. Les voisins demandent tous le contact de l’atelier.",
    "photos": [
      {
        "src": "/demo/porte.svg",
        "thumb": "/demo/porte.svg"
      }
    ],
    "visible": true,
    "position": 1
  },
  {
    "name": "Clarisse",
    "district": "Pissy",
    "rating": 5,
    "text": "Lit et armoire faits sur mesure pour une petite chambre. Tout rentre au centimètre près.",
    "photos": [
      {
        "src": "/demo/lit.svg",
        "thumb": "/demo/lit.svg"
      }
    ],
    "visible": true,
    "position": 2
  }
]'::jsonb) as x(name text, district text, rating smallint, text text, photos jsonb, visible boolean, position int);

-- before_after
insert into public.before_after (title, "before", "after", visible, position)
select title, "before", "after", visible, position
from jsonb_to_recordset('[
  {
    "title": "Rénovation d’un buffet ancien",
    "before": [
      {
        "src": "/demo/avant-1.svg",
        "thumb": "/demo/avant-1.svg"
      }
    ],
    "after": [
      {
        "src": "/demo/apres-1.svg",
        "thumb": "/demo/apres-1.svg"
      }
    ],
    "visible": true,
    "position": 0
  },
  {
    "title": "Remplacement d’une porte abîmée",
    "before": [
      {
        "src": "/demo/avant-2.svg",
        "thumb": "/demo/avant-2.svg"
      }
    ],
    "after": [
      {
        "src": "/demo/apres-2.svg",
        "thumb": "/demo/apres-2.svg"
      }
    ],
    "visible": true,
    "position": 1
  },
  {
    "title": "Chaise restaurée et revernie",
    "before": [
      {
        "src": "/demo/avant-3.svg",
        "thumb": "/demo/avant-3.svg"
      }
    ],
    "after": [
      {
        "src": "/demo/apres-3.svg",
        "thumb": "/demo/apres-3.svg"
      }
    ],
    "visible": true,
    "position": 2
  }
]'::jsonb) as x(title text, "before" jsonb, "after" jsonb, visible boolean, position int);

