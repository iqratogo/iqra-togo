import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  centered?: boolean
  className?: string
  /** Utilisé sur fond sombre — titre blanc, sous-titre blanc/70 */
  dark?: boolean
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  centered = false,
  className,
  dark = false,
}: SectionHeaderProps) {
  return (
    <div className={cn("space-y-4", centered && "text-center", className)}>
      {eyebrow && (
        <p
          className="text-sm font-semibold uppercase tracking-[0.15em]"
          style={{ color: dark ? "#f07a45" : "var(--azae-orange)" }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className="font-[family-name:var(--font-playfair)] text-4xl font-bold leading-tight lg:text-5xl"
        style={{ color: dark ? "#ffffff" : "var(--azae-navy)" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "max-w-2xl text-lg lg:text-xl",
            centered && "mx-auto",
            dark ? "text-white/75" : "text-gray-500"
          )}
        >
          {subtitle}
        </p>
      )}
      {centered && (
        <div
          className="mx-auto mt-1 h-0.5 w-[60px] rounded-full"
          style={{ backgroundColor: dark ? "#f07a45" : "var(--azae-orange)" }}
        />
      )}
    </div>
  )
}
