/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
// import { Skeleton } from "./ui/skeleton";
// import { Navigation } from "swiper/modules";
// import { Swiper, SwiperSlide } from "swiper/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "swiper/css";
import "swiper/css/navigation";

const episodeList = () => {
  interface Anime {
    number: string;
    season: string;
    title: string;
    status: string;
    meanScore: number;
    trailer: {
      thumbnail: string;
      id: string;
    };
    id: string;
    image: string;
  }

  interface StreamingData {
    iframe: {
      name: string;
      iframe: string;
    }[];
  }

  // const [loading, setLoading] = useState(false);
  const [episodeList, setEpisodeList] = useState<Anime[]>([]);
  const [streamingUrl, setStreamingUrl] = useState<string>("");
  const [selectedEpisode, setSelectedEpisode] = useState<string>("1");

  const fetchData = async () => {
    try {
      // Récupération de idGogo depuis localStorage
      const response = await fetch(
        `https://api.amvstr.me/api/v2/episodes/${window.location.pathname.split("/")[2]}`
      );
      await new Promise((resolve) => setTimeout(resolve, 1800));
      const data = await response.json();
      console.log("Data : ", data);

      const episodeData = data.results.map(
        (anime: {
          title: string;
          image: string;
          status: string;
          season: string;
          meanScore: number;
          number: number;
          id: string;
          animeId: number;
        }) => ({
          title: anime.title,
          image: anime.image,
          status: anime.status,
          season: anime.season,
          meanScore: anime.meanScore,
          id: anime.id,
          number: anime.number,
        })
      );

      setEpisodeList(episodeData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      // setLoading(false);
    }
  };

  const fetchStreamingData = async (episodeNumber: string) => {
    try {
      const idGogo = localStorage.getItem("idGogo");
      const responseStreaming = await fetch(
        `https://api.amvstr.me/api/v2/stream/${idGogo}/${episodeNumber}`
      );
      const dataStreaming = await responseStreaming.json();

      if (dataStreaming.iframe && dataStreaming.iframe.length > 0) {
        setStreamingUrl(dataStreaming.iframe[0].iframe);
      }
    } catch (error) {
      console.error("Error fetching streaming data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    // Charger l'épisode 1 par défaut
    fetchStreamingData("1");
  }, []);

  return (
    <div className="episode_list px-8 mt-2 md:px-20 md:mt-2 w-full">
      <Select
        defaultValue="1"
        onValueChange={(value) => {
          setSelectedEpisode(value);
          fetchStreamingData(value);
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Episode 1" />
        </SelectTrigger>
        <SelectContent>
          {episodeList.map((anime, index) => (
            <SelectItem value={anime.number} key={index}>
              Episode {anime.number}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {streamingUrl && (
        <div className="mt-4 aspect-video w-full">
          <iframe
            src={streamingUrl}
            className="w-full h-full"
            allowFullScreen
            allow="fullscreen"
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default episodeList;
