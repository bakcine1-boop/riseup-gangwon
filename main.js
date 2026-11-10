/* ═══════════════════════════════════════════════
   RISE UP, GANGWON! 2026 — main.js
   ═══════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 행사 데이터 (여기서 한 번에 수정) ── */
  var EV = {
    title: '2026 라이즈 업 강원 – FIA WORSHIP LIVE IN WONJU',
    start: '2026-12-12T15:00:00+09:00',
    calStart: '20261212T060000Z', calEnd: '20261212T100000Z',
    venue: '연세대학교 미래캠퍼스',
    address: '강원특별자치도 원주시 흥업면 연세대길 1'
  };

  var PROGRAM = [
    { t: '14:00', n: '입장 및 사전 찬양', s: '현장 안내 · 좌석 착석', tag: 'Open' },
    { t: '15:00', n: '개회 및 환영', s: '강원특별자치도기독교총연합회', tag: 'Opening' },
    { t: '15:15', n: '다음 세대를 위한 기도', s: '강원 지역 목회자 · 청소년·청년 대표', tag: 'Prayer' },
    { t: '15:40', n: '피아워십 찬양 PART 1', s: 'FIA WORSHIP', tag: 'Worship', hl: true },
    { t: '16:30', n: '말씀과 간증', s: '이동선 목사', tag: 'Message', hl: true },
    { t: '17:10', n: '피아워십 찬양 PART 2', s: 'FIA WORSHIP · 결단과 헌신', tag: 'Worship', hl: true },
    { t: '17:50', n: '합심 기도 · 봉헌', s: '다같이', tag: 'Together' },
    { t: '18:10', n: '축도 및 폐회', s: '', tag: 'Closing' }
  ];

  var FAQ = [
    { q: '누구나 참여할 수 있나요?', a: '네. 청소년·청년을 중심으로 하지만 어린이부터 장년까지 모든 세대가 무료로 참여할 수 있습니다. 교회에 다니지 않는 친구와 함께 오셔도 좋습니다.' },
    { q: '사전 신청을 하면 좌석이 지정되나요?', a: '사전 신청은 좌석 예약이나 우선 입장을 뜻하지 않습니다. 인원 파악과 안전 준비를 위한 것이며, 입장은 현장 안내에 따라 도착 순으로 진행됩니다.' },
    { q: '몇 시까지 도착하면 좋을까요?', a: '오후 2시부터 입장이 시작됩니다. 원활한 입장을 위해 예배 시작 30분 전까지 도착하시기를 권장합니다.' },
    { q: '단체(교회·부서)로 신청하려면?', a: '참가 신청에서 ‘단체 신청’ 탭을 선택해 교회명, 담당자, 총인원을 입력해 주세요. 15인승 이상 차량으로 이동하시면 꼭 체크해 주세요. 주차 구역을 따로 안내해 드립니다.' },
    { q: '주차는 가능한가요?', a: '연세대학교 미래캠퍼스 교내 주차장을 이용하실 수 있습니다. 혼잡이 예상되니 카풀이나 교회 단체 차량 이용을 권장합니다.' },
    { q: '준비물이 있나요?', a: '12월 원주의 저녁은 매우 춥습니다. 실내라도 이동 동선을 생각해 따뜻한 외투를 꼭 챙겨 주세요. 간단한 개인 물병을 권장하며, 쓰레기는 꼭 되가져가 주세요.' },
    { q: '신청 내용을 바꾸거나 취소하고 싶어요.', a: '같은 이름·연락처로 다시 신청하시면 담당자가 확인 후 정리합니다. 취소는 주최 측 문의처로 연락해 주세요.' }
  ];

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ═══════ HERO VIDEO ═══════
     - 스플래시 동안 미리 버퍼링, 재생 성공 시 페이드인
     - 데이터 절약 모드/모션 줄이기 → 포스터 이미지만
     - 화면 밖/탭 비활성 시 자동 일시정지 */
  var vid = $('#hero-vid'), vBtn = $('#vid-btn'), userPaused = false, heroBg = $('.hero-bg');
  var conn = navigator.connection || {};
  var noVideo = reduced || conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');

  /* 영상을 못 쓸 때(저전력 모드·차단·로드 실패) → 포스터가 천천히 움직이는 시네마틱 모드 */
  function fallback() { if (heroBg) heroBg.classList.add('kb'); if (vBtn) vBtn.classList.remove('on'); }
  function shown() { if (!vid) return; vid.classList.add('playing'); if (heroBg) heroBg.classList.remove('kb'); if (vBtn) vBtn.classList.add('on'); }

  if (vid && !noVideo) {
    /* iOS Safari: muted는 속성 + 프로퍼티 모두 설정해야 자동재생 허용 */
    vid.muted = true; vid.defaultMuted = true; vid.playsInline = true;
    vid.setAttribute('muted', ''); vid.setAttribute('playsinline', ''); vid.setAttribute('webkit-playsinline', '');
    vid.addEventListener('playing', shown);
    vid.addEventListener('timeupdate', function t() { if (vid.currentTime > 0) { shown(); vid.removeEventListener('timeupdate', t); } });
    vid.addEventListener('error', fallback, true);
    var src = $('source', vid); if (src) src.addEventListener('error', fallback);
    /* 4초 안에 재생이 안 되면 모션 포스터로 */
    setTimeout(function () { if (vid && (vid.paused || vid.readyState < 3) && !vid.classList.contains('playing')) fallback(); }, 4000);
  } else { if (vid) { vid.remove(); vid = null; } fallback(); }

  function playVid() {
    if (!vid || userPaused) return;
    var p;
    try { p = vid.play(); } catch (e) { fallback(); return; }
    if (p && p.catch) p.catch(function () {
      /* iOS 저전력 모드 등 자동재생 차단 → 모션 포스터 표시, 첫 터치 시 재시도 */
      fallback();
      var retry = function () { if (!userPaused && vid) vid.play().catch(function () {}); };
      document.addEventListener('touchend', retry, { once: true, passive: true });
      document.addEventListener('click', retry, { once: true });
    });
  }
  /* 스플래시와 무관하게 즉시 재생 시도 (iOS는 사용자 제스처와 가까운 시점일수록 유리) */
  playVid();
  if (vBtn) vBtn.addEventListener('click', function () {
    if (!vid) return;
    if (vid.paused) { userPaused = false; playVid(); vBtn.classList.remove('paused'); vBtn.setAttribute('aria-label', '배경 영상 일시정지'); }
    else { userPaused = true; vid.pause(); vBtn.classList.add('paused'); vBtn.setAttribute('aria-label', '배경 영상 재생'); }
  });
  if (vid && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { if (e[0].isIntersecting) playVid(); else if (vid.classList.contains('playing')) vid.pause(); }, { threshold: .05 }).observe($('#hero'));
  }
  document.addEventListener('visibilitychange', function () { if (!vid) return; if (document.hidden) vid.pause(); else playVid(); });
  window.addEventListener('pageshow', function (e) { if (e.persisted) playVid(); });

  /* ═══════ SPLASH ═══════ */
  var splash = $('#splash'), bar = $('#sp-bar'), pct = $('#sp-pct');
  var SKEY = 'ru_splash_v1';
  function seen() { try { return !!sessionStorage.getItem(SKEY); } catch (e) { return false; } }
  function mark() { try { sessionStorage.setItem(SKEY, '1'); } catch (e) {} }

  function progress(dur) {
    return new Promise(function (res) {
      var t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var e = 1 - Math.pow(1 - p, 3);
        var v = Math.round(e * 100);
        bar.style.width = v + '%'; pct.textContent = v + '%';
        if (p < 1) requestAnimationFrame(step); else res();
      }
      requestAnimationFrame(step);
    });
  }

  function runSplash() {
    return delay(150)
      .then(function () { splash.classList.add('s1'); return delay(600); })
      .then(function () { splash.classList.add('s2'); return progress(1300); })
      .then(function () { return delay(150); })
      .then(function () {
        splash.classList.add('exit');
        return delay(500);
      })
      .then(function () {
        splash.classList.add('hide-bg');
        document.body.classList.remove('locked');
        boot();
        return delay(650);
      })
      .then(function () { splash.classList.add('gone'); mark(); return delay(350); })
      .then(function () { splash.remove(); });
  }

  if (!splash) { boot(); }
  else if (seen() || reduced) { splash.remove(); document.body.classList.remove('locked'); requestAnimationFrame(boot); }
  else { runSplash(); }

  var booted = false;
  function boot() {
    if (booted) return; booted = true;
    var hero = $('#hero'); if (hero) hero.classList.add('vis');
    playVid();
    initReveal();
    initSnow();
  }

  /* ═══════ HEADER ═══════ */
  var header = $('#site-header'), lastY = 0, mob = $('#mob-cta');
  window.addEventListener('scroll', function () {
    var y = window.pageYOffset;
    header.classList.toggle('scrolled', y > 40);
    header.classList.toggle('hidden', y > 400 && y > lastY && !document.body.classList.contains('locked'));
    lastY = y;
    if (mob) {
      var reg = $('#register'), r = reg.getBoundingClientRect();
      var inReg = r.top < window.innerHeight && r.bottom > 0;
      mob.classList.toggle('show', y > window.innerHeight * .7 && !inReg);
    }
  }, { passive: true });

  /* active nav */
  var navLinks = $$('.h-nav a[href^="#"]:not(.h-cta)');
  if ('IntersectionObserver' in window) {
    var secObs = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) navLinks.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) secObs.observe(s); });
  }

  /* mobile menu */
  var mBtn = $('#menu-btn'), mNav = $('#m-nav');
  function closeMenu() { mBtn.classList.remove('open'); mNav.classList.remove('open'); mBtn.setAttribute('aria-expanded', 'false'); document.body.classList.remove('locked'); }
  mBtn.addEventListener('click', function () {
    var open = !mNav.classList.contains('open');
    mBtn.classList.toggle('open', open); mNav.classList.toggle('open', open);
    mBtn.setAttribute('aria-expanded', open); document.body.classList.toggle('locked', open);
  });
  $$('a', mNav).forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* smooth scroll */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); if (id.length < 2) return;
      var t = $(id); if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - (id === '#hero' ? 0 : 20), behavior: 'smooth' });
    });
  });

  /* ═══════ REVEAL ═══════ */
  function initReveal() {
    var els = $$('.rv');
    if (!('IntersectionObserver' in window) || reduced) { els.forEach(function (el) { el.classList.add('vis'); }); return; }
    var obs = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('vis'); obs.unobserve(en.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { obs.observe(el); });

    /* count-up */
    $$('[data-count]').forEach(function (el) {
      var target = +el.getAttribute('data-count');
      var o = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return; o.disconnect();
        var t0 = null;
        (function step(ts) { if (!t0) t0 = ts; var p = Math.min((ts - t0) / 1400, 1); el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target); if (p < 1) requestAnimationFrame(step); })(performance.now());
      }, { threshold: .5 });
      o.observe(el);
    });
  }

  /* ═══════ STATEMENT – 스크롤에 따라 단어 점등 ═══════ */
  var stmt = $('#stmt-big');
  if (stmt) {
    var hlWords = ['다음', '세대의', '찬양이', '다시', '일어나'];
    stmt.innerHTML = stmt.textContent.trim().split(/\s+/).map(function (w) {
      var hl = hlWords.some(function (h) { return w.indexOf(h) === 0; });
      return '<span class="wd' + (hl ? ' hl' : '') + '">' + esc(w) + '</span>';
    }).join(' ');
    var words = $$('.wd', stmt);
    var paint = function () {
      var r = stmt.getBoundingClientRect(), vh = window.innerHeight;
      var p = (vh * .85 - r.top) / (r.height + vh * .35);
      p = Math.max(0, Math.min(1, p));
      var n = Math.round(p * words.length);
      words.forEach(function (w, i) { w.classList.toggle('on', i < n); });
    };
    if (reduced) words.forEach(function (w) { w.classList.add('on'); });
    else { window.addEventListener('scroll', paint, { passive: true }); paint(); }
  }

  /* ═══════ COUNTDOWN ═══════ */
  var target = new Date(EV.start);
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function tick() {
    var d = target - new Date();
    if (d < 0) d = 0;
    var days = Math.floor(d / 864e5);
    $('#cd-d').textContent = days;
    $('#cd-h').textContent = pad(Math.floor(d / 36e5 % 24));
    $('#cd-m').textContent = pad(Math.floor(d / 6e4 % 60));
    $('#cd-s').textContent = pad(Math.floor(d / 1e3 % 60));
    var dd = $('#mc-dday'); if (dd) dd.textContent = d > 0 ? 'D-' + Math.ceil(d / 864e5) : 'D-DAY';
  }
  tick(); setInterval(tick, 1000);

  /* ═══════ PROGRAM / FAQ RENDER ═══════ */
  var pl = $('#prog-list');
  if (pl) pl.innerHTML = PROGRAM.map(function (p, i) {
    return '<li class="prog-item rv' + (p.hl ? ' hl' : '') + '" style="transition-delay:' + (i * .05) + 's"><span class="pi-t">' + p.t + '</span><span class="pi-n">' + esc(p.n) + (p.s ? '<small>' + esc(p.s) + '</small>' : '') + '</span><span class="pi-tag">' + p.tag + '</span></li>';
  }).join('');

  var fl = $('#faq-list');
  if (fl) {
    fl.innerHTML = FAQ.map(function (f, i) {
      return '<div class="faq-item"><button type="button" class="faq-q" aria-expanded="false" aria-controls="fa-' + i + '"><span><span class="qn">' + pad(i + 1) + '</span>' + esc(f.q) + '</span><span class="faq-ic" aria-hidden="true"></span></button><div class="faq-a" id="fa-' + i + '" role="region"><div><p>' + esc(f.a) + '</p></div></div></div>';
    }).join('');
    $$('.faq-q', fl).forEach(function (b) {
      b.addEventListener('click', function () {
        var it = b.parentNode, open = it.classList.contains('open');
        $$('.faq-item.open', fl).forEach(function (o) { o.classList.remove('open'); $('.faq-q', o).setAttribute('aria-expanded', 'false'); });
        if (!open) { it.classList.add('open'); b.setAttribute('aria-expanded', 'true'); }
      });
    });
  }

  /* ═══════ LEGACY drag scroll ═══════ */
  var lg = $('#lg-scroll');
  if (lg) {
    var down = false, sx = 0, sl = 0;
    lg.addEventListener('mousedown', function (e) { down = true; sx = e.pageX; sl = lg.scrollLeft; lg.classList.add('drag'); });
    window.addEventListener('mouseup', function () { down = false; lg.classList.remove('drag'); });
    lg.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); lg.scrollLeft = sl - (e.pageX - sx) * 1.3; });
    /* 진행 인디케이터 */
    var lgBar = $('#lg-bar');
    var lgUpd = function () {
      if (!lgBar) return;
      var max = lg.scrollWidth - lg.clientWidth;
      var vis = lg.clientWidth / lg.scrollWidth;
      lgBar.style.width = Math.min(100, (vis + (max > 0 ? lg.scrollLeft / max : 1) * (1 - vis)) * 100) + '%';
    };
    lg.addEventListener('scroll', lgUpd, { passive: true });
    window.addEventListener('resize', lgUpd);
    lgUpd();
  }

  /* ═══════ SNOW (hero canvas) ═══════ */
  function initSnow() {
    var cv = $('#snow'); if (!cv || reduced) return;
    var ctx = cv.getContext('2d'), W, H, flakes = [], dpr = Math.min(window.devicePixelRatio || 1, 2), running = true;
    function size() { W = cv.offsetWidth; H = cv.offsetHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); window.addEventListener('resize', size);
    var N = W < 600 ? 36 : 100;
    for (var i = 0; i < N; i++) flakes.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.8 + .4, s: Math.random() * .5 + .2, d: Math.random() * Math.PI * 2, o: Math.random() * .5 + .25 });
    new IntersectionObserver(function (e) { running = e[0].isIntersecting; if (running) requestAnimationFrame(draw); }).observe(cv);
    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        f.y += f.s; f.d += .01; f.x += Math.sin(f.d) * .3;
        if (f.y > H + 5) { f.y = -5; f.x = Math.random() * W; }
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(207,238,255,' + f.o + ')'; ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* cursor glow */
  var cg = $('.cursor-glow');
  if (cg && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    window.addEventListener('mousemove', function (e) { cg.classList.add('on'); cg.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)'; }, { passive: true });
  }

  /* ═══════ TOAST / COPY / CAL ═══════ */
  var toastEl = $('#toast'), tt;
  function toast(m) { toastEl.textContent = m; toastEl.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { toastEl.classList.remove('show'); }, 2400); }
  function copy(text, msg) {
    function fb() { var ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast(msg); } catch (e) { alert(text); } document.body.removeChild(ta); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { toast(msg); }, fb); else fb();
  }
  function openCal() {
    window.open('https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(EV.title) + '&dates=' + EV.calStart + '/' + EV.calEnd + '&location=' + encodeURIComponent(EV.venue + ' ' + EV.address) + '&details=' + encodeURIComponent('강원의 다음 세대여, 믿음으로 일어나라! ' + location.href.split('#')[0]), '_blank', 'noopener');
  }
  var ca = $('#copy-addr'); if (ca) ca.addEventListener('click', function () { copy(EV.address + ' ' + EV.venue, '주소가 복사되었습니다'); });
  var cb = $('#cal-btn'); if (cb) cb.addEventListener('click', openCal);
  var oc = $('#ok-cal'); if (oc) oc.addEventListener('click', openCal);
  var os = $('#ok-share');
  if (os) os.addEventListener('click', function () {
    var url = location.href.split('#')[0];
    if (navigator.share) navigator.share({ title: 'RISE UP, GANGWON! 2026', text: '12월 12일(토) 오후 3시, 연세대 미래캠퍼스에서 피아워십과 함께 예배해요!', url: url }).catch(function () {});
    else copy(url, '링크가 복사되었습니다');
  });

  /* (보안) 공개 페이지는 신청 데이터를 읽지 않습니다 – 쓰기(POST)만 수행 */

  /* ═══════ REGISTER FORM ═══════ */
  var box = $('.reg-box'), form = $('#reg-form'), ok = $('#form-ok'), sub = $('#sub-btn');
  var type = '개인';
  $$('.reg-tab').forEach(function (t) {
    t.addEventListener('click', function () {
      type = t.getAttribute('data-tab');
      $$('.reg-tab').forEach(function (x) { x.classList.toggle('active', x === t); x.setAttribute('aria-selected', x === t); });
      box.classList.toggle('is-group', type === '단체');
      form.reg_type.value = type;
      var c = $('#f-count');
      if (type === '단체' && +c.value < 2) c.value = 10;
      if (type === '개인' && +c.value >= 10) c.value = 1;
      $('#f-name').placeholder = type === '단체' ? '담당자 이름' : '홍길동';
      $('#f-church').placeholder = type === '단체' ? '○○교회 청년부' : '○○교회';
    });
  });

  $$('.stepper button').forEach(function (b) {
    b.addEventListener('click', function () {
      var c = $('#f-count'); c.value = Math.max(1, Math.min(2000, (+c.value || 0) + (+b.getAttribute('data-step'))));
    });
  });

  /* 전화번호 자동 하이픈 */
  var ph = $('#f-phone');
  ph.addEventListener('input', function () {
    var v = ph.value.replace(/\D/g, '').slice(0, 11);
    ph.value = v.length < 4 ? v : v.length < 8 ? v.slice(0, 3) + '-' + v.slice(3) : v.slice(0, 3) + '-' + v.slice(3, v.length - 4) + '-' + v.slice(-4);
  });
  $$('input', form).forEach(function (i) { i.addEventListener('input', function () { i.classList.remove('err'); }); });
  $('#f-agree').addEventListener('change', function () { this.parentNode.classList.remove('err'); });

  function fail(el, msg) { el.classList.add('err'); el.focus(); toast(msg); return false; }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sub.disabled) return;
    var name = $('#f-name'), phone = $('#f-phone'), church = $('#f-church'), cnt = $('#f-count'), agree = $('#f-agree');
    var g = type === '단체';
    if (!name.value.trim()) return fail(name, g ? '담당자 이름을 입력해 주세요' : '이름을 입력해 주세요');
    if (phone.value.replace(/\D/g, '').length < 10) return fail(phone, '올바른 연락처를 입력해 주세요');
    if (g && !church.value.trim()) return fail(church, '교회/단체명을 입력해 주세요');
    var hc = parseInt(cnt.value, 10) || 0;
    if (hc < 1 || (g && hc < 2)) return fail(cnt, g ? '단체는 2명 이상 입력해 주세요' : '인원을 확인해 주세요');
    if (!agree.checked) { agree.parentNode.classList.add('err'); toast('개인정보 수집·이용에 동의해 주세요'); return; }

    var catEl = $('input[name=category]:checked', form);
    var data = {
      reg_type: type,
      name: name.value.trim(),
      phone: phone.value.trim(),
      church: church.value.trim(),
      region: $('#f-region').value,
      category: g ? '기타' : (catEl ? catEl.value : '기타'),
      headcount: hc,
      youth_count: g ? (parseInt($('#f-youth').value, 10) || 0) : ((catEl && (catEl.value === '청소년' || catEl.value === '청년')) ? hc : 0),
      bus: g ? !!form.bus.checked : false,
      note: $('#f-note').value.trim(),
      agree: true,
      status: '대기',
      admin_memo: ''
    };

    sub.disabled = true; sub.classList.add('ld'); $('.bl', sub).textContent = '신청 중…';
    fetch('https://script.google.com/macros/s/AKfycbwQbCfibWjqFoQ_BCyBEYfy-r7zgRoV4vfqkuoYvd2iehD0MZUJNsPqEkq8bm_3wd1n/exec', { method: 'POST', body: JSON.stringify({ site: 'riseup', data: data }) })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j || !j.ok) throw new Error(); return j; })
      .then(function () {
        $('#ok-msg').innerHTML = (g ? esc(data.church) + ' <b>' + hc + '명</b>' : esc(data.name) + '님') + ', 신청해 주셔서 감사합니다.<br>12월 12일(토) 오후 3시, 연세대학교 미래캠퍼스에서 만나요!';
        form.hidden = true; $('.reg-tabs').style.display = 'none'; ok.hidden = false;
        toast('참가 신청이 완료되었습니다');
        var lc = $('#live-count'); if (lc) { var cur = parseInt(lc.textContent.replace(/\D/g, ''), 10) || 0; lc.textContent = (cur + hc).toLocaleString('ko-KR'); }
      })
      .catch(function () { toast('신청 중 오류가 발생했습니다. 다시 시도해 주세요'); })
      .finally(function () { sub.disabled = false; sub.classList.remove('ld'); $('.bl', sub).textContent = '참가 신청하기'; });
  });

  $('#ok-again').addEventListener('click', function () {
    form.reset(); $('#f-count').value = type === '단체' ? 10 : 1;
    form.hidden = false; ok.hidden = true; $('.reg-tabs').style.display = '';
  });
})();
