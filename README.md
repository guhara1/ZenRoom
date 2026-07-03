# 간다GO — 경기도 전지역 출장마사지 안내 사이트

경기도 31개 시·군 생활권 기준의 정적 안내 사이트입니다. 의존성 없는 Node 빌드 스크립트가
데이터 파일에서 198개 HTML 페이지와 sitemap.xml, robots.txt를 생성합니다.

## 빌드

```bash
node build.js
```

저장소 루트에 `/gyeonggi/...` 구조로 HTML이 생성됩니다. 생성물도 함께 커밋되어 있어
정적 호스팅(GitHub Pages, Netlify, Cloudflare Pages 등)에 그대로 배포할 수 있습니다.

## 배포 전 반드시 교체할 값 — `data/site.js`

| 항목 | 현재 값 (자리표시자) | 설명 |
|---|---|---|
| `siteUrl` | `https://gandago.kr` | 실제 도메인 — canonical·og:url·sitemap에 사용 |
| `telegramBuild` | `https://t.me/gandago_web` | 푸터 "웹사이트 제작문의" 버튼 링크 |
| `telegramPartner` | `https://t.me/gandago_partner` | 푸터 "제휴문의" 버튼 링크 |

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
