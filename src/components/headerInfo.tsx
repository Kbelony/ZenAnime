/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Star } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const [isOpen, setIsOpen] = useState(false);
  const [animeInfo, setAnimeInfo] = useState<Anime | null>(null);
  const [episodeList, setEpisodeList] = useState<EpisodeItem[]>([]);
  const [streamingUrl, setStreamingUrl] = useState<string>("");
  const [selectedEpisode, setSelectedEpisode] = useState<string>("1");
  const [availablePlayers, setAvailablePlayers] = useState<
    Array<{ name: string; iframe: string }>
  >([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("0");

  const fetchStreamingData = async (episodeNumber: string) => {
    try {
      const idGogo = localStorage.getItem("idGogo");
      console.log("Fetching episode:", episodeNumber, "with idGogo:", idGogo);

      const responseStreaming = await fetch(
        `https://api.amvstr.me/api/v2/stream/${idGogo}/${episodeNumber}`
      );
      const dataStreaming = await responseStreaming.json();
      console.log("Streaming data received:", dataStreaming);

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

        console.log(animeData);

        // Stockage de l'idGogo
        if (animeData.id_provider && animeData.id_provider.idGogo) {
          localStorage.setItem("idGogo", animeData.id_provider.idGogo);
        }

        // Récupération des épisodes
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

        // Charger le premier épisode
        await fetchStreamingData("1");
      } catch (error) {
        console.error("Error fetching data:", error);
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
          <div className="flex ml-7">
            <img
              className="mr-5 portrait:mr-5 portrait:w-46 portrait:max-h-72 rounded-lg"
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
                className="scroll-m-20 mt-1 text-5xl font-extrabold tracking-tight lg:text-4xl mb-2"
              >
                {animeInfo?.title.english}
              </h2>

              <div className="flex mb-2">
                <Star />
                <p className="ml-2">{animeInfo?.score.decimalScore}</p>
              </div>
              <div className="flex">
                <div className="flex mb-3">
                  <p className="mr-2 text-sm mt-0.5">Year:</p>
                  <p className="text-base">{animeInfo?.startIn.year}</p>
                </div>
                <div className="flex mb-3">
                  <p className="mr-2 ml-20 text-sm mt-0.5">Season:</p>
                  <p className="text-base"> {animeInfo?.season}</p>
                </div>
                <div className="flex mb-3">
                  <p className="mr-2 ml-20 text-sm mt-0.5">Episode :</p>
                  <p>
                    {animeInfo?.nextair?.episode === ""
                      ? animeInfo?.episodes
                      : animeInfo?.nextair?.episode}{" "}
                    / {animeInfo?.episodes}
                  </p>
                </div>
              </div>
              <div className="flex mt-2">
                <p className="mt-0.5 mr-2">Genre :</p>
                {Array.isArray(animeInfo?.genres) &&
                  animeInfo?.genres.map((genre, index) => (
                    <Badge
                      className="text-xs py-1.5 mr-3 cursor-default"
                      variant="secondary"
                      key={index}
                    >
                      {genre}
                    </Badge>
                  ))}
              </div>
              <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className="space-y-2 items-center"
              >
                <p
                  className="text-sm"
                  style={{
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    display: "-webkit-box",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: animeInfo?.description || "",
                  }}
                ></p>
                <div className="flex mt-2 items-center justify-between space-x-4 px-4">
                  <CollapsibleTrigger asChild>
                    <div className="flex justify-center items-center mt-2 ml-1">
                      <ChevronDown className="mx-auto" />
                      <p className="text-center mx-auto">See more</p>
                    </div>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="space-y-2 pr-10">
                  <p
                    className="ml-6 text-sm"
                    dangerouslySetInnerHTML={{
                      __html: animeInfo?.description || "",
                    }}
                  ></p>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </div>
      </div>
      <div className="flex mt-5 ml-5">
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
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default headerInfo;
