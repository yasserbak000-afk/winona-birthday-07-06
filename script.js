/* ====================================================================
   SITE D'ANNIVERSAIRE — WINONA
   Script principal : chargement, scènes, mini-jeux, effets visuels
   Aucune dépendance externe — JavaScript natif uniquement.
   ==================================================================== */

document.addEventListener('DOMContentLoaded', () => {
 try {

  /* ------------------------------------------------------------
     0. RÉFÉRENCES DOM GLOBALES
     ------------------------------------------------------------ */
  const loader          = document.getElementById('loader');
  const progressBar     = document.getElementById('progressBar');
  const progressPercent = document.getElementById('progressPercent');
  const startBtn        = document.getElementById('startBtn');
  const app             = document.getElementById('app');
  const toolbar         = document.getElementById('toolbar');
  const garland         = document.getElementById('garland');
  const bulbs           = document.querySelectorAll('.bulb');
  const scenes          = document.querySelectorAll('.scene');

  const themeToggle = document.getElementById('themeToggle');
  const muteToggle  = document.getElementById('muteToggle');
  const siteTimer   = document.getElementById('siteTimer');

  const bgMusic  = document.getElementById('bgMusic');
  const sfxPop   = document.getElementById('sfxPop');
  const sfxChime = document.getElementById('sfxChime');

  const canvas = document.getElementById('fx-canvas');
  const ctx    = canvas.getContext('2d');

  let currentScene = 0;

  /* ------------------------------------------------------------
     1. CANVAS PLEIN ÉCRAN — mise à l'échelle responsive
     ------------------------------------------------------------ */
  function resizeCanvas(){
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  /* ------------------------------------------------------------
     2. LECTURE AUDIO SÉCURISÉE
     (évite les erreurs bloquantes si les fichiers audio sont absents)
     ------------------------------------------------------------ */
  function playSafe(audioEl){
    if(!audioEl) return;
    const playPromise = audioEl.play();
    if(playPromise && playPromise.catch){
      playPromise.catch(() => { /* fichier audio absent ou lecture bloquée : on ignore */ });
    }
  }

  // Petite vibration discrète sur mobile (ignorée silencieusement si non supportée)
  function vibrateSafe(ms){
    if(navigator.vibrate) navigator.vibrate(ms);
  }

  // Fondu doux du volume de la musique de fond (pour les moments plus émotionnels)
  function fadeAudio(audioEl, targetVolume, durationMs){
    const startVolume = audioEl.volume;
    const steps = 30;
    const stepTime = durationMs / steps;
    let step = 0;
    const fadeInterval = setInterval(() => {
      step++;
      audioEl.volume = startVolume + (targetVolume - startVolume) * (step / steps);
      if(step >= steps) clearInterval(fadeInterval);
    }, stepTime);
  }

  let isMuted = false;
  muteToggle.addEventListener('click', () => {
    isMuted = !isMuted;
    bgMusic.muted = isMuted;
    sfxPop.muted = isMuted;
    sfxChime.muted = isMuted;
    muteToggle.textContent = isMuted ? '🔇' : '🔊';
  });

  /* ------------------------------------------------------------
     3. MODE SOMBRE (persisté via localStorage quand disponible)
     ------------------------------------------------------------ */
  // localStorage peut être bloqué par le navigateur lorsque le site est
  // ouvert directement depuis un fichier (file://) plutôt qu'un serveur.
  // On sécurise donc chaque accès pour ne jamais bloquer le reste du script.
  function safeStorageGet(key){
    try { return localStorage.getItem(key); } catch(e){ return null; }
  }
  function safeStorageSet(key, value){
    try { localStorage.setItem(key, value); } catch(e){ /* stockage indisponible : on ignore */ }
  }

  function applyTheme(dark){
    document.body.classList.toggle('dark', dark);
    themeToggle.textContent = dark ? '☀️' : '🌙';
    safeStorageSet('winona-theme', dark ? 'dark' : 'light');
  }
  const savedTheme = safeStorageGet('winona-theme');
  applyTheme(savedTheme === 'dark');

  themeToggle.addEventListener('click', () => {
    applyTheme(!document.body.classList.contains('dark'));
  });

  /* ------------------------------------------------------------
     4. MINUTEUR — temps passé sur le site
     ------------------------------------------------------------ */
  let secondsElapsed = 0;
  setInterval(() => {
    secondsElapsed++;
    const m = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
    const s = String(secondsElapsed % 60).padStart(2, '0');
    siteTimer.textContent = `${m}:${s}`;
  }, 1000);

  /* ------------------------------------------------------------
     5. ÉCRAN DE CHARGEMENT — barre de progression animée
     ------------------------------------------------------------ */
  let progress = 0;
  const loadingInterval = setInterval(() => {
    // Progression irrégulière pour un rendu plus naturel
    progress += Math.random() * 12 + 4;
    if(progress >= 100){
      progress = 100;
      clearInterval(loadingInterval);
      startBtn.classList.remove('hidden');
    }
    progressBar.style.width = progress + '%';
    progressPercent.textContent = Math.floor(progress) + '%';
  }, 260);

  startBtn.addEventListener('click', () => {
    // Musique douce (l'utilisateur vient d'interagir : autoplay autorisé)
    bgMusic.volume = 0.5;
    playSafe(bgMusic);

    // Confettis de bienvenue
    launchConfetti(140);

    // Transition cinématique vers l'application
    loader.classList.add('fade-out');
    setTimeout(() => {
      loader.classList.add('hidden');
      app.classList.remove('hidden');
      toolbar.classList.remove('hidden');
      garland.classList.remove('hidden');
      startAmbientFloaters();
      goToScene(0, true);
    }, 900);
  });

  /* ------------------------------------------------------------
     6. GESTION DES SCÈNES ("pages") + GUIRLANDE DE NAVIGATION
     ------------------------------------------------------------ */
  function goToScene(index, isFirstEntry){
    scenes.forEach(scene => scene.classList.remove('active'));
    const target = document.getElementById('scene-' + index);
    if(target) target.classList.add('active');
    currentScene = index;

    // Mise à jour de la guirlande lumineuse
    bulbs.forEach((bulb, i) => {
      bulb.classList.toggle('lit', i <= index);
      bulb.classList.toggle('current', i === index);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Déclenche les animations spécifiques à l'entrée dans une scène
    if(index === 0) runIntroSequence();
    if(index === 1) animateStatCards();
    if(index === 2) setupCakeGame();
    if(index === 3) setupGiftGrid();
    if(index === 4) setupGiftBox();
    if(index === 5) runNightReveal();
    if(index === 6) runDeparture();
    if(index !== 6 && petalIntervalId){ clearInterval(petalIntervalId); petalIntervalId = null; }
  }

  // Boutons "Continuer" de chaque scène
  document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = parseInt(btn.dataset.next, 10);
      goToScene(next);
    });
  });

  // Clic direct sur une ampoule de la guirlande (navigation libre une fois débloquée)
  bulbs.forEach(bulb => {
    bulb.addEventListener('click', () => {
      const idx = parseInt(bulb.dataset.scene, 10);
      // On autorise uniquement à revenir en arrière ou revoir une scène déjà visitée
      if(bulb.classList.contains('lit') || idx === currentScene){
        goToScene(idx);
      }
    });
  });

  document.getElementById('replayBtn').addEventListener('click', () => {
    fadeAudio(bgMusic, 0.5, 1200);
    goToScene(0);
  });

  /* ------------------------------------------------------------
     7. SCÈNE 0 — Effet machine à écrire + apparition progressive
     ------------------------------------------------------------ */
  let introAlreadyPlayed = false;
  function runIntroSequence(){
    if(introAlreadyPlayed) return;
    introAlreadyPlayed = true;

    const typewriterEl = document.getElementById('typewriter');
    const fullText = '🎉 Joyeux anniversaire Winona ❤️';
    let i = 0;

    function typeChar(){
      if(i <= fullText.length){
        typewriterEl.textContent = fullText.slice(0, i);
        i++;
        setTimeout(typeChar, 65);
      } else {
        typewriterEl.classList.add('done');
        revealLinesOneByOne();
      }
    }
    typeChar();

    function revealLinesOneByOne(){
      const lines = document.querySelectorAll('.reveal-line');
      lines.forEach((line, idx) => {
        setTimeout(() => line.classList.add('show'), 500 + idx * 900);
      });
    }
  }

  /* ------------------------------------------------------------
     8. SCÈNE 1 — Compteurs animés sur les cartes statistiques
     ------------------------------------------------------------ */
  let statsAnimated = false;
  function animateStatCards(){
    if(statsAnimated) return;
    statsAnimated = true;

    document.querySelectorAll('.stat-value[data-target]').forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 60));
      const tick = setInterval(() => {
        current += step;
        if(current >= target){ current = target; clearInterval(tick); }
        el.textContent = current;
      }, 20);
    });

    // Effet 3D léger au survol/toucher + son discret + vibration au premier contact
    document.querySelectorAll('.stat-card[data-tilt]').forEach(card => {
      let touched = false;
      const applyTilt = (clientX, clientY) => {
        const rect = card.getBoundingClientRect();
        const px = (clientX - rect.left) / rect.width - 0.5;
        const py = (clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty('--ry', (px * 12) + 'deg');
        card.style.setProperty('--rx', (-py * 12) + 'deg');
      };
      card.addEventListener('mousemove', e => applyTilt(e.clientX, e.clientY));
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
      card.addEventListener('mouseenter', () => {
        if(!touched){
          touched = true;
          vibrateSafe(15);
          sfxPop.volume = 0.25;
          playSafe(sfxPop);
        }
      });
      card.addEventListener('touchstart', () => {
        vibrateSafe(15);
        sfxPop.volume = 0.25;
        playSafe(sfxPop);
      }, { passive: true });
    });
  }

  /* ------------------------------------------------------------
     9. SCÈNE 2 — Mini-jeu : trouver les 5 gâteaux cachés
     ------------------------------------------------------------ */
  const cakeMessages = [
    'Encore un ! 🎂',
    'Tu es douée 😄',
    'Plus que deux !',
    'Presque fini ✨',
    'Le dernier, bravo ! 🥳'
  ];
  let cakesFound = 0;
  let cakeGameReady = false;

  function setupCakeGame(){
    if(cakeGameReady) return;
    cakeGameReady = true;

    const board = document.getElementById('cakeBoard');
    const totalCakes = 5;

    for(let n = 0; n < totalCakes; n++){
      const spot = document.createElement('button');
      spot.className = 'cake-spot';
      spot.textContent = '🎂';
      spot.setAttribute('aria-label', 'Gâteau caché');

      // Position aléatoire (en pourcentage, avec marge de sécurité)
      const top  = 8 + Math.random() * 74;
      const left = 4 + Math.random() * 84;
      spot.style.top  = top + '%';
      spot.style.left = left + '%';

      spot.addEventListener('click', () => onCakeFound(spot, n));
      board.appendChild(spot);
    }
  }

  function onCakeFound(spot, n){
    if(spot.classList.contains('found')) return;
    spot.classList.add('found');
    cakesFound++;

    vibrateSafe(20);
    playSafe(sfxPop);
    launchConfetti(30, spot.getBoundingClientRect());

    document.getElementById('cakeCount').textContent = cakesFound;
    document.getElementById('cakeMessage').textContent = cakeMessages[Math.min(n, cakeMessages.length - 1)];

    if(cakesFound >= 5){
      launchConfetti(160);
      document.getElementById('cakeContinueBtn').classList.remove('hidden');
    }
  }

  /* ------------------------------------------------------------
     10. SCÈNE 3 — Pluie de cadeaux (10 cadeaux à ouvrir)
     ------------------------------------------------------------ */
  const giftMessages = [
    'Un câlin virtuel. 🤗',
    'Une journée remplie de sourires. 😊',
    'Un bon pour rire autant que tu veux. 😂',
    'Un peu de bonheur supplémentaire. ✨',
    'Une montagne de chocolat (virtuelle 😅). 🍫',
    'Une pincée de magie pour ta journée. 🪄',
    'Un instant de calme et de douceur. 🌸',
    'Un compliment gratuit : tu es incroyable. 💫',
    'Une pensée pleine de tendresse. 💌',
    'Le droit officiel de faire la fête toute la journée. 🥳'
  ];
  let giftsOpened = 0;
  let giftGameReady = false;

  function setupGiftGrid(){
    if(giftGameReady) return;
    giftGameReady = true;

    const grid = document.getElementById('giftGrid');
    giftMessages.forEach((message, idx) => {
      const item = document.createElement('button');
      item.className = 'gift-item';
      item.innerHTML = `🎁<span class="gift-tooltip">${message}</span>`;
      item.setAttribute('aria-label', 'Cadeau ' + (idx + 1));

      item.addEventListener('click', () => {
        if(item.classList.contains('opened')) return;
        item.classList.add('opened');
        item.innerHTML = `🎊<span class="gift-tooltip">${message}</span>`;
        giftsOpened++;
        vibrateSafe(20);
        playSafe(sfxPop);
        launchConfetti(18, item.getBoundingClientRect());
        document.getElementById('giftCount').textContent = giftsOpened;

        if(giftsOpened >= giftMessages.length){
          launchConfetti(160);
          document.getElementById('giftContinueBtn').classList.remove('hidden');
        }
      });

      grid.appendChild(item);
    });
  }

  /* ------------------------------------------------------------
     11. SCÈNE 4 — Boîte cadeau animée + lettre progressive
     ------------------------------------------------------------ */
  const letterParagraphs = [
    'Joyeux anniversaire ❤️',
    "Aujourd'hui est une journée vraiment spéciale.",
    'Je voulais faire quelque chose de différent.',
    "Pas simplement t'envoyer quelques mots.",
    'Mais créer un petit moment rien que pour toi.',
    "J'espère que cette surprise t'aura fait sourire.",
    'Tu mérites de vivre une année remplie de bonheur, de réussite, de beaux souvenirs et de belles surprises.',
    "Continue d'être cette personne qui illumine les journées des autres simplement par sa présence.",
    'Profite de chaque instant.',
    'Et surtout…',
    "N'oublie jamais de sourire.",
    'Mais attends…',
    'Il reste encore une dernière surprise…'
  ];
  let giftBoxReady = false;

  function setupGiftBox(){
    if(giftBoxReady) return;
    giftBoxReady = true;

    const box = document.getElementById('giftBox');
    box.addEventListener('click', () => {
      if(box.classList.contains('opened')) return;
      box.classList.add('opened');
      playSafe(sfxChime);
      launchConfetti(90, box.getBoundingClientRect());

      document.getElementById('boxHint').textContent = 'La boîte s\'ouvre… ✨';

      setTimeout(() => {
        const letterCard = document.getElementById('letterCard');
        letterCard.classList.remove('hidden');
        revealLetter();
      }, 700);
    });
  }

  function revealLetter(){
    const body = document.getElementById('letterBody');
    body.innerHTML = '';

    letterParagraphs.forEach((text, idx) => {
      const p = document.createElement('p');
      p.textContent = text;
      body.appendChild(p);
      setTimeout(() => p.classList.add('show'), 300 + idx * 750);
    });

    // Signature, affichée après le dernier paragraphe
    const signature = document.createElement('p');
    signature.className = 'letter-signature';
    signature.textContent = '— Yasser';
    body.appendChild(signature);
    setTimeout(() => {
      signature.classList.add('show');
      document.getElementById('letterContinueBtn').classList.remove('hidden');
    }, 300 + letterParagraphs.length * 750 + 400);
  }

  /* ------------------------------------------------------------
     12. SCÈNE 5 — Révélation nocturne : ciel étoilé → boîte du ciel
         → carte du monde (Chine / Japon) → vrai cadeau
     ------------------------------------------------------------ */
  const giftLetterParagraphs = [
    "Je voulais t'offrir quelque chose qu'aucun objet ne pourra remplacer.",
    'Un souvenir.',
    'Une aventure.',
    'Un moment que nous pourrons raconter encore longtemps. ❤️',
    "J'ai envie que notre première rencontre soit vraiment spéciale.",
    "C'est pourquoi je veux t'offrir un voyage entièrement payé.",
    'Destination : 🇨🇳 la Chine ou 🇯🇵 le Japon.',
    'Nous choisirons ensemble.',
    "Parce que le plus important n'est pas le pays.",
    'Le plus important…',
    'C\'est de vivre cette première aventure avec toi.',
    "J'espère que ce voyage sera le premier d'une longue série de souvenirs.",
    "Merci d'avoir pris le temps de vivre cette petite aventure.",
    'Et surtout… joyeux anniversaire, Winona. ❤️'
  ];

  let nightRevealReady = false;
  function runNightReveal(){
    if(nightRevealReady) return;
    nightRevealReady = true;

    // Fondu de la musique vers un ton plus doux et émotionnel
    fadeAudio(bgMusic, 0.22, 2500);

    // Génère un ciel étoilé
    const skyLayer = document.getElementById('skyLayer');
    for(let i = 0; i < 90; i++){
      const star = document.createElement('span');
      star.className = 'star';
      star.style.top = Math.random() * 100 + '%';
      star.style.left = Math.random() * 100 + '%';
      star.style.animationDelay = (Math.random() * 3) + 's';
      skyLayer.appendChild(star);
    }

    // Révèle les 3 lignes de texte, puis fait apparaître la boîte
    const lines = document.querySelectorAll('#skyLines .reveal-line');
    lines.forEach((line, idx) => {
      setTimeout(() => line.classList.add('show'), 400 + idx * 1300);
    });

    setTimeout(() => {
      document.getElementById('skyBoxWrap').classList.remove('hidden');
    }, 400 + lines.length * 1300 + 600);

    // Clic sur la boîte du ciel : ouverture, confettis, feux d'artifice puis carte du monde
    const skyBox = document.getElementById('skyGiftBox');
    skyBox.addEventListener('click', () => {
      if(skyBox.classList.contains('opened')) return;
      skyBox.classList.add('opened');
      vibrateSafe(40);
      playSafe(sfxChime);
      launchConfetti(180, skyBox.getBoundingClientRect());
      let bursts = 0;
      const fw = setInterval(() => {
        launchFirework();
        bursts++;
        if(bursts >= 3) clearInterval(fw);
      }, 400);

      setTimeout(() => {
        document.getElementById('worldMapWrap').classList.remove('hidden');
      }, 900);

      setTimeout(() => {
        const card = document.getElementById('giftLetterCard');
        card.classList.remove('hidden');
        revealGiftLetter();
      }, 2600);
    });
  }

  function revealGiftLetter(){
    const body = document.getElementById('giftLetterBody');
    body.innerHTML = '';

    giftLetterParagraphs.forEach((text, idx) => {
      const p = document.createElement('p');
      p.textContent = text;
      body.appendChild(p);
      setTimeout(() => p.classList.add('show'), 300 + idx * 750);
    });

    const signature = document.createElement('p');
    signature.className = 'letter-signature';
    signature.textContent = '— Yasser';
    body.appendChild(signature);

    const totalDelay = 300 + giftLetterParagraphs.length * 750 + 400;
    setTimeout(() => {
      signature.classList.add('show');
      document.getElementById('adventureBtn').classList.remove('hidden');
    }, totalDelay);
  }

  /* ------------------------------------------------------------
     13. SCÈNE 6 — FINALE : décollage d'avion, pétales de cerisier
     ------------------------------------------------------------ */
  let departurePlayed = false;
  function runDeparture(){
    if(departurePlayed) return;
    departurePlayed = true;

    // La musique devient plus douce pour ce dernier moment
    fadeAudio(bgMusic, 0.15, 3500);

    // Quelques nuages qui défilent en arrière-plan
    const cloudLayer = document.getElementById('cloudLayer');
    const cloudPositions = [10, 30, 55, 75];
    cloudPositions.forEach((top, i) => {
      const cloud = document.createElement('span');
      cloud.className = 'cloud';
      cloud.textContent = '☁️';
      cloud.style.top = top + '%';
      cloud.style.animationDuration = (18 + i * 6) + 's';
      cloud.style.animationDelay = (i * 2) + 's';
      cloudLayer.appendChild(cloud);
    });

    launchConfetti(120);
    startPetalRain();
  }

  // Pluie continue de pétales de fleurs de cerisier
  let petalIntervalId = null;
  function startPetalRain(){
    if(petalIntervalId) clearInterval(petalIntervalId);
    petalIntervalId = setInterval(() => {
      const el = document.createElement('div');
      el.className = 'ambient-float petal';
      el.textContent = '🌸';
      el.style.left = Math.random() * 100 + 'vw';
      el.style.fontSize = (Math.random() * 12 + 14) + 'px';
      const duration = Math.random() * 6 + 7;
      el.style.animationDuration = duration + 's';
      el.style.animationDirection = 'reverse'; // tombe du haut vers le bas
      document.body.appendChild(el);
      setTimeout(() => el.remove(), duration * 1000);
    }, 380);
  }

  /* ------------------------------------------------------------
     14. MOTEUR DE PARTICULES — confettis
     ------------------------------------------------------------ */
  let particles = [];
  const confettiColors = ['#f6c9de', '#d4af6a', '#c9a9e7', '#fffbf7', '#f0cf85'];

  function launchConfetti(count, originRect){
    const originX = originRect ? originRect.left + originRect.width / 2 : canvas.width / 2;
    const originY = originRect ? originRect.top + originRect.height / 2 : -20;

    for(let i = 0; i < count; i++){
      particles.push({
        type: 'confetti',
        x: originX + (Math.random() - 0.5) * (originRect ? 40 : canvas.width * 0.8),
        y: originY,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 3 + 2,
        size: Math.random() * 8 + 4,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        life: 0,
        maxLife: 160 + Math.random() * 60
      });
    }
    ensureAnimating();
  }

  function launchBalloons(count){
    const balloonColors = ['#f6c9de', '#c9a9e7', '#f0cf85', '#ffffff'];
    for(let i = 0; i < count; i++){
      particles.push({
        type: 'balloon',
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 200,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -(Math.random() * 1.2 + 0.8),
        size: Math.random() * 18 + 22,
        color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
        sway: Math.random() * Math.PI * 2,
        life: 0,
        maxLife: 600
      });
    }
    ensureAnimating();
  }

  function launchFirework(){
    const originX = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
    const originY = Math.random() * canvas.height * 0.4 + canvas.height * 0.1;
    const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    const sparks = 46;

    for(let i = 0; i < sparks; i++){
      const angle = (Math.PI * 2 * i) / sparks;
      const speed = Math.random() * 3.5 + 2;
      particles.push({
        type: 'spark',
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 2,
        color,
        life: 0,
        maxLife: 60 + Math.random() * 20
      });
    }
    ensureAnimating();
  }

  let animating = false;
  function ensureAnimating(){
    if(!animating){
      animating = true;
      requestAnimationFrame(animateParticles);
    }
  }

  function animateParticles(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.life++;
      p.x += p.vx;
      p.y += p.vy;

      if(p.type === 'confetti'){
        p.vy += 0.05; // gravité douce
        p.rotation += p.rotationSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }

      if(p.type === 'balloon'){
        p.sway += 0.03;
        p.x += Math.sin(p.sway) * 0.6;
        ctx.save();
        ctx.globalAlpha = Math.min(1, (p.maxLife - p.life) / 80);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size * 0.7, p.size, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y + p.size);
        ctx.lineTo(p.x, p.y + p.size + 24);
        ctx.stroke();
        ctx.restore();
      }

      if(p.type === 'spark'){
        p.vy += 0.03;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    particles = particles.filter(p => p.life < p.maxLife && p.y < canvas.height + 100);

    if(particles.length > 0){
      requestAnimationFrame(animateParticles);
    } else {
      animating = false;
    }
  }

  /* ------------------------------------------------------------
     15. ÉLÉMENTS FLOTTANTS AMBIANTS (étoiles / cœurs discrets en fond)
     ------------------------------------------------------------ */
  function startAmbientFloaters(){
    const symbols = ['✨', '💫', '⭐', '💗'];
    setInterval(() => {
      const el = document.createElement('div');
      el.className = 'ambient-float';
      el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      el.style.left = Math.random() * 100 + 'vw';
      el.style.fontSize = (Math.random() * 14 + 10) + 'px';
      const duration = Math.random() * 8 + 8;
      el.style.animationDuration = duration + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), duration * 1000);
    }, 1400);
  }

} catch(err) {
  // Si une erreur inattendue survient malgré tout, elle est visible dans la
  // console du navigateur (touche F12 → onglet "Console") plutôt que de
  // bloquer silencieusement toute l'application.
  console.error('Erreur dans le script du site anniversaire :', err);
}

});
