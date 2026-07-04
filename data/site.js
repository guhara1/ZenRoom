// 간다GO 사이트 전역 설정
// 도메인·텔레그램 계정이 확정되면 이 파일만 수정하면 전체 페이지에 반영됩니다.
module.exports = {
  brand: '간다GO',
  brandEn: 'GandaGO',
  // TODO: 실제 도메인으로 교체하세요 (canonical, og:url, sitemap.xml에 사용)
  siteUrl: 'https://zenroom.pages.dev',
  phone: '0508-202-4719',
  phoneHref: 'tel:0508-202-4719',
  // TODO: 실제 텔레그램 계정으로 교체하세요 (푸터 제작문의·제휴문의 버튼)
  telegramBuild: 'https://t.me/gandago_web',
  telegramPartner: 'https://t.me/gandago_partner',
  ogImage: '/assets/img/og-main.svg',
  // 검색엔진 사이트 인증 (값이 있으면 전 페이지 <head>에 인증 메타 자동 삽입)
  naverVerify: 'f923e91390c0ea0559c3329999e949ca127634e7',
  googleVerify: '', // 구글 서치콘솔 HTML 태그 인증 시 content 값만 넣으세요
  // IndexNow 키(빠른 색인 제출용). 루트에 <key>.txt 파일이 함께 생성됩니다.
  indexNowKey: 'a1b2c3d4e5f64789a1b2c3d4e5f64789',
  // 히어로 배경 이미지(메인 + 모든 지역 페이지 상단).
  // 방법 1) 저장소에 커밋: assets/img/hero-bg.jpg 로 교체 → 상대경로 그대로 사용(권장, 가장 빠름)
  // 방법 2) 깃허브 raw URL 사용:
  //   'https://raw.githubusercontent.com/guhara1/zenroom/main/assets/img/hero-bg.webp'
  // 값이 없으면(null) 그라데이션 배경만 사용. 파일이 없어도 그라데이션으로 자연 폴백됩니다.
  heroImage: '/assets/img/hero-bg.webp',
  pricing: [
    { name: '60분 코스', price: '90,000', time: '60분', desc: '기본 컨디션·릴랙스 케어', featured: false },
    { name: '90분 코스', price: '150,000', time: '90분', desc: '아로마 포함 추천 구성', featured: true },
    { name: '120분 코스', price: '180,000', time: '120분', desc: '전신 집중 프리미엄 케어', featured: false },
  ],
  pricingNote: '지역·예약 시간대·이동 거리에 따라 상담 시 최종 확인됩니다.',
};
