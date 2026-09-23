export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="logo-mark">
      <defs>
        <radialGradient id="logo-core" cx="45%" cy="62%" r="60%">
          <stop offset="0%" stopColor="#fff1c9" />
          <stop offset="35%" stopColor="#ffc46b" />
          <stop offset="70%" stopColor="#ff8a3d" />
          <stop offset="100%" stopColor="#ff5a1f" />
        </radialGradient>
      </defs>
      <path
        d="M16 3.5c1.2 4.1 6.9 7.2 6.9 13.6A6.9 6.9 0 0 1 16 24a6.9 6.9 0 0 1-6.9-6.9c0-2.7 1.3-4.6 2.7-6 .3 1.8 1.2 3 2.4 3.6-.5-4.4.6-8.3 1.8-11.2Z"
        fill="url(#logo-core)"
      />
      <ellipse cx="16" cy="27.5" rx="7" ry="1.4" fill="#ff8a3d" opacity=".35" />
    </svg>
  )
}

export function Wordmark() {
  return (
    <span className="wordmark">
      <LogoMark />
      <span className="wordmark-text">ember</span>
    </span>
  )
}
