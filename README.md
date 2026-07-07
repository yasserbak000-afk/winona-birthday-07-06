# 🎂 Joyeux anniversaire Winona ❤️

Site d'anniversaire interactif, 100 % HTML/CSS/JS (sans framework), prêt à héberger sur **GitHub Pages** ou **Netlify**.

## Structure du projet

```
winona-anniversaire/
├── index.html          → toutes les scènes ("pages") de l'aventure
├── style.css            → thème, glassmorphism, animations, mode sombre
├── script.js             → logique des scènes, mini-jeux, effets (confettis, feux d'artifice…)
├── images/                → à compléter avec tes photos (voir LISEZMOI.txt)
│   └── LISEZMOI.txt
└── audio/                 → à compléter avec ta musique et sons (voir LISEZMOI.txt)
    └── LISEZMOI.txt
```

## Aperçu du parcours

1. **Écran de chargement** — "Préparation de ta surprise…" + barre de progression, puis bouton "✨ Commencer l'aventure".
2. **Page 1** — Titre en machine à écrire + texte qui apparaît progressivement.
3. **Page 2** — 4 cartes statistiques animées avec effet 3D au survol, léger son et vibration mobile (beauté, bonne humeur, pouvoir de sourire, chance).
4. **Page 3** — Mini-jeu : trouver 5 gâteaux cachés, avec messages aléatoires.
5. **Page 4** — Pluie de 10 cadeaux à ouvrir, chacun révélant un message.
6. **Page 5** — Boîte cadeau dorée qui s'ouvre sur une lettre personnelle (signée Yasser), révélée ligne par ligne, se terminant sur "il reste encore une dernière surprise…".
7. **Page 6 — Révélation nocturne** : l'écran devient noir, un ciel étoilé apparaît, puis une boîte descend du ciel. En l'ouvrant : confettis, feux d'artifice, puis une carte du monde stylisée où deux destinations s'illuminent (🇨🇳 Chine / 🇯🇵 Japon), suivie du vrai message-cadeau : un voyage offert.
8. **Grande finale** — Décollage d'avion animé, nuages qui défilent, pluie de pétales de fleurs de cerisier, message final "À bientôt, Winona ❤️".

Une **guirlande lumineuse** en bas de l'écran sert de navigation entre les scènes : chaque ampoule s'allume au fur et à mesure de la progression.

## Personnalisation rapide

- **Photos** : le dossier `/images` reste prévu pour de futures personnalisations (voir `images/LISEZMOI.txt`).
- **Musique / sons** : dépose `musique.mp3`, `pop.mp3`, `chime.mp3` dans `/audio` (voir `audio/LISEZMOI.txt`). Le site fonctionne très bien même sans ces fichiers ; la musique baisse doucement de volume lors des moments plus émotionnels (révélation nocturne, décollage final).
- **Textes** : tous les textes (lettres, messages des cadeaux, messages des gâteaux) sont modifiables directement dans `script.js`, chaque section est commentée.
- **Destinations du voyage** : recherche `pin-china` et `pin-japan` dans `index.html`/`style.css` pour changer les pays ou leur position sur la carte stylisée.
- **Couleurs** : modifiables en un seul endroit, en haut de `style.css`, dans le bloc `:root { ... }`.
- **Signature des lettres** : recherche `— Yasser` dans `script.js` pour la remplacer si besoin.

## Déploiement

### GitHub Pages
1. Crée un dépôt GitHub et pousse tout le contenu de ce dossier à la racine.
2. Dans les paramètres du dépôt → *Pages* → source : branche principale, dossier `/root`.
3. Le site sera disponible à `https://<ton-nom-utilisateur>.github.io/<nom-du-depot>/`.

### Netlify
1. Glisse-dépose simplement ce dossier sur [app.netlify.com/drop](https://app.netlify.com/drop).
2. C'est en ligne en quelques secondes.

## Fonctionnalités bonus incluses

Mode sombre · particules et effets lumineux · animations fluides (glassmorphism) · sons (facultatifs) · bouton pour couper la musique · compteur du temps passé sur le site · transitions cinématiques · responsive mobile-first.

Bon anniversaire à Winona ! 🎉
