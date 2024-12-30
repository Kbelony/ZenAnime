/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState, useCallback, useMemo } from "react";
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
  const stars = useMemo(() => {
    const fullStars = Math.floor(rating / 2);
    const hasHalfStar = rating % 2 >= 1;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <>
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
      </>
    );
  }, [rating]);

  return (
    <div className="flex items-center">
      {stars}
      <span className="ml-2">{(rating / 2).toFixed(1)}</span>
    </div>
  );
};

const HeaderInfo = () => {
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

  const fetchStreamingData = useCallback(async (episodeNumber: string) => {
    try {
      const idGogo = localStorage.getItem("idGogo");
      const cacheKey = `streaming_${idGogo}_${episodeNumber}`;
      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        const data = JSON.parse(cachedData);
        setAvailablePlayers(data.iframe);
        setStreamingUrl(data.iframe[0].iframe);
        return;
      }

      const responseStreaming = await fetch(
        `https://api.amvstr.me/api/v2/stream/${idGogo}/${episodeNumber}`
      );
      const dataStreaming = await responseStreaming.json();

      if (dataStreaming.iframe && dataStreaming.iframe.length > 0) {
        setAvailablePlayers(dataStreaming.iframe);
        setStreamingUrl(dataStreaming.iframe[0].iframe);
        sessionStorage.setItem(cacheKey, JSON.stringify(dataStreaming));
      }
    } catch (error) {
      console.error("Error fetching streaming data:", error);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const animeId = window.location.pathname.split("/")[2];
        const cacheKey = `anime_data_${animeId}`;
        const cachedData = sessionStorage.getItem(cacheKey);

        if (cachedData) {
          const { animeData, episodesData } = JSON.parse(cachedData);
          setAnimeInfo(animeData);
          setEpisodeList(episodesData);
          updateWatchHistory(animeId, animeData);
          await fetchStreamingData("1");
          setLoading(false);
          return;
        }

        const [animeResponse, episodesResponse] = await Promise.all([
          fetch(`https://api.amvstr.me/api/v2/info/${animeId}`, {
            signal: controller.signal,
          }),
          fetch(`https://api.amvstr.me/api/v2/episodes/${animeId}`, {
            signal: controller.signal,
          }),
        ]);

        const [animeData, episodesData] = await Promise.all([
          animeResponse.json(),
          episodesResponse.json(),
        ]);

        setAnimeInfo(animeData);
        updateWatchHistory(animeId, animeData);

        if (animeData.id_provider?.idGogo) {
          localStorage.setItem("idGogo", animeData.id_provider.idGogo);
        } else {
          localStorage.setItem("idGogo", "undefined");
        }

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

        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({
            animeData,
            episodesData: episodesData.results,
          })
        );

        await fetchStreamingData("1");
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [fetchStreamingData]);

  const updateWatchHistory = useCallback((animeId: string, _animeData: any) => {
    const existingAnimes = JSON.parse(
      localStorage.getItem("watchedAnimes") || "[]"
    );
    const animeIndex = existingAnimes.findIndex(
      (anime: { id: string }) => anime.id === animeId
    );

    const animeEntry = {
      id: animeId,
      lastEpisode:
        animeIndex !== -1 ? existingAnimes[animeIndex].lastEpisode : "1",
      timestamp: Date.now(),
    };

    if (animeIndex !== -1) {
      existingAnimes[animeIndex] = {
        ...existingAnimes[animeIndex],
        timestamp: Date.now(),
      };
    } else {
      existingAnimes.unshift(animeEntry);
    }

    const limitedAnimes = existingAnimes.slice(0, 20);
    localStorage.setItem("watchedAnimes", JSON.stringify(limitedAnimes));
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const episodeHash = window.location.hash.match(/episode-(\d+)/);
      const animeId = window.location.pathname.split("/")[2];

      // Récupérer le dernier épisode regardé depuis localStorage
      const watchedAnimes = JSON.parse(
        localStorage.getItem("watchedAnimes") || "[]"
      );
      const watchedAnime = watchedAnimes.find(
        (anime: { id: string }) => anime.id === animeId
      );

      // Si pas de hash dans l'URL, utiliser le dernier épisode regardé ou 1
      let newEpisode = episodeHash
        ? episodeHash[1]
        : watchedAnime?.lastEpisode || "1";

      // Vérifier si l'épisode est valide
      const isValidEpisode = (episode: string): boolean => {
        const episodeNum = parseInt(episode);

        if (isNaN(episodeNum)) return false;

        const maxEpisodes = animeInfo?.nextair?.episode
          ? parseInt(animeInfo.nextair.episode) - 1
          : animeInfo?.episodes
            ? animeInfo.episodes
            : episodeList?.length || 0;

        return episodeNum > 0 && episodeNum <= maxEpisodes;
      };

      if (!isValidEpisode(newEpisode)) {
        newEpisode = watchedAnime?.lastEpisode || "1";
      }

      // Ne mettre à jour le hash que si nécessaire
      if (!episodeHash) {
        window.location.hash = `episode-${newEpisode}`;
      }

      setSelectedEpisode(newEpisode);
      fetchStreamingData(newEpisode);
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [animeInfo, episodeList]);

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

            // Mettre à jour lastEpisode dans le localStorage et réorganiser
            const animeId = window.location.pathname.split("/")[2];
            const watchedAnimes = JSON.parse(
              localStorage.getItem("watchedAnimes") || "[]"
            );
            const animeIndex = watchedAnimes.findIndex(
              (anime: { id: string }) => anime.id === animeId
            );

            if (animeIndex !== -1) {
              // Retirer l'anime de sa position actuelle
              const updatedAnime = {
                ...watchedAnimes[animeIndex],
                lastEpisode: lastEpisode,
                timestamp: Date.now(),
              };
              watchedAnimes.splice(animeIndex, 1);
              // Le remettre au début du tableau
              watchedAnimes.unshift(updatedAnime);

              localStorage.setItem(
                "watchedAnimes",
                JSON.stringify(watchedAnimes)
              );
            }

            setSelectedEpisode(lastEpisode);
            fetchStreamingData(lastEpisode);
            window.location.hash = `episode-${lastEpisode}`;
          }}
        >
          <ArrowBigDownDash />
        </Button>
        <Select
          value={selectedEpisode}
          onValueChange={async (value) => {
            setSelectedEpisode(value);
            await fetchStreamingData(value);

            // Mettre à jour lastEpisode dans le localStorage et réorganiser
            const animeId = window.location.pathname.split("/")[2];
            const watchedAnimes = JSON.parse(
              localStorage.getItem("watchedAnimes") || "[]"
            );
            const animeIndex = watchedAnimes.findIndex(
              (anime: { id: string }) => anime.id === animeId
            );

            if (animeIndex !== -1) {
              const updatedAnime = {
                ...watchedAnimes[animeIndex],
                lastEpisode: value,
                timestamp: Date.now(),
              };
              watchedAnimes.splice(animeIndex, 1);
              watchedAnimes.unshift(updatedAnime);

              localStorage.setItem(
                "watchedAnimes",
                JSON.stringify(watchedAnimes)
              );
            }

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

      {streamingUrl && localStorage.getItem("idGogo") !== "undefined" ? (
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
      ) : (
        <div className="mt-6 aspect-video pb-8 px-5 md:px-8">
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-lg text-gray-500">
              Content currently unavailable
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderInfo;
