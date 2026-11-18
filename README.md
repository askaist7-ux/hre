# HRE 회사 홈페이지

순수 HTML / CSS / JavaScript 정적 사이트 (빌드 불필요). `index.html`을 브라우저로 열면 됩니다.

```
hre-site/
├─ index.html        랜딩페이지 (About · Business · Projects · Pipeline · Investor · Contact)
├─ login.html        로그인
├─ signup.html       회원가입
├─ css/style.css     디자인 (검정 / 흰색 / 포인트 #FFC400)
├─ js/main.js        메뉴, 데이터 표·막대 그래프, 스크롤 애니메이션
├─ js/auth.js        회원가입·로그인·세션 (HREAuth) + 헤더 로그인 상태 표시
├─ js/forms.js       로그인/회원가입 폼 검증·제출
└─ assets/img/       로고, 흑백 사진
```

## 인증 (데모)
- 계정은 브라우저 localStorage에 저장되고 비밀번호는 PBKDF2(SHA-256)로 해시됩니다.
- 실제 운영 시 `js/auth.js`의 `signup / login / logout / current`를 서버 API 호출로 교체하세요.
