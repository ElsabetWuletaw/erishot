import Image from "next/image";

type BrandLogoProps = {
  logoUrl?: string;
};

export function BrandLogo({ logoUrl }: BrandLogoProps) {
  if (logoUrl) {
    return (
      <span className="relative inline-flex h-12 w-40 items-center overflow-hidden sm:w-52" aria-hidden="true">
        <Image
          src={logoUrl}
          alt=""
          fill
          sizes="(min-width: 640px) 11rem, 9rem"
          className="object-contain"
          priority
          unoptimized
        />
      </span>
    );
  }

  return (
    <span className="inline-flex w-36 items-center sm:w-44" aria-hidden="true">
      <svg
        viewBox="0 0 440 120"
        role="img"
        className="h-auto w-full drop-shadow-[0_0_14px_rgba(169,132,69,0.28)]"
      >
        <title>ERISHOT</title>
        <path
          d="M20 29 C52 17 79 14 117 18"
          fill="none"
          stroke="#f4f0e8"
          strokeLinecap="round"
          strokeWidth="8"
        />
        <text
          x="20"
          y="73"
          fill="#f7f3ea"
          fontFamily="Brush Script MT, Segoe Script, cursive"
          fontSize="69"
          fontStyle="italic"
          fontWeight="700"
          letterSpacing="6"
        >
          ERI
        </text>
        <g transform="translate(159 43)">
          <rect x="0" y="18" width="48" height="29" rx="6" fill="#a98445" />
          <rect x="9" y="10" width="17" height="10" rx="2" fill="#a98445" />
          <circle cx="28" cy="32" r="13" fill="#090909" stroke="#f7f3ea" strokeWidth="3" />
          <circle cx="28" cy="32" r="6" fill="#a98445" />
        </g>
        <text
          x="215"
          y="74"
          fill="#caa45e"
          fontFamily="Brush Script MT, Segoe Script, cursive"
          fontSize="70"
          fontStyle="italic"
          fontWeight="700"
          letterSpacing="3"
        >
          SH
        </text>
        <g transform="translate(323 23)">
          <circle cx="38" cy="38" r="30" fill="#caa45e" />
          <path
            d="M21 20 L55 20 M16 35 L60 35 M23 58 L55 18 M21 19 L56 57 M17 40 L43 65"
            stroke="#090909"
            strokeLinecap="round"
            strokeWidth="3"
          />
          <path
            d="M40 27 C47 37 43 50 35 58"
            fill="none"
            stroke="#090909"
            strokeLinecap="round"
            strokeWidth="4"
          />
        </g>
        <text
          x="381"
          y="74"
          fill="#caa45e"
          fontFamily="Brush Script MT, Segoe Script, cursive"
          fontSize="70"
          fontStyle="italic"
          fontWeight="700"
        >
          T
        </text>
        <path
          d="M63 92 C144 82 249 87 379 83 C390 82 402 79 414 75"
          fill="none"
          stroke="#caa45e"
          strokeLinecap="round"
          strokeWidth="6"
        />
        <path
          d="M78 102 C163 94 290 98 399 91"
          fill="none"
          stroke="#caa45e"
          strokeLinecap="round"
          strokeWidth="3"
          opacity="0.65"
        />
      </svg>
    </span>
  );
}
