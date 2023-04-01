export interface SVGProps {
  name: string;
}

export function getSVG({ name }: SVGProps) {
  switch (name) {
    case "Play":
      return (
        <>
          <circle
            cx="60"
            cy="60"
            r="56.64"
            fill="none"
            stroke="#231f20"
            strokeWidth="2px"
          />
          <path d="M81.35,55.76,51.46,38.5a4.9,4.9,0,0,0-7.35,4.25v34.5a4.9,4.9,0,0,0,7.35,4.25L81.35,64.24A4.9,4.9,0,0,0,81.35,55.76Z" />
        </>
      );
    case "ForwardRewind":
      return (
        <>
          <circle
            fill="none"
            stroke="#231f20"
            strokeWidth="2px"
            strokeMiterlimit="10"
            cx="60"
            cy="60"
            r="56.64"
          />
          <path
            fill="none"
            stroke="#231f20"
            strokeWidth="2px"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M60,27.32A32.68,32.68,0,1,0,92.68,60"
          />
          <polyline
            fill="none"
            stroke="#231f20"
            strokeWidth="2px"
            strokeLinecap="round"
            strokeLinejoin="round"
            points="54.8 33.69 61.26 27.24 54.97 20.95"
          />
          <polyline
            fill="none"
            stroke="#231f20"
            strokeWidth="2px"
            strokeLinecap="round"
            strokeLinejoin="round"
            points="54.63 68.85 54.63 51.15 50.56 53.46"
          />
          <path
            fill="none"
            stroke="#231f20"
            strokeWidth="2px"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M60.84,67.28a4.92,4.92,0,0,0,3.62,1.57,5,5,0,1,0,0-10,4.92,4.92,0,0,0-3.63,1.59V51.15H68"
          />
        </>
      );
    case "BackwardRewind":
      return (
        <>
          <circle
            cx="60"
            cy="60"
            r="56.64"
            fill="none"
            stroke="#231f20"
            strokeMiterlimit="10"
            strokeWidth="2"
          />
          <path
            d="M60 27.32A32.68 32.68 0 1 1 27.32 60"
            fill="none"
            stroke="#231f20"
            strokeWidth="2px"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m65.19 33.69-6.45-6.45 6.29-6.29M54.63 68.85v-17.7l-4.07 2.31M60.84 67.28a4.92 4.92 0 0 0 3.62 1.57 5 5 0 1 0 0-10 4.92 4.92 0 0 0-3.63 1.59v-9.29H68"
            fill="none"
            stroke="#231f20"
            strokeWidth="2px"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );
    case "Pause":
      return (
        <>
          <circle
            fill="none"
            stroke="#231f20"
            strokeWidth="2px"
            className="cls-1"
            strokeMiterlimit="10"
            cx="60"
            cy="60"
            r="56.64"
          />
          <rect
            fill="#000"
            stroke="#000"
            strokeWidth="2px"
            className="cls-2"
            strokeLinecap="round"
            strokeLinejoin="round"
            height="44.92"
            rx="4.2"
            width="8.68"
            x="44.66"
            y="37.54"
          />
          <rect
            fill="#000"
            stroke="#000"
            strokeWidth="2px"
            className="cls-2"
            strokeLinecap="round"
            strokeLinejoin="round"
            height="44.92"
            rx="4.2"
            width="8.68"
            x="66.66"
            y="37.54"
          />
        </>
      );
    case "Favorite":
      return (
        <>
          <circle
            fill="none"
            stroke="#231f20"
            strokeWidth="2px"
            cx="60"
            cy="60"
            r="56.64"
          />
          <path
            fill="none"
            stroke="#231f20"
            strokeWidth="2px"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M47.24,35.4h3.68a16.9,16.9,0,0,1,8.52,3.69.75.75,0,0,0,1.11,0,17,17,0,0,1,8.53-3.68h3.68A18.16,18.16,0,0,1,79.7,38,16.56,16.56,0,0,1,87,49.42V54c-.81,4.31-3.15,7.67-6.26,10.69-6.31,6.13-12.48,12.42-18.7,18.64a6.87,6.87,0,0,1-1.49,1.25H59.43a6.92,6.92,0,0,1-1.57-1.33c-6.33-6.33-12.61-12.71-19-19A18.72,18.72,0,0,1,33,53.79v-4.6a17.85,17.85,0,0,1,4.09-8.47A17.11,17.11,0,0,1,47.24,35.4Z"
          />
        </>
      );
    case "":
      return <></>;
    default:
      return <path />;
  }
}
