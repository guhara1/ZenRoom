# 간다GO — 경기도 전지역 출장마사지 안내 사이트

경기도 31개 시·군 생활권 기준의 정적 안내 사이트입니다. 의존성 없는 Node 빌드 스크립트가
데이터 파일에서 650여 개 HTML 페이지와 sitemap.xml, robots.txt, _redirects를 생성합니다.

## URL 구조

- 메인은 도메인 루트(`/`)입니다. 구 `/gyeonggi/...` URL은 `_redirects`가 301로 새 경로에 연결합니다 (Cloudflare Pages).
- 계층: `/{시}/` → `/{시}/{구}/` (일반구 있는 7개 시) → `/{시}/{구}/{동}/`, 구가 없는 시·군은 `/{시}/{동}/`
- 행정동 페이지는 번호 동(1동·2동·3동)을 대표 1개로 통합하고 **noindex** 처리해
  도어웨이 페이지로 판정되지 않도록 합니다 (사이트맵에서도 제외). 색인 대상은
  메인·권역·생활권·시·군·구·역세권·프로그램 등 본문이 충분한 페이지만입니다.

## 빌드

```bash
node build.js
```

저장소 루트에 `/gyeonggi/...` 구조로 HTML이 생성됩니다. 생성물도 함께 커밋되어 있어
정적 호스팅(GitHub Pages, Netlify, Cloudflare Pages 등)에 그대로 배포할 수 있습니다.

## 배포 전 반드시 교체할 값 — `data/site.js`

| 항목 | 현재 값 | 설명 |
|---|---|---|
| `siteUrl` | `https://zenroom.pages.dev` | 커스텀 도메인 연결 시 교체 — canonical·og:url·sitemap에 사용 |
| `telegramBuild` | `https://t.me/gandago_web` | (자리표시자) 푸터 "웹사이트 제작문의" 버튼 링크 |
| `telegramPartner` | `https://t.me/gandago_partner` | (자리표시자) 푸터 "제휴문의" 버튼 링크 |

값 수정 후 `node build.js`를 다시 실행하면 전체 페이지에 반영됩니다.
`assets/img/og-main.svg`는 자리표시자입니다 — 실제 배포 시 1200×630 PNG/WebP로 교체하고
`data/site.js`의 `ogImage` 경로를 바꿔주세요.

## 구조

- `data/` — 지역·생활권·역세권·프로그램·정책 콘텐츠 데이터 (페이지별 고유 본문)
- `lib/templates.js` — 공통 레이아웃, 스키마(JSON-LD), 푸터, 플로팅 전화 버튼
- `assets/css/tokens.css` — 디자인 토큰 (프리미엄 다크 네이비 + 오렌지 팔레트)
- `assets/css/style.css` — 컴포넌트 오버레이
- `build.js` — 페이지 생성기 (실행 시 sitemap.xml·robots.txt·404.html 포함 생성)

## SEO 정책 (지시서 반영)

- 메타 디스크립션 전 페이지 80자 이내 (`lib/templates.js`의 `d80()`이 강제)
- 스키마: WebPage + BreadcrumbList 전 페이지, Organization은 메인·문의, FAQPage는 본문에
  실제 FAQ가 보이는 페이지만. LocalBusiness / Review / AggregateRating 미사용
- 출구별·노선별·읍면동 페이지 없음, 도어웨이성 URL 미생성
- 모든 주요 페이지에 Who/How/Why 블록, 불법·선정적 서비스 불가 안내, 개인정보 기준 링크
- 모바일 우측 하단 오렌지 플로팅 전화 버튼(애니메이션, tel: 연결) 전 페이지 노출
