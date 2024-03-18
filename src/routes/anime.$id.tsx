import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/anime/$id')({
  component: () => <div>Hello /anime/$id!</div>
})