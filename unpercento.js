/* ──────────────────────────────────────────────────────────────
   1% (unpercento.it) — portale verso il sito della crew.
   Aggiunge:
     · un blocco nella home, sotto la sezione eventi
     · un credito nel footer di tutte le pagine
   Non tocca nulla di esistente: inietta solo nodi nuovi.

   PER CAMBIARE I TESTI: modifica solo l'oggetto UNPERCENTO qui sotto.
   ────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var UNPERCENTO = {
    url:     'https://www.unpercento.it',
    label:   'In collaborazione con',
    /* Metti qui il file del logo (es. 'img-eventi/1percento.svg') e il
       marchio diventa quell'immagine. Se resta vuoto disegniamo la scritta
       "1%" col carattere Anton, come adesso. */
    logo:    'img-eventi/unpercento.png',
    logoAlt: '1% — not for everyone',
    name:    '1%',
    tagline: 'not for everyone',
    text:    'Il collettivo di Pordenone. Tessera, stand e premi durante le serate — drink, shot, magliette e altro.',
    cta:     'Scopri 1%',
    footer:  'In collaborazione con 1%'
  };

  /* Papi: ambra del sito, usata per etichetta e pulsante.
     1%: valori presi dal loro sito — rosso di marca, grigio, e il
     carattere Anton con cui compongono il segno "1%".            */
  var AMBER = '#F5B800';
  var RED   = '#e0181f';   // --color-brand-red di unpercento.it
  var GRAY  = '#a3a3a3';   // --color-brand-gray di unpercento.it

  /* Anton (SIL Open Font License) ospitato in locale, come i font Framer
     già presenti nel repo: nessuna richiesta a terze parti. */
  function injectFont() {
    if (document.getElementById('papi-unpercento-font')) return;
    var st = document.createElement('style');
    st.id = 'papi-unpercento-font';
    st.textContent =
      "@font-face{font-family:'Anton';font-style:normal;font-weight:400;" +
      "font-display:swap;src:url('fonts/anton-latin.woff2') format('woff2');}";
    document.head.appendChild(st);
  }

  function isHome() {
    var p = window.location.pathname.split('/').pop().replace('.html', '');
    return p === '' || p === 'index';
  }

  function escAttr(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Con un file: il logo vero, senza claim sotto (di solito ce l'ha già
     dentro). Senza file: il segno "1%" come lo compongono loro — Anton,
     rosso di marca — con il claim sotto. */
  function marchioHtml() {
    if (UNPERCENTO.logo) {
      return '<div style="flex:0 0 auto;min-width:120px;max-width:180px;">' +
        '<img src="' + escAttr(UNPERCENTO.logo) + '" alt="' + escAttr(UNPERCENTO.logoAlt) + '" ' +
             'style="width:100%;height:auto;max-height:90px;object-fit:contain;display:block;">' +
      '</div>';
    }
    return '<div style="flex:0 0 auto;min-width:120px;">' +
      '<div style="font-family:Anton,Impact,Haettenschweiler,sans-serif;font-weight:400;' +
           'font-size:64px;line-height:0.9;color:' + RED + ';letter-spacing:0.01em;">' +
        UNPERCENTO.name + '</div>' +
      '<div style="font-size:10px;color:' + GRAY + ';letter-spacing:0.3em;' +
           'text-transform:uppercase;margin-top:10px;white-space:nowrap;">' +
        UNPERCENTO.tagline + '</div>' +
    '</div>';
  }

  /* ── blocco home ── */
  function buildBlock() {
    var wrap = document.createElement('section');
    wrap.id = 'papi-unpercento';
    /* solo il riquadro interno ha un fondo: la sezione resta trasparente
       cosi' si vede lo sfondo del sito. */
    wrap.style.cssText = 'padding:60px 24px;background:transparent;';

    wrap.innerHTML =
      '<div style="max-width:960px;margin:0 auto;">' +
        '<div style="background:#161616;border:1px solid rgba(245,184,0,0.2);border-radius:16px;' +
             'padding:32px;display:flex;flex-wrap:wrap;gap:28px;align-items:center;">' +

          marchioHtml() +

          '<div style="flex:1;min-width:240px;">' +
            '<div style="font-size:10px;font-family:monospace;color:' + AMBER + ';letter-spacing:0.15em;' +
                 'text-transform:uppercase;margin-bottom:10px;">' + UNPERCENTO.label + '</div>' +
            '<p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.65;margin:0 0 20px;">' +
              UNPERCENTO.text + '</p>' +
            '<a href="' + UNPERCENTO.url + '" target="_blank" rel="noopener noreferrer" ' +
               'style="display:inline-block;background:' + AMBER + ';color:#111;font-weight:700;' +
               'padding:12px 22px;border-radius:8px;text-decoration:none;font-size:14px;letter-spacing:0.04em;">' +
              UNPERCENTO.cta + ' →</a>' +
          '</div>' +

        '</div>' +
      '</div>';

    return wrap;
  }

  function injectBlock() {
    if (!isHome()) return true;
    if (document.getElementById('papi-unpercento')) return true;

    var anchor = document.getElementById('eventselection');
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(buildBlock(), anchor.nextSibling);
      return true;
    }
    /* ripiego: sopra la sezione "about" */
    var about = document.getElementById('aboutku');
    if (about && about.parentNode) {
      about.parentNode.insertBefore(buildBlock(), about);
      return true;
    }
    return false;
  }

  /* ── credito nel footer (tutte le pagine) ── */
  function injectFooter() {
    if (document.getElementById('papi-unpercento-footer')) return true;

    /* i link legali del footer sono identici su tutte le pagine */
    var terms = document.querySelector('a[href="terms-and-conditions.html"]');
    if (!terms || !terms.parentNode) return false;

    var a = document.createElement('a');
    a.id = 'papi-unpercento-footer';
    a.href = UNPERCENTO.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = UNPERCENTO.footer + ' ↗';
    /* stessa scala tipografica dei link legali accanto (12px, 0.65),
       con un margine in più che lo stacca dal gruppo legale */
    var REST = 'rgba(255,255,255,0.65)';
    a.style.cssText = 'display:inline-block;font-size:12px;color:' + REST + ';' +
                      'text-decoration:none;margin-left:18px;white-space:nowrap;' +
                      'transition:color 0.2s ease;';
    a.addEventListener('mouseenter', function () { a.style.color = AMBER; });
    a.addEventListener('mouseleave', function () { a.style.color = REST; });

    terms.parentNode.appendChild(a);
    return true;
  }

  /* Framer idrata dopo il primo paint e può sostituire il DOM: continuiamo a
     controllare per qualche secondo e reinseriamo i nodi se spariscono.
     Le due funzioni sono idempotenti, quindi ripassarci non duplica nulla. */
  function run() {
    injectFont();
    var tries = 0;
    var timer = setInterval(function () {
      injectBlock();
      injectFooter();
      if (++tries >= 20) clearInterval(timer);
    }, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(run, 400); });
  } else {
    setTimeout(run, 400);
  }
})();
