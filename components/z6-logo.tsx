export const Z6Logo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 120 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Z6 Chat"
  >
    {/* Z6 Text with gradient */}
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a855f7" /> {/* Purple */}
        <stop offset="100%" stopColor="#ec4899" /> {/* Pink */}
      </linearGradient>
    </defs>

    {/* Z */}
    <path
      d="M15 10L30 10L15 25L15 28L33 28L33 25L18 25L33 10L33 7L15 7L15 10Z"
      fill="url(#logoGradient)"
    />

    {/* 6 */}
    <path
      d="M45 7C42.2 7 40 9.2 40 12L40 23C40 25.8 42.2 28 45 28L48 28C50.8 28 53 25.8 53 23L53 19C53 16.2 50.8 14 48 14L45 14L45 11L50 11L50 8L45 8C42.8 8 41 9.8 41 12L41 23C41 25.2 42.8 27 45 27L48 27C50.2 27 52 25.2 52 23L52 19C52 16.8 50.2 15 48 15L43 15L43 18L48 18C49.1 18 50 18.9 50 20L50 22C50 23.1 49.1 24 48 24L45 24C43.9 24 43 23.1 43 22L43 12C43 10.9 43.9 10 45 10L45 7Z"
      fill="url(#logoGradient)"
    />

    {/* Chat text */}
    <text
      x="60"
      y="24"
      fontFamily="system-ui, -apple-system, sans-serif"
      fontSize="16"
      fontWeight="500"
      fill="currentColor"
      className="opacity-80"
    >
      Chat
    </text>

    {/* Decorative dot */}
    <circle cx="110" cy="20" r="3" fill="url(#logoGradient)" opacity="0.6" />
  </svg>
)
