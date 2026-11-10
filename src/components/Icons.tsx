import type { SVGProps } from "react";
import type { AmenityKey, PlaceType } from "@/lib/types";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
);

export const LocateIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
  </Svg>
);

export const PlusIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const ListIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <circle cx="4.5" cy="6" r="1" fill="currentColor" />
    <circle cx="4.5" cy="12" r="1" fill="currentColor" />
    <circle cx="4.5" cy="18" r="1" fill="currentColor" />
  </Svg>
);

export const MapIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m9 4-6 2.5v13L9 17l6 3 6-2.5v-13L15 7 9 4Z" />
    <path d="M9 4v13M15 7v13" />
  </Svg>
);

export const RouteIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 11 21 3l-8 18-2-8-8-2Z" />
  </Svg>
);

export const PinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 1 1 14 0C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Svg>
);

export const CheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);

export const EditIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
    <path d="m13.5 6.5 4 4" />
  </Svg>
);

// Voorzieningen
export const ChangingTableIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="11" width="18" height="4" rx="1.5" />
    <path d="M5 15v5M19 15v5" />
    <circle cx="8.5" cy="7.5" r="2" />
    <path d="M11 9.5h6" />
  </Svg>
);

export const HighChairIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 3v8h8V3" />
    <path d="M6 11h12" />
    <path d="M9 11 7 21M15 11l2 10M8 16h8" />
  </Svg>
);

export const PlayCornerIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="12" width="8" height="8" rx="1.5" />
    <path d="M14 20l3.5-7 3.5 7h-7Z" />
    <circle cx="16" cy="6" r="3" />
  </Svg>
);

export const KidsMenuIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 3v7a2 2 0 0 0 4 0V3M9 10v11" />
    <path d="M17 21V3c-2 1.5-3 4-3 7h3" />
  </Svg>
);

export const AMENITY_ICON: Record<AmenityKey, (p: IconProps) => React.JSX.Element> = {
  changingTable: ChangingTableIcon,
  highChairs: HighChairIcon,
  playCorner: PlayCornerIcon,
  kidsMenu: KidsMenuIcon,
};

export const TYPE_LABEL: Record<PlaceType, string> = {
  restaurant: "Restaurant",
  bar: "Bar",
  cafe: "Café",
};

export const TYPE_EMOJI: Record<PlaceType, string> = {
  restaurant: "🍽️",
  bar: "🍹",
  cafe: "☕",
};

export function LogoMark({ size = 32 }: { size?: number }) {
  // Ouder en kind aan tafel
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="10" fill="var(--brand)" />
      <circle cx="12" cy="10" r="3.2" fill="white" />
      <circle cx="21.5" cy="12.5" r="2.4" fill="var(--sun)" />
      <path
        d="M6 18.5h20M9 18.5v7M23 18.5v7"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
