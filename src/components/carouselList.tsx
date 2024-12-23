import { useEffect, useState } from "react";
import {
  TrendingUp,
  Gem,
  Star,
  Wand,
  Clapperboard,
  ChevronRight,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
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

const CarouselList = () => {
  interface Anime {
    nextAiringEpisode: {
      airingAt: number;
      episode: number;
    } | null;
    episodes: string;
    coverImage: string;
    season: string;
    title: string;
    status: string;
    genres: string;
    meanScore: string;
    trailer: {
      thumbnail: string;
      id: string;
    };
    id: string;
    bannerImage: string;
  }
  const [loading, setLoading] = useState(false);
  const [animeListTrending, setAnimeListTrending] = useState<Anime[]>([]);
  const [animeListPopular, setAnimeListPopular] = useState<Anime[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response_trending = await fetch(
        "https://api.amvstr.me/api/v2/trending?limit=24"
      );
      const response_popular = await fetch(
        "https://api.amvstr.me/api/v2/popular?limit=24"
      );
      await new Promise((resolve) => setTimeout(resolve, 1800));
      const data_trending = await response_trending.json();
      const data_popular = await response_popular.json();
      console.log("Popular : ", data_popular);
      console.log("Trending : ", data_trending);
      const trendingData = data_trending.results.map(
        (anime: {
          coverImage: {
            extraLarge: string;
          };
          trailer: {
            thumbnail: string;
            id: string;
          };
          nextAiringEpisode: {
            airingAt: number;
            episode: number;
          };
          title: { english: string };
          bannerImage: string;
          status: string;
          season: string;
          genres: string[];
          meanScore: string;
          episodes: number;
          id: string;
          animeId: number;
        }) => ({
          coverImage: anime.coverImage.extraLarge,
          title: anime.title.english,
          bannerImage: anime.bannerImage,
          status: anime.status,
          season: anime.season,
          genres: anime.genres.join(", "),
          meanScore: anime.meanScore,
          id: anime.id,
          episodes: anime.episodes,
          trailer: {
            thumbnail: anime.trailer?.thumbnail,
            id: anime.trailer?.id,
          },
          nextAiringEpisode: {
            airingAt: anime.nextAiringEpisode?.airingAt,
            episode: anime.nextAiringEpisode?.episode,
          },
        })
      );
      const popularData = data_popular.results.map(
        (anime: {
          coverImage: {
            extraLarge: string;
          };
          title: { english: string };
          status: string;
          genres: string[];
          meanScore: string;
          episodes: number;
          id: string;
          animeId: number;
        }) => ({
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
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const settings = {
    centeredSlides: false,
    spaceBetween: 30,
    loop: false,
    navigation: true,
    breakpoints: {
      1200: {
        slidesPerView: 6,
        spaceBetween: 25,
      },
      1000: {
        slidesPerView: 5,
        spaceBetween: 25,
      },
      800: {
        slidesPerView: 4,
        spaceBetween: 25,
      },
      600: {
        slidesPerView: 3,
      },
      299: {
        slidesPerView: 2,
        spaceBetween: 10,
      },
    },
  };

  const settingsTrailer = {
    centeredSlides: true,
    spaceBetween: 30,
    loop: false,
    navigation: true,
    slidesPerView: 1,
  };

  const settingsUpcoming = {
    centeredSlides: false,
    direction: "vertical" as const,
    spaceBetween: 20,
    loop: false,
    navigation: true,
    slidesPerView: 2,
    slidesPerGroup: 2,
  };

  return (
    <div className="carousel_list px-8 mt-7 md:px-20 md:mt-10 w-full ">
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
          <Link to="/popular">
            <Button className="rounded-full mt-3 md:mt-0" variant="secondary">
              See All <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loading && (
          <div>
            <Swiper
              {...settings}
              modules={[Navigation]}
              className="swiper-container"
            >
              {Array.from({ length: 12 }).map((_, index) => (
                <SwiperSlide key={index}>
                  <Skeleton className="h-52 md:min-h-60 mb-2 md:max-h-80 portrait:min-h-10" />
                  <Skeleton className="h-4 w-36 mb-2" />
                  <div className="flex">
                    <Skeleton className="h-4 w-16 mr-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
        {!loading && animeListPopular && (
          <Swiper
            {...settings}
            modules={[Navigation]}
            className="swiper-container"
          >
            {loading && (
              <div>
                <Swiper
                  {...settings}
                  modules={[Navigation]}
                  className="swiper-container"
                >
                  {Array.from({ length: 12 }).map((_, index) => (
                    <SwiperSlide key={index}>
                      <Skeleton className="h-52 md:min-h-60 mb-2 md:max-h-80 portrait:min-h-10" />
                      <Skeleton className="h-4 w-36 mb-2" />
                      <div className="flex">
                        <Skeleton className="h-4 w-16 mr-1" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
            {!loading && animeListPopular && (
              <Swiper
                {...settings}
                modules={[Navigation]}
                className="swiper-container"
              >
                {animeListPopular.slice(0, 12).map((anime, index) => (
                  <SwiperSlide key={index}>
                    <Link to="/anime/$id" params={{ id: anime.id }}>
                      <div className="relative">
                        <div className="imgBadges flex absolute top-2 w-full px-2 z-10">
                          <div className="statusBadge hidden md:block">
                            {anime.status && (
                              <Badge
                                className="text-xs mr-0.5 md:mr-1 cursor-default"
                                variant="secondary"
                                key={0}
                              >
                                {anime.status}
                              </Badge>
                            )}
                          </div>
                          <div className="meanScoreBadge lg:ml-7">
                            {anime.meanScore && (
                              <Badge
                                className="text-xs mr-0.5 mt-0.5 md:mr-1 cursor-default"
                                variant="secondary"
                                key={0}
                              >
                                <Star className="h-4 w-4 mr-1" />
                                {anime.meanScore}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <img
                          className="max-h-52 md:min-h-60 md:max-h-80 portrait:min-h-10 rounded-lg"
                          src={anime.coverImage}
                          alt={anime.title}
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
                        {anime.title}
                      </h2>
                    </Link>
                    <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                      {anime.episodes === null
                        ? "X episodes"
                        : `${anime.episodes} episodes`}
                    </p>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
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
          <Link to="/trending">
            <Button className="rounded-full mt-3 md:mt-0" variant="secondary">
              See All <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Swiper
          {...settings}
          modules={[Navigation]}
          className="swiper-container"
        >
          {loading && (
            <div>
              <Swiper
                {...settings}
                modules={[Navigation]}
                className="swiper-container"
              >
                {Array.from({ length: 12 }).map((_, index) => (
                  <SwiperSlide key={index}>
                    <Skeleton className="h-52 md:min-h-60 mb-2 md:max-h-80 portrait:min-h-10" />
                    <Skeleton className="h-4 w-36 mb-2" />
                    <div className="flex">
                      <Skeleton className="h-4 w-16 mr-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
          {!loading && animeListPopular && (
            <Swiper
              {...settings}
              modules={[Navigation]}
              className="swiper-container"
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
                      <div className="relative">
                        <div className="imgBadges flex absolute top-2 w-full px-2 z-10">
                          <div className="statusBadge hidden md:block">
                            {anime.status && (
                              <Badge
                                className="text-xs mr-0.5 md:mr-1 cursor-default"
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
                                className="text-xs mr-0.5 mt-0.5 md:mr-1 cursor-default"
                                variant="secondary"
                                key={0}
                              >
                                <Star className="h-4 w-4 mr-1" />
                                {anime.meanScore}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <img
                          className="max-h-52 md:min-h-60 md:max-h-80 portrait:min-h-10 rounded-lg"
                          src={anime.coverImage}
                          alt={anime.title}
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
                        {anime.title}
                      </h2>
                    </Link>
                    <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                      {anime.episodes === null
                        ? "X episodes"
                        : `${anime.episodes} episodes`}
                    </p>
                  </SwiperSlide>
                ))}
            </Swiper>
          )}
        </Swiper>
      </div>
      <div className="trailer lg:hidden">
        <div className="flex mt-3">
          <h3 className="font-semibold tracking-tight first:mt-0">Trailer </h3>
          <Clapperboard className="ml-2 mt-0.5 h-5 w-5" />
        </div>
        <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
          A selection of new trailer !
        </p>
        {loading && (
          <div>
            <Swiper
              {...settingsTrailer}
              modules={[Navigation]}
              className="swiper-container"
            >
              {Array.from({ length: 12 }).map((_, index) => (
                <SwiperSlide key={index}>
                  <Skeleton className="h-60 md:min-h-60 mb-2 md:max-h-80 portrait:min-h-10" />
                  <Skeleton className="h-4 w-36 mb-2" />
                  <div className="flex">
                    <Skeleton className="h-4 w-16 mr-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
        {!loading && animeListTrending && (
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
                          className=" md:min-h-60 md:max-h-80 portrait:min-h-10 rounded-lg"
                          src={anime.trailer.thumbnail}
                          alt={anime.title}
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
                          {anime.title} Trailer
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
                            href={`https://www.youtube.com/watch?v=${anime.trailer.id}`}
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
          A selection of new trailer !
        </p>
        {loading && (
          <div>
            <Swiper
              {...settings}
              modules={[Navigation]}
              className="swiper-container"
            >
              {Array.from({ length: 12 }).map((_, index) => (
                <SwiperSlide key={index}>
                  <Skeleton className="h-52 md:min-h-60 mb-2 md:max-h-80 portrait:min-h-10" />
                  <Skeleton className="h-4 w-36 mb-2" />
                  <div className="flex">
                    <Skeleton className="h-4 w-16 mr-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
        {!loading && animeListTrending && (
          <div className="flex">
            <div className="mainUpcoming">
              {[...animeListTrending]
                .slice(0, 24)
                .filter(
                  (anime) =>
                    anime.nextAiringEpisode !== null &&
                    anime.bannerImage !== null
                )
                .slice(0, 1)
                .map((anime, index) => (
                  <div key={index}>
                    <Link
                      className="flex pr-6"
                      to="/anime/$id"
                      params={{ id: anime.id }}
                    >
                      <img
                        className=" max-h-52 min-h-80 rounded-lg object-cover"
                        src={anime.bannerImage}
                        alt={anime.title}
                      />
                    </Link>
                  </div>
                ))}
            </div>
            <Swiper
              {...settingsUpcoming}
              modules={[Navigation]}
              className="swiper-container h-[315px]"
            >
              {[...animeListTrending]
                .slice(0, 30)
                .sort(() => Math.random() - 0.5)
                .filter(
                  (anime) =>
                    anime.nextAiringEpisode !== null &&
                    anime.nextAiringEpisode.episode !== undefined &&
                    anime.bannerImage !== null &&
                    anime.id !==
                      [...animeListTrending]
                        .slice(0, 30)
                        .filter(
                          (a) =>
                            a.nextAiringEpisode !== null &&
                            a.nextAiringEpisode.episode !== undefined &&
                            a.bannerImage !== null
                        )[0]?.id
                )
                .map((anime, index) => (
                  <SwiperSlide key={index}>
                    <Link
                      className="flex"
                      to="/anime/$id"
                      params={{ id: anime.id }}
                    >
                      <img
                        className="w-64 max-h-52 min-h-36 rounded-lg object-cover"
                        src={anime.bannerImage}
                        alt={anime.title}
                      />
                      <div className="block ml-3">
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
                          {anime.title}
                        </h2>
                        <div className="flex">
                          <p className="mb-3 mt-1 pr-5 text-xs md:text-sm">
                            {anime.nextAiringEpisode
                              ? `Episode  ${anime.nextAiringEpisode.episode}`
                              : anime.nextAiringEpisode === undefined
                                ? "episode this week"
                                : "X episodes"}
                          </p>
                          <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                            {anime.nextAiringEpisode
                              ? new Date(
                                  anime.nextAiringEpisode.airingAt * 1000
                                ).toString() === "Invalid Date"
                                ? ""
                                : new Date(
                                    anime.nextAiringEpisode.airingAt * 1000
                                  )
                                    .toLocaleString("en-US", {
                                      weekday: "short",
                                      hour: "numeric",
                                      minute: "numeric",
                                      hour12: true,
                                    })
                                    .replace(" ", ", ")
                              : ""}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
            </Swiper>
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
        <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
          Here is a selection of our current favourites
        </p>
        {loading && (
          <div>
            <Swiper
              {...settings}
              modules={[Navigation]}
              className="swiper-container"
            >
              {Array.from({ length: 12 }).map((_, index) => (
                <SwiperSlide key={index}>
                  <Skeleton className="h-52 md:min-h-60 mb-2 md:max-h-80 portrait:min-h-10" />
                  <Skeleton className="h-4 w-36 mb-2" />
                  <div className="flex">
                    <Skeleton className="h-4 w-16 mr-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
        {!loading && animeListTrending && (
          <Swiper
            {...settings}
            modules={[Navigation]}
            className="swiper-container"
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
                    <div className="relative">
                      <div className="imgBadges flex absolute top-2 w-full px-2 z-10">
                        <div className="statusBadge hidden md:block">
                          {anime.status && (
                            <Badge
                              className="text-xs mr-0.5 md:mr-1 cursor-default"
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
                              className="text-xs mr-0.5 mt-0.5 md:mr-1 cursor-default"
                              variant="secondary"
                              key={0}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              {anime.meanScore}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <img
                        className="max-h-52 md:min-h-60 md:max-h-80 portrait:min-h-10 rounded-lg"
                        src={anime.coverImage}
                        alt={anime.title}
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
                      {anime.title}
                    </h2>
                  </Link>
                  <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                    {anime.episodes === null
                      ? "X episodes"
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
        <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
          A selection just for you !
        </p>
        {loading && (
          <div>
            <Swiper
              {...settings}
              modules={[Navigation]}
              className="swiper-container"
            >
              {Array.from({ length: 12 }).map((_, index) => (
                <SwiperSlide key={index}>
                  <Skeleton className="h-52 md:min-h-60 mb-2 md:max-h-80 portrait:min-h-10" />
                  <Skeleton className="h-4 w-36 mb-2" />
                  <div className="flex">
                    <Skeleton className="h-4 w-16 mr-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
        {!loading && animeListPopular && (
          <Swiper
            {...settings}
            modules={[Navigation]}
            className="swiper-container"
          >
            {[...animeListPopular]
              .slice(13, 24)
              .sort(() => Math.random() - 0.5)
              .map((anime, index) => (
                <SwiperSlide key={index}>
                  <Link to="/anime/$id" params={{ id: anime.id }}>
                    <div className="relative">
                      <div className="imgBadges flex absolute top-2 w-full px-2 z-10">
                        <div className="statusBadge hidden md:block">
                          {anime.status && (
                            <Badge
                              className="text-xs mr-0.5 md:mr-1 cursor-default"
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
                              className="text-xs mr-0.5 mt-0.5 md:mr-1 cursor-default"
                              variant="secondary"
                              key={0}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              {anime.meanScore}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <img
                        className="max-h-52 md:min-h-60 md:max-h-80 portrait:min-h-10 rounded-lg"
                        src={anime.coverImage}
                        alt={anime.title}
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
                      {anime.title}
                    </h2>
                  </Link>
                  <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                    {anime.episodes === null
                      ? "X episodes"
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
