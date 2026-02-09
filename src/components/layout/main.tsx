import { cn } from '@/lib/utils'

type MainProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  fluid?: boolean
  ref?: React.Ref<HTMLElement>
}

export function Main({ fixed, className, fluid, ...props }: MainProps) {
  return (
    <main
      data-layout={fixed ? 'fixed' : 'auto'}
      className={cn(
        'container w-full px-4 py-6', // Use Tailwind's container and spacing utilities
        fixed && 'flex grow flex-col overflow-hidden',
        fluid && 'max-w-full', // If fluid, remove max-width
        className
      )}
      {...props}
    />
  )
}
