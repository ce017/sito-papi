/* ──────────────────────────────────────────────────────────────
   Griglia partner / loghi eventi (Tropify ecc.).

   Prima questo script era copiato dentro tutte e 8 le pagine: la lista
   andava aggiornata in 8 punti. Ora vive qui e basta.

   PER AGGIUNGERE UN PARTNER: aggiungi una riga a PARTNERS qui sotto.
   `url` vuoto = logo non cliccabile.

   Dove finisce la griglia:
     1. dentro la sezione Framer "Sponsors", se la pagina ce l'ha;
     2. altrimenti in una sezione creata da noi sopra il footer.
   Il caso 2 serve perché Framer, dopo l'idratazione, tiene la sezione
   "Sponsors" solo su alcune pagine (home, eventi, venue): sulle altre
   spariva dal DOM e il logo non compariva.
   ────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var AMBER = '#F5B800';   /* ambra del sito, come le altre etichette */

  var PARTNERS = [
    { src: 'img-eventi/MF_logo%20TROPIFY-outlined.png', name: 'Tropify', url: '' },
    /* { src: 'img-eventi/altro.png', name: 'Altro Evento', url: 'https://link' }, */
  ];

  function buildHTML() {
    var inner = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:32px;max-width:1200px;margin:30px auto 0;width:100%;">';
    PARTNERS.forEach(function (p) {
      var img = '<img src="' + p.src + '" alt="' + p.name + '" style="width:100%;height:180px;object-fit:contain;display:block;opacity:0.9;transition:opacity 0.25s,transform 0.25s;" ' +
        'onmouseenter="this.style.opacity=\'1\';this.style.transform=\'scale(1.05)\'" ' +
        'onmouseleave="this.style.opacity=\'0.9\';this.style.transform=\'\'">';
      inner += p.url
        ? '<a href="' + p.url + '" target="_blank" rel="noopener" style="text-decoration:none;display:block;padding:10px;height:200px;box-sizing:border-box;">' + img + '</a>'
        : '<div style="display:block;padding:10px;height:200px;box-sizing:border-box;">' + img + '</div>';
    });
    inner += '</div>';
    return inner;
  }

  /* Il CSS del sito rende .papi-partners-grid-wrap un flex container. Dentro la
     sezione "Sponsors" va bene (larghezza definita), ma nella nostra sezione di
     ripiego la griglia diventa un flex item di larghezza indefinita e su mobile
     si espande a 4 colonne da 220px, sfondando la pagina di lato.
     Qui la riportiamo a un normale blocco, solo dentro il ripiego. */
  function injectFallbackCss() {
    if (document.getElementById('papi-partners-fallback-css')) return;
    var st = document.createElement('style');
    st.id = 'papi-partners-fallback-css';
    st.textContent =
      '#papi-partners-fallback .papi-partners-grid-wrap{display:block !important;}' +
      '#papi-partners-fallback .papi-partners-grid-wrap > div{' +
        'width:100% !important;min-width:0 !important;max-width:100% !important;}';
    document.head.appendChild(st);
  }

  function makeGrid() {
    var wrap = document.createElement('div');
    wrap.className = 'papi-partners-grid-wrap';
    wrap.style.cssText = 'width:100%;';
    wrap.innerHTML = buildHTML();
    return wrap;
  }

  /* ── 1. sezione "Sponsors" di Framer, quando c'è ── */
  function injectIntoSponsors() {
    var sponsors = document.querySelectorAll('[data-framer-name="Sponsors"]');
    var placed = false;
    sponsors.forEach(function (sp) {
      var container = sp.querySelector('[data-framer-name="Container"]') || sp;
      if (!container.querySelector('.papi-partners-grid-wrap')) {
        container.appendChild(makeGrid());
      }
      placed = true;
    });
    return placed;
  }

  /* ── 2. sezione nostra sopra il footer, quando "Sponsors" non esiste ── */
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

  function injectFallback() {
    var footer = visibleFooter();
    if (!footer) return false;
    injectFallbackCss();

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

    /* Stessa intestazione della sezione "Sponsors" in home: etichetta piccola
       sopra, titolo grande sotto. Il titolo riprende la tipografia che
       papi-partners-css applica all'h2 della sezione in home
       (Inter Display, clamp(28px,3vw,38px), weight 300), così le due
       sezioni si leggono identiche. */
    innerWrap.innerHTML =
      '<div style="text-align:center;">' +
        '<div style="display:inline-block;background:' + AMBER + ';color:#111;' +
             'font-family:monospace;font-size:11px;font-weight:700;letter-spacing:0.15em;' +
             'padding:4px 12px;border-radius:4px;text-transform:uppercase;">Partner</div>' +
        '<h2 style="font-family:\'Inter Display\',Inter,Arial,sans-serif;font-weight:300;' +
             'font-size:clamp(28px,3vw,38px);line-height:1.1;letter-spacing:-0.04em;' +
             'color:#fff;margin:16px 0 0;">I nostri eventi</h2>' +
      '</div>';
    innerWrap.appendChild(makeGrid());
    sec.appendChild(innerWrap);

    footer.parentNode.insertBefore(sec, footer);
    return true;
  }

  function place() {
    if (injectIntoSponsors()) return;
    injectFallback();
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
