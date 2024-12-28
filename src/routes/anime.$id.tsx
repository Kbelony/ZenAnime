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
    // Défiler vers le haut de la page
    window.scrollTo(0, 0);

    const fetchAnimeInfo = async () => {
      try {
        const response = await axios.get(
          `https://api.amvstr.me/api/v2/info/${id}`
        );
        const title = response.data.title?.english || "Anime Details";
        document.title = title;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des informations:",
          error
        );
        document.title = "Anime Details";
      }
    };

    fetchAnimeInfo();

    // Restaurer le titre original lors du démontage du composant
    return () => {
      document.title = "ZenAnime";
    };
  }, [id]);

  return (
    <div>
      <HeaderInfo />
    </div>
  );
}
