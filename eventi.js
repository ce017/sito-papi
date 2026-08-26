/* ──────────────────────────────────────────────────────────────
   Eventi — parte condivisa fra home ed "eventi".

   Due cose vivono qui:
     1. il modal di anteprima che si apre quando premi su una card;
     2. il countdown col prossimo evento, in home subito sotto la hero.

   Le card continuano a essere disegnate dagli script `papi-events-live`
   dentro index.html ed events.html: lì l'unica aggiunta è l'attributo
   `data-papi-ev="<id>"`. Il click lo intercettiamo da qui, in delega, così
   funziona anche se Framer ridisegna il DOM dopo l'idratazione.

   PER CAMBIARE I TESTI: modifica solo l'oggetto T qui sotto.
   ────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var AMBER = '#F5B800';

  var T = {
    prossimo:  'Prossimo evento',
    live:      'LIVE ORA',
    giorni:    'giorni',
    ore:       'ore',
    minuti:    'min',
    secondi:   'sec',
    biglietti: '🎟️ Acquista biglietti',
    galleria:  '📸 Guarda la galleria',
    lineup:    'Line-up',
    dove:      'Dove',
    chiudi:    'Chiudi'
  };

  /* Quando un evento non ha orario di fine lo consideriamo finito dopo
     tante ore: serve solo a decidere quando il countdown passa al
     prossimo evento. */
  var DURATA_DEFAULT_ORE = 6;

  var PAGE = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
  var IS_HOME = (PAGE === 'index');

  /* ── helper ── */
  function escHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function safeUrl(u) {
    return /^https?:\/\//i.test(String(u || '')) ? u : '';
  }
  function fmtDataLunga(dt) {
    if (!dt) return '';
    var d = new Date(dt);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('it-IT', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }
  function fmtOra(dt) {
    if (!dt) return '';
    var d = new Date(dt);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }
  function due(n) { return (n < 10 ? '0' : '') + n; }

  /* `end_time` è testo libero "HH:MM": lo attacchiamo alla data di inizio e,
     se cade prima dell'inizio, è la mattina dopo. */
  function fineEvento(ev) {
    var start = new Date(ev.event_date);
    if (isNaN(start.getTime())) return null;
    var m = /^(\d{1,2}):(\d{2})/.exec(String(ev.end_time || ''));
    if (!m) return new Date(start.getTime() + DURATA_DEFAULT_ORE * 3600000);
    var end = new Date(start);
    end.setHours(Number(m[1]), Number(m[2]), 0, 0);
    if (end <= start) end.setDate(end.getDate() + 1);
    return end;
  }

  /* ── dati ── */
  var _cache = null;
  var _byId = {};

  function caricaEventi() {
    if (_cache) return _cache;
    _cache = new Promise(function (resolve) {
      if (typeof supabase === 'undefined' || typeof SUPABASE_URL === 'undefined') {
        resolve([]);
        return;
      }
      var c = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      c.from('events').select('*').eq('is_published', true)
        .order('event_date', { ascending: true })
        .then(function (res) {
          var rows = (res && !res.error && res.data) ? res.data : [];
          rows.forEach(function (e) { _byId[String(e.id)] = e; });
          resolve(rows);
        })
        .catch(function () { resolve([]); });
    });
    return _cache;
  }

  /* ══════════════════════════════════════════════════════════
     1. MODAL DI ANTEPRIMA
     ══════════════════════════════════════════════════════════ */

  function injectCss() {
    if (document.getElementById('papi-ev-modal-css')) return;
    var st = document.createElement('style');
    st.id = 'papi-ev-modal-css';
    st.textContent =
      '#papi-ev-modal{position:fixed;inset:0;z-index:99999;display:none;' +
        'align-items:center;justify-content:center;padding:24px;' +
        'background:rgba(0,0,0,0.82);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);' +
        'opacity:0;transition:opacity 0.25s ease;}' +
      '#papi-ev-modal.is-open{display:flex;opacity:1;}' +
      /* scrollbar sottile e scura: quella di sistema arrivava bianca e
         spiccava sul pannello nero */
      '#papi-ev-modal-box{scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.18) transparent;' +
        'position:relative;width:100%;max-width:880px;max-height:88vh;overflow-y:auto;overscroll-behavior:contain;' +
        'background:#141414;border:1px solid rgba(245,184,0,0.28);border-radius:18px;' +
        'box-shadow:0 30px 80px rgba(0,0,0,0.7);' +
        'transform:translateY(18px) scale(0.98);transition:transform 0.28s cubic-bezier(0.32,0.72,0,1);}' +
      '#papi-ev-modal.is-open #papi-ev-modal-box{transform:none;}' +
      '#papi-ev-modal-close{position:absolute;top:14px;right:14px;z-index:2;width:38px;height:38px;' +
        'border:0;border-radius:50%;cursor:pointer;background:rgba(0,0,0,0.6);color:#fff;' +
        'font-size:20px;line-height:38px;text-align:center;padding:0;' +
        'transition:background 0.2s ease,transform 0.2s ease;}' +
      '#papi-ev-modal-close:hover{background:' + AMBER + ';color:#111;transform:scale(1.08);}' +
      '.papi-ev-modal-body{padding:28px;}' +
      /* La locandina non viene ne' stirata ne' tagliata: sta intera dentro
         al riquadro (object-fit:contain) e il vuoto ai lati lo riempie una
         copia sfocata della stessa immagine, cosi' i poster verticali non
         lasciano due bande nere. */
      '.papi-ev-cover{position:relative;width:100%;height:min(52vh,420px);' +
        'overflow:hidden;background:#0a0a0a;border-radius:18px 18px 0 0;}' +
      '.papi-ev-cover-bg{position:absolute;inset:-8%;width:116%;height:116%;' +
        'object-fit:cover;filter:blur(26px) saturate(130%) brightness(0.45);' +
        'transform:scale(1.06);}' +
      '.papi-ev-cover-img{position:relative;width:100%;height:100%;' +
        'object-fit:contain;display:block;}' +
      '.papi-ev-chip{display:inline-block;background:rgba(245,184,0,0.12);color:' + AMBER + ';' +
        'border:1px solid rgba(245,184,0,0.3);border-radius:999px;padding:5px 14px;' +
        'font-family:monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;}' +
      '.papi-ev-modal-sub{margin:14px 0 0;color:rgba(255,255,255,0.5);font-size:14px;}' +
      '.papi-ev-lineup{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:8px;}' +
      '.papi-ev-lineup li{background:#1d1d1d;border:1px solid rgba(255,255,255,0.08);' +
        'border-radius:8px;padding:8px 14px;color:#fff;font-size:14px;}' +
      '.papi-ev-cta{display:inline-flex;align-items:center;gap:8px;font-weight:700;font-size:14px;' +
        'padding:12px 22px;border-radius:8px;text-decoration:none;letter-spacing:0.03em;' +
        'transition:opacity 0.2s ease,transform 0.2s ease;}' +
      '.papi-ev-cta:hover{opacity:0.88;transform:translateY(-1px);}' +
      '#papi-ev-modal-box::-webkit-scrollbar{width:8px;}' +
      '#papi-ev-modal-box::-webkit-scrollbar-track{background:transparent;}' +
      '#papi-ev-modal-box::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.16);' +
        'border-radius:99px;border:2px solid transparent;background-clip:content-box;}' +
      '#papi-ev-modal-box::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.28);' +
        'border:2px solid transparent;background-clip:content-box;}' +
      '#papi-cd-cifre{flex:0 1 auto;display:flex;gap:20px;text-align:center;flex-wrap:nowrap;}' +
      '.papi-cd-cella{min-width:74px;}' +
      '.papi-cd-num{font-family:"Inter Display",Inter,Arial,sans-serif;font-weight:800;' +
        'font-size:clamp(30px,5vw,52px);line-height:1;color:#fff;font-variant-numeric:tabular-nums;}' +
      '.papi-cd-lab{font-family:monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;' +
        'color:rgba(255,255,255,0.4);margin-top:8px;}' +
      /* Da telefono le quattro cifre stanno su una riga sola: le celle si
         dividono lo spazio invece di avere una larghezza minima fissa, e il
         pannello stringe i suoi margini per lasciarne di piu'. */
      '@media (max-width:700px){' +
        '#papi-countdown .papi-glass{padding:28px 20px !important;gap:22px !important;}' +
        '#papi-cd-cifre{width:100%;gap:6px;justify-content:space-between;}' +
        '.papi-cd-cella{min-width:0;flex:1 1 0;}' +
        '.papi-cd-num{font-size:clamp(24px,8.2vw,38px);}' +
        '.papi-cd-lab{font-size:9px;letter-spacing:0.1em;margin-top:6px;}' +
      '}' +
      '[data-papi-ev]{cursor:pointer;}' +
      '@keyframes papiOggiPulse{0%,100%{transform:scale(1);}50%{transform:scale(1.07);}}' +
      '@media (max-width:640px){' +
        '#papi-ev-modal{padding:0;}' +
        '#papi-ev-modal-box{max-width:100%;max-height:100vh;border-radius:0;border-left:0;border-right:0;}' +
        '.papi-ev-cover{border-radius:0;height:min(46vh,320px);}' +
        '.papi-ev-modal-body{padding:22px 18px 32px;}}';
    document.head.appendChild(st);
  }

  var _modal = null;

  function creaModal() {
    if (_modal && document.body.contains(_modal)) return _modal;
    injectCss();
    var m = document.createElement('div');
    m.id = 'papi-ev-modal';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    m.innerHTML =
      '<div id="papi-ev-modal-box">' +
        '<button id="papi-ev-modal-close" type="button" aria-label="' + T.chiudi + '">&times;</button>' +
        '<div id="papi-ev-modal-content"></div>' +
      '</div>';
    document.body.appendChild(m);

    m.addEventListener('click', function (e) { if (e.target === m) chiudiModal(); });
    m.querySelector('#papi-ev-modal-close').addEventListener('click', chiudiModal);
    _modal = m;
    return m;
  }

  /* Una sezione compare solo se il campo è pieno: se in admin non scrivi
     niente, nel modal non appare niente (né titolo né riquadro vuoto). */
  function blocco(titolo, htmlContenuto) {
    if (!htmlContenuto) return '';
    return '<div style="margin-top:26px;">' +
      '<div style="font-family:monospace;font-size:10px;color:' + AMBER + ';letter-spacing:0.15em;' +
           'text-transform:uppercase;margin-bottom:10px;">' + escHtml(titolo) + '</div>' +
      htmlContenuto +
    '</div>';
  }

  function lineupHtml(raw) {
    var testo = String(raw || '').trim();
    if (!testo) return '';
    /* accetta sia "a capo" sia virgole come separatore */
    var voci = testo.split(/[\n\r]+|,/).map(function (s) { return s.trim(); })
                    .filter(function (s) { return s.length; });
    if (!voci.length) return '';
    return '<ul class="papi-ev-lineup">' + voci.map(function (v) {
      return '<li>' + escHtml(v) + '</li>';
    }).join('') + '</ul>';
  }

  function apriModal(ev) {
    if (!ev) return;
    var m = creaModal();
    var cont = m.querySelector('#papi-ev-modal-content');

    var data = fmtDataLunga(ev.event_date);
    var ora  = fmtOra(ev.event_date);
    var orario = ora ? ora + (ev.end_time ? ' - ' + escHtml(ev.end_time) : '') : '';
    var sotto = [data, orario].filter(Boolean).join(' &middot; ');

    var ticket = safeUrl(ev.ticket_url);
    var galleria = String(ev.gallery_url || '').trim();
    var azioni = '';
    if (ticket) {
      azioni += '<a class="papi-ev-cta" href="' + escHtml(ticket) + '" target="_blank" rel="noopener" ' +
                'style="background:' + AMBER + ';color:#111;">' + T.biglietti + '</a>';
    }
    if (galleria) {
      azioni += '<a class="papi-ev-cta" href="galleria.html#event-' + escHtml(String(ev.id)) + '" ' +
                'style="border:1px solid rgba(245,184,0,0.5);color:' + AMBER + ';">' + T.galleria + '</a>';
    }

    var descr = String(ev.description || '').trim();

    cont.innerHTML =
      (ev.image_url
        ? '<div class="papi-ev-cover">' +
            '<img class="papi-ev-cover-bg" src="' + escHtml(ev.image_url) + '" alt="" aria-hidden="true">' +
            '<img class="papi-ev-cover-img" src="' + escHtml(ev.image_url) + '" alt="' + escHtml(ev.title) + '">' +
          '</div>'
        : '') +
      '<div class="papi-ev-modal-body">' +
        (sotto ? '<span class="papi-ev-chip">' + sotto + '</span>' : '') +
        '<h2 style="font-family:\'Inter Display\',Inter,Arial,sans-serif;font-weight:800;' +
             'font-size:clamp(24px,4vw,38px);color:#fff;text-transform:uppercase;letter-spacing:1.5px;' +
             'margin:16px 0 0;line-height:1.08;">' + escHtml(ev.title) + '</h2>' +

        blocco(T.dove, ev.location
          ? '<div style="color:#fff;font-size:15px;">' + escHtml(ev.location) + '</div>' : '') +

        (descr
          ? '<p style="color:rgba(255,255,255,0.62);font-size:15px;line-height:1.7;margin:22px 0 0;' +
                'white-space:pre-line;">' + escHtml(descr) + '</p>'
          : '') +

        blocco(T.lineup, lineupHtml(ev.lineup)) +

        (azioni
          ? '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:30px;">' + azioni + '</div>'
          : '') +
      '</div>';

    cont.scrollTop = 0;
    m.querySelector('#papi-ev-modal-box').scrollTop = 0;
    document.body.style.overflow = 'hidden';
    /* forza un reflow così la transizione parte davvero */
    m.classList.add('is-open');
    void m.offsetWidth;
  }

  function chiudiModal() {
    if (!_modal) return;
    _modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') chiudiModal();
  });

  /* Click in delega: le card sono ridisegnate spesso, agganciarsi a ognuna
     non reggerebbe. I link dentro la card (biglietti, galleria) restano
     cliccabili e non aprono il modal. */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest && t.closest('a,button')) return;
    var card = t.closest && t.closest('[data-papi-ev]');
    if (!card) return;
    var id = card.getAttribute('data-papi-ev');
    var ev = _byId[String(id)];
    if (!ev) return;
    e.preventDefault();
    apriModal(ev);
  });

  /* ══════════════════════════════════════════════════════════
     2. COUNTDOWN — solo in home, sotto la hero
     ══════════════════════════════════════════════════════════ */

  function prossimoEvento(eventi) {
    var ora = Date.now();
    var futuri = eventi.filter(function (e) {
      var fine = fineEvento(e);
      return fine && fine.getTime() > ora;
    });
    futuri.sort(function (a, b) { return new Date(a.event_date) - new Date(b.event_date); });
    return futuri[0] || null;
  }

  function cellaHtml(valore, etichetta) {
    return '<div class="papi-cd-cella">' +
      '<div class="papi-cd-num">' + valore + '</div>' +
      '<div class="papi-cd-lab">' + etichetta + '</div>' +
    '</div>';
  }

  function costruisciCountdown(ev) {
    var sec = document.createElement('section');
    sec.id = 'papi-countdown';
    sec.setAttribute('data-papi-ev', String(ev.id));
    /* La sezione resta trasparente (sotto scorre lo sfondo del sito): il
       vetro sta sul pannello interno, cosi' sfoca le stelle che ci passano
       dietro invece di coprirle. */
    sec.className = 'papi-sez';
    sec.style.cssText = 'padding-top:56px;padding-bottom:56px;background:transparent;';
    sec.innerHTML =
      '<div class="papi-cont papi-glass" style="display:flex;flex-wrap:wrap;gap:32px;' +
           'align-items:center;justify-content:space-between;padding:40px 36px;box-sizing:border-box;">' +
        '<div style="flex:1 1 260px;min-width:0;">' +
          '<div class="papi-tag"><span id="papi-cd-label">' + T.prossimo + '</span></div>' +
          '<h2 class="papi-h" style="margin:0;">' + escHtml(ev.title) + '</h2>' +
          '<div style="color:rgba(255,255,255,0.45);font-size:14px;margin-top:14px;">' +
            fmtDataLunga(ev.event_date) +
            (ev.event_date ? ' &middot; ' + fmtOra(ev.event_date) +
              (ev.end_time ? ' - ' + escHtml(ev.end_time) : '') : '') +
          '</div>' +
        '</div>' +
        '<div id="papi-cd-cifre"></div>' +
      '</div>';
    return sec;
  }

  var _timer = null;

  function avviaCountdown(ev, sec) {
    var cifre = sec.querySelector('#papi-cd-cifre');
    var label = sec.querySelector('#papi-cd-label');
    var inizio = new Date(ev.event_date).getTime();
    var fine = fineEvento(ev);
    var fineMs = fine ? fine.getTime() : inizio;

    function tick() {
      var ora = Date.now();

      /* durante la serata il countdown lascia il posto a "LIVE ORA" */
      if (ora >= inizio && ora < fineMs) {
        label.textContent = T.live;
        label.style.color = AMBER;
        label.style.fontWeight = '600';
        cifre.innerHTML = '';
        return;
      }
      /* finito: ricarica la lista e passa al prossimo */
      if (ora >= fineMs) {
        clearInterval(_timer);
        _cache = null;
        sec.parentNode && sec.parentNode.removeChild(sec);
        montaCountdown();
        return;
      }

      var d = inizio - ora;
      var gg = Math.floor(d / 86400000);
      var hh = Math.floor(d / 3600000) % 24;
      var mm = Math.floor(d / 60000) % 60;
      var ss = Math.floor(d / 1000) % 60;

      cifre.innerHTML =
        (gg > 0 ? cellaHtml(String(gg), T.giorni) : '') +
        cellaHtml(due(hh), T.ore) +
        cellaHtml(due(mm), T.minuti) +
        cellaHtml(due(ss), T.secondi);
    }

    tick();
    clearInterval(_timer);
    _timer = setInterval(tick, 1000);
  }

  /* Subito sotto la hero: il primo blocco che incontri scendendo è la
     sezione eventi, quindi ci infiliamo appena prima. */
  function ancoraCountdown() {
    return document.getElementById('eventselection')
        || document.getElementById('aboutku')
        || document.getElementById('about');
  }

  function montaCountdown() {
    if (!IS_HOME) return true;
    if (document.getElementById('papi-countdown')) return true;
    var anchor = ancoraCountdown();
    if (!anchor || !anchor.parentNode) return false;

    return caricaEventi().then(function (eventi) {
      var ev = prossimoEvento(eventi);
      if (!ev) return true;
      if (document.getElementById('papi-countdown')) return true;
      var a = ancoraCountdown();
      if (!a || !a.parentNode) return false;
      var sec = costruisciCountdown(ev);
      a.parentNode.insertBefore(sec, a);
      avviaCountdown(ev, sec);
      return true;
    });
  }

  /* ── avvio ── */
  function run() {
    injectCss();
    caricaEventi();
    if (!IS_HOME) return;
    /* Framer idrata dopo il primo paint e può sostituire il DOM: riproviamo
       per qualche secondo. montaCountdown è idempotente. */
    var tries = 0;
    var iv = setInterval(function () {
      montaCountdown();
      if (++tries >= 20 || document.getElementById('papi-countdown')) clearInterval(iv);
    }, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(run, 400); });
  } else {
    setTimeout(run, 400);
  }

  /* usata dagli script delle card per registrare gli eventi già scaricati */
  window.PapiEventi = {
    apri: apriModal,
    registra: function (rows) {
      (rows || []).forEach(function (e) { _byId[String(e.id)] = e; });
    }
  };
})();
