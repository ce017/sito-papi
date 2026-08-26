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
    { src: 'img-eventi/MF_logo%20TROPIFY-outlined.png', name: 'Tropify', ig: '' },
    /* { src: 'img-eventi/nome-logo.png', name: 'Nome Evento', ig: 'https://www.instagram.com/handle/' }, */
  ];

  function escAttr(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function safeUrl(u) {
    return /^https?:\/\//i.test(String(u || '')) ? u : '';
  }

  function buildHTML() {
    var inner = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:32px;max-width:1200px;margin:30px auto 0;width:100%;">';
    EVENTI.forEach(function (p) {
      var img = '<img src="' + escAttr(p.src) + '" alt="' + escAttr(p.name) + '" ' +
        'style="width:100%;height:180px;object-fit:contain;display:block;opacity:0.9;">';
      var ig = safeUrl(p.ig);
      inner += ig
        /* title + aria-label: al tocco su mobile non c'è hover che spieghi
           dove porta il logo, quindi lo diciamo esplicitamente. */
        ? '<a class="papi-partner-link" href="' + escAttr(ig) + '" target="_blank" rel="noopener noreferrer" ' +
          'title="' + escAttr(p.name) + ' su Instagram" aria-label="' + escAttr(p.name) + ' su Instagram" ' +
          'style="text-decoration:none;display:block;padding:10px;height:200px;box-sizing:border-box;">' + img + '</a>'
        : '<div style="display:block;padding:10px;height:200px;box-sizing:border-box;">' + img + '</div>';
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
      '#papi-partners-fallback .papi-partners-grid-wrap{display:block !important;}' +
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

  function place() {
    var footer = visibleFooter();
    if (!footer) return false;
    injectCss();

    /* se c'è già ma è finito in una variante nascosta (o il breakpoint è
       cambiato), lo spostiamo sopra il footer attualmente visibile */
    var existing = document.getElementById('papi-partners-fallback');
    if (existing) {
      if (isVisible(existing) || existing.nextElementSibling === footer) return true;
      footer.parentNode.insertBefore(existing, footer);
      return true;
    }

    /* volutamente un <div> e non un <section>: la galleria nasconde tutti
       gli "#main section" del template clonato, e ci finirebbe dentro anche
       questa griglia. */
    var sec = document.createElement('div');
    sec.id = 'papi-partners-fallback';
    sec.style.cssText = 'padding:56px 24px 24px;background:#111;';
    var innerWrap = document.createElement('div');
    innerWrap.style.cssText = 'max-width:1200px;margin:0 auto;';

    /* Solo il titolo grande, senza la vecchia targhetta gialla "Partner":
       la sezione si chiama "I nostri eventi" e basta, uguale su ogni pagina. */
    innerWrap.innerHTML =
      '<div style="text-align:center;">' +
        '<h2 style="font-family:\'Inter Display\',Inter,Arial,sans-serif;font-weight:300;' +
             'font-size:clamp(28px,3vw,38px);line-height:1.1;letter-spacing:-0.04em;' +
             'color:#fff;margin:0;">' + TITOLO + '</h2>' +
      '</div>';
    innerWrap.appendChild(makeGrid());
    sec.appendChild(innerWrap);

    footer.parentNode.insertBefore(sec, footer);
    return true;
  }

  /* Framer idrata dopo il primo paint e può sostituire il DOM: ricontrolliamo
     per qualche secondo e rimettiamo la griglia se sparisce. */
  function run() {
    var tries = 0;
    var timer = setInterval(function () {
      place();
      if (++tries >= 30) clearInterval(timer);
    }, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(run, 200); });
  } else {
    setTimeout(run, 200);
  }
})();
