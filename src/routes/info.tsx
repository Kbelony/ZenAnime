import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/info')({
  component: () => <div>Hello /info!</div>
})