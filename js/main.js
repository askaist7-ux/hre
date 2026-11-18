(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* 모바일 메뉴 */
  var nav = $('#nav'), btn = $('#menuBtn');
  if (btn && nav) {
    btn.addEventListener('click', function () { nav.classList.toggle('open'); });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); }); });
  }

  /* 운영 자산 데이터 (출처: HRE 회사소개서, 2026.11) */
  var regions = [
    ['강원도', 44.65, 15], ['경기도', 15.61, 32], ['경상남도', 13.61, 26], ['경상북도', 20.06, 32],
    ['전라남도', 20.17, 38], ['전라북도', 13.94, 21], ['충청남도', 29.06, 21], ['충청북도', 23.26, 42]
  ];
  var tbody = $('#opTable');
  if (tbody) {
    var tm = 0, tc = 0;
    regions.forEach(function (r) {
      tm += r[1]; tc += r[2];
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + r[0] + '</td><td class="n">' + r[1].toFixed(2) + '</td><td class="n">' + r[2] + '</td>';
      tbody.appendChild(tr);
    });
    var t = document.createElement('tr'); t.className = 'total';
    t.innerHTML = '<td>Total</td><td class="n">' + tm.toFixed(2) + '</td><td class="n">' + tc + '</td>';
    tbody.appendChild(t);
  }

  function bars(el, rows, unit, digits) {
    if (!el) return;
    var max = Math.max.apply(null, rows.map(function (r) { return r[1]; }));
    rows.forEach(function (r, i) {
      var d = document.createElement('div'); d.className = 'bar' + (i === 0 ? ' top' : '');
      d.innerHTML = '<span>' + r[0] + '</span><div><i data-w="' + (r[1] / max * 100).toFixed(1) + '"></i></div><b>' + r[1].toFixed(digits) + unit + '</b>';
      el.appendChild(d);
    });
  }
  bars($('#opBars'), regions.slice().sort(function (a, b) { return b[1] - a[1]; }), '', 2);
  bars($('#codBars'), [['1Q 2029', 345], ['1Q 2035', 245], ['1Q 2027', 130], ['2Q 2028', 120]], '', 0);

  /* 스크롤 등장 + 막대 애니메이션 + 숫자 카운트 */
  function count(el) {
    var target = +el.dataset.count, suf = el.dataset.suffix || '', t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1200, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString('en-US') + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function reveal(el) {
    el.classList.add('in');
    $$('.bar i', el).forEach(function (i) { i.style.width = i.dataset.w + '%'; });
    $$('[data-count]', el).forEach(function (c) { if (!reduce) count(c); });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } });
    }, { threshold: .15 });
    $$('.rv').forEach(function (el) { io.observe(el); });
  } else { $$('.rv').forEach(reveal); }

  /* 현재 섹션 메뉴 강조 */
  var links = $$('.nav a');
  var secs = links.map(function (a) { return $(a.getAttribute('href')); });
  window.addEventListener('scroll', function () {
    var y = window.scrollY + 120, cur = -1;
    secs.forEach(function (s, i) { if (s && s.offsetTop <= y) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
  }, { passive: true });
})();
