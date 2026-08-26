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

  function buildHTML() {
    var inner = '<div class="papi-partners-griglia" style="display:grid;gap:20px;margin:26px auto 0;width:100%;">';
    EVENTI.forEach(function (p) {
      var img = '<img src="' + escAttr(p.src) + '" alt="' + escAttr(p.name) + '" ' +
        'style="width:100%;height:74px;object-fit:contain;display:block;opacity:0.9;">';
      var ig = safeUrl(p.ig);
      inner += ig
        /* title + aria-label: al tocco su mobile non c'è hover che spieghi
           dove porta il logo, quindi lo diciamo esplicitamente. */
        ? '<a class="papi-partner-link" href="' + escAttr(ig) + '" target="_blank" rel="noopener noreferrer" ' +
          'title="' + escAttr(p.name) + ' su Instagram" aria-label="' + escAttr(p.name) + ' su Instagram" ' +
          'style="text-decoration:none;display:block;padding:6px;box-sizing:border-box;">' + img + '</a>'
        : '<div style="display:block;padding:6px;box-sizing:border-box;">' + img + '</div>';
    });
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
        'max-width:1200px;margin-left:auto;margin-right:auto;}' +
      /* Sei loghi in fila su desktop; scendono a 3 e poi a 2 quando non ci stanno. */
      /* Sempre tutti in fila, anche da telefono: rimpiccioliscono, non vanno
         a capo. Su schermi stretti stringiamo spazi e altezza del logo. */
      '.papi-partners-griglia{grid-template-columns:repeat(' + COLONNE + ',minmax(0,1fr));}' +
      '#papi-partners-fallback .papi-partners-griglia img{width:100% !important;min-width:0 !important;' +
        'max-width:100% !important;height:74px !important;max-height:none !important;' +
        'object-fit:contain !important;}' +
      '@media (max-width:900px){#papi-partners-fallback .papi-partners-griglia{gap:10px;}' +
        '#papi-partners-fallback .papi-partners-griglia img{height:48px !important;}}' +
      '@media (max-width:600px){#papi-partners-fallback{padding-left:12px;padding-right:12px;}' +
        '#papi-partners-fallback .papi-partners-griglia{gap:6px;}' +
        '#papi-partners-fallback .papi-partners-griglia img{height:32px !important;}' +
        '#papi-partners-fallback .papi-partners-griglia > a,' +
        '#papi-partners-fallback .papi-partners-griglia > div{padding:2px !important;}}' +
      '#papi-partners-fallback .papi-partners-grid-wrap > div,' +
      '#papi-partners-fallback .papi-partners-grid-wrap > a{' +
        'width:100% !important;min-width:0 !important;max-width:100% !important;}' +
      '.papi-partners-grid-wrap img{transition:opacity 0.25s,transform 0.25s;}' +
      '.papi-partner-link:hover img{opacity:1 !important;transform:scale(1.05);}' +
      '.papi-partner-link:focus-visible{outline:2px solid ' + AMBER + ';outline-offset:4px;border-radius:8px;}';
    document.head.appendChild(st);
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
    sec.style.cssText = 'padding:48px 24px 32px;background:transparent;';
    var innerWrap = document.createElement('div');
    innerWrap.style.cssText = 'max-width:1200px;margin:0 auto;';

    innerWrap.innerHTML =
      '<div style="text-align:center;">' +
        '<h2 class="papi-h" style="margin:0;">' + TITOLO + '</h2>' +
      '</div>';
    innerWrap.appendChild(makeGrid());
    sec.appendChild(innerWrap);

    footer.appendChild(sec);
    ordina(footer, sec);
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
