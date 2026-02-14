import { useMemo } from "react";

const coupangAds = [
  {
    href: "https://link.coupang.com/a/dLS7ok",
    img: "https://image3.coupangcdn.com/image/affiliate/banner/af7bdcbfb8e34245a2ce59ad44c2c2a1@2x.jpg",
    alt: "그린만년 스탁스탬프 도안변경, 혼합색상, 검정, 1개",
  },
  {
    href: "https://link.coupang.com/a/dLTbRQ",
    img: "https://static.coupangcdn.com/image/affiliate/banner/bec6fd80e590d5b6f18a7bf2cb902325@2x.jpg",
    alt: "아트방도장 고급형 500자 고딕체 만능 조립식 막도장 세트",
  },
  {
    href: "https://link.coupang.com/a/dLTctF",
    img: "https://img2c.coupangcdn.com/image/affiliate/banner/a3e8112bdde20dc039dcb2dda1c6060a@2x.jpg",
    alt: "무료 콜스탬프 간이영수증 사업자명판 자동스탬프",
  },
  {
    href: "https://link.coupang.com/a/dLTc3J",
    img: "https://image4.coupangcdn.com/image/affiliate/banner/7a836eba5a6149f7cbe9b993439979bc@2x.jpg",
    alt: "도장마트 법인도장 만년법인카본블랙",
  },
  {
    href: "https://link.coupang.com/a/dLTekC",
    img: "https://image11.coupangcdn.com/image/affiliate/banner/c3d0a17ad573d67cae1ff13b869269a5@2x.jpg",
    alt: "혼스 감열식 라벨프린터 HSRP-301B Skyblue",
  },
  {
    href: "https://link.coupang.com/a/dLTeKf",
    img: "https://image9.coupangcdn.com/image/affiliate/banner/bdf8c165dbb7133ae21ab2e94deb9eae@2x.jpg",
    alt: "혼스 감열식 라벨프린터 HSRP-301W White",
  },
  {
    href: "https://link.coupang.com/a/dLTff2",
    img: "https://image13.coupangcdn.com/image/affiliate/banner/a381799e2f5d69ff21e1a2a176251272@2x.jpg",
    alt: "브라더 휴대용 라벨 프린터 PT-H110PK",
  },
  {
    href: "https://link.coupang.com/a/dLTgbT",
    img: "https://img4a.coupangcdn.com/image/affiliate/banner/a959d78010129acbbad5e124e9e031e2@2x.jpg",
    alt: "아베른 스탠딩 PP 13칸 대용량 서류정리함",
  },
  {
    href: "https://link.coupang.com/a/dLTgLf",
    img: "https://image9.coupangcdn.com/image/affiliate/banner/2533d2d8648e90711b0bda0d2476107a@2x.jpg",
    alt: "코멧 A4 파일케이스 반투명 2개",
  },
  {
    href: "https://link.coupang.com/a/dLTg8S",
    img: "https://image2.coupangcdn.com/image/affiliate/banner/268b9b72338315ffac0c0dfcb9f3fd14@2x.jpg",
    alt: "맙소샵 사무실 다층 A4 파일 정리 보관 랙",
  },
  {
    href: "https://link.coupang.com/a/dLTjZ1",
    img: "https://image3.coupangcdn.com/image/affiliate/banner/87d51ccf470115f2e940c0c74649f95d@2x.jpg",
    alt: "4 in 1 휴대용 레이저 거리측정기 100M",
  },
  {
    href: "https://link.coupang.com/a/dLTlHx",
    img: "https://image10.coupangcdn.com/image/affiliate/banner/c52b274b6a23c32e18b2db59a75f8dc1@2x.jpg",
    alt: "케미 생활방수 골전도 무선 블루투스 이어셋",
  },
  {
    href: "https://link.coupang.com/a/dLTmsp",
    img: "https://image13.coupangcdn.com/image/affiliate/banner/8c663b477861cfa0abbb09722bab50d2@2x.jpg",
    alt: "아이리버 골전도 넥밴드 블루투스 이어폰",
  },
  {
    href: "https://link.coupang.com/a/dLTnx9",
    img: "https://img3a.coupangcdn.com/image/affiliate/banner/c2b3b0ef4ee5530e88d2908ca0449df9@2x.jpg",
    alt: "카템 화물차용 와이드 콘솔 수납 정리함 그레이",
  },
  {
    href: "https://link.coupang.com/a/dLTnTD",
    img: "https://image10.coupangcdn.com/image/affiliate/banner/e86b454eded2ff0e6de5d622813acdeb@2x.jpg",
    alt: "카템 화물차용 와이드 콘솔 수납 정리함 브라운",
  },
  {
    href: "https://link.coupang.com/a/dLToZo",
    img: "https://img1c.coupangcdn.com/image/affiliate/banner/0b85b4dfc121bd8aabf2916c675a51a0@2x.jpg",
    alt: "현대오피스 지폐계수기 V-630",
  },
  {
    href: "https://link.coupang.com/a/dLTptr",
    img: "https://image15.coupangcdn.com/image/affiliate/banner/9bf7be8c8dc546c33863c6da2294e62a@2x.jpg",
    alt: "페이퍼프랜드 위폐감별 지폐계수기 V-330UV",
  },
  {
    href: "https://link.coupang.com/a/dLTrTE",
    img: "https://image5.coupangcdn.com/image/affiliate/banner/e8af0fc90fe58c55fe821e8a4ee56a45@2x.jpg",
    alt: "이그닉 리트 사무용 데스크탑",
  },
  {
    href: "https://link.coupang.com/a/dLTp8z",
    img: "https://image1.coupangcdn.com/image/affiliate/banner/fcc3880d44d24b0284df983639c2f0e2@2x.jpg",
    alt: "MONGDOL 디지털 지폐투입구 안전 금고",
  },
  {
    href: "https://link.coupang.com/a/dLTuAM",
    img: "https://image7.coupangcdn.com/image/affiliate/banner/cffc320ee9d730084edf983f3cb0a402@2x.jpg",
    alt: "페리페이지 휴대용프린터A4 블루투스 무선 라벨프린터",
  },
];

