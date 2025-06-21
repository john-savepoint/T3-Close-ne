import Image from "next/image"
import { cn } from "@/lib/utils"

interface Z6LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Z6Logo({ className, width = 120, height = 40 }: Z6LogoProps) {
  return (
    <div className={cn("relative", className)}>
      <Image
        src="/z6chat-logo.webp"
        alt="Z6Chat"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
    </div>
  )
}
