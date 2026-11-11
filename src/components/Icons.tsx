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

export const MenuIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
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

export const PlaygroundIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 21V9l4-4 4 4v12" />
    <path d="M4 13h8" />
    <path d="M12 9c3 0 5 2 6 5l2 7" />
    <path d="M17 21h4" />
  </Svg>
);

export const StrollerIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 5h3l2 9h9l2-6H8" />
    <path d="M14 5a5 5 0 0 1 5 3" />
    <circle cx="9" cy="19" r="1.8" />
    <circle cx="17" cy="19" r="1.8" />
  </Svg>
);

export const AMENITY_ICON: Record<AmenityKey, (p: IconProps) => React.JSX.Element> = {
  changingTable: ChangingTableIcon,
  highChairs: HighChairIcon,
  playCorner: PlayCornerIcon,
  kidsMenu: KidsMenuIcon,
  playground: PlaygroundIcon,
  stroller: StrollerIcon,
};

export const TYPE_EMOJI: Record<PlaceType, string> = {
  restaurant: "🍽️",
  cafe: "🍻",
  bar: "☕",
};

// Kinderstoel met hartje, uit het label "Kindvriendelijk".
export function ChairMark({
  size = 24,
  chair = "currentColor",
  heart = "var(--heart)",
  seat = "var(--brand)",
}: {
  size?: number;
  chair?: string;
  heart?: string;
  seat?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <rect x="33" y="8" width="54" height="48" rx="16" fill="#ffffff" stroke={chair} strokeWidth="7"></rect>
      <path d="M60 42s-9.5-5.8-11.8-11.6c-1.7-4.2 1-8.6 5.5-8.6 2.5 0 4.5 1.4 6.3 3.7 1.8-2.3 3.8-3.7 6.3-3.7 4.5 0 7.2 4.4 5.5 8.6C69.5 36.2 60 42 60 42Z" fill={heart}></path>
      <rect x="20" y="56" width="80" height="13" rx="6.5" fill={seat} stroke={chair} strokeWidth="7"></rect>
      <path d="M38 69 30 111M82 69l8 42M34 93h52" stroke={chair} strokeWidth="7" strokeLinecap="round" fill="none"></path>
    </svg>
  );
}

