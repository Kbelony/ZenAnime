import { createFileRoute } from '@tanstack/react-router'
import PopularList from "@/components/popularList";

export const Route = createFileRoute("/popular")({
  component: () => (
    <div>
      <PopularList />
    </div>
  ),
});