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
  // const [loading, setLoading] = useState(false);
  const [episodeList, setEpisodeList] = useState<Anime[]>([]);

  const fetchData = async () => {
    try {
      // Récupération de idGogo depuis localStorage
      const idGogo = localStorage.getItem("idGogo");
      const response = await fetch(
        `https://api.amvstr.me/api/v2/episodes/${window.location.pathname.split("/")[2]}`
      );
      const responseStreaming = await fetch(
        `https://api.amvstr.me/api/v2/stream/${idGogo}/1`
      );
      await new Promise((resolve) => setTimeout(resolve, 1800));
      const data = await response.json();
      const dataStreaming = await responseStreaming.json();
      console.log("Data : ", data);
      console.log("Streaming : ", dataStreaming);
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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="episode_list px-8 mt-2 md:px-20 md:mt-2 w-full">
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue
            placeholder={episodeList.length > 0 ? episodeList[0].number : ""}
          />
        </SelectTrigger>
        <SelectContent>
          {episodeList.map((anime, index) => (
            <SelectItem value={anime.number} key={index}>
              Episode {anime.number}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default episodeList;
