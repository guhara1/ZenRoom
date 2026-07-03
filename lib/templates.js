// 간다GO — 공통 템플릿·스키마 렌더러
const site = require('../data/site');

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 메타 디스크립션 80자 제한 (지시: 모든 페이지 80자 이내)
function d80(s) {
  const t = String(s).trim();
  return t.length <= 80 ? t : t.slice(0, 79) + '…';
}

const NAV = [
  ['경기 홈', '/'],
  ['경기남부', '/south/'],
  ['경기북부', '/north/'],
  ['경기서부', '/west/'],
  ['경기동부', '/east/'],
  ['도시별 안내', '/cities/'],
  ['생활권', '/life/'],
  ['프로그램', '/program/'],
  ['이용 장소', '/use/'],
  ['예약 전 확인', '/check/'],
  ['문의하기', '/contact/'],
];

function headerHtml(activePath) {
  const items = NAV.map(([label, href]) => {
    const cur = href === activePath ? ' aria-current="page"' : '';
    return `<li><a href="${href}"${cur}>${label}</a></li>`;
  }).join('');
  return `<header class="site-header">
  <div class="container site-header__inner">
    <a class="brand" href="/">간다<span class="brand__go">GO</span><span class="brand__tag">경기도 출장마사지</span></a>
    <nav aria-label="주 메뉴"><ul class="gnb">${items}</ul></nav>
    <a class="header-call" href="${site.phoneHref}">📞 ${site.phone}</a>
    <button class="nav-toggle" aria-expanded="false" aria-label="메뉴 열기">☰</button>
  </div>
</header>`;
}

function footerHtml() {
  return `<footer class="site-footer">
  <div class="container">
    <div class="site-footer__grid">
      <div>
        <h3>간다GO · 경기도 전지역 출장마사지 안내</h3>
        <p>경기도 31개 시·군 생활권별 방문 가능 지역과 호텔·오피스텔·자택 이용 전 확인사항을 안내합니다. 불법·선정적 서비스는 제공하거나 안내하지 않습니다.</p>
        <a class="footer-phone" href="${site.phoneHref}">📞 ${site.phone}</a>
        <div class="footer-cta">
          <a class="btn btn--telegram" href="${site.telegramBuild}" target="_blank" rel="noopener">웹사이트 제작문의</a>
          <a class="btn btn--telegram-outline" href="${site.telegramPartner}" target="_blank" rel="noopener">제휴문의</a>
        </div>
      </div>
      <div>
        <h3>바로가기</h3>
        <ul>
          <li><a href="/cities/">31개 시·군 안내</a></li>
          <li><a href="/life/">핵심 생활권</a></li>
          <li><a href="/station/">역세권·터미널</a></li>
          <li><a href="/program/">마사지 프로그램</a></li>
          <li><a href="/use/">이용 장소</a></li>
          <li><a href="/sitemap/">사이트맵</a></li>
        </ul>
      </div>
      <div>
        <h3>운영 정책</h3>
        <ul>
          <li><a href="/check/">예약 전 확인</a></li>
          <li><a href="/policy/operation/">운영 기준</a></li>
          <li><a href="/policy/privacy/">개인정보 처리방침</a></li>
          <li><a href="/policy/no-illegal/">불법·선정적 서비스 불가 안내</a></li>
          <li><a href="/policy/author/">작성자·검수자 안내</a></li>
          <li><a href="/contact/">문의하기</a></li>
        </ul>
      </div>
    </div>
    <div class="site-footer__legal">
      <p>상호: 간다GO&nbsp;&nbsp;|&nbsp;&nbsp;전화예약: <a href="${site.phoneHref}">${site.phone}</a></p>
      <p>© 간다GO. All rights reserved. 본 사이트는 방문형 웰니스 관리 안내 사이트이며, 불법·선정적 서비스를 제공하지 않습니다.</p>
    </div>
  </div>
</footer>
<a class="floating-call" href="${site.phoneHref}" aria-label="전화 예약 ${site.phone}">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.36 11.36 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.57 1 1 0 0 1-.25 1.02z"/></svg>
</a>
<script src="/assets/js/main.js" defer></script>`;
}

function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, url], i) => ({
      '@type': 'ListItem', position: i + 1, name,
      item: site.siteUrl + url,
    })),
  };
}

