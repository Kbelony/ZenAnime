/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import HeaderInfoSkeleton from "./headerInfoSkeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowBigDownDash, Star, StarHalf } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";

const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating / 2);
  const hasHalfStar = rating % 2 >= 1;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className="w-4 h-4 fill-yellow-400 text-yellow-400"
        />
      ))}
      {hasHalfStar && (
        <StarHalf className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-yellow-400" />
      ))}
      <span className="ml-2">{(rating / 2).toFixed(1)}</span>
    </div>
  );
};

const headerInfo = () => {
  interface Anime {
    number: string;
    coverImage: {
      large: string;
      medium: string;
      color: string;
    };
    bannerImage: string;
    title: {
      english: string;
      romaji: string;
    };
    status: string;
    genres: string[];
    score: {
      decimalScore: number;
      averageScore: number;
    };
    startIn: {
      year: number;
    };
    nextair: {
      episode: string;
    };
    id: number;
    season: string;
    episodes: number;
    meanScore: number;
    description: string;
    id_provider?: {
      idGogo: string;
    };
  }

  interface EpisodeItem {
    title: string;
    image: string;
    status: string;
    season: string;
    meanScore: number;
    number: string | number;
    id: string;
  }

  const [animeInfo, setAnimeInfo] = useState<Anime | null>(null);
  const [episodeList, setEpisodeList] = useState<EpisodeItem[]>([]);
  const [streamingUrl, setStreamingUrl] = useState<string>("");
  const [selectedEpisode, setSelectedEpisode] = useState<string>("1");
  const [availablePlayers, setAvailablePlayers] = useState<
    Array<{ name: string; iframe: string }>
  >([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStreamingData = async (episodeNumber: string) => {
    try {
      const idGogo = localStorage.getItem("idGogo");
      const responseStreaming = await fetch(
        `https://api.amvstr.me/api/v2/stream/${idGogo}/${episodeNumber}`
      );
      const dataStreaming = await responseStreaming.json();

      if (dataStreaming.iframe && dataStreaming.iframe.length > 0) {
        setAvailablePlayers(dataStreaming.iframe);
        setStreamingUrl(dataStreaming.iframe[0].iframe);
      }
    } catch (error) {
      console.error("Error fetching streaming data:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const animeResponse = await fetch(
          `https://api.amvstr.me/api/v2/info/${window.location.pathname.split("/")[2]}`
        );
        const animeData = await animeResponse.json();
        setAnimeInfo(animeData);

        if (animeData.id_provider && animeData.id_provider.idGogo) {
          localStorage.setItem("idGogo", animeData.id_provider.idGogo);
        }

        const episodesResponse = await fetch(
          `https://api.amvstr.me/api/v2/episodes/${window.location.pathname.split("/")[2]}`
        );
        const episodesData = await episodesResponse.json();

        if (episodesData.results) {
          const episodeData = episodesData.results.map((episode: any) => ({
            title: episode.title,
            image: episode.image,
            status: episode.status,
            season: episode.season,
            meanScore: episode.meanScore,
            id: episode.id,
            number: episode.number?.toString() || "1",
          }));
          setEpisodeList(episodeData);
        }

        await fetchStreamingData("1");
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const episodeHash = window.location.hash.match(/episode-(\d+)/);
      let newEpisode = episodeHash ? episodeHash[1] : "1";

      // Vérifier si l'épisode est valide
      const isValidEpisode = (episode: string): boolean => {
        const episodeNum = parseInt(episode);

        // Vérifier si c'est un nombre valide et s'il existe dans la liste des épisodes
        if (isNaN(episodeNum)) return false;

        const maxEpisodes = animeInfo?.nextair?.episode
          ? parseInt(animeInfo.nextair.episode) - 1
          : animeInfo?.episodes
            ? animeInfo.episodes
            : episodeList?.length || 0;

        return episodeNum > 0 && episodeNum <= maxEpisodes;
      };

      // Si l'épisode n'est pas valide, rediriger vers l'épisode 1
      if (!isValidEpisode(newEpisode)) {
        newEpisode = "1";
        window.location.hash = "episode-1";
      }

      setSelectedEpisode(newEpisode);
      fetchStreamingData(newEpisode);
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Exécuter au montage

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [animeInfo, episodeList]); // Ajouter les dépendances nécessaires

  if (loading) {
    return <HeaderInfoSkeleton />;
  }

  return (
    <div>
      <div className="header_mobile md:hidden">
        <img
          className="object-cover mobile_img"
          src={animeInfo?.bannerImage}
          alt=""
          onContextMenu={(e) => e.preventDefault()}
          draggable="false"
        />
        <div className="mt-6 text-center info_mobile ">
          <div className="flex justify-center meanScoreBadge mb-3">
            <Badge
              className="text-xs mr-0.5 mt-0.5 md:mr-1 cursor-default"
              variant="secondary"
              key={0}
            >
              {animeInfo?.status}
            </Badge>
          </div>

          <h1
            style={{
              whiteSpace: "pre-wrap",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            className="scroll-m-20 mt-1 flex justify-center items-center text-3xl font-extrabold tracking-tight"
          >
            {animeInfo?.title.english}
          </h1>
          <h2
            style={{
              whiteSpace: "pre-wrap",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            className="scroll-m-20 text-xl flex justify-center items-center tracking-tight text-[#a0a0a0]"
          >
            {animeInfo?.title.romaji}
          </h2>
        </div>
      </div>
      <div className="header_desktop hidden md:block">
        <img
          className="object-cover blur_img"
          src={animeInfo?.bannerImage}
          alt=""
        />
        <div className="absolute top-20 p-4">
          <div className="flex ml-7 desktop_img">
            <img
              className="mr-5 portrait:mr-5 portrait:w-46 h-80 rounded-lg"
              src={animeInfo?.coverImage.large}
              alt=""
            />
            <div className="ml-2 mb-2">
              <h2
                style={{
                  whiteSpace: "pre-wrap",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
                className="scroll-m-20 mt-1 text-5xl font-extrabold tracking-tight lg:text-4xl mb-4"
              >
                {animeInfo?.title.english}
              </h2>

              <div className="flex items-center">
                <StarRating rating={animeInfo?.score.decimalScore || 0} />
              </div>
              <div className="flex mt-3">
                <div className="flex mb-3">
                  <p className="mr-1 text-sm mt-0.5  text-slate-600 dark:text-slate-400">
                    Year:
                  </p>
                  <p className="text-base">{animeInfo?.startIn.year}</p>
                </div>
                <div className="flex mb-3">
                  <p className="mr-1 ml-20 text-sm mt-0.5 text-slate-600 dark:text-slate-400">
                    Season:
                  </p>
                  <p className="text-base"> {animeInfo?.season}</p>
                </div>
                <div className="flex mb-3">
                  <p className="mr-1 ml-20 text-sm mt-0.5 text-slate-600 dark:text-slate-400">
                    Episode:
                  </p>
                  <p className="text-base">
                    {animeInfo?.nextair?.episode == null
                      ? animeInfo?.episodes
                      : animeInfo?.nextair?.episode}{" "}
                    / {animeInfo?.episodes}
                  </p>
                </div>
              </div>
              <div className="flex">
                <p className="mr-1 text-sm mt-1 text-slate-600 dark:text-slate-400">
                  Genre :
                </p>
                {Array.isArray(animeInfo?.genres) &&
                  animeInfo?.genres.map((genre, index) => (
                    <p className="text-base mt-0.5 mb-4" key={index}>
                      {genre},
                    </p>
                  ))}
              </div>
              <p
                className="text-sm overflow-hidden"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 7,
                  WebkitBoxOrient: "vertical",
                }}
                dangerouslySetInnerHTML={{
                  __html: animeInfo?.description || "",
                }}
              ></p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex mt-5 ml-5 md:ml-8">
        <Button
          className="last_episode text-white bg-blue-500 mr-2"
          variant="outline"
          size="icon"
          onClick={() => {
            const lastEpisode = animeInfo?.nextair?.episode
              ? (parseInt(animeInfo.nextair.episode) - 1).toString()
              : animeInfo?.episodes
                ? animeInfo.episodes.toString()
                : episodeList.length > 0
                  ? episodeList[episodeList.length - 1].number.toString()
                  : "1";
            setSelectedEpisode(lastEpisode);
            fetchStreamingData(lastEpisode);
            window.location.hash = `episode-${lastEpisode}`;
          }}
        >
          <ArrowBigDownDash />
        </Button>
        <Select
          value={selectedEpisode}
          onValueChange={(value) => {
            setSelectedEpisode(value);
            fetchStreamingData(value);
            window.location.hash = `episode-${value}`;
          }}
        >
          <SelectTrigger className="w-[120px] md:w-[180px]">
            <SelectValue placeholder={`Episode ${selectedEpisode}`} />
          </SelectTrigger>
          <SelectContent>
            {animeInfo?.nextair?.episode
              ? Array.from(
                  { length: parseInt(animeInfo.nextair.episode) - 1 },
                  (_, index) => (
                    <SelectItem value={(index + 1).toString()} key={index}>
                      Episode {index + 1}
                    </SelectItem>
                  )
                )
              : animeInfo?.episodes
                ? Array.from({ length: animeInfo.episodes }, (_, index) => (
                    <SelectItem value={(index + 1).toString()} key={index}>
                      Episode {index + 1}
                    </SelectItem>
                  ))
                : episodeList.map((anime, index) => (
                    <SelectItem value={anime.number.toString()} key={index}>
                      Episode {anime.number}
                    </SelectItem>
                  ))}
          </SelectContent>
        </Select>
        <div className="ml-2">
          <Select
            value={selectedPlayer}
            onValueChange={(value) => {
              setSelectedPlayer(value);
              setStreamingUrl(availablePlayers[parseInt(value)].iframe);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lecteur" />
            </SelectTrigger>
            <SelectContent>
              {availablePlayers.map((player, index) => (
                <SelectItem key={index} value={index.toString()}>
                  Lecteur {player.name || index + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {streamingUrl && (
        <div className="mt-6 aspect-video pb-8 px-5 md:px-8">
          <iframe
            key={streamingUrl}
            src={streamingUrl}
            className="w-full h-full"
            allowFullScreen
            allow="fullscreen"
            referrerPolicy="no-referrer"
            loading="lazy"
            scrolling="no"
            frameBorder="0"
            security="restricted"
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default headerInfo;
