import { SpinnerGap } from '@phosphor-icons/react'

function PageLoading() {
  return (
    <div className="flex h-full min-h-[400px] items-center justify-center">
      <SpinnerGap className="size-8 animate-spin text-muted-foreground" />
    </div>
  )
}

export { PageLoading }
