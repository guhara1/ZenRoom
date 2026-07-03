#!/usr/bin/env node
// 간다GO 정적 사이트 빌더 — `node build.js` 실행 시 저장소 루트에 HTML을 생성합니다.
const fs = require('fs');
const path = require('path');

const T = require('./lib/templates');
const site = require('./data/site');
const regions = require('./data/regions');
const areas = require('./data/areas');
const cities = require('./data/cities');
const life = require('./data/life');
const stations = require('./data/stations');
const newtowns = require('./data/newtowns');
const places = require('./data/places');
const checks = require('./data/check');
const programs = require('./data/programs');
const admin = require('./data/admin');
const romanize = require('./lib/romanize');
const dongContent = require('./lib/dongContent');

const OUT = __dirname;
const pages = []; // sitemap.xml 수집: {path, priority, noindex}

function write(relPath, html, { priority = 0.6, noindex = false } = {}) {
  const dir = path.join(OUT, relPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  pages.push({ path: relPath.replace(/\/?$/, '/').replace(/^\/?/, '/'), priority, noindex });
}

const regionBySlug = Object.fromEntries(regions.map((r) => [r.slug, r]));
const areaBySlug = Object.fromEntries(areas.map((a) => [a.slug, a]));
const cityBySlug = Object.fromEntries(cities.map((c) => [c.slug, c]));
const lifeBySlug = Object.fromEntries(life.map((l) => [l.slug, l]));

const SHARED_FAQ = [
  ['경기도 전지역 방문이 가능한가요?', '실제 방문 주소, 가까운 생활권, 예약 가능 시간, 이동 기준을 확인한 뒤 안내합니다. 정확한 주소를 알려주시면 가장 빠르게 확인됩니다.'],
  ['불법·선정적 서비스도 가능한가요?', '불법·선정적 서비스는 제공하거나 안내하지 않습니다. 건전한 방문형 관리 서비스만 운영합니다.'],
];

function pricingHtml() {
  const cards = site.pricing.map((p) => `
    <div class="price-card${p.featured ? ' price-card--featured' : ''}">
      ${p.featured ? '<span class="price-card__badge">추천</span>' : ''}
      <div class="price-card__name">${p.name}</div>
      <div class="price-card__price">${p.price}<small>원</small></div>
      <div class="price-card__time">${p.time}</div>
      <p class="price-card__desc">${p.desc}</p>
      <a class="btn ${p.featured ? 'btn--accent' : 'btn--ghost'}" href="${site.phoneHref}">예약 문의</a>
    </div>`).join('');
  return `<section class="section section--tint" id="pricing">
  <div class="container">
    <div class="section-head">
      <h2>이용 코스와 요금 살펴보기</h2>
      <p>60·90·120분 코스별 기준 요금이며, 추가 비용 없이 있는 그대로 안내해 드립니다.</p>
    </div>
    <div class="pricing-grid">${cards}</div>
    <p class="pricing-note">${site.pricingNote} <a href="/check/travel-fee/">상세 요금 안내 보기 →</a></p>
  </div>
</section>`;
}

function cardGrid(items, chips = false) {
  const cls = chips ? 'card-grid card-grid--chips' : 'card-grid';
  const lis = items.map(({ name, href, desc }) => chips
    ? `<li><a class="chip" href="${href}">${T.esc(name)}</a></li>`
    : `<li><a class="card" href="${href}"><h3>${T.esc(name)}</h3>${desc ? `<p>${T.esc(desc)}</p>` : ''}</a></li>`
  ).join('\n');
  return `<ul class="${cls}">${lis}</ul>`;
}

/* ---------------------------------------------------------------- 메인 */
function buildMain() {
  const pth = '/';
  const title = '경기도 출장마사지｜수원·성남·용인·고양·부천·평택 홈타이 지역 안내';
  const desc = '경기도 출장마사지·홈타이 31개 시·군 생활권과 호텔·오피스텔·자택 이용 기준 안내.';
  const faqs = [
    ...[
      ['경기도는 시·군별로 찾는 것이 좋나요?', '시·군명도 중요하지만, 실제 이용은 광교, 판교, 동탄, 일산, 운정, 배곧, 고덕 같은 생활권 기준으로 함께 확인하는 것이 좋습니다.'],
      ['경기남부와 경기북부는 이용 기준이 다른가요?', '네. 경기남부는 신도시·산업단지·SRT·업무지구 기준이 많고, 경기북부는 서울 접경·외곽 이동·펜션 숙소 기준이 중요합니다.'],
      ['호텔이나 출장 숙소에서도 이용할 수 있나요?', '숙소 정책, 객실 출입 가능 여부, 프런트 확인 방식 등을 먼저 확인해야 합니다. 숙소명을 알려주시면 예약 전에 확인해 드립니다.'],
      ['오피스텔은 어떤 점을 확인해야 하나요?', '공동현관, 엘리베이터, 경비실, 주차, 관리 규정, 방문 가능 시간대를 확인해야 합니다.'],
      ['외곽 지역은 추가 확인이 필요한가요?', '양평, 가평, 연천, 포천 등은 거리와 예약 시간에 따라 이동 기준이 달라질 수 있어 사전 확인이 필요합니다.'],
    ],
    ...SHARED_FAQ,
  ];
  const body = `
<section class="hero">
  <div class="container">
    <h1>경기도 출장마사지 · 31개 시군 생활권별 방문 가능 지역 안내</h1>
    <p>수원, 성남, 용인, 고양, 부천, 화성, 평택, 안산, 남양주, 파주 등 경기도 31개 시·군 주요 생활권과 호텔·오피스텔·자택 이용 전 확인사항을 안내합니다.</p>
    <div class="hero__cta">
      <a class="btn btn--accent" href="${site.phoneHref}">전화 예약 ${site.phone}</a>
      <a class="btn btn--ghost" href="/south/">경기남부 보기</a>
      <a class="btn btn--ghost" href="/north/">경기북부 보기</a>
      <a class="btn btn--ghost" href="/west/">경기서부 보기</a>
      <a class="btn btn--ghost" href="/east/">경기동부 보기</a>
      <a class="btn btn--ghost" href="/cities/">도시별 안내</a>
      <a class="btn btn--ghost" href="/check/">예약 전 확인</a>
    </div>
  </div>
</section>
<section class="section">
  <div class="container narrow">
    <h2>경기도는 도시명보다 생활권 확인이 먼저입니다</h2>
    <p class="lead">경기도는 31개 시·군으로 넓게 구성되어 있어 같은 경기도라도 수원 광교, 성남 판교, 화성 동탄, 고양 일산, 시흥 배곧, 평택 고덕, 남양주 다산의 이용 기준이 다릅니다. 이 사이트는 행정구역, 생활권, 역세권, 신도시, 산업단지, 외곽 이동 기준을 함께 안내합니다.</p>
    <p>예를 들어 같은 화성시라도 동탄역 인근 신축 오피스텔과 향남 산업단지 배후 숙소는 건물 출입 방식, 주차, 예약 가능 시간대가 전혀 다릅니다. 예약 전 실제 머무는 위치(생활권)를 기준으로 확인하면 대기 시간 없이 정확하게 안내받을 수 있습니다.</p>
  </div>
</section>
${pricingHtml()}
<section class="section">
  <div class="container">
    <div class="section-head"><h2>경기도 8대 생활권 안내</h2><p>권역별 생활권 특징과 이용 기준을 확인하세요.</p></div>
    ${cardGrid(areas.map((a) => ({ name: a.name, href: `/area/${a.slug}/`, desc: a.zones.slice(0, 4).join(' · ') })))}
  </div>
</section>
<section class="section section--tint">
  <div class="container">
    <div class="section-head"><h2>경기도 31개 시·군 안내</h2><p>시·군별 생활권과 예약 전 확인사항을 안내합니다.</p></div>
    ${cardGrid(cities.map((c) => ({ name: c.name, href: `/${c.slug}/` })), true)}
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="section-head"><h2>신도시·산업단지·역세권 생활권</h2><p>이용 문의가 많은 핵심 거점을 모았습니다.</p></div>
    ${cardGrid([
      { name: '광교신도시', href: '/use/gwanggyo-newtown/' },
      { name: '판교테크노밸리', href: '/use/pangyo-technovalley/' },
      { name: '동탄신도시', href: '/use/dongtan-newtown/' },
      { name: '평택 고덕', href: '/use/pyeongtaek-godeok-newtown/' },
      { name: '일산신도시', href: '/use/ilsan-newtown/' },
      { name: '운정신도시', href: '/use/unjeong-newtown/' },
      { name: '다산신도시', href: '/use/dasan-newtown/' },
      { name: '배곧신도시', href: '/use/baegot-newtown/' },
      { name: '반월·시화산단', href: '/use/banwol-sihwa-industrial/' },
      { name: '광명역세권', href: '/use/gwangmyeong-station-area/' },
    ], true)}
  </div>
</section>
<section class="section section--tint">
  <div class="container">
    <div class="section-head"><h2>이용 장소별 확인 기준</h2><p>장소 유형에 따라 예약 전 확인 항목이 다릅니다.</p></div>
    ${cardGrid(places.map((p) => ({ name: p.name, href: `/use/${p.slug}/` })), true)}
  </div>
</section>
<section class="section">
  <div class="container narrow article">
    <h2>예약 전 확인해야 할 내용</h2>
    <ul class="checklist">
      <li>방문 주소를 정확히 확인했나요?</li>
      <li>경기도 어느 권역인지 확인했나요?</li>
      <li>가까운 생활권과 역세권을 확인했나요?</li>
      <li>호텔·숙소 이용 가능 여부를 확인했나요?</li>
      <li>오피스텔 공동현관과 관리 규정을 확인했나요?</li>
      <li>아파트 단지 출입 방식을 확인했나요?</li>
      <li>산업단지 또는 외곽 지역 이동 기준을 확인했나요?</li>
      <li>예약 가능 시간과 변경 기준을 확인했나요?</li>
      <li>개인정보 처리 기준을 확인했나요?</li>
      <li>불법·선정적 서비스 불가 안내를 확인했나요?</li>
    </ul>
    ${T.faqHtml(faqs)}
    ${T.policyNoticeHtml()}
    ${T.whwHtml()}
  </div>
</section>`;
  const html = T.layout({
    title, desc, path: pth, activePath: pth,
    schemas: [
      T.webPageSchema(title, T.d80(desc), pth),
      T.organizationSchema(),
      T.breadcrumbSchema([['경기도 출장마사지', '/']]),
      T.faqSchema(faqs),
    ],
  }, body);
  write('', html, { priority: 1.0 });
}

/* ------------------------------------------------------------ 권역 페이지 */
function buildRegions() {
  for (const r of regions) {
    const pth = `/${r.slug}/`;
    const crumbs = [['경기도 출장마사지', '/'], [r.name, pth]];
    const bodySections = r.body.map(([h, p]) => `<h2>${T.esc(h)}</h2><p>${T.esc(p)}</p>`).join('\n');
    const cityCards = cardGrid(r.cities.map((s) => ({ name: cityBySlug[s].name, href: `/${s}/` })), true);
    const areaCards = cardGrid(r.areas.map((s) => ({ name: areaBySlug[s].name, href: `/area/${s}/`, desc: areaBySlug[s].zones.slice(0, 3).join(' · ') })));
    const faqs = SHARED_FAQ;
    const body = `
<section class="section">
  <div class="container article">
    ${T.breadcrumbHtml(crumbs)}
    <h1>${T.esc(r.h1)}</h1>
    <p class="lead">${T.esc(r.intro)}</p>
    ${T.ctaHtml()}
    ${bodySections}
    <h2>${T.esc(r.name)} 생활권 바로가기</h2>
    ${areaCards}
    <h2>${T.esc(r.name)} 시·군 안내</h2>
    ${cityCards}
    ${T.checklistHtml()}
    ${T.faqHtml(faqs)}
    ${T.linkListHtml(r.links)}
    ${T.policyNoticeHtml()}
    ${T.whwHtml()}
  </div>
</section>`;
    const html = T.layout({
      title: r.title, desc: r.desc, path: pth, activePath: pth,
      schemas: [T.webPageSchema(r.title, T.d80(r.desc), pth), T.breadcrumbSchema(crumbs), T.faqSchema(faqs)],
    }, body);
    write(`${r.slug}`, html, { priority: 0.9 });
  }
}

/* ------------------------------------------------------- 8대 생활권 페이지 */
function buildAreas() {
  // 허브
  const hubPath = '/area/';
  const hubCrumbs = [['경기도 출장마사지', '/'], ['8대 생활권', hubPath]];
  const hubBody = `
<section class="section"><div class="container article">
  ${T.breadcrumbHtml(hubCrumbs)}
  <h1>경기도 8대 생활권 안내</h1>
  <p class="lead">경기도를 실제 이용 흐름에 맞춘 8개 생활권으로 나눠 안내합니다. 도시명보다 머무는 생활권 기준으로 확인하면 예약이 빠르고 정확해집니다.</p>
  ${cardGrid(areas.map((a) => ({ name: a.name, href: `/area/${a.slug}/`, desc: a.zones.slice(0, 4).join(' · ') })))}
  ${T.hubIntroHtml('경기도 8대 생활권')}
  ${T.bookingFlowHtml()}
  ${T.pricingNoteHtml()}
  ${T.policyNoticeHtml()}
</div></section>`;
  write('area', T.layout({
    title: '경기도 8대 생활권 안내｜간다GO', desc: '경기도 8대 생활권별 특징과 출장마사지 이용 기준을 안내합니다.',
    path: hubPath, schemas: [T.webPageSchema('경기도 8대 생활권 안내', '경기도 8대 생활권별 이용 기준 안내', hubPath), T.breadcrumbSchema(hubCrumbs)],
  }, hubBody), { priority: 0.8 });

  for (const a of areas) {
    const pth = `/area/${a.slug}/`;
    const crumbs = [['경기도 출장마사지', '/'], ['8대 생활권', '/area/'], [a.name, pth]];
    const zones = a.zones.map((z) => `<li>${T.esc(z)}</li>`).join('');
    const bodySections = a.body.map(([h, p]) => `<h2>${T.esc(h)}</h2><p>${T.esc(p)}</p>`).join('\n');
    const cityCards = cardGrid(a.cities.filter((s) => cityBySlug[s]).map((s) => ({ name: cityBySlug[s].name, href: `/${s}/` })), true);
    const faqs = [
      [`${a.name}은 어떤 기준으로 확인하나요?`, '실제 머무는 생활권(동·단지·숙소)과 건물 유형을 기준으로 확인합니다. 주소를 알려주시면 이동 기준을 바로 안내해 드립니다.'],
      ...SHARED_FAQ,
    ];
    const body = `
<section class="section"><div class="container article">
  ${T.breadcrumbHtml(crumbs)}
  <h1>${T.esc(a.h1)}</h1>
  <p class="lead">${T.esc(a.intro)}</p>
  ${T.ctaHtml()}
  <h2>대표 생활권</h2>
  <ul>${zones}</ul>
  ${bodySections}
  <h2>포함 시·군 안내</h2>
  ${cityCards}
  ${T.checklistHtml()}
  ${T.faqHtml(faqs)}
  ${T.linkListHtml(a.links)}
  ${T.policyNoticeHtml()}
  ${T.whwHtml()}
</div></section>`;
    write(`area/${a.slug}`, T.layout({
      title: a.title, desc: a.desc, path: pth,
      schemas: [T.webPageSchema(a.title, T.d80(a.desc), pth), T.breadcrumbSchema(crumbs), T.faqSchema(faqs)],
    }, body), { priority: 0.8 });
  }
}

/* --------------------------------------------------------- 시·군 페이지 */
function buildCities() {
  // 허브
  const hubPath = '/cities/';
  const hubCrumbs = [['경기도 출장마사지', '/'], ['31개 시·군 안내', hubPath]];
  const grouped = ['south', 'north', 'west', 'east'].map((rs) => {
    const r = regionBySlug[rs];
    const list = cities.filter((c) => c.region === rs);
    return `<h2>${T.esc(r.name)}</h2>${cardGrid(list.map((c) => ({ name: c.name, href: `/${c.slug}/` })), true)}`;
  }).join('\n');
  write('cities', T.layout({
    title: '경기도 31개 시·군 출장마사지 안내｜간다GO',
    desc: '경기도 31개 시·군별 생활권과 출장마사지 예약 전 확인사항을 안내합니다.',
    path: hubPath, activePath: hubPath,
    schemas: [T.webPageSchema('경기도 31개 시·군 안내', '경기도 31개 시·군별 이용 기준 안내', hubPath), T.breadcrumbSchema(hubCrumbs)],
  }, `<section class="section"><div class="container article">
  ${T.breadcrumbHtml(hubCrumbs)}
  <h1>경기도 31개 시·군 안내</h1>
  <p class="lead">경기도 전 시·군의 생활권 특징과 예약 전 확인사항을 안내합니다. 정확한 주소 기준으로 확인하면 어느 지역이든 빠르게 안내됩니다.</p>
  ${grouped}
  ${T.hubIntroHtml('경기도 31개 시·군')}
  ${T.bookingFlowHtml()}
  ${T.pricingNoteHtml()}
  ${T.policyNoticeHtml()}
</div></section>`), { priority: 0.8 });

  for (const c of cities) {
    const pth = `/${c.slug}/`;
    const region = regionBySlug[c.region];
    const area = areaBySlug[c.area];
    const crumbs = [['경기도 출장마사지', '/'], [region.name, `/${region.slug}/`], [`${c.name} 출장마사지`, pth]];
    const title = `${c.name} 출장마사지 안내｜${c.zones.slice(0, 3).join('·')} 생활권 이용 기준`;
    const desc = `${c.name} 출장마사지 ${c.zones.slice(0, 3).join('·')} 생활권과 숙소·오피스텔 예약 전 확인 안내.`;
    const faqs = [...c.faq, ...SHARED_FAQ];
    const nightNote = c.tier === 3
      ? `${c.name}은 외곽권으로 심야 시간대 이동 기준이 도심과 다릅니다. 야간·심야 예약은 반드시 사전에 협의해 주시고, 숙소 출입 가능 여부를 함께 확인해 주세요.`
      : `야간·심야 예약 시에는 공동현관 출입 방법과 주차 위치 확인이 추가로 필요합니다. ${c.name} 도심 생활권은 늦은 시간에도 안내가 가능하니 희망 시간을 알려주세요.`;
    const links = [
      ...c.links,
      [`${region.name} 전체 생활권 보기`, `/${region.slug}/`],
      [`${area.name} 생활권 안내`, `/area/${area.slug}/`],
    ];
    // 행정구(있는 도시) 또는 행정동·읍·면 버튼 섹션
    const ad = admin[c.slug];
    let adminSection = '';
    if (ad && ad.gus) {
      adminSection = `<h2>${T.esc(c.name)} 행정구 안내</h2>
  <p>${T.esc(c.name)}는 ${ad.gus.map((g) => g.name).join('·')} ${ad.gus.length}개 일반구로 나뉩니다. 구를 선택하면 행정동별 방문 안내를 확인할 수 있습니다.</p>
  ${cardGrid(ad.gus.map((g) => ({ name: g.name, href: `/${c.slug}/${g.slug}/` })), true)}`;
    } else if (ad && ad.dongs) {
      adminSection = `<h2>${T.esc(c.name)} 행정동·읍·면 안내</h2>
  <p>방문하실 행정동·읍·면을 선택하면 해당 지역 방문 안내를 확인할 수 있습니다. 1동·2동처럼 번호로 나뉜 행정동은 생활권이 같아 대표 페이지 하나로 함께 안내합니다.</p>
  ${cardGrid(ad.dongs.map((d) => ({ name: d, href: `/${c.slug}/${romanize(d)}/` })), true)}`;
    }
    const body = `
<section class="section"><div class="container article">
  ${T.breadcrumbHtml(crumbs)}
  <h1>${T.esc(c.name)} 출장마사지 · ${T.esc(c.zones.slice(0, 3).join('·'))} 생활권 이용 안내</h1>
  <p class="lead">${T.esc(c.intro)}</p>
  ${T.ctaHtml()}
  <h2>${T.esc(c.name)} 생활권 특징</h2>
  <p>${T.esc(c.living)}</p>
  <p>대표 생활권: ${c.zones.map((z) => T.esc(z)).join(', ')}</p>
  ${adminSection}
  <h2>가까운 역세권과 이동 기준</h2>
  <p>${T.esc(c.transit)}</p>
  <h2>호텔·숙소 이용 전 확인</h2>
  <p>${T.esc(c.stay)}</p>
  <p>호텔·모텔·레지던스는 숙소마다 외부인 객실 방문 정책이 다릅니다. 체크인 이후 시간대로 예약하시고, 방문이 어려운 숙소는 인근 대안을 안내해 드립니다. <a href="/check/hotel-policy/">호텔 정책 확인 안내 보기</a></p>
  <h2>오피스텔·아파트 이용 전 확인</h2>
  <p>오피스텔은 공동현관 출입 방식(비밀번호·세대 호출·경비실 경유)을, 아파트 단지는 방문 차량 등록 여부를 예약 전에 확인해 주세요. 도착 시 세대 호출 방식이 가장 일반적이며, 단지명과 동·호수를 알려주시면 방문 절차를 미리 안내해 드립니다. <a href="/check/building-access/">건물 출입 확인 안내 보기</a></p>
  <h2>산업단지·신도시·외곽 이동 기준</h2>
  <p>${T.esc(c.extra)}</p>
  <h2>야간 예약 전 확인</h2>
  <p>${T.esc(nightNote)}</p>
  ${T.checklistHtml([`${c.name} 안에서도 어느 생활권(${c.zones.slice(0, 3).join('·')})인지 확인했나요?`])}
  ${T.faqHtml(faqs)}
  ${T.linkListHtml(links, '관련 지역 보기')}
  ${T.policyNoticeHtml()}
  ${T.whwHtml()}
</div></section>`;
    write(`${c.slug}`, T.layout({
      title, desc, path: pth,
      schemas: [T.webPageSchema(title, T.d80(desc), pth), T.breadcrumbSchema(crumbs), T.faqSchema(faqs)],
    }, body), { priority: c.tier === 1 ? 0.9 : 0.7 });
  }
}

/* ------------------------------------------------ 행정구·행정동 페이지 */
function dongPage(c, gu, dongName) {
  const dslug = romanize(dongName);
  const rel = gu ? `${c.slug}/${gu.slug}/${dslug}` : `${c.slug}/${dslug}`;
  const pth = `/${rel}/`;
  const region = regionBySlug[c.region];
  const dc = dongContent.build({ city: c, gu, name: dongName, region });
  const crumbs = [
    ['경기도 출장마사지', '/'],
    [c.name, `/${c.slug}/`],
    ...(gu ? [[gu.name, `/${c.slug}/${gu.slug}/`]] : []),
    [dongName, pth],
  ];
  const title = `${c.name} ${dongName} 출장마사지｜${dc.label} 방문 안내`;
  const desc = `${c.name}${gu ? ' ' + gu.name : ''} ${dongName} 출장마사지 방문 기준과 예약 전 확인 안내.`;
  const faqs = [...dc.faq, ...SHARED_FAQ];
  const sectionsHtml = dc.sections
    .map(([h, p]) => `<h2>${T.esc(h)}</h2><p>${T.esc(p)}</p>`).join('\n  ');
  const links = [
    [`${c.name} 전체 안내`, `/${c.slug}/`],
    ...(gu ? [[`${gu.name} 행정동 안내`, `/${c.slug}/${gu.slug}/`]] : []),
    ...c.links.slice(0, 2),
    ...dc.uses,
    [`${region.name} 생활권 보기`, `/${region.slug}/`],
  ];
  const body = `
<section class="section"><div class="container article">
  ${T.breadcrumbHtml(crumbs)}
  <h1>${T.esc(c.name)} ${T.esc(dongName)} 출장마사지 · ${T.esc(dc.label)} 방문 안내</h1>
  <p class="lead">${T.esc(dc.lead)}</p>
  ${T.ctaHtml()}
  ${sectionsHtml}
  <h2>가까운 생활권 함께 보기</h2>
  <p>${T.esc(dongName)} 방문은 ${T.esc(c.name)}의 대표 생활권(${c.zones.map((z) => T.esc(z)).join(', ')}) 기준과 함께 안내됩니다. ${T.esc(c.name)} 전체의 숙소·오피스텔·아파트 이용 기준과 역세권 정보는 <a href="/${c.slug}/">${T.esc(c.name)} 안내 페이지</a>에서 확인할 수 있습니다.</p>
  ${T.bookingFlowHtml()}
  ${T.pricingNoteHtml()}
  ${T.checklistHtml(dc.checks)}
  ${T.faqHtml(faqs)}
  ${T.linkListHtml(links, '관련 지역·안내 보기')}
  ${T.policyNoticeHtml()}
  ${T.whwHtml()}
</div></section>`;
  write(rel, T.layout({
    title, desc, path: pth,
    schemas: [T.webPageSchema(title, T.d80(desc), pth), T.breadcrumbSchema(crumbs), T.faqSchema(faqs)],
  }, body), { priority: 0.5 });
}

function buildAdmin() {
  for (const c of cities) {
    const ad = admin[c.slug];
    if (!ad) continue;
    if (ad.gus) {
      for (const gu of ad.gus) {
        const pth = `/${c.slug}/${gu.slug}/`;
        const crumbs = [['경기도 출장마사지', '/'], [c.name, `/${c.slug}/`], [gu.name, pth]];
        const title = `${c.name} ${gu.name} 출장마사지 안내｜행정동별 방문 기준`;
        const desc = `${c.name} ${gu.name} 행정동별 출장마사지 방문 안내와 예약 전 확인.`;
        const faqs = [
          [`${gu.name} 안에서는 어느 동이든 방문 가능한가요?`, `${gu.name} 전 행정동이 안내 대상입니다. 정확한 주소를 알려주시면 건물 출입 방식과 이동 기준을 예약 전에 확인해 드립니다.`],
          ...SHARED_FAQ,
        ];
        const region = regionBySlug[c.region];
        const body = `
<section class="section"><div class="container article">
  ${T.breadcrumbHtml(crumbs)}
  <h1>${T.esc(c.name)} ${T.esc(gu.name)} 출장마사지 · 행정동별 방문 안내</h1>
  <p class="lead">${T.esc(gu.note)}</p>
  ${T.ctaHtml()}
  <h2>${T.esc(gu.name)} 행정동 안내</h2>
  <p>방문하실 행정동을 선택해 주세요. 1동·2동처럼 번호로 나뉜 행정동은 생활권이 같아 대표 페이지 하나로 함께 안내합니다.</p>
  ${cardGrid(gu.dongs.map((d) => ({ name: d, href: `/${c.slug}/${gu.slug}/${romanize(d)}/` })), true)}
  <h2>아파트·오피스텔 이용 전 확인</h2>
  <p>오피스텔은 공동현관 출입 방식(비밀번호·세대 호출·경비실 경유)을, 아파트 단지는 방문 차량 등록 여부를 예약 전에 확인해 주세요. 단지명과 동·호수를 알려주시면 방문 절차를 미리 안내해 드립니다.</p>
  <h2>숙소 이용 전 확인</h2>
  <p>호텔·모텔·레지던스는 숙소마다 외부인 객실 방문 정책이 다릅니다. 숙소명을 알려주시면 방문 가능 여부를 예약 전에 확인해 드리며, 방문이 어려운 숙소는 인근 대안을 안내해 드립니다.</p>
  ${T.bookingFlowHtml()}
  ${T.pricingNoteHtml()}
  ${T.checklistHtml()}
  ${T.faqHtml(faqs)}
  ${T.linkListHtml([
    [`${c.name} 전체 안내`, `/${c.slug}/`],
    [`${region.name} 생활권 보기`, `/${region.slug}/`],
    ['이용 장소별 확인 기준', '/use/'],
    ['예약 전 확인사항', '/check/'],
  ], '관련 지역 보기')}
  ${T.policyNoticeHtml()}
  ${T.whwHtml()}
</div></section>`;
        write(`${c.slug}/${gu.slug}`, T.layout({
          title, desc, path: pth,
          schemas: [T.webPageSchema(title, T.d80(desc), pth), T.breadcrumbSchema(crumbs), T.faqSchema(faqs)],
        }, body), { priority: 0.6 });
        for (const d of gu.dongs) dongPage(c, gu, d);
      }
    } else if (ad.dongs) {
      for (const d of ad.dongs) dongPage(c, null, d);
    }
  }
}

/* --------------------------------------------------------- 생활권 페이지 */
function buildLife() {
  const hubPath = '/life/';
  const hubCrumbs = [['경기도 출장마사지', '/'], ['핵심 생활권', hubPath]];
  write('life', T.layout({
    title: '경기도 핵심 생활권 안내｜간다GO',
    desc: '광교·판교·동탄·일산 등 경기도 핵심 생활권별 이용 기준을 안내합니다.',
    path: hubPath, activePath: hubPath,
    schemas: [T.webPageSchema('경기도 핵심 생활권 안내', '경기도 핵심 생활권별 이용 기준 안내', hubPath), T.breadcrumbSchema(hubCrumbs)],
  }, `<section class="section"><div class="container article">
  ${T.breadcrumbHtml(hubCrumbs)}
  <h1>경기도 핵심 생활권 안내</h1>
  <p class="lead">실제 예약 문의가 많은 핵심 생활권을 모았습니다. 도시명보다 생활권 기준으로 확인하면 이동 기준과 건물 출입 방식을 더 정확하게 안내받을 수 있습니다.</p>
  ${cardGrid(life.map((l) => ({ name: l.name, href: `/life/${l.slug}/` })), true)}
  ${T.hubIntroHtml('핵심 생활권')}
  ${T.bookingFlowHtml()}
  ${T.pricingNoteHtml()}
  ${T.policyNoticeHtml()}
</div></section>`), { priority: 0.8 });

  for (const l of life) {
    const pth = `/life/${l.slug}/`;
    const city = cityBySlug[l.city];
    const region = regionBySlug[l.region];
    const crumbs = [['경기도 출장마사지', '/'], ['핵심 생활권', '/life/'], [`${l.name} 생활권`, pth]];
    const title = `${l.name} 출장마사지 안내｜생활권 이용 기준과 예약 전 확인`;
    const desc = `${l.name} 생활권 출장마사지 이용 기준과 숙소·오피스텔 예약 전 확인 안내.`;
    const faqs = [
      [`${l.name} 생활권은 어디까지 포함되나요?`, `${l.name} 일대와 인접 생활권을 함께 안내합니다. 정확한 주소를 알려주시면 이동 기준을 바로 확인해 드립니다.`],
      ...SHARED_FAQ,
    ];
    const links = [
      ...l.links,
      [`${region.name} 전체 안내`, `/${region.slug}/`],
    ];
    const body = `
<section class="section"><div class="container article">
  ${T.breadcrumbHtml(crumbs)}
  <h1>${T.esc(l.name)} 출장마사지 · 생활권 이용 기준 안내</h1>
  <p class="lead">${T.esc(l.intro)}</p>
  ${T.ctaHtml()}
  <h2>이 생활권의 특징</h2>
  <ul>${l.points.map((p) => `<li>${T.esc(p)}</li>`).join('')}</ul>
  <h2>숙소·오피스텔 이용 전 확인</h2>
  <p>호텔·레지던스는 숙소별 객실 방문 정책을, 오피스텔은 공동현관 출입 방식을 예약 전에 확인해 주세요. ${T.esc(city ? city.name : '해당 시·군')} 전체 기준은 시·군 안내 페이지에서 함께 확인할 수 있습니다.</p>
  <h2>야간 예약 전 확인</h2>
  <p>야간·심야 예약은 건물 출입 가능 여부가 핵심입니다. 심야 공동현관 출입 방법과 주차 위치를 알려주시면 늦은 시간에도 원활하게 진행됩니다.</p>
  ${T.bookingFlowHtml()}
  ${T.pricingNoteHtml()}
  ${T.checklistHtml()}
  ${T.faqHtml(faqs)}
  ${T.linkListHtml(links, '관련 지역 보기')}
  ${T.policyNoticeHtml()}
  ${T.whwHtml()}
</div></section>`;
    write(`life/${l.slug}`, T.layout({
      title, desc, path: pth,
      schemas: [T.webPageSchema(title, T.d80(desc), pth), T.breadcrumbSchema(crumbs), T.faqSchema(faqs)],
    }, body), { priority: 0.7 });
  }
}

/* --------------------------------------------------------- 역세권 페이지 */
function buildStations() {
  const hubPath = '/station/';
  const hubCrumbs = [['경기도 출장마사지', '/'], ['역세권·터미널', hubPath]];
  write('station', T.layout({
    title: '경기도 역세권·KTX·SRT·터미널 이용 안내｜간다GO',
    desc: '경기도 주요 역세권·KTX·SRT 인접 숙소의 출장마사지 이용 기준 안내.',
    path: hubPath, activePath: hubPath,
    schemas: [T.webPageSchema('경기도 역세권·터미널 안내', '경기도 주요 역세권 인접 숙소 이용 기준 안내', hubPath), T.breadcrumbSchema(hubCrumbs)],
  }, `<section class="section"><div class="container article">
  ${T.breadcrumbHtml(hubCrumbs)}
  <h1>경기도 역세권·KTX·SRT·터미널 안내</h1>
  <p class="lead">출장·여행 고객 문의가 많은 주요 역 인접 숙소권을 안내합니다. 출구별·노선별 구분 없이 역 생활권 기준으로 확인해 드립니다.</p>
  ${cardGrid(stations.map((s) => ({ name: s.name, href: `/station/${s.slug}/` })), true)}
  ${T.hubIntroHtml('역세권·터미널 인접 숙소')}
  ${T.bookingFlowHtml()}
  ${T.pricingNoteHtml()}
  ${T.policyNoticeHtml()}
</div></section>`), { priority: 0.7 });

  for (const s of stations) {
    const pth = `/station/${s.slug}/`;
    const city = cityBySlug[s.city];
    const lf = s.life ? lifeBySlug[s.life] : null;
    const crumbs = [['경기도 출장마사지', '/'], ['역세권·터미널', '/station/'], [`${s.name} 인접 숙소`, pth]];
    const title = `${s.name} 인접 숙소 출장마사지 안내｜예약 전 확인`;
    const desc = `${s.name} 인접 숙소·오피스텔 출장마사지 이용 기준과 예약 전 확인 안내.`;
    const faqs = [
      [`${s.name} 도착 직후 바로 이용할 수 있나요?`, '체크인과 이동 시간을 고려해 30분~1시간 여유를 두고 예약하시는 것을 권장합니다. 도착 시간을 알려주시면 맞춰서 조율해 드립니다.'],
      ...SHARED_FAQ,
    ];
    const links = [
      city ? [`${city.name} 전체 안내`, `/${city.slug}/`] : null,
      lf ? [`${lf.name} 생활권 이용 기준`, `/life/${lf.slug}/`] : null,
      ['KTX·SRT·터미널 이용 안내', '/use/station-terminal/'],
      ['호텔 정책 확인 안내', '/check/hotel-policy/'],
    ].filter(Boolean);
    const body = `
<section class="section"><div class="container article">
  ${T.breadcrumbHtml(crumbs)}
  <h1>${T.esc(s.name)} 인접 숙소 출장마사지 · 예약 전 확인 안내</h1>
  <p class="lead">${T.esc(s.note)}</p>
  ${T.ctaHtml()}
  <h2>역 인근 숙소 이용 전 확인</h2>
  <p>역 인접 호텔·레지던스·오피스텔은 건물마다 외부인 방문 정책이 다릅니다. 숙소명을 알려주시면 객실 방문 가능 여부를 예약 전에 확인해 드리며, 방문이 어려운 숙소는 인근 대안을 안내해 드립니다.</p>
  <h2>도착 시간 기준 예약 안내</h2>
  <p>열차·버스 도착 시간에 맞춰 예약하실 때는 체크인과 이동 시간을 고려해 30분~1시간 여유를 두는 것이 좋습니다. 관리사가 숙소로 직접 방문하므로, 체크인 후 호실만 알려주시면 됩니다.</p>
  <h2>야간 도착 시 확인</h2>
  <p>늦은 시간 도착이라면 숙소 프런트 운영 시간과 건물 출입 방법을 함께 확인해 주세요. 심야 예약 가능 여부는 지역과 일정에 따라 상담 시 안내됩니다.</p>
  ${T.bookingFlowHtml()}
  ${T.pricingNoteHtml()}
  ${T.checklistHtml(['숙소명과 객실 방문 가능 여부를 확인했나요?', '도착 시간 기준으로 예약 시간을 여유 있게 잡았나요?'])}
  ${T.faqHtml(faqs)}
  ${T.linkListHtml(links, '관련 지역 보기')}
  ${T.policyNoticeHtml()}
  ${T.whwHtml()}
</div></section>`;
    write(`station/${s.slug}`, T.layout({
      title, desc, path: pth,
      schemas: [T.webPageSchema(title, T.d80(desc), pth), T.breadcrumbSchema(crumbs), T.faqSchema(faqs)],
    }, body), { priority: 0.6 });
  }
}

/* ---------------------------------------------- 이용 장소 + 신도시·산단 */
function buildUse() {
  const hubPath = '/use/';
  const hubCrumbs = [['경기도 출장마사지', '/'], ['이용 장소', hubPath]];
  write('use', T.layout({
    title: '경기도 이용 장소별 확인 기준｜간다GO',
    desc: '자택·호텔·오피스텔·산업단지 등 이용 장소별 예약 전 확인 기준 안내.',
    path: hubPath, activePath: hubPath,
    schemas: [T.webPageSchema('경기도 이용 장소별 확인 기준', '이용 장소별 예약 전 확인 기준 안내', hubPath), T.breadcrumbSchema(hubCrumbs)],
  }, `<section class="section"><div class="container article">
  ${T.breadcrumbHtml(hubCrumbs)}
  <h1>이용 장소별 확인 기준</h1>
  <p class="lead">같은 지역이라도 자택·호텔·오피스텔·산업단지 숙소는 예약 전 확인 항목이 다릅니다. 이용하실 장소 유형을 먼저 확인해 보세요.</p>
  <h2>장소 유형별 안내</h2>
  ${cardGrid(places.map((p) => ({ name: p.name, href: `/use/${p.slug}/` })), true)}
  <h2>신도시 이용 기준</h2>
  ${cardGrid(newtowns.filter((n) => n.type === 'newtown').map((n) => ({ name: n.name, href: `/use/${n.slug}/` })), true)}
  <h2>산업단지 이용 기준</h2>
  ${cardGrid(newtowns.filter((n) => n.type === 'industrial').map((n) => ({ name: n.name, href: `/use/${n.slug}/` })), true)}
  ${T.hubIntroHtml('이용 장소 유형')}
  ${T.bookingFlowHtml()}
  ${T.pricingNoteHtml()}
  ${T.policyNoticeHtml()}
</div></section>`), { priority: 0.8 });

  // 이용 장소 12
  for (const p of places) {
    const pth = `/use/${p.slug}/`;
    const crumbs = [['경기도 출장마사지', '/'], ['이용 장소', '/use/'], [p.name, pth]];
    const title = `${p.h1}｜간다GO`;
    const desc = `${p.name} 이용 시 예약 전 확인사항과 이용 기준을 안내합니다.`;
    const faqs = [...p.faq, ...SHARED_FAQ];
    const body = `
<section class="section"><div class="container article">
  ${T.breadcrumbHtml(crumbs)}
  <h1>${T.esc(p.h1)}</h1>
  <p class="lead">${T.esc(p.intro)}</p>
  ${T.ctaHtml()}
  <h2>예약 전 확인 항목</h2>
  <ul class="checklist">${p.points.map((x) => `<li>${T.esc(x)}</li>`).join('')}</ul>
  <h2>진행 방식 안내</h2>
  <p>예약 시 주소와 장소 유형을 알려주시면 방문 절차를 미리 안내해 드립니다. 관리사가 필요한 장비(베드 또는 매트, 오일, 수건)를 준비해 방문하며, 안내된 코스와 시간 기준으로만 진행됩니다.</p>
  ${T.bookingFlowHtml()}
  ${T.pricingNoteHtml()}
  ${T.faqHtml(faqs)}
  ${T.linkListHtml([
    ['예약 전 확인사항 전체 보기', '/check/'],
    ['이용 코스·요금 안내', '/#pricing'],
    ['마사지 프로그램 안내', '/program/'],
  ], '함께 확인하면 좋은 안내')}
  ${T.policyNoticeHtml()}
  ${T.whwHtml()}
</div></section>`;
    write(`use/${p.slug}`, T.layout({
      title, desc, path: pth,
      schemas: [T.webPageSchema(title, T.d80(desc), pth), T.breadcrumbSchema(crumbs), T.faqSchema(faqs)],
    }, body), { priority: 0.7 });
  }

  // 신도시·산업단지 22
  for (const n of newtowns) {
    const pth = `/use/${n.slug}/`;
    const city = cityBySlug[n.city];
    const lf = n.life ? lifeBySlug[n.life] : null;
    const crumbs = [['경기도 출장마사지', '/'], ['이용 장소', '/use/'], [n.name, pth]];
    const isInd = n.type === 'industrial';
    const title = `${n.name} ${isInd ? '인접 숙소' : '생활권'} 출장마사지 이용 기준`;
    const desc = `${n.name} ${isInd ? '인접 숙소와 출장 숙소' : '아파트·오피스텔'} 이용 전 확인사항 안내.`;
    const faqs = [
      isInd
        ? [`${n.name} 근처 장기 출장 숙소에서도 이용 가능한가요?`, '숙소 주소와 출입 가능 시간, 주차 공간을 알려주시면 방문 가능 여부를 예약 전에 확인해 드립니다.']
        : [`${n.name} 아파트 방문 절차는 어떻게 되나요?`, '단지명과 동·호수, 공동현관 출입 방식을 알려주시면 방문 절차를 예약 전에 안내해 드립니다.'],
      ...SHARED_FAQ,
    ];
    const typeSection = isInd
      ? `<h2>출장 숙소 이용 전 확인</h2>
  <p>산업단지 인접 숙소는 공동 출입문 방식과 야간 출입 제한, 주차 공간이 숙소마다 다릅니다. 교대 근무 일정에 맞춘 시간 조율도 가능하니 근무 일정과 함께 문의해 주세요. 산단 내부(공장·사무동·기숙사)에서는 진행하지 않으며, 인근 원룸·오피스텔·숙소 기준으로 안내됩니다.</p>
  <h2>야간·새벽 예약 기준</h2>
  <p>교대 근무 특성상 늦은 시간 문의가 많은 지역입니다. 심야에는 숙소 출입 가능 여부 확인이 특히 중요하며, 예약 가능 시간은 상담 시 확인됩니다.</p>`
      : `<h2>아파트·오피스텔 이용 전 확인</h2>
  <p>신도시 대단지는 같은 단지라도 동별 출입구가 다르고 방문 차량 등록 규정이 엄격한 편입니다. 단지명과 동·호수까지 정확한 주소, 공동현관 출입 방식을 알려주시면 도착 지연 없이 진행됩니다. 입주 초기 단지는 지도 앱 주소 오류가 있을 수 있으니 단지 정문 위치를 함께 안내해 주시면 좋습니다.</p>
  <h2>예약 가능 시간 안내</h2>
  <p>신도시 생활권은 저녁~밤 시간대 문의가 많습니다. 심야 예약은 공동현관 출입 가능 여부에 따라 달라지므로 희망 시간을 알려주시면 확인해 드립니다.</p>`;
    const links = [
      city ? [`${city.name} 전체 안내`, `/${city.slug}/`] : null,
      lf ? [`${lf.name} 생활권 이용 기준`, `/life/${lf.slug}/`] : null,
      isInd ? ['장기 출장 숙소 이용 안내', '/use/business-trip-accommodation/'] : ['신도시 생활권 예약 전 확인', '/use/newtown/'],
      isInd ? ['산업단지 인접 숙소 확인', '/check/industrial-area/'] : ['신도시 아파트 확인 안내', '/check/newtown-apartment/'],
    ].filter(Boolean);
    const body = `
<section class="section"><div class="container article">
  ${T.breadcrumbHtml(crumbs)}
  <h1>${T.esc(n.name)} ${isInd ? '인접 숙소' : '생활권'} 출장마사지 이용 기준</h1>
  <p class="lead">${T.esc(n.note)}</p>
  ${T.ctaHtml()}
  ${typeSection}
  ${T.bookingFlowHtml()}
  ${T.pricingNoteHtml()}
  ${T.checklistHtml(isInd
    ? ['숙소 출입 가능 시간을 확인했나요?', '주차 공간을 확인했나요?']
    : ['단지명과 동·호수까지 확인했나요?', '방문 차량 등록 여부를 확인했나요?'])}
  ${T.faqHtml(faqs)}
  ${T.linkListHtml(links, '관련 지역 보기')}
  ${T.policyNoticeHtml()}
  ${T.whwHtml()}
</div></section>`;
    write(`use/${n.slug}`, T.layout({
      title, desc, path: pth,
      schemas: [T.webPageSchema(title, T.d80(desc), pth), T.breadcrumbSchema(crumbs), T.faqSchema(faqs)],
    }, body), { priority: 0.6 });
  }
}

/* ------------------------------------------------------ 예약 전 확인 */
function buildChecks() {
  const hubPath = '/check/';
  const hubCrumbs = [['경기도 출장마사지', '/'], ['예약 전 확인', hubPath]];
  write('check', T.layout({
    title: '예약 전 확인사항 안내｜간다GO',
    desc: '방문 주소·건물 출입·호텔 정책·예약 시간 등 예약 전 확인사항 안내.',
    path: hubPath, activePath: hubPath,
    schemas: [T.webPageSchema('예약 전 확인사항 안내', '예약 전 확인사항 전체 안내', hubPath), T.breadcrumbSchema(hubCrumbs)],
  }, `<section class="section"><div class="container article">
  ${T.breadcrumbHtml(hubCrumbs)}
  <h1>예약 전 확인사항 안내</h1>
  <p class="lead">예약 전에 아래 항목만 확인해 주시면 어느 지역이든 대기 없이 정확하게 안내됩니다. 항목별 자세한 기준은 각 페이지에서 확인하세요.</p>
  ${cardGrid(checks.map((c) => ({ name: c.name, href: `/check/${c.slug}/` })), true)}
  ${T.hubIntroHtml('예약 전 확인 항목')}
  ${T.bookingFlowHtml()}
  ${T.pricingNoteHtml()}
  ${T.policyNoticeHtml()}
</div></section>`), { priority: 0.8 });

  const otherChecks = (cur) => checks.filter((c) => c.slug !== cur.slug).slice(0, 5)
    .map((c) => [c.name, `/check/${c.slug}/`]);
  for (const c of checks) {
    const pth = `/check/${c.slug}/`;
    const crumbs = [['경기도 출장마사지', '/'], ['예약 전 확인', '/check/'], [c.name, pth]];
    const title = `${c.h1}｜간다GO`;
    const desc = `${c.name} — 경기도 출장마사지 예약 전 확인 기준 안내.`;
    const detailHtml = (c.body || []).map(([h, p]) => `<h2>${T.esc(h)}</h2><p>${T.esc(p)}</p>`).join('\n  ');
    const faqs = [...(c.faq || []), ...SHARED_FAQ];
    const body = `
<section class="section"><div class="container article">
  ${T.breadcrumbHtml(crumbs)}
  <h1>${T.esc(c.h1)}</h1>
  <p class="lead">${T.esc(c.intro)}</p>
  ${T.ctaHtml()}
  <h2>핵심 확인 항목</h2>
  <ul class="checklist">${c.points.map((x) => `<li>${T.esc(x)}</li>`).join('')}</ul>
  ${detailHtml}
  ${T.bookingFlowHtml()}
  ${T.pricingNoteHtml()}
  ${T.faqHtml(faqs)}
  ${T.linkListHtml([
    ...otherChecks(c),
    ['이용 장소별 확인 기준', '/use/'],
    ['개인정보 처리방침', '/policy/privacy/'],
  ], '함께 확인하면 좋은 안내')}
  ${T.policyNoticeHtml()}
  ${T.whwHtml()}
</div></section>`;
    write(`check/${c.slug}`, T.layout({
      title, desc, path: pth,
      schemas: [T.webPageSchema(title, T.d80(desc), pth), T.breadcrumbSchema(crumbs), T.faqSchema(faqs)],
    }, body), { priority: 0.6 });
  }
}

/* -------------------------------------------------------- 프로그램 */
function buildPrograms() {
  const hubPath = '/program/';
  const hubCrumbs = [['경기도 출장마사지', '/'], ['마사지 프로그램', hubPath]];
  const hubFaqs = [
    ['어떤 프로그램을 선택해야 할지 모르겠어요.', '컨디션과 선호(부드러운 이완·강한 압·스트레칭)를 알려주시면 상담 시 맞는 프로그램을 안내해 드립니다.'],
    ...SHARED_FAQ,
  ];
  write('program', T.layout({
    title: '마사지 프로그램 안내｜스웨디시·아로마·타이·스포츠 관리 기준',
    desc: '스웨디시·아로마·타이·스포츠·발마사지 등 프로그램별 특징과 확인사항 안내.',
    path: hubPath, activePath: hubPath,
    schemas: [T.webPageSchema('마사지 프로그램 안내', '프로그램별 특징과 예약 전 확인사항 안내', hubPath), T.breadcrumbSchema(hubCrumbs), T.faqSchema(hubFaqs)],
  }, `<section class="section"><div class="container article">
  ${T.breadcrumbHtml(hubCrumbs)}
  <h1>마사지 프로그램 안내 · 이용 전 확인해야 할 관리 유형</h1>
  <p class="lead">프로그램명을 나열하는 페이지가 아니라, 어떤 관리가 본인에게 맞는지, 어떤 장소에서 이용 가능한지, 예약 전 무엇을 확인해야 하는지 안내하는 페이지입니다. 모든 프로그램은 60·90·120분 코스 기준으로 제공됩니다.</p>
  ${T.ctaHtml()}
  <h2>프로그램별 안내</h2>
  ${cardGrid(programs.map((p) => ({ name: p.name, href: `/program/${p.slug}/`, desc: p.intro.slice(0, 46) + '…' })))}
  <h2>프로그램 선택 기준</h2>
  <ul>
    <li>부드러운 이완이 필요하면 — 스웨디시, 아로마테라피, 로미로미</li>
    <li>강한 압과 뭉침 해소가 필요하면 — 딥티슈, 스포츠 마사지</li>
    <li>몸을 늘리고 풀고 싶으면 — 타이마사지</li>
    <li>하체 피로가 중심이면 — 발마사지</li>
    <li>둘이 함께라면 — 커플 관리</li>
  </ul>
  ${T.faqHtml(hubFaqs)}
  ${T.policyNoticeHtml()}
  ${T.whwHtml()}
</div></section>`), { priority: 0.8 });

  for (const p of programs) {
    const pth = `/program/${p.slug}/`;
    const crumbs = [['경기도 출장마사지', '/'], ['마사지 프로그램', '/program/'], [p.name, pth]];
    const faqs = [...p.faq, ...SHARED_FAQ];
    const body = `
<section class="section"><div class="container article">
  ${T.breadcrumbHtml(crumbs)}
  <h1>${T.esc(p.h1)}</h1>
  <p class="lead">${T.esc(p.intro)}</p>
  ${T.ctaHtml()}
  <h2>어떤 이용자에게 맞나요?</h2>
  <p>${T.esc(p.fit)}</p>
  <h2>진행 방식과 압 조절</h2>
  <p>${T.esc(p.how)}</p>
  <h2>이용 장소별 확인</h2>
  <p>자택·아파트는 공동현관 출입 방식을, 호텔·숙소는 객실 방문 가능 여부를, 오피스텔은 관리 규정과 방문 가능 시간대를 예약 전에 확인해 주세요. 장소 유형별 자세한 기준은 <a href="/use/">이용 장소 안내</a>에서 확인할 수 있습니다.</p>
  <h2>예약 전 확인 항목</h2>
  <ul class="checklist">${p.checks.map((x) => `<li>${T.esc(x)}</li>`).join('')}</ul>
  <h2>코스 시간 선택 안내</h2>
  <p>모든 프로그램은 60분·90분·120분 코스로 이용할 수 있습니다. 처음이라면 90분 코스가 준비·관리·마무리까지 여유 있게 진행되어 가장 만족도가 높고, 특정 부위 집중 관리는 60분, 전신을 꼼꼼히 관리하려면 120분을 권합니다.</p>
  ${T.bookingFlowHtml()}
  ${T.pricingNoteHtml()}
  ${T.faqHtml(faqs)}
  ${T.linkListHtml(p.links, '함께 보면 좋은 안내')}
  ${T.policyNoticeHtml()}
  ${T.whwHtml()}
</div></section>`;
    write(`program/${p.slug}`, T.layout({
      title: p.title, desc: p.desc, path: pth,
      schemas: [T.webPageSchema(p.title, T.d80(p.desc), pth), T.breadcrumbSchema(crumbs), T.faqSchema(faqs)],
    }, body), { priority: 0.7 });
  }
}

/* ------------------------------------------------------ 정책·문의 */
function buildPolicyAndContact() {
  const mk = (slug, title, desc, h1, inner, priority = 0.4) => {
    const pth = `/${slug}/`;
    const crumbs = [['경기도 출장마사지', '/'], [h1, pth]];
    write(`${slug}`, T.layout({
      title: `${title}｜간다GO`, desc, path: pth,
      schemas: [T.webPageSchema(title, T.d80(desc), pth), T.breadcrumbSchema(crumbs)],
    }, `<section class="section"><div class="container article">
  ${T.breadcrumbHtml(crumbs)}
  <h1>${T.esc(h1)}</h1>
  ${inner}
</div></section>`), { priority });
  };

  mk('policy/privacy', '개인정보 처리방침', '간다GO 개인정보 처리방침 — 수집 항목·목적·보관·파기 기준 안내.', '개인정보 처리방침', `
  <p class="lead">간다GO는 예약 확인과 방문 안내에 필요한 최소한의 정보만 확인하며, 아래 기준에 따라 처리합니다.</p>
  <h2>1. 수집 항목과 목적</h2>
  <p>예약 진행 시 연락처, 방문 주소, 예약 희망 시간을 확인합니다. 이 정보는 예약 확인, 방문 안내, 일정 조율 목적으로만 사용됩니다.</p>
  <h2>2. 보관과 파기</h2>
  <p>수집된 정보는 예약 이행 완료 후 목적이 달성되면 지체 없이 파기합니다. 별도의 회원 데이터베이스를 운영하지 않으며, 마케팅 목적으로 보관하지 않습니다.</p>
  <h2>3. 제3자 제공</h2>
  <p>이용자의 정보를 제3자에게 제공하지 않습니다. 단, 법령에 따른 요청이 있는 경우는 예외로 합니다.</p>
  <h2>4. 이용자의 권리</h2>
  <p>이용자는 언제든지 본인 정보의 삭제를 요청할 수 있습니다. 전화(${site.phone}) 또는 문의하기를 통해 요청해 주세요. 요청 시 지체 없이 확인하고 처리해 드립니다.</p>
  <h2>5. 정보의 안전한 관리</h2>
  <p>예약 상담 과정에서 확인한 연락처와 주소는 예약 이행에만 사용하며, 관리사에게는 방문에 필요한 최소한의 정보(주소·시간·건물 출입 방식)만 전달됩니다. 예약이 끝나면 관련 정보는 보관하지 않고 파기합니다.</p>
  <h2>6. 문의 채널과 개인정보</h2>
  <p>전화·문자·텔레그램 등 어떤 경로로 문의하시더라도 동일한 기준이 적용됩니다. 상담 내용은 예약 목적 외로 사용되지 않으며, 광고·마케팅 수신 동의를 받거나 제3자와 공유하지 않습니다.</p>
  <h2>7. 처리방침 변경</h2>
  <p>본 처리방침은 서비스 운영이나 관련 법령 변경에 따라 개정될 수 있으며, 변경 시 본 페이지를 통해 안내합니다.</p>
  <h2>8. 문의처</h2>
  <p>개인정보 처리에 대한 문의: 전화예약 ${site.phone} / <a href="/contact/">문의하기</a>. 관련 안내는 <a href="/check/privacy/">개인정보 처리 기준</a> 페이지에서도 확인할 수 있습니다.</p>`);

  mk('policy/no-illegal', '불법·선정적 서비스 불가 안내', '간다GO는 건전한 방문형 관리만 운영하며 불법·선정적 서비스를 제공하지 않습니다.', '불법·선정적 서비스 불가 안내', `
  <p class="lead">간다GO는 건전한 방문형 웰니스 관리 서비스만 운영합니다. 아래 기준은 모든 지역, 모든 프로그램, 모든 예약에 예외 없이 적용됩니다.</p>
  <div class="notice-box"><p><strong>불법·선정적 서비스는 어떤 경우에도 제공하거나 안내하지 않습니다.</strong> 관련 문의나 요구가 있는 경우 예약이 즉시 취소되며, 이후 이용이 제한될 수 있습니다.</p></div>
  <h2>운영 원칙</h2>
  <ul>
    <li>안내된 코스(60·90·120분)와 프로그램 기준으로만 진행합니다.</li>
    <li>관리사에 대한 무리한 요구·부적절한 행동 시 관리가 중단되며, 환불이 제한될 수 있습니다.</li>
    <li>본 사이트의 어떤 문구도 불법·선정적 서비스를 암시하지 않습니다.</li>
    <li>이용 중 불편 사항은 즉시 전화(${site.phone})로 알려주시면 조치합니다.</li>
  </ul>
  <h2>제공하는 서비스의 범위</h2>
  <p>간다GO가 제공하는 것은 스웨디시·아로마·타이·스포츠·딥티슈·발마사지 등 건전한 방문형 웰니스 관리입니다. 모든 관리는 예약 시 안내된 코스와 프로그램 기준으로만 진행되며, 그 외의 어떤 서비스도 제공하지 않습니다. 프로그램별 자세한 내용은 <a href="/program/">마사지 프로그램 안내</a>에서 확인할 수 있습니다.</p>
  <h2>이용자와 관리사 보호</h2>
  <p>이 원칙은 이용자와 관리사 모두를 보호하기 위한 것입니다. 관리사는 안전한 환경에서 전문적인 관리를 제공하고, 이용자는 명확한 기준 안에서 안심하고 서비스를 받을 수 있습니다. 여성 관리사·여성 고객 이용 시에도 동일한 기준과 예약 확인 절차가 적용됩니다.</p>
  <h2>왜 이 안내를 모든 페이지에 두나요</h2>
  <p>방문형 관리 서비스에 대한 오해를 예방하고, 이용자와 관리사 모두가 안전한 기준 안에서 서비스를 이용·제공하기 위함입니다. 오해의 소지가 있는 표현(상위노출 보장·최저가·1위·은밀 등)도 사이트 전체에서 사용하지 않습니다.</p>`);

  mk('policy/operation', '운영 기준', '간다GO 서비스 운영 기준 — 예약·진행·변경·중단 원칙 안내.', '서비스 운영 기준', `
  <p class="lead">간다GO의 예약·진행·변경 기준을 투명하게 안내합니다.</p>
  <h2>예약 기준</h2>
  <p>모든 예약은 방문 주소, 건물 출입 방식, 예약 시간 확인 후 확정됩니다. 코스별 기준 요금은 전 지역 동일하며, 외곽 장거리 구간은 상담 시 최종 확인됩니다.</p>
  <h2>진행 기준</h2>
  <p>예약 확정 시 안내된 코스와 시간 기준으로 진행되며, 관리사가 필요 장비를 준비해 방문합니다. 압 조절과 집중 부위 요청은 관리 중 언제든 가능합니다.</p>
  <h2>변경·취소 기준</h2>
  <p>관리사 이동 시작 전 변경·취소는 부담이 없습니다. 이동 중·도착 후 취소는 협의가 필요하며, 무단 노쇼는 이후 예약이 제한될 수 있습니다. <a href="/check/change-policy/">변경·취소 기준 자세히 보기</a></p>
  <h2>중단 기준</h2>
  <p>불법·선정적 요구, 관리사에 대한 부적절한 행동, 심한 음주 상태 등의 경우 진행이 중단될 수 있습니다. 이는 관리사의 안전과 서비스 품질을 지키기 위한 것으로, 예외 없이 적용됩니다.</p>
  <h2>요금 기준</h2>
  <p>60분·90분·120분 코스별 기준 요금은 경기도 전 지역 동일하게 안내되며, 추가 비용 없이 있는 그대로 안내해 드립니다. 외곽·장거리 구간의 이동 기준만 상담 시 최종 확인되며, 상위노출·최저가·1위 같은 과장 표현은 사용하지 않습니다. 자세한 기준은 <a href="/check/travel-fee/">이동 기준 안내</a>에서 확인할 수 있습니다.</p>
  <h2>이용 고객 안내</h2>
  <p>방문 관리가 처음이신 경우에도 특별한 준비 없이 이용하실 수 있습니다. 누울 공간과 수건만 준비해 주시면 되고, 건강 상태(통증·부상·임신 등)는 미리 알려주셔야 안전하게 관리 범위를 맞출 수 있습니다. 자세한 준비 사항은 <a href="/check/customer-notice/">이용 고객 안내</a>를 참고해 주세요.</p>`);

  mk('policy/author', '작성자·검수자 안내', '간다GO 콘텐츠의 작성·검수 기준과 책임 주체를 안내합니다.', '작성자·검수자 안내', `
  <p class="lead">이 사이트의 모든 콘텐츠는 아래 기준으로 작성·검수됩니다.</p>
  <h2>작성 주체</h2>
  <p>간다GO 운영팀이 경기도 31개 시·군 예약 상담 경험을 바탕으로 작성합니다. 지역별 생활권 특징, 건물 출입 방식, 숙소 정책 등은 실제 상담에서 반복적으로 확인되는 내용을 기준으로 합니다.</p>
  <h2>작성 방식</h2>
  <p>경기도 공식 행정구역 자료와 시·군별 생활권 구조를 참고하며, AI 보조 도구를 사용할 수 있으나 최종 문구는 사람이 검수합니다. 중복·과장·허위 표현, 상위노출 보장·최저가·1위 같은 표현은 사용하지 않습니다.</p>
  <h2>검수 기준</h2>
  <p>모든 페이지는 게시 전 다음 기준으로 검수됩니다: 실제 서비스와 일치하는지, 불법·선정적 표현이 없는지, 지역 정보가 정확한지, 이용자에게 실질적으로 필요한 정보인지.</p>
  <h2>경험 기반 콘텐츠(E-E-A-T)</h2>
  <p>지역 페이지의 생활권 특징, 건물 출입 방식, 숙소 정책 안내는 실제 경기도 예약 상담에서 반복적으로 확인되는 경험을 바탕으로 작성됩니다. 광교·판교·동탄·일산·배곧 같은 생활권마다 오피스텔 공동현관 방식, 신도시 대단지 차량 등록, 산업단지 배후 숙소의 야간 출입처럼 실제 방문에서 확인한 차이를 반영합니다. 어디서나 볼 수 있는 일반적 요약이 아니라, 방문 서비스 운영 과정에서 얻은 실질적인 확인 정보를 제공하는 것을 목표로 합니다.</p>
  <h2>표현 원칙</h2>
  <p>이용자에게 오해를 줄 수 있는 표현은 사용하지 않습니다. 상위노출 보장, 최저가, 1위, VIP, 은밀 같은 표현이나 허위 후기·별점을 넣지 않으며, 실제 오프라인 매장이 없으므로 LocalBusiness·Review·별점 구조화 데이터도 사용하지 않습니다.</p>
  <h2>수정 요청</h2>
  <p>잘못된 지역 정보나 오래된 내용을 발견하시면 <a href="/contact/">문의하기</a>로 알려주세요. 확인 후 신속히 수정합니다.</p>`);

  // 문의하기
  const contactPath = '/contact/';
  const contactCrumbs = [['경기도 출장마사지', '/'], ['문의하기', contactPath]];
  write('contact', T.layout({
    title: '문의하기｜간다GO 전화예약 및 제휴 문의',
    desc: '간다GO 전화예약(0508-202-4719)과 웹사이트 제작·제휴 문의 안내.',
    path: contactPath, activePath: contactPath,
    schemas: [T.webPageSchema('문의하기', '간다GO 예약·제휴 문의 안내', contactPath), T.breadcrumbSchema(contactCrumbs), T.organizationSchema()],
  }, `<section class="section"><div class="container article">
  ${T.breadcrumbHtml(contactCrumbs)}
  <h1>문의하기</h1>
  <p class="lead">예약 문의는 전화가 가장 빠릅니다. 방문 주소와 희망 시간을 알려주시면 바로 확인해 드립니다.</p>
  <h2>전화 예약</h2>
  <p style="font-size:1.6rem;font-weight:800"><a href="${site.phoneHref}">📞 ${site.phone}</a></p>
  <p>상호: 간다GO · 경기도 전지역 출장마사지 안내</p>
  ${T.ctaHtml()}
  <h2>예약 전 준비하면 좋은 정보</h2>
  <ul class="checklist">
    <li>방문 주소 (도로명 + 동·호수, 숙소는 숙소명)</li>
    <li>희망 날짜와 시간</li>
    <li>희망 코스 (60분 / 90분 / 120분)와 프로그램</li>
    <li>건물 출입 방식 (공동현관·프런트 등)</li>
  </ul>
  ${T.bookingFlowHtml()}
  ${T.pricingNoteHtml()}
  <h2>지역·프로그램 바로가기</h2>
  <p>방문 지역이나 원하는 관리를 먼저 살펴보실 수 있습니다. <a href="/cities/">31개 시·군 안내</a>에서 지역을, <a href="/program/">마사지 프로그램 안내</a>에서 관리 유형을, <a href="/check/">예약 전 확인</a>에서 방문 준비 사항을 확인해 보세요.</p>
  <h2>웹사이트 제작·제휴 문의</h2>
  <p>웹사이트 제작 문의와 제휴 제안은 텔레그램으로 받고 있습니다.</p>
  <div class="footer-cta">
    <a class="btn btn--telegram" href="${site.telegramBuild}" target="_blank" rel="noopener">웹사이트 제작문의 (텔레그램)</a>
    <a class="btn btn--telegram-outline" href="${site.telegramPartner}" target="_blank" rel="noopener">제휴문의 (텔레그램)</a>
  </div>
  ${T.policyNoticeHtml()}
</div></section>`), { priority: 0.7 });
}

/* --------------------------------------------------- 사이트맵·기타 */
function buildMisc() {
  // HTML 사이트맵
  const smPath = '/sitemap/';
  const smCrumbs = [['경기도 출장마사지', '/'], ['사이트맵', smPath]];
  const group = (title, items) =>
    `<h2>${title}</h2><ul class="link-list">${items.map(([n, h]) => `<li><a href="${h}">${T.esc(n)}</a></li>`).join('')}</ul>`;
  write('sitemap', T.layout({
    title: '사이트맵｜간다GO', desc: '간다GO 전체 페이지 목록 — 지역·생활권·프로그램·정책 안내.',
    path: smPath,
    schemas: [T.webPageSchema('사이트맵', '간다GO 전체 페이지 목록', smPath), T.breadcrumbSchema(smCrumbs)],
  }, `<section class="section"><div class="container article">
  ${T.breadcrumbHtml(smCrumbs)}
  <h1>사이트맵</h1>
  ${group('메인·권역', [['경기도 홈', '/'], ...regions.map((r) => [r.name, `/${r.slug}/`])])}
  ${group('8대 생활권', areas.map((a) => [a.name, `/area/${a.slug}/`]))}
  ${group('31개 시·군', cities.map((c) => [c.name, `/${c.slug}/`]))}
  ${group('핵심 생활권', life.map((l) => [l.name, `/life/${l.slug}/`]))}
  ${group('역세권·터미널', stations.map((s) => [s.name, `/station/${s.slug}/`]))}
  ${group('이용 장소', places.map((p) => [p.name, `/use/${p.slug}/`]))}
  ${group('신도시·산업단지', newtowns.map((n) => [n.name, `/use/${n.slug}/`]))}
  ${group('마사지 프로그램', programs.map((p) => [p.name, `/program/${p.slug}/`]))}
  ${group('예약 전 확인', checks.map((c) => [c.name, `/check/${c.slug}/`]))}
  ${group('정책·문의', [['운영 기준', '/policy/operation/'], ['개인정보 처리방침', '/policy/privacy/'], ['불법·선정적 서비스 불가 안내', '/policy/no-illegal/'], ['작성자·검수자 안내', '/policy/author/'], ['문의하기', '/contact/']])}
</div></section>`), { priority: 0.3 });

  // 구 URL(/gyeonggi/...) → 새 URL 301 리다이렉트 (Cloudflare Pages _redirects)
  fs.writeFileSync(path.join(OUT, '_redirects'), `/gyeonggi / 301
/gyeonggi/ / 301
/gyeonggi/* /:splat 301
`);

  // 404
  fs.writeFileSync(path.join(OUT, '404.html'), T.layout({
    title: '페이지를 찾을 수 없습니다｜간다GO',
    desc: '요청하신 페이지를 찾을 수 없습니다. 경기도 지역 안내로 이동해 주세요.',
    path: '/404.html', noindex: true, schemas: [],
  }, `<section class="section"><div class="container article" style="text-align:center">
  <h1>페이지를 찾을 수 없습니다</h1>
  <p class="lead">주소가 변경되었거나 삭제된 페이지입니다. 아래에서 원하시는 안내를 찾아보세요.</p>
  <div class="hero__cta">
    <a class="btn btn--accent" href="/">경기도 홈으로</a>
    <a class="btn btn--ghost" href="/cities/">도시별 안내</a>
    <a class="btn btn--ghost" href="/sitemap/">사이트맵</a>
  </div>
</div></section>`));

  // robots.txt
  fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *
Allow: /

Sitemap: ${site.siteUrl}/sitemap.xml
`);

  // sitemap.xml — noindex 페이지 제외
  const urls = pages.filter((p) => !p.noindex).map((p) => `  <url>
    <loc>${site.siteUrl}${p.path}</loc>
    <priority>${p.priority.toFixed(1)}</priority>
  </url>`).join('\n');
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`);

  // OG 이미지(자리표시자 SVG — 실제 배포 시 1200×630 PNG/WebP 교체 권장)
  const imgDir = path.join(OUT, 'assets', 'img');
  fs.mkdirSync(imgDir, { recursive: true });
  fs.writeFileSync(path.join(imgDir, 'og-main.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="g" cx="80%" cy="0%" r="90%">
      <stop offset="0%" stop-color="#1d3050"/>
      <stop offset="100%" stop-color="#0a1322"/>
    </radialGradient>
    <linearGradient id="a" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff8a2a"/>
      <stop offset="100%" stop-color="#ff6a00"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <text x="90" y="290" font-family="Pretendard, sans-serif" font-size="88" font-weight="800" fill="#eaf1fb">간다<tspan fill="#ff7a1c">GO</tspan></text>
  <text x="90" y="380" font-family="Pretendard, sans-serif" font-size="42" fill="#b9c6d9">경기도 31개 시·군 출장마사지 안내</text>
  <rect x="90" y="440" width="430" height="76" rx="38" fill="url(#a)"/>
  <text x="130" y="490" font-family="Pretendard, sans-serif" font-size="34" font-weight="700" fill="#14100b">전화예약 0508-202-4719</text>
</svg>
`);
}

/* ---------------------------------------------------------------- 실행 */
buildMain();
buildRegions();
buildAreas();
buildCities();
buildAdmin();
buildLife();
buildStations();
buildUse();
buildChecks();
buildPrograms();
buildPolicyAndContact();
buildMisc();

console.log(`빌드 완료: HTML 페이지 ${pages.length}개 + sitemap.xml, robots.txt, 404.html`);
