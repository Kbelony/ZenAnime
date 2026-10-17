import HeaderInfo from "@/components/headerInfo";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { fetchAnimeInfo, getMediaTitle } from "@/lib/anilist";

export const Route = createFileRoute("/anime/$id")({
  component: AnimeDetails,
});

function AnimeDetails() {
  const { id } = Route.useParams();

  useEffect(() => {
    window.scrollTo(0, 0);

    const controller = new AbortController();

    const fetchTitle = async () => {
      try {
        const cachedTitle = sessionStorage.getItem(`anime_title_${id}`);
        if (cachedTitle) {
          document.title = cachedTitle;
          return;
        }

        const data = await fetchAnimeInfo(id, controller.signal);
        const title = getMediaTitle(data.title);
        document.title = title;
        sessionStorage.setItem(`anime_title_${id}`, title);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error(
          "Erreur lors de la récupération des informations:",
          error
        );
        document.title = "Anime Details";
      }
    };

    fetchTitle();

    return () => {
      controller.abort();
      document.title = "ZenAnime";
    };
  }, [id]);

  return (
    <div>
      <HeaderInfo />
    </div>
  );
}
