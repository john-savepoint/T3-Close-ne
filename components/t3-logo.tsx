import Image from "next/image"

export const T3Logo = ({ className }: { className?: string }) => (
  <Image
    src="/z6chat-logo.png"
    alt="Z6.Chat"
    width={200}
    height={60}
    className={className}
    priority
  />
)
