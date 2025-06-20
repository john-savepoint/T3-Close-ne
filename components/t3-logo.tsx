export const T3Logo = ({ className }: { className?: string }) => (
  <svg
    width="160"
    height="60"
    viewBox="0 0 160 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g>
      {/* Z6 - White fill with colored outline, moved closer to Chat */}
      <text
        x="10"
        y="45"
        fontSize="64"
        fontWeight="bold"
        fill="white"
        stroke="#ff1493"
        strokeWidth="2"
        fontFamily="Inter, system-ui, sans-serif"
      >
        Z6
      </text>
      {/* Chat - Moved closer to Z6 */}
      <text
        x="95"
        y="40"
        fontSize="24"
        fontWeight="500"
        fill="currentColor"
        fontFamily="Inter, system-ui, sans-serif"
        opacity="0.8"
      >
        Chat
      </text>
    </g>
  </svg>
)
