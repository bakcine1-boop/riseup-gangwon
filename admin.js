/* RISE UP, GANGWON! 2026 — 신청 관리 */
(function () {
  'use strict';
  var API = 'tables/registrations';
  var ALL = [], VIEW = [], SEL = {}, page = 1, PER = 30, sortKey = 'created_at', sortDir = -1, charts = {};

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(n) { return (n || 0).toLocaleString('ko-KR'); }
  function dt(ts) { if (!ts) return '-'; var d = new Date(+ts || ts); return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  function dkey(ts) { var d = new Date(+ts || ts); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  var tt; function toast(m) { var t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('show'); }, 2200); }

  /* D-day */
  var diff = new Date('2026-12-12T15:00:00+09:00') - new Date();
  $('#ad-dday').textContent = diff > 0 ? 'D-' + Math.ceil(diff / 864e5) : 'D-DAY';

  /* ── 데이터 로드 (전체 페이지) ── */
  function load() {
    ALL = [];
    $('#tbody').innerHTML = '<tr><td colspan="13" class="empty">불러오는 중…</td></tr>';
    function get(p) {
      return fetch(API + '?page=' + p + '&limit=200&sort=-created_at').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
        var d = (j.data || []).filter(function (x) { return !x.deleted; });
        ALL = ALL.concat(d);
        if ((j.data || []).length === 200 && p < 50) return get(p + 1);
      });
    }
    return get(1).then(function () { fillRegions(); stats(); apply(); })
      .catch(function () { $('#tbody').innerHTML = '<tr><td colspan="13" class="empty">데이터를 불러오지 못했습니다.</td></tr>'; });
  }

  function fillRegions() {
    var s = $('#f-region'), cur = s.value, set = {};
    ALL.forEach(function (r) { if (r.region) set[r.region] = 1; });
    s.innerHTML = '<option value="">전체 지역</option>' + Object.keys(set).sort().map(function (k) { return '<option>' + esc(k) + '</option>'; }).join('');
    s.value = cur;
  }

  /* ── 통계 ── */
  function stats() {
    var act = ALL.filter(function (r) { return r.status !== '취소'; });
    var total = 0, youth = 0, ch = {}, bus = 0;
    act.forEach(function (r) { total += +r.headcount || 0; youth += +r.youth_count || 0; if (r.church) ch[r.church.replace(/\s/g, '')] = 1; if (r.bus) bus++; });
    $('#k-total').textContent = fmt(total);
    $('#k-count').textContent = fmt(ALL.length);
    $('#k-p').textContent = ALL.filter(function (r) { return r.reg_type !== '단체'; }).length;
    $('#k-g').textContent = ALL.filter(function (r) { return r.reg_type === '단체'; }).length;
    $('#k-youth').textContent = fmt(youth);
    $('#k-youth-r').textContent = '전체의 ' + (total ? Math.round(youth / total * 100) : 0) + '%';
    $('#k-church').textContent = fmt(Object.keys(ch).length);
    $('#k-bus').textContent = bus;
    $('#k-wait').textContent = ALL.filter(function (r) { return (r.status || '대기') === '대기'; }).length;
    $('#k-ok').textContent = ALL.filter(function (r) { return r.status === '확정'; }).length;
    $('#k-cancel').textContent = ALL.filter(function (r) { return r.status === '취소'; }).length;
    drawCharts(act);
  }

  function drawCharts(act) {
    if (!window.Chart) return;
    Chart.defaults.color = 'rgba(255,255,255,.5)';
    Chart.defaults.borderColor = 'rgba(255,255,255,.06)';
    Chart.defaults.font.family = "'Pretendard Variable',sans-serif";
    var daily = {}; act.forEach(function (r) { var k = dkey(r.created_at); daily[k] = (daily[k] || 0) + (+r.headcount || 0); });
    var dk = Object.keys(daily).sort(), cum = 0, cumArr = dk.map(function (k) { cum += daily[k]; return cum; });
    var reg = {}; act.forEach(function (r) { var k = r.region || '미입력'; reg[k] = (reg[k] || 0) + (+r.headcount || 0); });
    var rk = Object.keys(reg).sort(function (a, b) { return reg[b] - reg[a]; }).slice(0, 10);
    var cat = {}; act.filter(function (r) { return r.reg_type !== '단체'; }).forEach(function (r) { var k = r.category || '기타'; cat[k] = (cat[k] || 0) + (+r.headcount || 0); });
    var ck = Object.keys(cat);

    function mk(id, cfg) { if (charts[id]) charts[id].destroy(); charts[id] = new Chart(document.getElementById(id), cfg); }
    mk('ch-daily', { type: 'bar', data: { labels: dk.map(function (k) { return k.slice(5).replace('-', '/'); }), datasets: [
      { type: 'line', label: '누적', data: cumArr, borderColor: '#5fd3ff', backgroundColor: 'rgba(0,174,239,.1)', fill: true, tension: .35, yAxisID: 'y1', pointRadius: 2 },
      { label: '일별', data: dk.map(function (k) { return daily[k]; }), backgroundColor: 'rgba(0,174,239,.55)', borderRadius: 6 }
    ] }, options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10 } } }, scales: { y: { beginAtZero: true }, y1: { beginAtZero: true, position: 'right', grid: { display: false } } } } });
    mk('ch-region', { type: 'bar', data: { labels: rk, datasets: [{ data: rk.map(function (k) { return reg[k]; }), backgroundColor: '#00aeef', borderRadius: 6 }] }, options: { indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false } } } });
    mk('ch-cat', { type: 'doughnut', data: { labels: ck, datasets: [{ data: ck.map(function (k) { return cat[k]; }), backgroundColor: ['#00aeef', '#5fd3ff', '#cfeeff', '#3b82f6', '#64748b'], borderWidth: 0 }] }, options: { maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 10 } } } } });
  }

  /* ── 필터·정렬 ── */
  function apply() {
    var q = $('#q').value.trim().toLowerCase().replace(/-/g, ''), ty = $('#f-type').value, st = $('#f-status').value, rg = $('#f-region').value;
    VIEW = ALL.filter(function (r) {
      if (ty && (r.reg_type || '개인') !== ty) return false;
      if (st && (r.status || '대기') !== st) return false;
      if (rg && r.region !== rg) return false;
      if (q) { var s = [r.name, r.phone, r.church, r.note, r.admin_memo].join(' ').toLowerCase().replace(/-/g, ''); if (s.indexOf(q) < 0) return false; }
      return true;
    });
    VIEW.sort(function (a, b) {
      var x = a[sortKey], y = b[sortKey];
      if (sortKey === 'headcount' || sortKey === 'created_at') { x = +x || 0; y = +y || 0; } else { x = String(x || ''); y = String(y || ''); }
      return (x > y ? 1 : x < y ? -1 : 0) * sortDir;
    });
    $$('.tbl th[data-sort]').forEach(function (th) { th.classList.remove('asc', 'desc'); if (th.dataset.sort === sortKey) th.classList.add(sortDir > 0 ? 'asc' : 'desc'); });
    var sum = VIEW.reduce(function (a, r) { return a + (+r.headcount || 0); }, 0);
    $('#t-info').textContent = '· ' + VIEW.length + '건 / ' + fmt(sum) + '명';
    var maxP = Math.max(1, Math.ceil(VIEW.length / PER)); if (page > maxP) page = maxP;
    render();
  }

  function render() {
    var rows = VIEW.slice((page - 1) * PER, page * PER);
    if (!rows.length) { $('#tbody').innerHTML = '<tr><td colspan="13" class="empty">신청 내역이 없습니다.</td></tr>'; }
    else $('#tbody').innerHTML = rows.map(function (r) {
      var st = r.status || '대기', ty = r.reg_type || '개인';
      return '<tr data-id="' + esc(r.id) + '"' + (SEL[r.id] ? ' class="sel"' : '') + '>' +
        '<td><input type="checkbox" class="rk"' + (SEL[r.id] ? ' checked' : '') + ' aria-label="선택"></td>' +
        '<td class="dim">' + dt(r.created_at) + '</td>' +
        '<td><span class="tag t-' + ty + '">' + ty + '</span></td>' +
        '<td><b>' + esc(r.name) + '</b>' + (r.admin_memo ? '<span class="memo-dot" title="메모 있음"></span>' : '') + '</td>' +
        '<td>' + esc(r.phone) + '</td>' +
        '<td>' + esc(r.church || '-') + '</td>' +
        '<td class="dim">' + esc(r.region || '-') + '</td>' +
        '<td class="dim">' + esc(r.category || '-') + '</td>' +
        '<td class="num"><b>' + fmt(+r.headcount) + '</b></td>' +
        '<td class="num dim">' + fmt(+r.youth_count) + '</td>' +
        '<td>' + (r.bus ? '<span class="tag t-bus">버스</span>' : '<span class="dim">-</span>') + '</td>' +
        '<td><select class="st-sel" aria-label="상태 변경">' + ['대기', '확정', '취소'].map(function (s) { return '<option' + (s === st ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></td>' +
        '<td><span class="tag s-' + st + '">' + st + '</span></td></tr>';
    }).join('');
    pager();
    syncBulk();
  }

  function pager() {
    var n = Math.ceil(VIEW.length / PER), el = $('#pager');
    if (n <= 1) { el.innerHTML = ''; return; }
    var h = '<button data-p="' + (page - 1) + '"' + (page === 1 ? ' disabled' : '') + ' aria-label="이전"><svg class="ic" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg></button>';
    for (var i = 1; i <= n; i++) if (i === 1 || i === n || Math.abs(i - page) <= 2) h += '<button data-p="' + i + '"' + (i === page ? ' class="on"' : '') + '>' + i + '</button>'; else if (Math.abs(i - page) === 3) h += '<button disabled>…</button>';
    h += '<button data-p="' + (page + 1) + '"' + (page === n ? ' disabled' : '') + ' aria-label="다음"><svg class="ic" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></button>';
    el.innerHTML = h;
  }
  $('#pager').addEventListener('click', function (e) { var b = e.target.closest('button[data-p]'); if (!b || b.disabled) return; page = +b.dataset.p; render(); window.scrollTo({ top: $('.tbl-panel').offsetTop - 70, behavior: 'smooth' }); });

  /* ── 이벤트 ── */
  var deb; $('#q').addEventListener('input', function () { clearTimeout(deb); deb = setTimeout(function () { page = 1; apply(); }, 200); });
  ['#f-type', '#f-status', '#f-region'].forEach(function (s) { $(s).addEventListener('change', function () { page = 1; apply(); }); });
  $('#btn-refresh').addEventListener('click', function () { SEL = {}; load().then(function () { toast('새로고침 완료'); }); });
  $$('.tbl th[data-sort]').forEach(function (th) { th.addEventListener('click', function () { var k = th.dataset.sort; if (sortKey === k) sortDir *= -1; else { sortKey = k; sortDir = k === 'created_at' ? -1 : 1; } apply(); }); });

  $('#tbody').addEventListener('click', function (e) {
    var tr = e.target.closest('tr[data-id]'); if (!tr) return;
    var id = tr.dataset.id;
    if (e.target.classList.contains('rk')) { if (e.target.checked) SEL[id] = 1; else delete SEL[id]; tr.classList.toggle('sel', !!SEL[id]); syncBulk(); return; }
    if (e.target.closest('.st-sel')) return;
    openModal(id);
  });
  $('#tbody').addEventListener('change', function (e) {
    if (!e.target.classList.contains('st-sel')) return;
    var id = e.target.closest('tr').dataset.id;
    patch(id, { status: e.target.value }).then(function () { toast('상태: ' + e.target.value); stats(); apply(); });
  });
  $('#sel-all').addEventListener('change', function () {
    var on = this.checked;
    VIEW.slice((page - 1) * PER, page * PER).forEach(function (r) { if (on) SEL[r.id] = 1; else delete SEL[r.id]; });
    render();
  });
  function syncBulk() {
    var n = Object.keys(SEL).length; $('#bulk').hidden = !n; $('#sel-n').textContent = n;
    var pr = VIEW.slice((page - 1) * PER, page * PER);
    $('#sel-all').checked = pr.length > 0 && pr.every(function (r) { return SEL[r.id]; });
  }
  $$('[data-bulk]').forEach(function (b) {
    b.addEventListener('click', function () {
      var ids = Object.keys(SEL), st = b.dataset.bulk;
      Promise.all(ids.map(function (id) { return patch(id, { status: st }); })).then(function () { SEL = {}; toast(ids.length + '건을 ‘' + st + '’(으)로 변경했습니다'); stats(); apply(); });
    });
  });
  $('#bulk-del').addEventListener('click', function () {
    var ids = Object.keys(SEL);
    if (!confirm(ids.length + '건을 삭제할까요? 되돌릴 수 없습니다.')) return;
    Promise.all(ids.map(del)).then(function () { SEL = {}; toast('삭제 완료'); fillRegions(); stats(); apply(); });
  });

  /* ── API ── */
  function find(id) { for (var i = 0; i < ALL.length; i++) if (ALL[i].id === id) return ALL[i]; }
  function patch(id, data) {
    return fetch(API + '/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { var r = find(id); if (r) Object.assign(r, data, j || {}); return j; })
      .catch(function () { toast('저장 실패 – 다시 시도해 주세요'); throw 0; });
  }
  function del(id) {
    return fetch(API + '/' + id, { method: 'DELETE' }).then(function (r) { if (!r.ok && r.status !== 204) throw 0; ALL = ALL.filter(function (x) { return x.id !== id; }); })
      .catch(function () { toast('삭제 실패'); });
  }

  /* ── 모달 ── */
  var modal = $('#modal'), mf = $('#m-form'), curId = null;
  function openModal(id) {
    var r = find(id); if (!r) return; curId = id;
    ['reg_type', 'status', 'name', 'phone', 'church', 'region', 'category', 'headcount', 'youth_count', 'note', 'admin_memo'].forEach(function (k) { if (mf[k]) mf[k].value = r[k] == null ? '' : r[k]; });
    if (!r.status) mf.status.value = '대기';
    if (!r.reg_type) mf.reg_type.value = '개인';
    mf.bus.checked = !!r.bus;
    $('#m-meta').textContent = '신청: ' + (r.created_at ? new Date(+r.created_at).toLocaleString('ko-KR') : '-') + (r.updated_at && r.updated_at !== r.created_at ? ' · 수정: ' + new Date(+r.updated_at).toLocaleString('ko-KR') : '');
    modal.hidden = false; document.body.style.overflow = 'hidden';
  }
  function closeModal() { modal.hidden = true; document.body.style.overflow = ''; curId = null; }
  $$('[data-close]', modal).forEach(function (b) { b.addEventListener('click', closeModal); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
  mf.addEventListener('submit', function (e) {
    e.preventDefault(); if (!curId) return;
    var d = { reg_type: mf.reg_type.value, status: mf.status.value, name: mf.name.value.trim(), phone: mf.phone.value.trim(), church: mf.church.value.trim(), region: mf.region.value.trim(), category: mf.category.value, headcount: parseInt(mf.headcount.value, 10) || 1, youth_count: parseInt(mf.youth_count.value, 10) || 0, bus: mf.bus.checked, note: mf.note.value.trim(), admin_memo: mf.admin_memo.value.trim() };
    patch(curId, d).then(function () { toast('저장되었습니다'); closeModal(); fillRegions(); stats(); apply(); });
  });
  $('#m-del').addEventListener('click', function () {
    if (!curId || !confirm('이 신청을 삭제할까요?')) return;
    var id = curId; del(id).then(function () { delete SEL[id]; toast('삭제되었습니다'); closeModal(); fillRegions(); stats(); apply(); });
  });

  /* ── CSV ── */
  $('#btn-csv').addEventListener('click', function () {
    var H = ['신청일시', '유형', '이름/담당자', '연락처', '교회/단체', '지역', '구분', '인원', '청소년·청년', '버스', '상태', '요청사항', '관리자메모'];
    var rows = VIEW.map(function (r) { return [r.created_at ? new Date(+r.created_at).toLocaleString('ko-KR') : '', r.reg_type || '개인', r.name, r.phone, r.church, r.region, r.category, r.headcount, r.youth_count, r.bus ? 'Y' : '', r.status || '대기', r.note, r.admin_memo]; });
    var csv = [H].concat(rows).map(function (a) { return a.map(function (v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\r\n');
    var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = '라이즈업강원_신청자_' + dkey(Date.now()) + '.csv'; document.body.appendChild(a); a.click(); a.remove();
    toast(VIEW.length + '건 다운로드');
  });

  /* ── 비밀번호 화면 (1212) ──
     ※ 브라우저 단 잠금은 '간단한 열람 차단'용입니다. 실제 보안은 배포 시 접근 규칙(이메일 허용)으로 강화하세요. */
  var AKEY = 'ru_admin_ok', PIN_HASH = '774b4cc0';  // FNV-1a("ru|1212")
  function h(s) { var x = 0x811c9dc5; for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 0x01000193) >>> 0; } return ('0000000' + x.toString(16)).slice(-8); }
  var pins = $$('#pin input'), loaded = false;
  function unlock() { document.body.classList.remove('auth-lock'); if (!loaded) { loaded = true; load(); } }
  function authed() { try { return sessionStorage.getItem(AKEY) === PIN_HASH; } catch (e) { return false; } }
  function tryPin() {
    var v = pins.map(function (p) { return p.value; }).join('');
    if (v.length < 4) return;
    if (h('ru|' + v) === PIN_HASH) { try { sessionStorage.setItem(AKEY, PIN_HASH); } catch (e) {} unlock(); }
    else {
      var box = $('#pin'); box.classList.remove('err'); void box.offsetWidth; box.classList.add('err');
      $('#gate-err').textContent = '비밀번호가 올바르지 않습니다';
      pins.forEach(function (p) { p.value = ''; }); pins[0].focus();
    }
  }
  pins.forEach(function (p, i) {
    p.addEventListener('input', function () {
      p.value = p.value.replace(/\D/g, '').slice(-1);
      $('#gate-err').textContent = ''; $('#pin').classList.remove('err');
      if (p.value && i < pins.length - 1) pins[i + 1].focus();
      tryPin();
    });
    p.addEventListener('keydown', function (e) { if (e.key === 'Backspace' && !p.value && i > 0) { pins[i - 1].focus(); pins[i - 1].value = ''; } });
    p.addEventListener('paste', function (e) {
      var t = ((e.clipboardData || window.clipboardData).getData('text') || '').replace(/\D/g, '').slice(0, 4);
      if (!t) return; e.preventDefault(); pins.forEach(function (q, k) { q.value = t[k] || ''; }); tryPin();
    });
  });
  $('#gate-form').addEventListener('submit', function (e) { e.preventDefault(); tryPin(); });
  $('#btn-logout').addEventListener('click', function () { try { sessionStorage.removeItem(AKEY); } catch (e) {} location.reload(); });

  if (authed()) unlock(); else setTimeout(function () { pins[0].focus(); }, 50);
})();
