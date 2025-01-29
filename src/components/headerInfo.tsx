/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import HeaderInfoSkeleton from "./headerInfoSkeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowBigDownDash, Star, StarHalf, Magnet } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ReactPlayer from "react-player";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
// import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

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
    relation?: {
      id: string;
      type: string;
      format: string;
      status: string;
      averageScore: number;
      coverImage: {
        large: string;
      };
      title: {
        english: string;
        romaji: string;
      };
      episodes: number;
    }[];
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
    Array<{
      id: string;
      url: string | URL;
      name: string;
      iframe: string;
    }>
  >([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const swiperRelationsRef = useRef<any>(null);

  const updateWatchHistory = useCallback((animeId: string, _animeData: any) => {
    const existingAnimes = JSON.parse(
      localStorage.getItem("watchedAnimes") || "[]"
    );
    const animeIndex = existingAnimes.findIndex(
      (anime: { id: string }) => anime.id === animeId
    );

    let animeEntry;
    if (animeIndex !== -1) {
      animeEntry = {
        ...existingAnimes[animeIndex],
        timestamp: Date.now(),
      };
      existingAnimes.splice(animeIndex, 1);
    } else {
      animeEntry = {
        id: animeId,
        lastEpisode: "1",
        timestamp: Date.now(),
      };
    }

    existingAnimes.unshift(animeEntry);

    const limitedAnimes = existingAnimes.slice(0, 20);
    localStorage.setItem("watchedAnimes", JSON.stringify(limitedAnimes));
  }, []);

  const fetchStreamingData = useCallback(
    async (episodeNumber: string, signal?: AbortSignal) => {
      try {
        setIframeLoading(true);
        setError(null);

        const idGogo =
          animeInfo?.id_provider?.idGogo || localStorage.getItem("idGogo");
        const currentAnimeId = window.location.pathname.split("/")[2];

        if (!idGogo || idGogo === "undefined") {
          setError("No source available for this episode");
          setIframeLoading(false);
          return;
        }

        // Réinitialiser l'état lors du changement d'anime
        const previousAnimeId = sessionStorage.getItem("current_anime_id");
        if (previousAnimeId !== currentAnimeId) {
          Object.keys(sessionStorage).forEach((key) => {
            if (key.startsWith("streaming_")) {
              sessionStorage.removeItem(key);
            }
          });
          sessionStorage.setItem("current_anime_id", currentAnimeId);
          setStreamingUrl("");
          setAvailablePlayers([]);
          setSelectedPlayer("0");
        }

        const responseStreaming = await fetch(
          `https://api.amvstr.me/api/v2/stream/${idGogo}/${episodeNumber}`,
          {
            signal,
            headers: {
              Accept: "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
              Priority: "high",
              "X-Requested-With": "XMLHttpRequest",
            },
            cache: "no-store",
          }
        );

        if (!responseStreaming.ok) {
          throw new Error(`Erreur serveur: ${responseStreaming.status}`);
        }

        const dataStreaming = await responseStreaming.json();

        if (!dataStreaming?.iframe?.length && !dataStreaming?.nspl) {
          throw new Error("No source available for this episode");
        }

        const iframeSources =
          dataStreaming.iframe?.map((player: any, index: number) => ({
            id: `iframe-${index}`,
            name: player.name || `Lecteur ${index + 1}`,
            url: player.iframe,
          })) || [];

        // Filtrer pour avoir Doodstream
        const doodstreamPlayer = iframeSources.find(
          (player: { name: string }) =>
            player.name.toLowerCase().includes("doodstream")
        );
        const otherPlayers = iframeSources.filter(
          (player: { name: string }) =>
            !player.name.toLowerCase().includes("doodstream")
        );

        // Ajouter le lecteur ReactPlayer avec configuration optimisée pour mobile
        const reactPlayerSource = dataStreaming.stream?.multi?.backup?.url
          ? [
              {
                id: "react-player",
                name: "Direct Player",
                url: dataStreaming.stream.multi.backup.url,
                isM3U8: true,
              },
            ]
          : [];

        const nsplSources = dataStreaming.nspl
          ? [
              {
                id: "nspl-backup",
                name: "nspl Backup",
                url: dataStreaming.nspl.backup,
              },
            ]
          : [];

        const nsplMain = dataStreaming.nspl
          ? [
              {
                id: "nspl-main",
                name: "nspl Main",
                url: dataStreaming.nspl.main,
              },
            ]
          : [];

        // Combiner les sources dans l'ordre souhaité
        const validPlayers = [
          ...reactPlayerSource,
          ...nsplSources,
          ...(doodstreamPlayer ? [doodstreamPlayer] : []),
          ...nsplMain,
          ...otherPlayers,
        ].filter((player) => {
          try {
            new URL(player.url);
            return true;
          } catch {
            return false;
          }
        });

        if (!validPlayers.length) {
          throw new Error("No valid source available");
        }

        // Mettre à jour les players et l'URL avec Direct Player comme lecteur par défaut
        setAvailablePlayers(validPlayers);
        const defaultPlayer =
          validPlayers.find((player) => player.id === "react-player") ||
          validPlayers.find((player) => player.id === "nspl-backup") ||
          validPlayers[0];
        const iframeUrl = new URL(defaultPlayer.url);
        iframeUrl.searchParams.set("pause", "1");
        setStreamingUrl(iframeUrl.toString());
        setSelectedPlayer(defaultPlayer.id.toString());
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "AbortError") return;
          setError(
            error.message.includes("Erreur serveur")
              ? "Streaming server is temporarily unavailable"
              : error.message
          );
        }
        setStreamingUrl("");
        setAvailablePlayers([]);
        setSelectedPlayer("0");
      } finally {
        setIframeLoading(false);
      }
    },
    [animeInfo?.id_provider?.idGogo]
  );

  useEffect(() => {
    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const animeId = window.location.pathname.split("/")[2];
        const cacheKey = `anime_data_${animeId}`;
        const cachedData = sessionStorage.getItem(cacheKey);

        if (cachedData) {
          const { animeData, episodesData } = JSON.parse(cachedData);
          setAnimeInfo(animeData);
          setEpisodeList(episodesData);
          updateWatchHistory(animeId, animeData);

          if (animeData.id_provider?.idGogo) {
            localStorage.setItem("idGogo", animeData.id_provider.idGogo);
            await fetchStreamingData("1", controller.signal);
          } else {
            localStorage.setItem("idGogo", "undefined");
            setError("No source available for this anime");
          }
          await new Promise((resolve) => setTimeout(resolve, 100));
          if (animeData && Object.keys(animeData).length > 0) {
            setLoading(false);
          }
          return;
        }

        timeoutId = setTimeout(() => {
          if (loading) {
            controller.abort();
            setError(
              "Streaming server is taking too long to respond, please try again"
            );
            setLoading(false);
          }
        }, 20000);

        const [animeResponse, episodesResponse] = await Promise.all([
          fetch(`https://api.amvstr.me/api/v2/info/${animeId}`, {
            signal: controller.signal,
          }),
          fetch(`https://api.amvstr.me/api/v2/episodes/${animeId}`, {
            signal: controller.signal,
          }),
        ]);

        if (!animeResponse.ok || !episodesResponse.ok) {
          throw new Error("Error while retrieving data");
        }

        const [animeData, episodesData] = await Promise.all([
          animeResponse.json(),
          episodesResponse.json(),
        ]);

        if (!loading) return;

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

        await fetchStreamingData("1", controller.signal);

        await new Promise((resolve) => setTimeout(resolve, 100));
        if (animeData && Object.keys(animeData).length > 0) {
          setLoading(false);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            return;
          } else {
            setError("An error occurred while loading");
          }
        }
        console.error("Error fetching data:", error);
        setLoading(false);
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    };

    fetchData();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchStreamingData, updateWatchHistory]);

  useEffect(() => {
    const handleHashChange = () => {
      const episodeHash = window.location.hash.match(/episode-(\d+)/);
      const animeId = window.location.pathname.split("/")[2];

      const watchedAnimes = JSON.parse(
        localStorage.getItem("watchedAnimes") || "[]"
      );
      const watchedAnime = watchedAnimes.find(
        (anime: { id: string }) => anime.id === animeId
      );

      let newEpisode = episodeHash
        ? episodeHash[1]
        : watchedAnime?.lastEpisode || "1";

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

  if (loading || !animeInfo || Object.keys(animeInfo).length === 0) {
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
                lastEpisode: lastEpisode,
                timestamp: Date.now(),
              };
              watchedAnimes.splice(animeIndex, 1);
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
            setIframeLoading(true);
            await fetchStreamingData(value);

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
              setIframeLoading(true);
              const selected = availablePlayers.find(
                (player) => player.id === value
              );
              if (selected) {
                const iframeUrl = new URL(selected.url);
                iframeUrl.searchParams.set("pause", "1");
                setStreamingUrl(iframeUrl.toString());
                setTimeout(() => {
                  setIframeLoading(false);
                }, 2000);
              }
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lecteur" />
            </SelectTrigger>
            <SelectContent>
              {availablePlayers.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  {player.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 aspect-video pb-5 px-5 md:px-8">
        <div className="relative w-full h-full">
          {iframeLoading && (
            <div className="absolute inset-0 z-10 bg-background">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
          )}
          {error ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <p className="text-lg text-gray-500 mb-2">{error}</p>
                <Button
                  className="bg-blue-500 text-white hover:bg-blue-600"
                  onClick={() => {
                    setError(null);
                    fetchStreamingData(selectedEpisode);
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : selectedPlayer === "react-player" ? (
            <div className="w-full h-full rounded-lg overflow-hidden">
              <ReactPlayer
                url={streamingUrl}
                width="100%"
                height="100%"
                controls={true}
                playing={false}
                playsinline={true}
                config={{
                  file: {
                    forceHLS: true,
                    hlsOptions: {
                      enableWorker: true,
                      autoStartLoad: true,
                      startPosition: -1,
                      debug: false,
                    },
                    attributes: {
                      crossOrigin: "anonymous",
                      playsInline: true,
                      preload: "auto",
                    },
                  },
                }}
              />
            </div>
          ) : streamingUrl && localStorage.getItem("idGogo") !== "undefined" ? (
            <div className="w-full h-full">
              <iframe
                key={`${streamingUrl}-${selectedPlayer}`}
                src={streamingUrl}
                className="w-full h-full rounded-lg"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="no-referrer"
                loading="lazy"
                scrolling="no"
                frameBorder="0"
                security="restricted"
                style={{ display: iframeLoading ? "none" : "block" }}
                onLoad={() => {
                  setTimeout(() => {
                    setIframeLoading(false);
                  }, 500);
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
          )}
        </div>
      </div>

      {/* Relations Section */}
      {animeInfo?.relation && animeInfo.relation.length > 0 && (
        <div className="relations px-5 mb-5 md:px-8">
          <Accordion type="single" collapsible>
            <AccordionItem value="related-anime">
              <AccordionTrigger>
                <div className="flex flex-col items-start">
                  <div className="flex items-center">
                    <h3 className="font-semibold tracking-tight first:mt-0">
                      Related Anime
                    </h3>
                    <Magnet className="ml-2 h-5 w-5" />
                  </div>
                  <p className="mb-3 text-xs mt-1 md:text-sm font-light text-slate-600 dark:text-slate-400">
                    Other seasons and related anime
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {/* <div className="flex">
                  <div className="hidden -mt-7 md:flex ml-auto gap-3 p-4 rounded-lg">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full border-gray-700 bg-transparent hover:bg-transparent hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all"
                      onClick={() => swiperRelationsRef.current?.slidePrev()}
                    >
                      <ChevronLeft className="h-4 w-4 text-gray-400 hover:text-blue-500" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full border-gray-700 bg-transparent hover:bg-transparent hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all"
                      onClick={() => swiperRelationsRef.current?.slideNext()}
                    >
                      <ChevronRight className="h-4 w-4 text-gray-400 focus:text-blue-500" />
                    </Button>
                  </div>
                </div> */}

                <Swiper
                  spaceBetween={20}
                  slidesPerView={2}
                  breakpoints={{
                    640: { slidesPerView: 3 },
                    768: { slidesPerView: 4 },
                    1024: { slidesPerView: 5 },
                    1280: { slidesPerView: 6 },
                  }}
                  modules={[Navigation]}
                  className="swiper-container"
                  onSwiper={(swiper) => {
                    swiperRelationsRef.current = swiper;
                  }}
                >
                  {animeInfo.relation
                    .filter(
                      (anime) =>
                        (anime.type === "ANIME" || anime.format === "MOVIE") &&
                        anime.status !== "NOT_YET_RELEASED"
                    )
                    .sort(
                      (a, b) => (b.averageScore || 0) - (a.averageScore || 0)
                    )
                    .map((anime, index) => (
                      <SwiperSlide key={index}>
                        <div
                          onClick={() => {
                            const currentPath = window.location.pathname;
                            const newPath = `/anime/${anime.id}`;

                            if (currentPath !== newPath) {
                              // Nettoyer le sessionStorage pour forcer le rechargement des données
                              Object.keys(sessionStorage).forEach((key) => {
                                if (key.startsWith("anime_data_")) {
                                  sessionStorage.removeItem(key);
                                }
                              });

                              // Recharger la page avec le nouvel ID
                              window.location.href = newPath;
                            }
                          }}
                          className="cursor-pointer"
                        >
                          <div className="relative overflow-hidden rounded-lg group">
                            <div className="imgBadges flex absolute top-2 w-full px-2 z-10">
                              <div className="statusBadge hidden md:block">
                                {anime.status && (
                                  <Badge
                                    className="text-xs mr-0.5 md:mr-1 cursor-default h-6 flex items-center"
                                    variant="secondary"
                                  >
                                    {anime.status}
                                  </Badge>
                                )}
                              </div>
                              <div className="meanScoreBadge md:ml-auto lg:ml-6">
                                {anime.averageScore && (
                                  <Badge
                                    className="text-xs mr-0.5 mt-0.5 md:mr-1 cursor-default h-6 flex items-center"
                                    variant="secondary"
                                  >
                                    <Star className="h-4 w-4 mr-1" />
                                    {(anime.averageScore / 20).toFixed(1)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <img
                              className="w-[148.797px] h-[208px] md:w-[184px] md:h-[260.398px] xl:w-[204px] xl:h-[260.398px] rounded-lg transition-transform duration-300 group-hover:scale-110 object-cover"
                              src={anime.coverImage.large}
                              alt={anime.title.english || anime.title.romaji}
                            />
                          </div>
                          <h2
                            className="scroll-m-20 mt-1 text-sm font-extrabold tracking-tight lg:text-base mb-2"
                            style={{
                              whiteSpace: "pre-wrap",
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {anime.title.english || anime.title.romaji}
                          </h2>
                          <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                            {anime.format} • {anime.episodes || "?"} episodes
                          </p>
                        </div>
                      </SwiperSlide>
                    ))}
                </Swiper>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
};

export default HeaderInfo;
