import HeaderInfo from "@/components/headerInfo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/anime/$id")({
  component: () => (
    <div>
      <HeaderInfo />
    </div>
  ),
});
