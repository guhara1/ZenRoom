// 간다GO — 모바일 내비게이션 토글
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.gnb');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();
