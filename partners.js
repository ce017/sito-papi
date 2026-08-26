/* ──────────────────────────────────────────────────────────────
   "I nostri eventi" — la griglia con i loghi delle crew (Tropify ecc.).

   PER AGGIUNGERE UN EVENTO: aggiungi una riga a EVENTI qui sotto.
     src → il file del logo dentro img-eventi/ (spazi scritti come %20)
     ig  → il link Instagram; se lo lasci vuoto il logo non è cliccabile.

   Prima questo script provava prima a infilarsi nella sezione "Sponsors"
   di Framer e solo in mancanza di quella costruiva la propria sezione.
   Ma `papi-content-fix` sostituisce "Sponsors" con il riquadro info del
   locale su tutte le pagine: chi vinceva la corsa cambiava da pagina a
   pagina, ed è il motivo per cui la sezione si vedeva diversa in giro per
   il sito. Ora costruiamo sempre la nostra sezione sopra al footer, così
   è identica ovunque.
   ────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var AMBER = '#F5B800';
  var TITOLO = 'I nostri eventi';

  var EVENTI = [
    { src: 'img-eventi/MF_logo%20TROPIFY-outlined.png', name: 'Tropify',           ig: 'https://www.instagram.com/tropify.events' },
    { src: 'img-eventi/maldita.png',                    name: 'Maldita',           ig: 'https://www.instagram.com/maldita.official_' },
    { src: 'img-eventi/perreo.png',                     name: 'Perreo',            ig: 'https://www.instagram.com/perreo.events' },
    { src: 'img-eventi/we-love-reggaeton.png',          name: 'We Love Reggaeton', ig: 'https://www.instagram.com/welovereggaeton_tour' },
    { src: 'img-eventi/trenches-party.png',             name: 'Trenches Party',    ig: 'https://www.instagram.com/trenches.party' },
    { src: 'img-eventi/unpercento.png',                 name: '1%',                ig: 'https://www.instagram.com/unpercento.official' },
    { src: 'img-eventi/tutt-altro.png',                 name: "Tutt'Altro",        ig: 'https://www.instagram.com/__tuttaltro' },
  ];

  /* Una riga sola: tante colonne quanti sono i loghi, cosi' aggiungendone
     uno non serve ritoccare il CSS a mano. */
  var COLONNE = Math.min(EVENTI.length, 8);

  function escAttr(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function safeUrl(u) {
    return /^https?:\/\//i.test(String(u || '')) ? u : '';
  }

  function voce(p, copia) {
    var img = '<img src="' + escAttr(p.src) + '" alt="' + (copia ? '' : escAttr(p.name)) + '" ' +
      'style="display:block;opacity:0.92;">';
    var ig = safeUrl(p.ig);
    var extra = copia ? ' aria-hidden="true" tabindex="-1"' : '';
    return ig
      /* title + aria-label: al tocco su mobile non c'è hover che spieghi
         dove porta il logo, quindi lo diciamo esplicitamente. */
      ? '<a class="papi-partner-link" href="' + escAttr(ig) + '" target="_blank" rel="noopener noreferrer" ' +
        'title="' + escAttr(p.name) + ' su Instagram" aria-label="' + escAttr(p.name) + ' su Instagram"' + extra + '>' +
        img + '</a>'
      : '<div class="papi-partner-link"' + extra + '>' + img + '</div>';
  }

  function buildHTML() {
    var inner = '<div class="papi-partners-griglia">';
    EVENTI.forEach(function (p) { inner += voce(p, false); });
    /* copia per il nastro scorrevole del telefono */
    EVENTI.forEach(function (p) { inner += voce(p, true); });
    inner += '</div>';
    return inner;
  }

  /* Il CSS del sito rende .papi-partners-grid-wrap un flex container, e come
     flex item di larghezza indefinita su mobile la griglia si espandeva a 4
     colonne da 220px sfondando la pagina di lato. Qui la riportiamo a un
     normale blocco. */
  function injectCss() {
    if (document.getElementById('papi-partners-fallback-css')) return;
    var st = document.createElement('style');
    st.id = 'papi-partners-fallback-css';
    st.textContent =
      '#papi-partners-fallback .papi-partners-grid-wrap{display:block !important;' +
        'max-width:100%;margin-left:auto;margin-right:auto;}' +
      /* Sei loghi in fila su desktop; scendono a 3 e poi a 2 quando non ci stanno. */
      /* Da schermo largo: tutti in riga, una griglia con tante colonne
         quanti sono i loghi. La seconda copia della lista sta nascosta. */
      '#papi-partners-fallback .papi-partners-griglia{display:grid;gap:20px;margin:26px auto 0;width:100%;' +
        'grid-template-columns:repeat(' + COLONNE + ',minmax(0,1fr));}' +
      '#papi-partners-fallback .papi-partner-link{display:block;padding:6px;box-sizing:border-box;' +
        'text-decoration:none;}' +
      '#papi-partners-fallback .papi-partner-link[aria-hidden="true"]{display:none;}' +
      /* Una vecchia regola in pagina forza width:auto e max-width:160px con
         !important su questi loghi: senza !important qui tornerebbero alla
         larghezza naturale e sborderebbero dalla colonna. */
      '#papi-partners-fallback .papi-partners-griglia img{width:100% !important;min-width:0 !important;' +
        'max-width:100% !important;height:74px !important;max-height:none !important;' +
        'object-fit:contain !important;}' +
      '@media (max-width:900px){#papi-partners-fallback .papi-partners-griglia{gap:14px;}' +
        '#papi-partners-fallback .papi-partners-griglia img{height:56px !important;}}' +

      /* Da telefono: nastro che scorre lento verso destra, loghi grandi.
         Ogni logo sta su una piastrella di vetro scuro, cosi' anche quelli
         chiari o molto scuri si staccano dallo sfondo. */
      '@media (max-width:700px){' +
        '#papi-partners-fallback{overflow:hidden;}' +
        '#papi-partners-fallback .papi-partners-grid-wrap{max-width:none !important;' +
          'margin-left:-24px;margin-right:-24px;width:calc(100% + 48px);' +
          'overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;' +
          'scrollbar-width:none;overscroll-behavior-x:contain;' +
          '-webkit-mask-image:linear-gradient(90deg,transparent,#000 4%,#000 96%,transparent);' +
          'mask-image:linear-gradient(90deg,transparent,#000 4%,#000 96%,transparent);}' +
        '#papi-partners-fallback .papi-partners-grid-wrap::-webkit-scrollbar{display:none;}' +
        '#papi-partners-fallback .papi-partners-griglia{display:flex !important;flex-wrap:nowrap;' +
          'gap:14px;width:max-content;margin-top:26px;}' +
        '#papi-partners-fallback .papi-partner-link[aria-hidden="true"]{display:block;}' +
        /* Fondo pieno e non semitrasparente: con rgba ogni piastrella
           prendeva il colore di quello che le passava dietro (stelle e
           sfumatura ambra), e i box risultavano di colori diversi fra loro.
           Cosi' invece sono tutti identici. */
        '#papi-partners-fallback .papi-partner-link{flex:0 0 auto;width:132px;padding:14px 16px;' +
          'border-radius:16px;background:#161616;' +
          'border:1px solid rgba(255,255,255,0.07);' +
          'box-shadow:0 10px 24px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.06);}' +
        '#papi-partners-fallback .papi-partners-griglia img{height:64px !important;}' +
      '}' +

      '#papi-partners-fallback .papi-partners-grid-wrap > div,' +
      '#papi-partners-fallback .papi-partners-grid-wrap > a{' +
        'width:100% !important;min-width:0 !important;max-width:100% !important;}' +
      '.papi-partners-grid-wrap img{transition:opacity 0.25s,transform 0.25s;}' +
      '.papi-partner-link:hover img{opacity:1 !important;transform:scale(1.05);}' +
      '.papi-partner-link:focus-visible{outline:2px solid ' + AMBER + ';outline-offset:4px;border-radius:8px;}';
    document.head.appendChild(st);
  }

  /* Quanti secondi per far passare l'intera lista una volta. Piu' basso =
     piu' veloce. */
  var GIRO_SECONDI = 26;

  /* Il nastro lo muoviamo cambiando lo scorrimento del contenitore invece
     che con un'animazione CSS: cosi' il dito puo' trascinarlo davvero, e
     quando lo lasci riparte da solo. La lista e' stampata due volte, quindi
     arrivati a meta' si torna all'inizio senza che si veda il salto. */
  function avviaNastro(wrap) {
    if (!wrap || wrap.papiNastroAttivo) return;
    wrap.papiNastroAttivo = true;

    var track = wrap.querySelector('.papi-partners-griglia');
    var stretto = window.matchMedia('(max-width:700px)');
    var menoMoto = window.matchMedia('(prefers-reduced-motion:reduce)');
    var pos = 0;
    var fermoFino = 0;
    var ultimo = 0;

    function meta() { return track ? track.scrollWidth / 2 : 0; }

    function pausa(ms) { fermoFino = Date.now() + ms; }

    /* Mentre il dito e' sopra non muoviamo niente; dopo che ha lasciato
       diamo un attimo di respiro (lo scorrimento per inerzia continua). */
    ['pointerdown', 'touchstart', 'wheel'].forEach(function (ev) {
      wrap.addEventListener(ev, function () { pausa(60000); }, { passive: true });
    });
    ['pointerup', 'pointercancel', 'touchend', 'touchcancel'].forEach(function (ev) {
      wrap.addEventListener(ev, function () { pausa(1600); }, { passive: true });
    });

    function passo(ts) {
      requestAnimationFrame(passo);
      if (!ultimo) { ultimo = ts; return; }
      var dt = ts - ultimo;
      ultimo = ts;
      if (dt > 200) return;                       /* scheda tornata in primo piano */
      if (!stretto.matches || menoMoto.matches) return;
      var m = meta();
      if (!m) return;

      /* se nel frattempo l'ha spostato il dito, ripartiamo da dove sta lui */
      if (Math.abs(wrap.scrollLeft - pos) > 2) pos = wrap.scrollLeft;
      if (Date.now() < fermoFino) return;

      /* verso destra: lo scorrimento cala */
      pos -= (m / (GIRO_SECONDI * 1000)) * dt;
      if (pos <= 0) pos += m;
      else if (pos >= m) pos -= m;
      wrap.scrollLeft = pos;
    }

    /* partiamo da meta' cosi' c'e' contenuto sia a destra sia a sinistra */
    requestAnimationFrame(function () {
      if (stretto.matches) { pos = meta(); wrap.scrollLeft = pos; }
      requestAnimationFrame(passo);
    });
  }

  function makeGrid() {
    var wrap = document.createElement('div');
    wrap.className = 'papi-partners-grid-wrap';
    wrap.style.cssText = 'width:100%;';
    wrap.innerHTML = buildHTML();
    return wrap;
  }

  function isVisible(el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  /* Framer tiene in pagina più varianti del footer (desktop/tablet/telefono)
     e ne mostra una sola. Dobbiamo agganciarci a quella visibile, altrimenti
     su mobile la griglia finisce dentro una variante nascosta. */
  function visibleFooter() {
    var footers = document.querySelectorAll('footer');
    for (var i = 0; i < footers.length; i++) {
      if (isVisible(footers[i]) && footers[i].parentNode) return footers[i];
    }
    var legal = document.querySelector('a[href="terms-and-conditions.html"]');
    if (legal && legal.closest) {
      var f = legal.closest('footer');
      if (f && f.parentNode) return f;
    }
    return null;
  }

  /* Ordine in fondo alla pagina: prima tutto il resto (compresa la mappa
     "Come Arrivare", che un altro script sposta in coda al footer dopo di
     noi), poi la griglia dei loghi, e per ultimo il blocco "logo Papi +
     indirizzo", che deve chiudere la pagina qualunque cosa aggiungiamo.
     Rimettiamo in ordine solo se serve: spostare nodi a ogni giro per
     nulla farebbe sfarfallare quello che c'e' dentro. */
  function ordina(footer, sec) {
    var indirizzo = footer.querySelector('[data-framer-name="Papi logo + Address"]');
    if (indirizzo) {
      if (sec.nextElementSibling === indirizzo && footer.lastElementChild === indirizzo) return;
      footer.appendChild(sec);
      footer.appendChild(indirizzo);
    } else if (footer.lastElementChild !== sec) {
      footer.appendChild(sec);
    }
  }

  function place() {
    var footer = visibleFooter();
    if (!footer) return false;
    injectCss();

    /* se c'è già ma è finito in una variante nascosta (o il breakpoint è
       cambiato), lo spostiamo dentro al footer attualmente visibile */
    var existing = document.getElementById('papi-partners-fallback');
    if (existing) {
      ordina(footer, existing);
      return true;
    }

    /* volutamente un <div> e non un <section>: la galleria nasconde tutti
       gli "#main section" del template clonato, e ci finirebbe dentro anche
       questa griglia. */
    var sec = document.createElement('div');
    sec.id = 'papi-partners-fallback';
    /* niente sfondo pieno: sotto c'e' lo sfondo del sito con le stelle,
       un blocco opaco lo tagliava via. */
    sec.className = 'papi-sez';
    sec.style.cssText = 'padding-top:48px;padding-bottom:32px;background:transparent;';
    var innerWrap = document.createElement('div');
    innerWrap.className = 'papi-cont';

    /* a sinistra come tutti gli altri titoli del sito, non centrato */
    innerWrap.innerHTML = '<h2 class="papi-h" style="margin:0;">' + TITOLO + '</h2>';
    innerWrap.appendChild(makeGrid());
    sec.appendChild(innerWrap);

    footer.appendChild(sec);
    ordina(footer, sec);
    avviaNastro(sec.querySelector('.papi-partners-grid-wrap'));
    return true;
  }

  /* Framer idrata dopo il primo paint e può sostituire il DOM: ricontrolliamo
     per qualche secondo e rimettiamo la griglia se sparisce. */
  function run() {
    var tries = 0;
    var timer = setInterval(function () {
      place();
      if (++tries >= 40) clearInterval(timer);
    }, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(run, 200); });
  } else {
    setTimeout(run, 200);
  }
})();