function breadcrumbHtml(items) {
  const lis = items.map(([name, url], i) =>
    i === items.length - 1
      ? `<li aria-current="page">${esc(name)}</li>`
      : `<li><a href="${url}">${esc(name)}</a></li>`
  ).join('');
  return `<nav class="breadcrumb" aria-label="현재 위치"><ol>${lis}</ol></nav>`;
}

function webPageSchema(title, desc, path) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: desc,
    url: site.siteUrl + path,
    inLanguage: 'ko',
    isPartOf: { '@type': 'WebSite', name: site.brand, url: site.siteUrl },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: site.siteUrl + site.ogImage,
    },
  };
}

function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.brand,
    url: site.siteUrl,
    telephone: site.phone,
    logo: { '@type': 'ImageObject', url: site.siteUrl + site.ogImage },
    areaServed: '경기도',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: site.phone,
      contactType: 'reservations',
      availableLanguage: 'Korean',
    },
  };
}

// FAQ 스키마 — 본문에 실제로 보이는 FAQ만 넣습니다.
function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([q, a]) => ({
      '@type': 'Question', name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

function faqHtml(faqs) {
  if (!faqs || !faqs.length) return '';
  const items = faqs.map(([q, a]) =>
    `<div class="faq-item"><h3>${esc(q)}</h3><p>${esc(a)}</p></div>`).join('\n');
  return `<h2 id="faq">자주 묻는 질문</h2>\n${items}`;
}

// Who / How / Why 블록 (모든 주요 페이지 하단)
function whwHtml() {
  return `<h2 id="who-how-why">이 페이지는 누가, 어떻게, 왜 만들었나요</h2>
<div class="whw">
  <div><h3>Who — 누가</h3><p>이 콘텐츠는 경기도 전지역 방문형 웰니스 서비스 이용 전, 사용자가 위치·건물 출입·숙소 정책·예약 기준을 확인할 수 있도록 간다GO 운영팀이 작성했습니다. 경기도 31개 시·군과 주요 생활권, 역세권, 신도시, 산업단지 기준으로 페이지를 관리합니다.</p></div>
  <div><h3>How — 어떻게</h3><p>경기도 공식 행정구역 자료, 시·군별 생활권 구조, 실제 예약 전 확인 항목, 개인정보 처리 기준, 불법·선정적 서비스 불가 원칙을 바탕으로 작성합니다. AI 보조 도구를 사용할 수 있으나, 최종 문구는 사람이 검수하고 중복·과장·허위 표현을 제거합니다.</p></div>
  <div><h3>Why — 왜</h3><p>이 페이지의 목적은 검색 순위 조작이 아니라, 경기도에서 자택·호텔·오피스텔·업무지구·산업단지 인접 숙소 이용 전 필요한 확인사항을 이해하기 쉽게 안내하는 것입니다. 제공하지 않는 서비스나 불법·선정적 내용을 암시하지 않으며, 방문 가능 여부는 실제 주소와 예약 조건 확인 후 안내합니다.</p></div>
</div>`;
}

// 불법·선정적 서비스 불가 + 개인정보 공통 안내
function policyNoticeHtml() {
  return `<h2 id="policy">개인정보 처리와 운영 원칙</h2>
<p>예약 확인과 연락에 필요한 최소 정보(연락처·방문 주소·예약 시간)만 확인하며, 이용 후 지체 없이 파기합니다. 자세한 기준은 <a href="/policy/privacy/">개인정보 처리방침</a>에서 확인할 수 있습니다.</p>
<div class="notice-box">
  <p><strong>불법·선정적 서비스 불가 안내</strong> — 간다GO는 건전한 방문형 관리 서비스만 운영합니다. 불법·선정적 서비스는 어떤 경우에도 제공하거나 안내하지 않으며, 관련 요구 시 예약이 취소됩니다. <a href="/policy/no-illegal/">전체 안내 보기</a></p>
</div>`;
}

// 예약 전 공통 체크리스트
function checklistHtml(extra) {
  const base = [
    '방문 주소(도로명 + 동·호수)를 정확히 확인했나요?',
    '건물 출입 방식(공동현관·경비실·프런트)을 확인했나요?',
    '희망 예약 시간과 변경 기준을 확인했나요?',
    '주차 가능 여부를 확인했나요?',
  ];
  const items = [...(extra || []), ...base];
  return `<h2 id="checklist">예약 전 체크리스트</h2>
<ul class="checklist">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
}

function linkListHtml(links, title) {
  if (!links || !links.length) return '';
  return `<h2 id="related">${esc(title || '관련 지역·안내 보기')}</h2>
<ul class="link-list">${links.map(([label, href]) => `<li><a href="${href}">${esc(label)}</a></li>`).join('\n')}</ul>`;
}

// 허브 페이지 공통 하단 — 서비스 소개 + 예약 절차 + 요금 + Who/How/Why
function hubIntroHtml(kind) {
  return `<h2>간다GO는 어떤 서비스인가요</h2>
<p>간다GO는 경기도 31개 시·군을 대상으로 하는 방문형 웰니스 관리 안내 서비스입니다. 관리사가 자택·호텔·오피스텔·펜션 등 예약하신 장소로 직접 방문해 60·90·120분 코스로 관리를 진행합니다. ${kind || '이 페이지의 항목'}은 예약 전에 확인하면 방문이 매끄러워지는 정보를 모은 것으로, 각 항목을 눌러 자세한 기준을 확인하실 수 있습니다.</p>`;
}

// 예약 진행 순서 안내 (지역·장소 페이지 공통)
function bookingFlowHtml() {
  return `<h2 id="booking-flow">예약 진행 순서</h2>
<ol>
  <li><strong>전화 문의</strong> — ${site.phone}로 방문 주소(또는 숙소명)와 희망 시간을 알려주세요.</li>
  <li><strong>방문 가능 확인</strong> — 건물 출입 방식, 숙소 정책, 이동 기준을 확인해 드립니다.</li>
  <li><strong>코스 선택</strong> — 60분·90분·120분 코스와 프로그램을 선택하시면 예약이 확정됩니다.</li>
  <li><strong>방문 관리</strong> — 관리사가 베드(또는 매트)·오일·수건을 준비해 방문하며, 안내된 코스 기준으로만 진행됩니다.</li>
</ol>`;
}

// 코스·요금 기준 안내 (전 페이지 공통 요금 정책)
function pricingNoteHtml() {
  const rows = site.pricing.map((p) => `<li>${p.name} — ${p.price}원 · ${p.desc}${p.featured ? ' (추천)' : ''}</li>`).join('');
  return `<h2 id="pricing-note">이용 코스와 요금 기준</h2>
<ul>${rows}</ul>
<p>코스별 기준 요금은 경기도 전 지역 동일하게 안내되며, 추가 비용 없이 있는 그대로 안내해 드립니다. ${site.pricingNote} <a href="/check/travel-fee/">상세 요금 안내 보기</a></p>`;
}

function ctaHtml() {
  return `<div class="hero__cta" style="margin-top:var(--sp-6)">
  <a class="btn btn--accent" href="${site.phoneHref}">전화 예약 ${site.phone}</a>
  <a class="btn btn--ghost" href="/check/">예약 전 확인</a>
</div>`;
}

// 전체 페이지 레이아웃
function layout({ title, desc, path, schemas = [], activePath = null, noindex = false }, body) {
  const description = d80(desc);
  const canonical = site.siteUrl + path;
  const schemaTags = schemas
    .map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join('\n  ');
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  ${noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow">'}
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${site.brand}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${site.siteUrl}${site.ogImage}">
  <meta property="og:locale" content="ko_KR">
  <link rel="preload" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/woff2/PretendardVariable.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
  <link rel="stylesheet" href="/assets/css/tokens.css">
  <link rel="stylesheet" href="/assets/css/style.css">
  ${schemaTags}
</head>
<body>
<a class="skip-link" href="#main">본문 바로가기</a>
${headerHtml(activePath)}
<main id="main">
${body}
</main>
${footerHtml()}
</body>
</html>`;
}

module.exports = {
  esc, d80, layout,
  breadcrumbHtml, breadcrumbSchema,
  webPageSchema, organizationSchema, faqSchema, faqHtml,
  whwHtml, policyNoticeHtml, checklistHtml, linkListHtml, ctaHtml,
  bookingFlowHtml, pricingNoteHtml, hubIntroHtml,
  site,
};
