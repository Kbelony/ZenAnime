import HeaderInfo from "@/components/headerInfo";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import axios from "axios";

export const Route = createFileRoute("/anime/$id")({
  component: AnimeDetails,
});

function AnimeDetails() {
  const { id } = Route.useParams();

  useEffect(() => {
    window.scrollTo(0, 0);

    const controller = new AbortController();

    const fetchAnimeInfo = async () => {
      try {
        const cachedTitle = sessionStorage.getItem(`anime_title_${id}`);
        if (cachedTitle) {
          document.title = cachedTitle;
          return;
        }

        const response = await axios.get(
          `https://api.amvstr.me/api/v2/info/${id}`,
          { signal: controller.signal }
        );
        const title = response.data.title?.english || "Anime Details";
        document.title = title;
        sessionStorage.setItem(`anime_title_${id}`, title);
      } catch (error) {
        if (axios.isCancel(error)) return;
        console.error(
          "Erreur lors de la récupération des informations:",
          error
        );
        document.title = "Anime Details";
      }
    };

    fetchAnimeInfo();

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
