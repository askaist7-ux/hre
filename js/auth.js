/* HRE auth — 회원가입 / 로그인 / 세션 (데모: 브라우저 localStorage 저장)
 * 실제 서비스에서는 아래 Store 의 메서드를 서버 API 호출(fetch)로 교체하세요.
 *   POST /api/signup, POST /api/login, POST /api/logout, GET /api/me
 */
(function () {
  'use strict';
  var USERS = 'hre_users', SESSION = 'hre_session';

  function read(store, key, def) { try { var v = store.getItem(key); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function write(store, key, val) { try { store.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; } }

  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  function randSalt() {
    var a = new Uint8Array(16);
    (window.crypto || window.msCrypto).getRandomValues(a);
    return hex(a);
  }
  function hash(pw, salt) {
    if (window.crypto && crypto.subtle) {
      var enc = new TextEncoder();
      return crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits'])
        .then(function (k) { return crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' }, k, 256); })
        .then(hex);
    }
    return Promise.resolve('x' + btoa(unescape(encodeURIComponent(salt + pw)))); // 폴백(데모용)
  }

  var Auth = {
    validEmail: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); },
    validPhone: function (v) { return !v || /^01[0-9]-?\d{3,4}-?\d{4}$/.test(v); },
    pwScore: function (v) {
      var s = 0;
      if (v.length >= 8) s++;
      if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
      if (/\d/.test(v)) s++;
      if (/[^A-Za-z0-9]/.test(v)) s++;
      return s; // 0~4
    },
    signup: function (d) {
      var users = read(localStorage, USERS, []);
      var email = d.email.trim().toLowerCase();
      if (users.some(function (u) { return u.email === email; })) return Promise.reject(new Error('이미 가입된 이메일입니다.'));
      var salt = randSalt();
      return hash(d.password, salt).then(function (h) {
        users.push({ name: d.name.trim(), email: email, phone: (d.phone || '').trim(), company: (d.company || '').trim(), salt: salt, pw: h, marketing: !!d.marketing, createdAt: new Date().toISOString() });
        if (!write(localStorage, USERS, users)) throw new Error('브라우저 저장소를 사용할 수 없습니다.');
        return true;
      });
    },
    login: function (email, password, remember) {
      email = email.trim().toLowerCase();
      var u = read(localStorage, USERS, []).filter(function (x) { return x.email === email; })[0];
      if (!u) return Promise.reject(new Error('이메일 또는 비밀번호가 올바르지 않습니다.'));
      return hash(password, u.salt).then(function (h) {
        if (h !== u.pw) throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
        var s = { name: u.name, email: u.email, at: Date.now() };
        localStorage.removeItem(SESSION); sessionStorage.removeItem(SESSION);
        write(remember ? localStorage : sessionStorage, SESSION, s);
        return s;
      });
    },
    current: function () { return read(sessionStorage, SESSION, null) || read(localStorage, SESSION, null); },
    logout: function () { try { localStorage.removeItem(SESSION); sessionStorage.removeItem(SESSION); } catch (e) {} }
  };
  window.HREAuth = Auth;

  /* 헤더의 로그인 상태 표시 */
  document.addEventListener('DOMContentLoaded', function () {
    var area = document.getElementById('authArea');
    var me = Auth.current();
    if (area && me) {
      area.innerHTML = '';
      var chip = document.createElement('span'); chip.className = 'user-chip'; chip.textContent = me.name + ' 님';
      var out = document.createElement('button'); out.className = 'btn'; out.type = 'button'; out.textContent = '로그아웃';
      out.addEventListener('click', function () { Auth.logout(); location.reload(); });
      area.appendChild(chip); area.appendChild(out);
    }
  });
})();
