interface BurgerIconProps {
  className?: string
  title?: string
}

/** Cartoon burger used for the logo, footer and favicon. */
export default function BurgerIcon({ className, title }: BurgerIconProps) {
  return (
    <svg
      viewBox="0 0 96 88"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {/* top bun */}
      <path
        d="M10 40C10 19 27 8 48 8s38 11 38 32c0 3-2 5-5 5H15c-3 0-5-2-5-5z"
        fill="#F4BF45"
        stroke="#7A4A2A"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path d="M20 26c5-8 13-12 22-13" fill="none" stroke="#FFE3A0" strokeWidth="4" strokeLinecap="round" />
      <g fill="#FFF8E7" stroke="#C99A3A" strokeWidth="0.8">
        <ellipse cx="30" cy="27" rx="3" ry="1.7" transform="rotate(-20 30 27)" />
        <ellipse cx="45" cy="20" rx="3" ry="1.7" />
        <ellipse cx="60" cy="25" rx="3" ry="1.7" transform="rotate(20 60 25)" />
        <ellipse cx="72" cy="33" rx="3" ry="1.7" transform="rotate(30 72 33)" />
        <ellipse cx="52" cy="33" rx="3" ry="1.7" transform="rotate(-10 52 33)" />
        <ellipse cx="22" cy="36" rx="3" ry="1.7" transform="rotate(-30 22 36)" />
      </g>
      {/* lettuce */}
      <path
        d="M8 47c5-4 8 4 13 0s8 4 13 0 8 4 13 0 8 4 13 0 8 4 13 0 8 4 15 0l-2 6H9z"
        fill="#6CC067"
        stroke="#3E8A3C"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* tomato */}
      <rect x="14" y="51" width="68" height="6" rx="3" fill="#E5533D" stroke="#9E2E21" strokeWidth="2" />
      {/* cheese */}
      <path d="M11 56h74l-8 7-6-4-7 8-7-8-9 6-8-6-9 5-7-5z" fill="#FFCB3D" stroke="#C98D12" strokeWidth="2" strokeLinejoin="round" />
      {/* patty */}
      <rect x="9" y="58" width="78" height="12" rx="6" fill="#8B4A2B" stroke="#5A2E18" strokeWidth="3" />
      <path d="M20 63h8M40 65h10M62 62h9" stroke="#B26A42" strokeWidth="2.5" strokeLinecap="round" />
      {/* bottom bun */}
      <path
        d="M11 72h74v3c0 6-8 9-37 9S11 81 11 75z"
        fill="#F0A64C"
        stroke="#7A4A2A"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
