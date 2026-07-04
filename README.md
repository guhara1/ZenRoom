# 간다GO — 경기도 전지역 출장마사지 안내 사이트

경기도 31개 시·군 생활권 기준의 정적 안내 사이트입니다. 의존성 없는 Node 빌드 스크립트가
데이터 파일에서 650여 개 HTML 페이지와 sitemap.xml, robots.txt, _redirects를 생성합니다.

## URL 구조

- 메인은 도메인 루트(`/`)입니다. 구 `/gyeonggi/...` URL은 `_redirects`가 301로 새 경로에 연결합니다 (Cloudflare Pages).
- 계층: `/{시}/` → `/{시}/{구}/` (일반구 있는 7개 시) → `/{시}/{구}/{동}/`, 구가 없는 시·군은 `/{시}/{동}/`
- 행정동 페이지는 번호 동(1동·2동·3동)을 대표 1개로 통합하며, **전 페이지 색인 대상**입니다.
  도어웨이 판정을 피하기 위해 동별 성격(신도시·상권·산단·주거·관광·읍·면)에 따라 본문 구성이
  달라지고(`lib/dongContent.js` + `data/dong-meta.js`), 주요 동에는 수기 소개 노트가 붙습니다.
  동의 성격 분류·노트는 `data/dong-meta.js`에서 수정할 수 있습니다.

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

### 히어로 배경 이미지 업로드 (메인 + 모든 지역 페이지)

메인과 모든 지역 페이지 상단 히어로에 같은 배경 이미지가 들어갑니다. 이미지는 두 가지 방법으로
지정할 수 있습니다(`data/site.js`의 `heroImage`).

1. **저장소에 커밋(권장)** — 이미지를 **`assets/img/hero-bg.jpg`**로 교체(덮어쓰기)하고
   커밋하면 끝. HTML이 `/assets/img/hero-bg.jpg`를 항상 참조하므로 재빌드 없이도 반영됩니다.
   깃허브 웹에서 올릴 때 raw URL:
   `https://raw.githubusercontent.com/guhara1/zenroom/main/assets/img/hero-bg.jpg`
   (작업 브랜치 기준: `.../guhara1/zenroom/claude/ganda-go-footer-seo-9lmx6s/assets/img/hero-bg.jpg`)
2. **외부 URL 사용** — `heroImage`에 `https://...` URL을 넣고 `node build.js` 실행.

텍스트 가독성을 위해 어두운 오버레이가 자동으로 얹히므로 밝은/어두운 이미지 모두 사용 가능합니다.
권장: 가로 1920px 이상, 어두운 톤의 프리미엄 이미지. 현재 `assets/img/hero-bg.jpg`는 임시
그라데이션 자리표시자이니 실제 이미지로 교체하세요.

### 파비콘

`favicon.svg`(브랜드 오렌지 'G' 마크)와 `favicon-32.png`, `apple-touch-icon.png`가 생성되어
있습니다. `favicon.svg`를 수정하면 PNG는 다음 명령으로 다시 렌더링하세요(선택):
Playwright로 SVG→PNG 변환.

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
