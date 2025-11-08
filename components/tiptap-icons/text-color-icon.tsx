import { memo } from "react"

type SvgProps = React.ComponentPropsWithoutRef<"svg">

export const TextColorIcon = memo(({ className, ...props }: SvgProps) => {
  return (
    <svg
      width="24"
      height="24"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 3C6.44772 3 6 3.44772 6 4V5H5C4.44772 5 4 5.44772 4 6C4 6.55228 4.44772 7 5 7H6V18C6 18.5523 6.44772 19 7 19H8V20C8 20.5523 8.44772 21 9 21H15C15.5523 21 16 20.5523 16 20C16 19.4477 15.5523 19 15 19H10V18H17C17.5523 18 18 17.5523 18 17V6C18 5.44772 17.5523 5 17 5H16V4C16 3.44772 15.5523 3 15 3H7ZM8 5V16H16V7H8V5Z"
        fill="currentColor"
      />
      <path
        d="M10 9H14L13 12H11L10 9Z"
        fill="currentColor"
      />
      <rect
        x="2"
        y="19"
        width="20"
        height="2"
        rx="1"
        fill="currentColor"
      />
    </svg>
  )
})

TextColorIcon.displayName = "TextColorIcon"