import { cn } from "@nextui-org/react";

const Badge = ({className, children}) => {
  return (
    <span
      className={cn('inline-flex items-center gap-x-1.5 py-1.5 px-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-500 dark:bg-white/[.05] dark:text-white', className)}>
      {children}
    </span>
  )
}

export default Badge