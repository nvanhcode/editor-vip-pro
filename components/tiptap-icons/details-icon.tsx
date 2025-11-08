import { memo } from "react"

type SvgProps = React.ComponentPropsWithoutRef<"svg">

export const DetailsIcon = memo(({ className, ...props }: SvgProps) => {
  return (
    <svg
      width="24"
      height="24"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M3 7h18M3 12h18M3 17h18" />
      <path d="M7 7v10" />
    </svg>
  )
})

DetailsIcon.displayName = "DetailsIcon"