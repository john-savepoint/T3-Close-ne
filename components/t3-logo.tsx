export const T3Logo = ({ className }: { className?: string }) => (
  <svg
    width="160"
    height="48"
    viewBox="0 0 160 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ overflow: 'visible' }}
  >
    <g>
      {/* Z6 - White fill with subtle pink outline */}
      <text
        x="10"
        y="36"
        fontSize="42"
        fontWeight="600"
        fill="white"
        stroke="#ff1493"
        strokeWidth="0.8"
        strokeOpacity="0.7"
        paintOrder="fill"
        fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
      >
        Z6
      </text>
      {/* Chat - Consistent font with app */}
      <text
        x="75"
        y="32"
        fontSize="20"
        fontWeight="500"
        fill="currentColor"
        fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        opacity="0.9"
      >
        Chat
      </text>
    </g>
  </svg>
)
