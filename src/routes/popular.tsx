import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/popular')({
  component: () => <div>Hello /popular!</div>
})