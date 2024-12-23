import { createFileRoute } from '@tanstack/react-router'
import TrendingList from "@/components/trendingList";

export const Route = createFileRoute("/trending")({
  component: () => (
    <div>
      <TrendingList />
    </div>
  ),
});