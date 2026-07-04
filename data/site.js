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
  // 히어로(메인 상단) 배경 이미지. assets/img/에 파일을 넣고 경로를 지정하세요.
  // 값이 없으면(null) 기존 그라데이션 배경이 그대로 쓰입니다.
  heroImage: '/assets/img/hero-bg.jpg',
  pricing: [
    { name: '60분 코스', price: '90,000', time: '60분', desc: '기본 컨디션·릴랙스 케어', featured: false },
    { name: '90분 코스', price: '150,000', time: '90분', desc: '아로마 포함 추천 구성', featured: true },
    { name: '120분 코스', price: '180,000', time: '120분', desc: '전신 집중 프리미엄 케어', featured: false },
  ],
  pricingNote: '지역·예약 시간대·이동 거리에 따라 상담 시 최종 확인됩니다.',
};
