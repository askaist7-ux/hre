(function () {
  'use strict';
  var A = window.HREAuth;
  var $ = function (id) { return document.getElementById(id); };

  function setErr(id, text) {
    var m = $(id + 'Msg'), f = $(id) && $(id).closest('.field');
    if (m) { m.textContent = text || ''; m.className = 'msg' + (text ? ' err' : ''); }
    if (f) f.classList.toggle('err', !!text);
    return !text;
  }
  function alertBox(text) { var a = $('alert'); if (!a) return; a.textContent = text || ''; a.classList.toggle('show', !!text); }
  function busy(on, label) { var b = $('submitBtn'); b.disabled = on; b.textContent = on ? '처리 중…' : label; }

  /* ---------- 로그인 ---------- */
  var lf = $('loginForm');
  if (lf) {
    if (A.current()) { location.replace('index.html'); return; }
    $('forgot').addEventListener('click', function (e) { e.preventDefault(); alertBox('비밀번호 찾기는 서버 연동 후 제공됩니다. (데모)'); });
    lf.addEventListener('submit', function (e) {
      e.preventDefault(); alertBox('');
      var email = $('email').value, pw = $('password').value;
      var ok = setErr('email', !email ? '이메일을 입력해 주세요.' : (!A.validEmail(email) ? '이메일 형식이 올바르지 않습니다.' : ''));
      ok = setErr('password', pw ? '' : '비밀번호를 입력해 주세요.') && ok;
      if (!ok) return;
      busy(true, '로그인');
      A.login(email, pw, $('remember').checked).then(function () {
        location.href = 'index.html';
      }).catch(function (err) { alertBox(err.message); busy(false, '로그인'); });
    });
  }

  /* ---------- 회원가입 ---------- */
  var sf = $('signupForm');
  if (sf) {
    if (A.current()) { location.replace('index.html'); return; }
    var bar = $('strengthBar');
    $('password').addEventListener('input', function () { bar.style.width = (A.pwScore(this.value) * 25) + '%'; });

    var agrees = Array.prototype.slice.call(document.querySelectorAll('.agree'));
    $('agreeAll').addEventListener('change', function () { var v = this.checked; agrees.forEach(function (c) { c.checked = v; }); });
    agrees.forEach(function (c) { c.addEventListener('change', function () { $('agreeAll').checked = agrees.every(function (x) { return x.checked; }); }); });

    sf.addEventListener('submit', function (e) {
      e.preventDefault(); alertBox('');
      var d = { name: $('name').value, email: $('email').value, company: $('company').value, phone: $('phone').value, password: $('password').value, marketing: $('marketing').checked };
      var ok = true;
      ok = setErr('name', d.name.trim().length < 2 ? '이름을 2자 이상 입력해 주세요.' : '') && ok;
      ok = setErr('email', !A.validEmail(d.email) ? '올바른 이메일을 입력해 주세요.' : '') && ok;
      ok = setErr('phone', !A.validPhone(d.phone) ? '연락처 형식이 올바르지 않습니다.' : '') && ok;
      ok = setErr('password', (d.password.length < 8 || !/[A-Za-z]/.test(d.password) || !/\d/.test(d.password)) ? '8자 이상, 영문과 숫자를 포함해 주세요.' : '') && ok;
      ok = setErr('password2', $('password2').value !== d.password ? '비밀번호가 일치하지 않습니다.' : '') && ok;
      var m = $('agreeMsg'), need = !($('terms').checked && $('privacy').checked);
      m.textContent = need ? '필수 약관에 동의해 주세요.' : ''; m.className = 'msg' + (need ? ' err' : '');
      if (!ok || need) return;
      busy(true, '가입하기');
      A.signup(d).then(function () {
        location.href = 'login.html?joined=1';
      }).catch(function (err) { alertBox(err.message); busy(false, '가입하기'); });
    });
  }

  if (/joined=1/.test(location.search) && $('alert')) alertBox('가입이 완료되었습니다. 로그인해 주세요.');
})();
