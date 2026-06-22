/* ============================================================
   AlumKit — global.js
   Nav · reveal · count-up · barras · formulario · Tweaks
   Compartido por todas las páginas. Vanilla JS, sin dependencias.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Palettes & type stacks ---------- */
  var PALETTES = {
    institutional: { '--c-primary':'#143C7A','--c-primary-ink':'#0B2750','--c-secondary':'#2C6CDF','--c-celeste':'#DCEBFF','--c-celeste-soft':'#EFF5FF','--c-accent':'#EC6A4C' },
    ocean:         { '--c-primary':'#0E4F6E','--c-primary-ink':'#08364C','--c-secondary':'#0EA5C0','--c-celeste':'#CFF0F4','--c-celeste-soft':'#EAF8FA','--c-accent':'#F4A261' },
    forest:        { '--c-primary':'#1F4D3F','--c-primary-ink':'#103229','--c-secondary':'#2B7F66','--c-celeste':'#D6EBE2','--c-celeste-soft':'#EFF7F3','--c-accent':'#E07A5F' },
    warm:          { '--c-primary':'#3C2E5B','--c-primary-ink':'#241A3A','--c-secondary':'#7A56C9','--c-celeste':'#E5DCFB','--c-celeste-soft':'#F4EFFD','--c-accent':'#F4845F' }
  };
  var TYPE_STACKS = {
    jakarta: "'Plus Jakarta Sans', system-ui, sans-serif",
    inter:   "'Inter', system-ui, sans-serif",
    manrope: "'Manrope', system-ui, sans-serif",
    dmsans:  "'DM Sans', system-ui, sans-serif"
  };

  var DEFAULTS = { palette:'institutional', typeScale:'jakarta', useSerifAccent:true, showFloatingCards:true };
  var STORE_KEY = 'alumkit-tweaks';

  function loadTweaks() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) return Object.assign({}, DEFAULTS, JSON.parse(raw));
    } catch (e) {}
    return Object.assign({}, DEFAULTS);
  }
  function saveTweaks(t) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(t)); } catch (e) {}
  }

  var tweaks = loadTweaks();

  function applyTweaks() {
    var root = document.documentElement;
    var pal = PALETTES[tweaks.palette] || PALETTES.institutional;
    Object.keys(pal).forEach(function (k) { root.style.setProperty(k, pal[k]); });
    var stack = TYPE_STACKS[tweaks.typeScale] || TYPE_STACKS.jakarta;
    root.style.setProperty('--font-body', stack);
    root.style.setProperty('--font-display', stack);
    document.body.classList.toggle('no-serif-accent', !tweaks.useSerifAccent);
    var floats = document.querySelectorAll('.hero-floating-top, .hero-floating-card');
    floats.forEach(function (el) { el.classList.toggle('is-hidden', !tweaks.showFloatingCards); });
  }

  /* ---------- Sticky nav ---------- */
  function initNav() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    var burger = document.querySelector('.nav-burger');
    var menu = document.querySelector('.mobile-menu');
    if (!burger || !menu) return;
    var open = function () { menu.classList.add('open'); document.body.style.overflow = 'hidden'; };
    var close = function () { menu.classList.remove('open'); document.body.style.overflow = ''; };
    burger.addEventListener('click', open);
    menu.addEventListener('click', function (e) {
      if (e.target === menu || e.target.closest('.mobile-menu-close') || e.target.closest('a')) close();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Count-up stats ---------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var start = performance.now(), dur = 1600;
    function fmt(n) { return n.toLocaleString('es-AR'); }
    function tick(t) {
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.innerHTML = '<span>' + fmt(Math.round(target * eased)) + '</span>' +
                     (suffix ? '<span class="suf">' + suffix + '</span>' : '');
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  function initCounters() {
    var nums = document.querySelectorAll('.stat-num[data-count]');
    if (!nums.length) return;
    if (!('IntersectionObserver' in window)) { nums.forEach(countUp); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.3 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ---------- Breakdown bars ---------- */
  function initBars() {
    var bars = document.querySelectorAll('.bar-fill[data-pct]');
    if (!bars.length) return;
    var fill = function (el) { el.style.width = el.getAttribute('data-pct') + '%'; };
    if (!('IntersectionObserver' in window)) { bars.forEach(fill); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { setTimeout(function(){ fill(e.target); }, 120); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    bars.forEach(function (b) { io.observe(b); });
  }

  /* ---------- Contact form ---------- */
  function initForm() {
    var form = document.querySelector('#contact-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = document.querySelector('.form-success');
      if (ok) ok.classList.add('show');
      form.reset();
      if (ok) ok.scrollIntoView ? null : null;
    });
  }

  /* ---------- Tweaks panel ---------- */
  var panelEl = null;

  function buildPanel() {
    if (panelEl) return panelEl;
    var p = document.createElement('div');
    p.className = 'twk-panel';
    p.setAttribute('role', 'dialog');
    p.setAttribute('aria-label', 'Tweaks');

    var swatchColors = {
      institutional: '#143C7A', ocean: '#0E4F6E', forest: '#1F4D3F', warm: '#3C2E5B'
    };
    var swatchHtml = Object.keys(swatchColors).map(function (k) {
      return '<button class="twk-swatch" data-pal="' + k + '" title="' + k +
             '" style="background:' + swatchColors[k] + '" aria-checked="' + (tweaks.palette === k) + '"></button>';
    }).join('');

    var fontOpts = [['jakarta','Plus Jakarta Sans'],['inter','Inter'],['manrope','Manrope'],['dmsans','DM Sans']]
      .map(function (o) { return '<option value="' + o[0] + '"' + (tweaks.typeScale === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; })
      .join('');

    p.innerHTML =
      '<div class="twk-head">' +
        '<span class="twk-title">Tweaks</span>' +
        '<button class="twk-close" aria-label="Cerrar">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="twk-section">' +
        '<div class="twk-section-label">Paleta</div>' +
        '<div class="twk-swatches">' + swatchHtml + '</div>' +
      '</div>' +
      '<div class="twk-section">' +
        '<div class="twk-section-label">Tipografía</div>' +
        '<div class="twk-row"><span class="twk-label">Familia</span></div>' +
        '<select class="twk-field" data-font>' + fontOpts + '</select>' +
      '</div>' +
      '<div class="twk-section">' +
        '<div class="twk-section-label">Detalles</div>' +
        '<div class="twk-row"><span class="twk-label">Acento serif cursiva</span>' +
          '<button class="twk-toggle" data-toggle="useSerifAccent" aria-checked="' + tweaks.useSerifAccent + '"></button></div>' +
        '<div class="twk-row"><span class="twk-label">Tarjetas flotantes</span>' +
          '<button class="twk-toggle" data-toggle="showFloatingCards" aria-checked="' + tweaks.showFloatingCards + '"></button></div>' +
      '</div>';

    document.body.appendChild(p);
    panelEl = p;

    p.querySelector('.twk-close').addEventListener('click', function () { hidePanel(true); });

    p.querySelectorAll('.twk-swatch').forEach(function (sw) {
      sw.addEventListener('click', function () {
        tweaks.palette = sw.getAttribute('data-pal');
        p.querySelectorAll('.twk-swatch').forEach(function (s) {
          s.setAttribute('aria-checked', s.getAttribute('data-pal') === tweaks.palette);
        });
        applyTweaks(); saveTweaks(tweaks);
      });
    });

    p.querySelector('[data-font]').addEventListener('change', function (e) {
      tweaks.typeScale = e.target.value; applyTweaks(); saveTweaks(tweaks);
    });

    p.querySelectorAll('.twk-toggle').forEach(function (tg) {
      tg.addEventListener('click', function () {
        var key = tg.getAttribute('data-toggle');
        tweaks[key] = !tweaks[key];
        tg.setAttribute('aria-checked', tweaks[key]);
        applyTweaks(); saveTweaks(tweaks);
      });
    });

    return p;
  }

  function showPanel() { buildPanel().classList.add('open'); }
  function hidePanel(notify) {
    if (panelEl) panelEl.classList.remove('open');
    if (notify) post('__edit_mode_dismissed');
  }

  /* ---------- Host edit-mode protocol ---------- */
  function post(type, extra) {
    try { window.parent.postMessage(Object.assign({ type: type }, extra || {}), '*'); } catch (e) {}
  }
  function initHostProtocol() {
    post('__edit_mode_available');
    post('__edit_mode_set_keys', { keys: ['palette', 'typeScale', 'useSerifAccent', 'showFloatingCards'] });
    window.addEventListener('message', function (e) {
      var d = e.data || {};
      if (d.type === '__activate_edit_mode') showPanel();
      else if (d.type === '__deactivate_edit_mode') hidePanel(false);
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    applyTweaks();
    initNav();
    initMobileMenu();
    initReveal();
    initCounters();
    initBars();
    initForm();
    initHostProtocol();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

/* ============================================================
   DONADOR
   ============================================================ */
(function () {
  'use strict';

  /* -- Clave de localStorage -- */
  var STORAGE_KEY = 'alumkit_donaciones_total';

  /* -- Leer total acumulado -- */
  function getTotal() {
    return parseFloat(localStorage.getItem(STORAGE_KEY) || '0');
  }

  /* -- Guardar total acumulado -- */
  function saveTotal(n) {
    localStorage.setItem(STORAGE_KEY, n.toString());
  }

  /* -- Formatear como moneda argentina: $ 1.500,00 -- */
  function fmt(n) {
    return '$ ' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /* ---- Construir el modal (solo una vez) ---- */
  function buildModal() {
    if (document.getElementById('don-overlay')) return;

    var montos = [1500, 3000, 5000, 10000];

    var html =
      '<div id="don-overlay" role="dialog" aria-modal="true" aria-label="Realizar Donación" style="' +
        'display:none;position:fixed;inset:0;z-index:99999;' +
        'background:rgba(10,18,40,.78);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);' +
        'align-items:center;justify-content:center;padding:16px">' +

        '<div id="don-modal" style="' +
          'background:#0f172a;border-radius:18px;width:100%;max-width:420px;' +
          'box-shadow:0 24px 64px rgba(0,0,0,.6);overflow:hidden;' +
          'transform:scale(.9) translateY(20px);transition:transform .35s cubic-bezier(.34,1.56,.64,1),opacity .3s ease;opacity:0">' +

          /* Cabecera */
          '<div style="display:flex;align-items:center;justify-content:space-between;padding:22px 24px 0">' +
            '<div style="display:flex;align-items:center;gap:10px">' +
              '<div style="width:38px;height:38px;border-radius:10px;background:rgba(244,166,42, 0.85);' +
                'border:1px solid rgba(244,166,42, 0.85);display:flex;align-items:center;justify-content:center;font-size:18px">❤</div>' +
              '<h2 style="margin:0;font-family:var(--font-display,inherit);font-size:1.2rem;color:#f1f5f9;font-weight:600">Realizar Donación</h2>' +
            '</div>' +
            '<button id="don-close" aria-label="Cerrar" style="' +
              'width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.07);' +
              'border:1px solid rgba(255,255,255,.1);color:#94a3b8;font-size:16px;cursor:pointer;' +
              'display:flex;align-items:center;justify-content:center;transition:background .2s,transform .2s">✕</button>' +
          '</div>' +

          /* Total recaudado */
          '<div style="margin:18px 24px 0;padding:16px;background:rgba(255,255,255,.05);' +
            'border:1px solid rgba(255,255,255,.08);border-radius:12px;text-align:center;position:relative;overflow:hidden">' +
            '<div style="position:absolute;top:0;left:0;right:0;height:2px;' +
              'background:linear-gradient(90deg,transparent,#F4A62A,transparent)"></div>' +
            '<span style="display:block;font-size:.7rem;font-weight:700;letter-spacing:.1em;' +
              'text-transform:uppercase;color:rgba(241,245,249,.4);margin-bottom:6px">Total recaudado</span>' +
            '<span id="don-total" style="display:block;font-size:2rem;color:#F4A62A;' +
              'font-family:var(--font-display,inherit);line-height:1;' +
              'transition:transform .25s cubic-bezier(.34,1.56,.64,1)">$ 0,00</span>' +
            '<span style="display:block;font-size:.73rem;color:rgba(241, 245, 249, 0.71);margin-top:5px">' +
              'Gracias a todos los que ya donaron</span>' +
          '</div>' +

          /* Separador */
          '<hr style="border:none;border-top:1px solid rgba(255,255,255,.08);margin:18px 24px 0">' +

          /* Campo monto */
          '<div style="padding:0 24px;margin-top:16px">' +
            '<label for="don-input" style="display:block;font-size:.8rem;font-weight:600;' +
              'color:rgba(241,245,249,.6);margin-bottom:8px">Monto a donar (pesos argentinos)</label>' +
            '<div style="position:relative">' +
              '<span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);' +
                'color:#F4A62A;font-size:1.1rem;pointer-events:none">$</span>' +
              '<input id="don-input" type="number" min="1" step="1" placeholder="Ingresá el monto" style="' +
                'width:100%;box-sizing:border-box;padding:14px 14px 14px 32px;' +
                'background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.1);' +
                'border-radius:10px;color:#f1f5f9;font-size:1.2rem;outline:none;' +
                'transition:border-color .2s,box-shadow .2s;font-family:var(--font-display,inherit);' +
                '-moz-appearance:textfield" autocomplete="off" inputmode="numeric">' +
            '</div>' +
          '</div>' +

          /* Montos rápidos */
          '<div style="padding:0 24px;margin-top:12px">' +
            '<span style="display:block;font-size:.68rem;font-weight:700;letter-spacing:.1em;' +
              'text-transform:uppercase;color:rgba(241,245,249,.35);margin-bottom:8px">Sugeridos</span>' +
            '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">' +
              montos.map(function(m) {
                return '<button class="don-quick" data-m="' + m + '" type="button" style="' +
                  'padding:9px 4px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);' +
                  'border-radius:8px;color:rgba(241,245,249,.7);font-size:.78rem;font-weight:600;cursor:pointer;' +
                  'transition:all .2s;font-family:inherit">$\u00a0' + m.toLocaleString('es-AR') + '</button>';
              }).join('') +
            '</div>' +
          '</div>' +

          /* Mensaje feedback */
          '<div id="don-msg" style="' +
            'margin:12px 24px 0;padding:0 14px;border-radius:8px;font-size:.83rem;font-weight:500;' +
            'display:flex;align-items:center;gap:8px;max-height:0;overflow:hidden;opacity:0;' +
            'transition:max-height .3s ease,opacity .25s ease,padding .25s ease"></div>' +

          /* Botón Donar */
          '<div style="padding:16px 24px 24px;margin-top:4px">' +
            '<button id="don-btn" type="button" style="' +
              'width:100%;padding:15px;background:#F4A62A;color:#0f1624;border:none;' +
              'border-radius:10px;font-size:.9rem;font-weight:800;letter-spacing:.05em;' +
              'text-transform:uppercase;cursor:pointer;' +
              'transition:background .2s,transform .15s,box-shadow .2s;font-family:inherit">❤ Donar ahora</button>' +
          '</div>' +

        '</div>' + /* /.don-modal */
      '</div>'; /* /#don-overlay */

    document.body.insertAdjacentHTML('beforeend', html);
  }

  /* ---- Referencias (se resuelven después del buildModal) ---- */
  function el(id) { return document.getElementById(id); }

  /* ---- Mostrar total ---- */
  function renderTotal() {
    var t = el('don-total');
    if (!t) return;
    t.textContent = fmt(getTotal());
    /* bump animation */
    t.style.transform = 'scale(1.15)';
    setTimeout(function() { t.style.transform = 'scale(1)'; }, 280);
  }

  /* ---- Mensaje de feedback ---- */
  function showMsg(tipo, texto) {
    var m = el('don-msg');
    if (!m) return;
    var bg  = tipo === 'ok'  ? 'rgba(34,197,94,.12)'  : 'rgba(248,113,113,.12)';
    var brd = tipo === 'ok'  ? 'rgba(34,197,94,.3)'   : 'rgba(248,113,113,.3)';
    var col = tipo === 'ok'  ? '#4ade80'               : '#f87171';
    var ico = tipo === 'ok'  ? '✓' : '✕';
    m.style.cssText += ';background:' + bg + ';border:1px solid ' + brd + ';color:' + col;
    m.innerHTML = '<span>' + ico + '</span><span>' + texto + '</span>';
    m.style.maxHeight = '60px';
    m.style.opacity   = '1';
    m.style.padding   = '10px 14px';
    if (tipo === 'ok') {
      setTimeout(function() {
        m.style.maxHeight = '0'; m.style.opacity = '0'; m.style.padding = '0 14px';
      }, 3000);
    }
  }
  function hideMsg() {
    var m = el('don-msg');
    if (m) { m.style.maxHeight = '0'; m.style.opacity = '0'; m.style.padding = '0 14px'; }
  }

  /* ---- Abrir modal ---- */
  function openModal() {
    var ov = el('don-overlay');
    var mo = el('don-modal');
    if (!ov) return;
    ov.style.display = 'flex';
    /* Forzar reflow para que la transición funcione */
    void mo.offsetWidth;
    mo.style.transform = 'scale(1) translateY(0)';
    mo.style.opacity   = '1';
    document.body.style.overflow = 'hidden';
    renderTotal();
    var inp = el('don-input');
    setTimeout(function() { if (inp) inp.focus(); }, 350);
  }

  /* ---- Cerrar modal ---- */
  function closeModal() {
    var ov = el('don-overlay');
    var mo = el('don-modal');
    if (!ov) return;
    mo.style.transform = 'scale(.9) translateY(20px)';
    mo.style.opacity   = '0';
    document.body.style.overflow = '';
    setTimeout(function() {
      ov.style.display = 'none';
      var inp = el('don-input');
      if (inp) inp.value = '';
      hideMsg();
      document.querySelectorAll('.don-quick').forEach(function(b) {
        b.style.background = 'rgba(255,255,255,.06)';
        b.style.borderColor = 'rgba(255,255,255,.1)';
        b.style.color = 'rgba(241,245,249,.7)';
      });
    }, 320);
  }

  /* ---- Procesar donación ---- */
  function donate() {
    var inp = el('don-input');
    var monto = parseFloat(inp ? inp.value : '');

    if (!monto || monto <= 0) {
      if (inp) {
        inp.style.borderColor = '#f87171';
        inp.style.boxShadow   = '0 0 0 3px rgba(248,113,113,.18)';
        setTimeout(function() {
          inp.style.borderColor = 'rgba(255,255,255,.1)';
          inp.style.boxShadow   = 'none';
        }, 1800);
      }
      showMsg('err', 'Ingresá un monto mayor a $ 0.');
      return;
    }

    var nuevoTotal = getTotal() + monto;
    saveTotal(nuevoTotal);
    renderTotal();
    showMsg('ok', '¡Gracias! Donaste ' + fmt(monto) + ' 🎉');
    if (inp) inp.value = '';
    document.querySelectorAll('.don-quick').forEach(function(b) {
      b.style.background = 'rgba(255,255,255,.06)';
      b.style.borderColor = 'rgba(255,255,255,.1)';
      b.style.color = 'rgba(241,245,249,.7)';
    });
  }

  /* ---- Vincular eventos internos del modal ---- */
  function bindModal() {
    /* Cerrar */
    var cerrar = el('don-close');
    if (cerrar) cerrar.addEventListener('click', closeModal);

    /* Click fuera del modal */
    var ov = el('don-overlay');
    if (ov) ov.addEventListener('click', function(e) {
      if (e.target === ov) closeModal();
    });

    /* Escape */
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        var o = el('don-overlay');
        if (o && o.style.display === 'flex') closeModal();
      }
    });

    /* Botón donar */
    var btn = el('don-btn');
    if (btn) btn.addEventListener('click', donate);

    /* Enter en el input */
    var inp = el('don-input');
    if (inp) {
      inp.addEventListener('keydown', function(e) { if (e.key === 'Enter') donate(); });
      inp.addEventListener('input', function() {
        inp.style.borderColor = 'rgba(255,255,255,.1)';
        inp.style.boxShadow   = 'none';
        hideMsg();
      });
      inp.addEventListener('focus', function() {
        inp.style.borderColor = '#F4A62A';
        inp.style.boxShadow   = '0 0 0 3px rgba(244,166,42,.18)';
      });
      inp.addEventListener('blur', function() {
        inp.style.borderColor = 'rgba(255,255,255,.1)';
        inp.style.boxShadow   = 'none';
      });
    }

    /* Montos rápidos */
    document.querySelectorAll('.don-quick').forEach(function(b) {
      b.addEventListener('click', function() {
        document.querySelectorAll('.don-quick').forEach(function(x) {
          x.style.background  = 'rgba(255,255,255,.06)';
          x.style.borderColor = 'rgba(255,255,255,.1)';
          x.style.color       = 'rgba(241,245,249,.7)';
        });
        b.style.background  = 'rgba(244,166,42,.15)';
        b.style.borderColor = 'rgba(244,166,42,.45)';
        b.style.color       = '#F4A62A';
        var inp2 = el('don-input');
        if (inp2) { inp2.value = b.getAttribute('data-m'); inp2.focus(); }
        hideMsg();
      });
      b.addEventListener('mouseenter', function() {
        if (b.style.background.indexOf('.15') === -1) {
          b.style.background = 'rgba(255,255,255,.11)';
        }
      });
      b.addEventListener('mouseleave', function() {
        if (b.style.background.indexOf('.15') === -1) {
          b.style.background = 'rgba(255,255,255,.06)';
        }
      });
    });
  }

  /* ---- Interceptar todos los links #donar del sitio ---- */
  function interceptDonorLinks() {
    document.querySelectorAll('a[href*="#donar"]').forEach(function(a) {
      a.addEventListener('click', function(e) {
        e.preventDefault();
        openModal();
      });
    });
  }

  /* ---- Init ---- */
  function initDonadora() {
    buildModal();
    bindModal();
    interceptDonorLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDonadora);
  } else {
    initDonadora();
  }

})();

/* ============================================================
   scroll
   ============================================================ */
(function () {
  'use strict';

  function initFootTotop() {
    var btn = document.getElementById('foot-totop');
    if (!btn) return;
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFootTotop);
  } else {
    initFootTotop();
  }
})();