function shuffleAndPick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

interface AdPlaceholderProps {
  position: string;
  className?: string;
  count?: number;
  layout?: "horizontal" | "vertical";
}

export function AdPlaceholder({ position, className = "", count = 5, layout = "horizontal" }: AdPlaceholderProps) {
  const selectedAds = useMemo(() => shuffleAndPick(coupangAds, count), [count]);

  if (layout === "vertical") {
    return (
      <div
        className={`${className}`}
        data-testid={`ad-placeholder-${position}`}
        data-ad-position={position}
      >
        <div className="flex flex-col items-center gap-3">
          {selectedAds.map((ad, i) => (
            <a
              key={i}
              href={ad.href}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="unsafe-url"
              className="block"
              data-testid={`ad-link-${position}-${i}`}
            >
              <img
                src={ad.img}
                alt={ad.alt}
                width="120"
                height="240"
                className="rounded-md"
                loading="lazy"
              />
            </a>
          ))}
        </div>
        <p className="text-[9px] text-muted-foreground/50 text-center mt-2 leading-tight">
          딸기폼은 무료로 양식을 제공하는 서비스입니다.<br />
          위 쇼핑 링크를 통해 쿠팡을 이용해주시면 소정의 제휴 혜택이 발생하여 서비스 운영에 도움이 됩니다.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`w-full ${className}`}
      data-testid={`ad-placeholder-${position}`}
      data-ad-position={position}
    >
      <div className="flex items-center justify-center gap-4 overflow-x-auto py-3">
        {selectedAds.map((ad, i) => (
          <a
            key={i}
            href={ad.href}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="unsafe-url"
            className="flex-shrink-0"
            data-testid={`ad-link-${position}-${i}`}
          >
            <img
              src={ad.img}
              alt={ad.alt}
              width="120"
              height="240"
              className="rounded-md"
              loading="lazy"
            />
          </a>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground/50 text-center mt-1 leading-tight">
        딸기폼은 무료로 양식을 제공하는 서비스입니다.<br />
        위 쇼핑 링크를 통해 쿠팡을 이용해주시면 소정의 제휴 혜택이 발생하여 서비스 운영에 도움이 됩니다.
      </p>
    </div>
  );
}
