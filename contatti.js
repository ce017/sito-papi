/* ──────────────────────────────────────────────────────────────
   Contatti — colonna a sinistra del form, nella pagina Contatti.

   ►►► QUI SI CAMBIANO I CONTATTI DI TUTTO IL SITO ◄◄◄
   Compila CONTATTI qui sotto: un campo lasciato vuoto ('') semplicemente
   non produce il bottone, quindi non resta mai un pulsante che non porta
   da nessuna parte.

   `tel` e `whatsapp` vanno scritti in formato internazionale senza spazi
   né segni (es. '393331234567'): è il formato che vogliono sia i link
   `tel:` sia wa.me. Quello che si legge a schermo lo decidi con
   `telVisibile`.
   ────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var CONTATTI = {
    email:       'info@papionthebeach.com',
    tel:         '393792771571',
    telVisibile: '+39 379 277 1571',
    /* stesso numero del telefono: se il WhatsApp e' un altro, cambia qui */
    whatsapp:    '393792771571',
    instagram:   'https://www.instagram.com/papi_onthebeach/',
    /* messaggio già scritto quando si apre WhatsApp */
    waTesto:     'Ciao Papi! Vorrei qualche informazione.'
  };

  /* Reso disponibile al resto della pagina: il form usa la stessa mail,
     così c'è un posto solo da aggiornare. */
  window.PapiContatti = CONTATTI;

  var AMBER = '#F5B800';
  var WA_GREEN = '#25D366';

  var PAGE = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
  if (PAGE !== 'contact') return;

  function escAttr(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var ICONE = {
    whatsapp: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.38 9.38 0 0 1-1.44-5.01c0-5.18 4.22-9.4 9.42-9.4a9.36 9.36 0 0 1 9.4 9.41c0 5.18-4.22 9.4-9.41 9.4zM20.5 3.49A11.8 11.8 0 0 0 12.04 0C5.5 0 .18 5.32.17 11.86c0 2.09.55 4.13 1.59 5.93L.07 24l6.36-1.67a11.85 11.85 0 0 0 5.61 1.43h.01c6.54 0 11.86-5.32 11.87-11.86a11.8 11.8 0 0 0-3.42-8.41z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.12 1.38A5.87 5.87 0 0 0 .63 4.14c-.3.76-.5 1.64-.56 2.9C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.12a5.87 5.87 0 0 0 2.12 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.87 5.87 0 0 0 2.12-1.38 5.87 5.87 0 0 0 1.38-2.12c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.87 5.87 0 0 0-1.38-2.12A5.87 5.87 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/></svg>',
    tel:   '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.85 21 3 13.15 3 3.5c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>',
    email: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>'
  };

  /* Ogni voce esce solo se il dato c'è: niente bottoni che non portano da
     nessuna parte. */
  function voci() {
    var out = [];
    if (CONTATTI.whatsapp) {
      out.push({
        key: 'whatsapp',
        href: 'https://wa.me/' + CONTATTI.whatsapp +
              (CONTATTI.waTesto ? '?text=' + encodeURIComponent(CONTATTI.waTesto) : ''),
        etichetta: 'WhatsApp',
        valore: 'Scrivici su WhatsApp',
        colore: WA_GREEN,
        pieno: true,
        esterno: true
      });
    }
    if (CONTATTI.instagram) {
      out.push({
        key: 'instagram',
        href: CONTATTI.instagram,
        etichetta: 'Instagram',
        valore: '@papi_onthebeach',
        colore: AMBER,
        esterno: true
      });
    }
    if (CONTATTI.tel) {
      out.push({
        key: 'tel',
        href: 'tel:+' + CONTATTI.tel,
        etichetta: 'Telefono',
        valore: CONTATTI.telVisibile || ('+' + CONTATTI.tel),
        colore: AMBER
      });
    }
    if (CONTATTI.email) {
      out.push({
        key: 'email',
        href: 'mailto:' + CONTATTI.email,
        etichetta: 'Email',
        valore: CONTATTI.email,
        colore: AMBER
      });
    }
    return out;
  }

  function injectCss() {
    if (document.getElementById('papi-contatti-css')) return;
    var st = document.createElement('style');
    st.id = 'papi-contatti-css';
    st.textContent =
      '#papi-contatti-aside{margin-top:28px;width:100%;}' +
      '#papi-contatti-griglia{display:grid;gap:12px;' +
        'grid-template-columns:repeat(auto-fit,minmax(210px,1fr));}' +
      '.papi-ct-btn{display:flex;align-items:center;gap:14px;text-decoration:none;' +
        'background:#161616;border:1px solid rgba(245,184,0,0.22);border-radius:12px;' +
        'padding:14px 16px;color:#fff;' +
        'transition:border-color 0.2s ease,transform 0.2s ease,background 0.2s ease;}' +
      '.papi-ct-btn:hover{transform:translateY(-2px);border-color:rgba(245,184,0,0.55);background:#1b1b1b;}' +
      '.papi-ct-btn:focus-visible{outline:2px solid ' + AMBER + ';outline-offset:3px;}' +
      '.papi-ct-btn--pieno{background:' + WA_GREEN + ';border-color:' + WA_GREEN + ';color:#0b2a16;}' +
      '.papi-ct-btn--pieno:hover{background:#1fbe5b;border-color:#1fbe5b;}' +
      '.papi-ct-ico{flex:0 0 auto;display:flex;align-items:center;justify-content:center;}' +
      '.papi-ct-txt{min-width:0;}' +
      '.papi-ct-lab{font-family:monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;' +
        'opacity:0.65;margin-bottom:2px;}' +
      '.papi-ct-val{font-size:14px;font-weight:600;line-height:1.35;' +
        'white-space:normal;overflow-wrap:anywhere;}' +
      '@media (max-width:600px){#papi-contatti-griglia{grid-template-columns:1fr;}}';
    document.head.appendChild(st);
  }

  function buildAside() {
    var aside = document.createElement('aside');
    aside.id = 'papi-contatti-aside';

    var html =
      '<div style="font-family:monospace;font-size:10px;color:' + AMBER + ';letter-spacing:0.15em;' +
           'text-transform:uppercase;margin-bottom:14px;">Scrivici subito</div>' +
      '<div id="papi-contatti-griglia">';

    voci().forEach(function (v) {
      var extra = v.esterno ? ' target="_blank" rel="noopener noreferrer"' : '';
      html +=
        '<a class="papi-ct-btn' + (v.pieno ? ' papi-ct-btn--pieno' : '') + '" ' +
           'href="' + escAttr(v.href) + '"' + extra + ' aria-label="' + escAttr(v.etichetta) + '">' +
          '<span class="papi-ct-ico" style="color:' + (v.pieno ? '#0b2a16' : v.colore) + ';">' +
            ICONE[v.key] + '</span>' +
          '<span class="papi-ct-txt">' +
            '<span class="papi-ct-lab" style="display:block;">' + escAttr(v.etichetta) + '</span>' +
            '<span class="papi-ct-val" style="display:block;">' + escAttr(v.valore) + '</span>' +
          '</span>' +
        '</a>';
    });

    aside.innerHTML = html + '</div>';
    return aside;
  }

  /* La colonna di sinistra è quella di Framer: ci sono già "Contattaci", il
     sottotitolo e la nota sulle prenotazioni Tavoli. Non la tocchiamo, i
     bottoni li appendiamo semplicemente in fondo a quel blocco.
     Non ha un id suo, quindi la riconosciamo così: è il fratello del form
     che non è né il form di Framer né il nostro. */
  function colonnaSinistra() {
    var form = document.getElementById('papi-contact-wrap');
    if (!form || !form.parentNode) return null;
    var figli = form.parentNode.children;
    for (var i = 0; i < figli.length; i++) {
      var c = figli[i];
      if (c === form || c.tagName === 'FORM') continue;
      if (c.id === 'papi-contatti-aside' || c.contains(form)) continue;
      return c;
    }
    return null;
  }

  /* Il form è iniettato da `papi-contact-form-js` poco dopo il caricamento:
     aspettiamo che compaia, poi agganciamo i bottoni alla colonna accanto. */
  function place() {
    if (!document.getElementById('papi-contact-wrap')) return false;
    if (!voci().length) return true;   /* nessun contatto compilato: non mostriamo niente */

    var sinistra = colonnaSinistra();
    if (!sinistra) return false;

    var esistente = document.getElementById('papi-contatti-aside');
    if (esistente) {
      /* Framer può ricostruire la colonna: se i bottoni sono finiti fuori
         li rimettiamo dentro invece di duplicarli. */
      if (esistente.parentNode !== sinistra) sinistra.appendChild(esistente);
      return true;
    }

    injectCss();
    sinistra.appendChild(buildAside());
    return true;
  }

  function run() {
    var tries = 0;
    var iv = setInterval(function () {
      if (place() || ++tries >= 30) clearInterval(iv);
    }, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(run, 300); });
  } else {
    setTimeout(run, 300);
  }
})();
