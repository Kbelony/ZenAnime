/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  TrendingUp,
  Gem,
  Star,
  Wand,
  Clapperboard,
  ChevronRight,
  StepForward,
  X,
  Play,
  ChevronLeft,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper/types";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Link } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface AnimeApiResponse {
  coverImage: {
    extraLarge: string;
    large?: string;
  };
  title: {
    english: string;
    romaji?: string;
  };
  status: string;
  genres: string[];
  meanScore: number;
  episodes: number;
  id: string;
  bannerImage?: string;
  season?: string;
  trailer?: {
    thumbnail: string;
    id: string;
  };
  nextAiringEpisode?: {
    airingAt: number;
    episode: number;
  };
}

interface Anime {
  score: any;
  coverImage: string | { large?: string; extraLarge?: string };
  title: string | { english: string; romaji: string };
  status: string;
  genres: string;
  meanScore: number;
  episodes: number;
  id: string;
  bannerImage?: string;
  season?: string;
  trailer?: {
    thumbnail: string;
    id: string;
  };
  nextAiringEpisode?: {
    airingAt: number;
    episode: number;
  };
  lastEpisode?: string;
  timestamp?: number;
}

interface WatchedAnime {
  id: string;
  lastEpisode: string;
  timestamp: number;
}

const CarouselList = () => {
  const [sectionsLoading, setSectionsLoading] = useState({
    watched: true,
    trending: true,
    popular: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [watchedAnimeList, setWatchedAnimeList] = useState<Anime[]>([]);
  const [animeListTrending, setAnimeListTrending] = useState<Anime[]>([]);
  const [animeListPopular, setAnimeListPopular] = useState<Anime[]>([]);
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());

  const swiperResumeRef = useRef<SwiperType>();
  const swiperPopularRef = useRef<SwiperType>();
  const swiperTrendingRef = useRef<SwiperType>();
  const swiperSelectionRef = useRef<SwiperType>();
  const swiperForYouRef = useRef<SwiperType>();

  const settings = useMemo(
    () => ({
      centeredSlides: false,
      spaceBetween: 30,
      loop: false,
      // Start of Selection
      navigation: { enabled: window.innerWidth <= 768 },
      breakpoints: {
        1980: { slidesPerView: 8, spaceBetween: 25 },
        1200: { slidesPerView: 6, spaceBetween: 25 },
        1180: { slidesPerView: 5, spaceBetween: 15 },
        1024: { slidesPerView: 4, spaceBetween: 15 },
        840: { slidesPerView: 4, spaceBetween: 15 },
        768: { slidesPerView: 3, spaceBetween: 25 },
        600: { slidesPerView: 4 },
        299: { slidesPerView: 2, spaceBetween: 10 },
      },
    }),
    []
  );

  const settingsTrailer = useMemo(
    () => ({
      centeredSlides: true,
      spaceBetween: 30,
      loop: false,
      navigation: true,
      slidesPerView: 1,
    }),
    []
  );

  const fetchWatchedAnimes = useCallback(async () => {
    try {
      setSectionsLoading((prev) => ({ ...prev, watched: true }));
      const watchedAnimes: WatchedAnime[] = JSON.parse(
        localStorage.getItem("watchedAnimes") || "[]"
      );

      if (watchedAnimes.length === 0) return [];

      const cacheKey = `watched_animes_${watchedAnimes.map((a) => a.id).join("_")}`;
      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setWatchedAnimeList(parsedData);
        return parsedData;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const watchedAnimesData = await Promise.all(
        watchedAnimes.map(async (anime) => {
          try {
            const response = await fetch(
              `https://api.amvstr.me/api/v2/info/${anime.id}`,
              { signal: controller.signal }
            );
            if (!response.ok)
              throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return {
              ...data,
              lastEpisode: anime.lastEpisode,
              timestamp: anime.timestamp,
            };
          } catch (error) {
            console.error(`Erreur pour l'anime ${anime.id}:`, error);
            return null;
          }
        })
      );

      clearTimeout(timeout);

      const filteredData = watchedAnimesData.filter(Boolean);
      setWatchedAnimeList(filteredData);
      sessionStorage.setItem(cacheKey, JSON.stringify(filteredData));
      return filteredData;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des animes regardés:",
        error
      );
      setError("Erreur lors du chargement de votre historique");
      return [];
    } finally {
      setSectionsLoading((prev) => ({ ...prev, watched: false }));
    }
  }, []);

  const fetchAnimeList = useCallback(async () => {
    try {
      setSectionsLoading((prev) => ({
        ...prev,
        trending: true,
        popular: true,
      }));
      const cacheKey = "anime_lists_data";
      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        const { trending, popular } = JSON.parse(cachedData);
        setAnimeListTrending(trending);
        setAnimeListPopular(popular);
        setSectionsLoading((prev) => ({
          ...prev,
          trending: false,
          popular: false,
        }));
        return;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const [response_trending, response_popular] = await Promise.all([
        fetch("https://api.amvstr.me/api/v2/trending?limit=24", {
          signal: controller.signal,
        }),
        fetch("https://api.amvstr.me/api/v2/popular?limit=24", {
          signal: controller.signal,
        }),
      ]);

      clearTimeout(timeout);

      if (!response_trending.ok || !response_popular.ok) {
        throw new Error(
          "Une erreur est survenue lors de la récupération des données"
        );
      }

      const [data_trending, data_popular] = await Promise.all([
        response_trending.json(),
        response_popular.json(),
      ]);

      const trendingData = data_trending.results.map(
        (anime: AnimeApiResponse) => ({
          coverImage: anime.coverImage.extraLarge,
          title: anime.title.english,
          bannerImage: anime.bannerImage,
          status: anime.status,
          season: anime.season,
          genres: anime.genres.join(", "),
          meanScore: anime.meanScore,
          id: anime.id,
          episodes: anime.episodes,
          trailer: anime.trailer,
          nextAiringEpisode: anime.nextAiringEpisode,
        })
      );

      const popularData = data_popular.results.map(
        (anime: AnimeApiResponse) => ({
          coverImage: anime.coverImage.extraLarge,
          title: anime.title.english,
          status: anime.status,
          genres: anime.genres.join(", "),
          meanScore: anime.meanScore,
          id: anime.id,
          episodes: anime.episodes,
        })
      );

      setAnimeListTrending(trendingData);
      setAnimeListPopular(popularData);

      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({ trending: trendingData, popular: popularData })
      );
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          setError("Le temps de réponse est trop long, veuillez réessayer");
        } else {
          setError("Une erreur est survenue lors du chargement des données");
        }
      }
      console.error("Erreur lors de la récupération des données:", error);
    } finally {
      setSectionsLoading((prev) => ({
        ...prev,
        trending: false,
        popular: false,
      }));
    }
  }, []);

  const removeFromWatchlist = useCallback(async (animeId: string) => {
    try {
      setAnimatingIds((prev) => new Set(prev).add(animeId));
      await new Promise((resolve) => setTimeout(resolve, 300));

      const watchedAnimes = JSON.parse(
        localStorage.getItem("watchedAnimes") || "[]"
      );
      const updatedWatchedAnimes = watchedAnimes.filter(
        (anime: { id: string }) => anime.id !== animeId
      );
      localStorage.setItem(
        "watchedAnimes",
        JSON.stringify(updatedWatchedAnimes)
      );

      setWatchedAnimeList((prevList) =>
        prevList.filter((anime) => String(anime.id) !== String(animeId))
      );
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    } finally {
      setAnimatingIds((prev) => {
        const next = new Set(prev);
        next.delete(animeId);
        return next;
      });
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      try {
        await Promise.all([fetchWatchedAnimes(), fetchAnimeList()]);
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
        setError("Erreur lors du chargement");
      }
    };

    fetchData();
  }, [fetchWatchedAnimes, fetchAnimeList]);

  const renderSkeleton = () => (
    <div>
      <Swiper {...settings} modules={[Navigation]} className="swiper-container">
        {Array.from({ length: 12 }).map((_, index) => (
          <SwiperSlide key={index}>
            <Skeleton className="h-52 md:min-h-60 mb-2 md:max-h-80 portrait:min-h-10" />
            <Skeleton className="h-4 w-36 mb-2" />
            <div className="flex mb-6">
              <Skeleton className="h-4 w-16 mr-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );

  if (error) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="carousel_list px-8 mt-7 md:px-20 md:mt-10 w-full ">
      {localStorage.getItem("watchedAnimes") &&
        JSON.parse(localStorage.getItem("watchedAnimes") || "[]").length >
          0 && (
          <div className="resume">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center">
                  <h3 className="font-semibold tracking-tight first:mt-0">
                    Resume
                  </h3>
                  <StepForward className="ml-2 mt-0.5 h-5 w-5" />
                </div>
                <p className="mb-3 pr-5 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                  Continue watching where you left off!
                </p>
              </div>
              <div className="hidden md:flex ml-auto gap-3 p-4 rounded-lg">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-gray-700 bg-transparent hover:bg-transparent hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all"
                  onClick={() => swiperResumeRef.current?.slidePrev()}
                >
                  <ChevronLeft className="h-4 w-4 text-gray-400 hover:text-blue-500" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-gray-700 bg-transparent hover:bg-transparent hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all"
                  onClick={() => swiperResumeRef.current?.slideNext()}
                >
                  <ChevronRight className="h-4 w-4 text-gray-400 focus:text-blue-500" />
                </Button>
              </div>
            </div>

            {sectionsLoading.watched ? (
              renderSkeleton()
            ) : (
              <Swiper
                {...settings}
                modules={[Navigation]}
                className="swiper-container"
                onSwiper={(swiper) => {
                  swiperResumeRef.current = swiper;
                }}
              >
                {watchedAnimeList.map((anime, index) => {
                  const watchedAnimes = JSON.parse(
                    localStorage.getItem("watchedAnimes") || "[]"
                  );
                  const watchedAnime = watchedAnimes.find(
                    (watched: { id: string }) => watched.id === String(anime.id)
                  );

                  // console.log("ID from API:", anime.id);
                  // console.log("Watched anime data:", watchedAnime);

                  return (
                    <SwiperSlide
                      key={index}
                      className={`transition-all duration-300 ${
                        animatingIds.has(String(anime.id))
                          ? "opacity-0 transform scale-95"
                          : "opacity-100 transform scale-100"
                      }`}
                    >
                      <Link
                        to="/anime/$id"
                        params={{ id: anime.id }}
                        hash={`episode${watchedAnime?.lastEpisode || "1"}`}
                      >
                        <div className="relative overflow-hidden rounded-lg group">
                          <div className="imgBadges flex absolute top-2 w-full px-2 z-10">
                            <div className="statusBadge flex justify-between w-full">
                              {anime.status && (
                                <Badge
                                  className="text-xs mr-0.5 md:mr-1 cursor-default h-6 flex items-center"
                                  variant="secondary"
                                  key={0}
                                >
                                  <Star className="h-4 w-4 mr-1" />
                                  {(anime?.score?.decimalScore / 2).toFixed(1)}
                                </Badge>
                              )}
                              <Button
                                variant="outline"
                                className="mr-2"
                                size="icon"
                                onClick={(e) => {
                                  e.preventDefault();
                                  removeFromWatchlist(String(anime.id));
                                }}
                              >
                                <X />
                              </Button>
                            </div>
                            {/* <div className="meanScoreBadge lg:ml-auto">
                          {anime.meanScore && (
                            <Badge
                              className="text-xs mr-0.5 mt-0.5 md:mr-1 cursor-default h-6 flex items-center"
                              variant="secondary"
                              key={0}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              {anime?.score?.decimalScore}
                            </Badge>
                          )}
                        </div> */}
                          </div>
                          <img
                            className="w-[148.797px] h-[208px] md:w-[184px] md:h-[260.398px] xl:w-[204px] xl:h-[260.398px] rounded-lg transition-transform duration-300 group-hover:scale-110 object-cover"
                            src={
                              typeof anime.coverImage === "string"
                                ? anime.coverImage
                                : anime.coverImage.large
                            }
                            alt={
                              typeof anime.title === "string"
                                ? anime.title
                                : anime.title.english || anime.title.romaji
                            }
                          />
                        </div>
                        <h2
                          className="scroll-m-20 mt-1 text-sm font-extrabold tracking-tight lg:text-base"
                          style={{
                            whiteSpace: "pre-wrap",
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {typeof anime.title === "string"
                            ? anime.title
                            : anime.title.english || anime.title.romaji}
                        </h2>
                      </Link>
                      <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                        {anime.episodes === 1
                          ? "Movie"
                          : `Episode ${watchedAnime?.lastEpisode || "?"}`}
                      </p>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            )}
          </div>
        )}
      <div className="popular">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center">
              <h3 className="font-semibold tracking-tight first:mt-0">
                Popular
              </h3>
              <Star className="ml-2 mt-0.5 h-5 w-5" />
            </div>
            <p className="mb-3 pr-5 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
              A selection of the most popular anime of all time !
            </p>
          </div>
          <div className="hidden md:flex ml-auto gap-3 p-4 rounded-lg">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-gray-700 bg-transparent hover:bg-transparent hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all"
              onClick={() => swiperPopularRef.current?.slidePrev()}
            >
              <ChevronLeft className="h-4 w-4 text-gray-400 hover:text-blue-500" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-gray-700 bg-transparent hover:bg-transparent hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all"
              onClick={() => swiperPopularRef.current?.slideNext()}
            >
              <ChevronRight className="h-4 w-4 text-gray-400 focus:text-blue-500" />
            </Button>
          </div>
          <Link to="/popular">
            <Button className="rounded-full mt-3 md:mt-4" variant="secondary">
              See All <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {sectionsLoading.popular ? (
          renderSkeleton()
        ) : (
          <Swiper
            {...settings}
            modules={[Navigation]}
            className="swiper-container"
            onSwiper={(swiper) => {
              swiperPopularRef.current = swiper;
            }}
          >
            {animeListPopular.slice(0, 12).map((anime, index) => (
              <SwiperSlide key={index}>
                <Link to="/anime/$id" params={{ id: anime.id }}>
                  <div className="relative overflow-hidden rounded-lg group">
                    <div className="imgBadges flex absolute top-2 w-full px-2 z-10">
                      <div className="statusBadge hidden md:block">
                        {anime.status && (
                          <Badge
                            className="text-xs mr-0.5 md:mr-1 cursor-default h-6 flex items-center"
                            variant="secondary"
                            key={0}
                          >
                            {anime.status}
                          </Badge>
                        )}
                      </div>
                      <div className="meanScoreBadge lg:ml-auto">
                        {anime.meanScore && (
                          <Badge
                            className="text-xs mr-0.5 mt-0.5 md:mr-1 cursor-default h-6 flex items-center"
                            variant="secondary"
                            key={0}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            {(anime.meanScore / 20).toFixed(1)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <img
                      className="w-[148.797px] h-[208px] md:w-[184px] md:h-[260.398px] xl:w-[204px] xl:h-[260.398px] rounded-lg transition-transform duration-300 group-hover:scale-110 object-cover"
                      src={
                        typeof anime.coverImage === "string"
                          ? anime.coverImage
                          : anime.coverImage.extraLarge ||
                            anime.coverImage.large
                      }
                      alt={
                        typeof anime.title === "string"
                          ? anime.title
                          : anime.title.english || anime.title.romaji
                      }
                    />
                  </div>
                  <h2
                    className="scroll-m-20 mt-1 text-sm font-extrabold tracking-tight lg:text-base"
                    style={{
                      whiteSpace: "pre-wrap",
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {typeof anime.title === "string"
                      ? anime.title
                      : anime.title.english || anime.title.romaji}
                  </h2>
                </Link>
                <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                  {anime.episodes === null
                    ? "X episodes"
                    : anime.episodes === 1
                      ? `Movie`
                      : `${anime.episodes} episodes`}
                </p>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
      <div className="trending">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center">
              <h3 className="font-semibold tracking-tight first:mt-0">
                Trending
              </h3>
              <TrendingUp className="ml-2 mt-0.5 h-5 w-5" />
            </div>
            <p className="mb-3 pr-5 text-xs md:text-sm text-slate-600 dark:text-slate-400">
              A selection of the most trending anime of the moment
            </p>
          </div>
          <div className="hidden md:flex ml-auto gap-3 p-4 rounded-lg">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-gray-700 bg-transparent hover:bg-transparent hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all"
              onClick={() => swiperTrendingRef.current?.slidePrev()}
            >
              <ChevronLeft className="h-4 w-4 text-gray-400 hover:text-blue-500" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-gray-700 bg-transparent hover:bg-transparent hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all"
              onClick={() => swiperTrendingRef.current?.slideNext()}
            >
              <ChevronRight className="h-4 w-4 text-gray-400 focus:text-blue-500" />
            </Button>
          </div>
          <Link to="/trending">
            <Button className="rounded-full mt-4" variant="secondary">
              See All <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {sectionsLoading.trending ? (
          renderSkeleton()
        ) : (
          <Swiper
            {...settings}
            modules={[Navigation]}
            className="swiper-container"
            onSwiper={(swiper) => {
              swiperTrendingRef.current = swiper;
            }}
          >
            {animeListTrending
              .slice(0, 12)
              .filter(
                (anime) =>
                  anime.title !== null && anime.status !== "NOT_YET_RELEASED"
              )
              .map((anime, index) => (
                <SwiperSlide key={index}>
                  <Link to="/anime/$id" params={{ id: anime.id }}>
                    <div className="relative overflow-hidden rounded-lg group">
                      <div className="imgBadges flex absolute top-2 w-full px-2 z-10">
                        <div className="statusBadge hidden md:block">
                          {anime.status && (
                            <Badge
                              className="text-xs mr-0.5 md:mr-1 cursor-default h-6 flex items-center"
                              variant="secondary"
                              key={0}
                            >
                              {anime.status}
                            </Badge>
                          )}
                        </div>
                        <div className="meanScoreBadge lg:ml-auto">
                          {anime.meanScore && (
                            <Badge
                              className="text-xs mr-0.5 mt-0.5 md:mr-1 cursor-default h-6 flex items-center"
                              variant="secondary"
                              key={0}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              {(anime.meanScore / 20).toFixed(1)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <img
                        className="w-[148.797px] h-[208px] md:w-[184px] md:h-[260.398px] xl:w-[204px] xl:h-[260.398px] rounded-lg transition-transform duration-300 group-hover:scale-110 object-cover"
                        src={
                          typeof anime.coverImage === "string"
                            ? anime.coverImage
                            : anime.coverImage.extraLarge ||
                              anime.coverImage.large
                        }
                        alt={
                          typeof anime.title === "string"
                            ? anime.title
                            : anime.title.english || anime.title.romaji
                        }
                      />
                    </div>
                    <h2
                      className="scroll-m-20 mt-1 text-sm font-extrabold tracking-tight lg:text-base mb-1"
                      style={{
                        whiteSpace: "pre-wrap",
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {typeof anime.title === "string"
                        ? anime.title
                        : anime.title.english || anime.title.romaji}
                    </h2>
                  </Link>
                  <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                    {anime.episodes === null
                      ? "X episodes"
                      : anime.episodes === 1
                        ? `Movie`
                        : `${anime.episodes} episodes`}
                  </p>
                </SwiperSlide>
              ))}
          </Swiper>
        )}
      </div>
      <div className="trailer lg:hidden md:hidden">
        <div className="flex mt-3">
          <h3 className="font-semibold tracking-tight first:mt-0">Trailer </h3>
          <Clapperboard className="ml-2 mt-0.5 h-5 w-5" />
        </div>
        <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
          A selection of new trailer !
        </p>
        {sectionsLoading.trending ? (
          renderSkeleton()
        ) : (
          <Swiper
            {...settingsTrailer}
            modules={[Navigation]}
            className="swiper-container"
          >
            {[...animeListTrending]
              .slice(0, 24)
              .sort(() => Math.random() - 0.5)
              .filter((anime) => anime.trailer && anime.trailer.thumbnail)
              .map((anime, index) => (
                <SwiperSlide key={index}>
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <a>
                        <img
                          className="w-full landscape:w-svw rounded-lg"
                          src={anime.trailer?.thumbnail}
                          alt={
                            typeof anime.title === "string"
                              ? anime.title
                              : anime.title.english
                          }
                        />
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
                          {typeof anime.title === "string"
                            ? anime.title
                            : anime.title.english}{" "}
                          Trailer
                        </h2>
                        <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                          Season : {anime.season}
                        </p>
                      </a>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your account and remove your data from our
                          servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <a
                            href={`https://www.youtube.com/watch?v=${anime.trailer?.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Continue
                          </a>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </SwiperSlide>
              ))}
          </Swiper>
        )}
      </div>
      <div className="upcoming hidden md:block">
        <div className="flex mt-3">
          <h3 className="font-semibold tracking-tight first:mt-0">
            Upcoming next
          </h3>
          <Clapperboard className="ml-2 mt-0.5 h-5 w-5" />
        </div>
        <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
          Episodes that should be released soon
        </p>
        {sectionsLoading.trending ? (
          renderSkeleton()
        ) : (
          <div className="flex flex-col gap-4">
            {[...animeListTrending]
              .slice(0, 30)
              .filter(
                (anime) =>
                  anime.nextAiringEpisode !== null &&
                  anime.nextAiringEpisode?.episode !== undefined &&
                  anime.bannerImage !== null &&
                  anime.id !==
                    [...animeListTrending]
                      .slice(0, 30)
                      .filter(
                        (a) =>
                          a.nextAiringEpisode !== null &&
                          a.nextAiringEpisode?.episode !== undefined &&
                          a.bannerImage !== null
                      )[0]?.id
              )
              .sort((a, b) => {
                const timeA = a.nextAiringEpisode?.airingAt || 0;
                const timeB = b.nextAiringEpisode?.airingAt || 0;
                return timeA - timeB;
              })
              .map((anime, index) => (
                <div key={index} className="flex items-center p-2 gap-2">
                  <Link
                    to="/anime/$id"
                    params={{ id: anime.id }}
                    className="flex items-center gap-4 w-full"
                  >
                    <img
                      className="rounded-lg h-32 object-cover"
                      src={
                        typeof anime.coverImage === "string"
                          ? anime.coverImage
                          : anime.coverImage.large
                      }
                      alt={
                        typeof anime.title === "string"
                          ? anime.title
                          : anime.title.english || anime.title.romaji
                      }
                    />
                    <div className="flex flex-col flex-1">
                      <h2 className="scroll-m-20 text-sm font-extrabold tracking-tight lg:text-base">
                        {typeof anime.title === "string"
                          ? anime.title
                          : anime.title.english || anime.title.romaji}
                      </h2>
                      <p className=" mt-3 text-sm">
                        {anime.nextAiringEpisode
                          ? `Episode  ${anime.nextAiringEpisode.episode}`
                          : anime.nextAiringEpisode === undefined
                            ? "episode this week"
                            : "X episodes"}
                      </p>
                      <div className="flex">
                        <p className="mb-3 mt-2 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                          {anime.nextAiringEpisode
                            ? new Date(
                                anime.nextAiringEpisode.airingAt * 1000
                              ).toString() === "Invalid Date"
                              ? ""
                              : new Date(
                                  anime.nextAiringEpisode.airingAt * 1000
                                ).toLocaleString("en-US", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                  hour: "numeric",
                                  minute: "numeric",
                                  hour12: true,
                                })
                            : ""}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <div className="meanScoreBadge flex-shrink-0 flex items-center justify-end xl:mr-10 lg:mr-10 md:mr-5 mr-2">
                    <Badge
                      className="text-xs mr-0.5 mt-0.5 md:mr-1 cursor-default h-6 flex items-center"
                      variant="secondary"
                      key={0}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      {anime?.meanScore
                        ? (anime.meanScore / 20).toFixed(1)
                        : "N/A"}
                    </Badge>
                  </div>

                  <Link
                    to="/anime/$id"
                    params={{ id: anime.id }}
                    hash={`episode-${anime.nextAiringEpisode?.episode ? anime.nextAiringEpisode.episode - 1 : ""}`}
                  >
                    <div className="flex w-full justify-end">
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <p>Watch last episode</p>
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </Link>
                </div>
              ))}
          </div>
        )}
      </div>
      <div className="selection">
        <div className="flex mt-2 md:mt-8">
          <h3 className="font-semibold tracking-tight first:mt-0">
            Our selection
          </h3>
          <Gem className="ml-2 mt-0.5 h-5 w-5" />
        </div>
        <div className="flex">
          <div>
            <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
              Here is a selection of our current favourites
            </p>
          </div>
          <div className="hidden -mt-7 md:flex ml-auto gap-3 p-4 rounded-lg">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-gray-700 bg-transparent hover:bg-transparent hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all"
              onClick={() => swiperSelectionRef.current?.slidePrev()}
            >
              <ChevronLeft className="h-4 w-4 text-gray-400 hover:text-blue-500" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-gray-700 bg-transparent hover:bg-transparent hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all"
              onClick={() => swiperSelectionRef.current?.slideNext()}
            >
              <ChevronRight className="h-4 w-4 text-gray-400 focus:text-blue-500" />
            </Button>
          </div>
        </div>

        {sectionsLoading.trending ? (
          renderSkeleton()
        ) : (
          <Swiper
            {...settings}
            modules={[Navigation]}
            className="swiper-container"
            onSwiper={(swiper) => {
              swiperSelectionRef.current = swiper;
            }}
          >
            {[...animeListTrending]
              .slice(13, 24)
              .sort(() => Math.random() - 0.5)
              .filter(
                (anime) =>
                  anime.title !== null && anime.status !== "NOT_YET_RELEASED"
              )
              .map((anime, index) => (
                <SwiperSlide key={index}>
                  <Link to="/anime/$id" params={{ id: anime.id }}>
                    <div className="relative overflow-hidden rounded-lg group">
                      <div className="imgBadges flex absolute top-2 w-full px-2 z-10">
                        <div className="statusBadge hidden md:block">
                          {anime.status && (
                            <Badge
                              className="text-xs mr-0.5 md:mr-1 cursor-default h-6 flex items-center"
                              variant="secondary"
                              key={0}
                            >
                              {anime.status}
                            </Badge>
                          )}
                        </div>
                        <div className="meanScoreBadge lg:ml-auto">
                          {anime.meanScore && (
                            <Badge
                              className="text-xs mr-0.5 mt-0.5 md:mr-1 cursor-default h-6 flex items-center"
                              variant="secondary"
                              key={0}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              {(anime.meanScore / 20).toFixed(1)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <img
                        className="w-[148.797px] h-[208px] md:w-[184px] md:h-[260.398px] xl:w-[204px] xl:h-[260.398px] rounded-lg transition-transform duration-300 group-hover:scale-110 object-cover"
                        src={
                          typeof anime.coverImage === "string"
                            ? anime.coverImage
                            : anime.coverImage?.large ||
                              anime.coverImage?.extraLarge
                        }
                        alt={
                          typeof anime.title === "string"
                            ? anime.title
                            : anime.title?.english || anime.title?.romaji
                        }
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
                      {typeof anime.title === "string"
                        ? anime.title
                        : anime.title?.english || anime.title?.romaji}
                    </h2>
                  </Link>
                  <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                    {anime.episodes === null
                      ? "X episodes"
                      : anime.episodes === 1
                        ? `Movie`
                        : `${anime.episodes} episodes`}
                  </p>
                </SwiperSlide>
              ))}
          </Swiper>
        )}
      </div>
      <div className="forYou">
        <div className="flex mt-3">
          <h3 className="font-semibold tracking-tight first:mt-0">For you </h3>
          <Wand className="ml-2 mt-0.5 h-5 w-5" />
        </div>
        <div className="flex">
          <div>
            <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
              A selection just for you !
            </p>
          </div>
          <div className="hidden -mt-7 md:flex ml-auto gap-3 p-4 rounded-lg">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-gray-700 bg-transparent hover:bg-transparent hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all"
              onClick={() => swiperForYouRef.current?.slidePrev()}
            >
              <ChevronLeft className="h-4 w-4 text-gray-400 hover:text-blue-500" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-gray-700 bg-transparent hover:bg-transparent hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all"
              onClick={() => swiperForYouRef.current?.slideNext()}
            >
              <ChevronRight className="h-4 w-4 text-gray-400 focus:text-blue-500" />
            </Button>
          </div>
        </div>
        {sectionsLoading.popular ? (
          renderSkeleton()
        ) : (
          <Swiper
            {...settings}
            modules={[Navigation]}
            className="swiper-container"
            onSwiper={(swiper) => {
              swiperForYouRef.current = swiper;
            }}
          >
            {[...animeListPopular]
              .slice(13, 24)
              .sort(() => Math.random() - 0.5)
              .map((anime, index) => (
                <SwiperSlide key={index}>
                  <Link to="/anime/$id" params={{ id: anime.id }}>
                    <div className="relative overflow-hidden rounded-lg group">
                      <div className="imgBadges flex absolute top-2 w-full px-2 z-10">
                        <div className="statusBadge hidden md:block">
                          {anime.status && (
                            <Badge
                              className="text-xs mr-0.5 md:mr-1 cursor-default h-6 flex items-center"
                              variant="secondary"
                              key={0}
                            >
                              {anime.status}
                            </Badge>
                          )}
                        </div>
                        <div className="meanScoreBadge lg:ml-auto">
                          {anime.meanScore && (
                            <Badge
                              className="text-xs mr-0.5 mt-0.5 md:mr-1 cursor-default h-6 flex items-center"
                              variant="secondary"
                              key={0}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              {(anime.meanScore / 20).toFixed(1)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <img
                        className="w-[148.797px] h-[208px] md:w-[184px] md:h-[260.398px] xl:w-[204px] xl:h-[260.398px] rounded-lg transition-transform duration-300 group-hover:scale-110 object-cover"
                        src={
                          typeof anime.coverImage === "string"
                            ? anime.coverImage
                            : anime.coverImage.large ||
                              anime.coverImage.extraLarge
                        }
                        alt={
                          typeof anime.title === "string"
                            ? anime.title
                            : anime.title.english || anime.title.romaji
                        }
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
                      {typeof anime.title === "string"
                        ? anime.title
                        : anime.title.english || anime.title.romaji}
                    </h2>
                  </Link>
                  <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                    {anime.episodes === null
                      ? "X episodes"
                      : anime.episodes === 1
                        ? `Movie`
                        : `${anime.episodes} episodes`}
                  </p>
                </SwiperSlide>
              ))}
          </Swiper>
        )}
      </div>
    </div>
  );
};

export default CarouselList;
