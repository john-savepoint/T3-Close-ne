export const T3Logo = ({ className }: { className?: string }) => (
  <svg
    width="200"
    height="60"
    viewBox="0 0 200 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g>
      {/* Z6 */}
      <text
        x="10"
        y="40"
        fontSize="32"
        fontWeight="bold"
        fill="currentColor"
        fontFamily="Inter, system-ui, sans-serif"
      >
        Z6
      </text>
      {/* Chat */}
      <text
        x="70"
        y="40"
        fontSize="24"
        fontWeight="500"
        fill="currentColor"
        fontFamily="Inter, system-ui, sans-serif"
        opacity="0.8"
      >
        Chat
      </text>
      {/* Accent dot */}
      <circle
        cx="155"
        cy="35"
        r="4"
        fill="#9333ea"
      />
    </g>
  </svg>
)
