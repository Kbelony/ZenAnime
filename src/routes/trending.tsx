import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/trending')({
  component: () => <div>Hello /trending!</div>
})