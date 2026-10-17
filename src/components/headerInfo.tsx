/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import HeaderInfoSkeleton from "./headerInfoSkeleton";
import { Badge } from "@/components/ui/badge";
import { Star, StarHalf, Magnet } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { fetchAnimeInfo, getMediaTitle } from "@/lib/anilist";

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
  interface RelationAnime {
    id: string;
    type: string;
    format: string;
    status: string;
    averageScore: number;
    coverImage: {
      large: string;
      color: string;
    };
    title: {
      english: string;
      romaji: string;
    };
    episodes: number;
  }

  interface Anime {
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
    } | null;
    id: number;
    season: string;
    episodes: number;
    description: string;
    relation?: RelationAnime[];
  }

  const [animeInfo, setAnimeInfo] = useState<Anime | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const swiperRelationsRef = useRef<any>(null);

  const updateWatchHistory = useCallback((animeId: string) => {
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
    localStorage.setItem(
      "watchedAnimes",
      JSON.stringify(existingAnimes.slice(0, 20))
    );
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout>;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const animeId = window.location.pathname.split("/")[2];
        const cacheKey = `anilist_anime_${animeId}`;
        const cachedData = sessionStorage.getItem(cacheKey);

        if (cachedData) {
          const animeData = JSON.parse(cachedData);
          setAnimeInfo(animeData);
          updateWatchHistory(animeId);
          setLoading(false);
          return;
        }

        timeoutId = setTimeout(() => {
          controller.abort();
          setError("Le serveur met trop de temps à répondre");
          setLoading(false);
        }, 20000);

        const media = await fetchAnimeInfo(animeId, controller.signal);

        const animeData: Anime = {
          id: media.id,
          coverImage: {
            large: media.coverImage?.large || media.coverImage?.extraLarge || "",
            medium: media.coverImage?.medium || "",
            color: media.coverImage?.color || "#900000",
          },
          bannerImage: media.bannerImage || "",
          title: {
            english: getMediaTitle(media.title),
            romaji: media.title?.romaji || "",
          },
          status: media.status || "Unknown",
          genres: media.genres || [],
          score: {
            averageScore: media.averageScore || 0,
            decimalScore: media.averageScore ? media.averageScore / 10 : 0,
          },
          startIn: {
            year: media.startDate?.year || media.seasonYear || 0,
          },
          nextair: media.nextAiringEpisode
            ? { episode: String(media.nextAiringEpisode.episode) }
            : null,
          season: media.season || "",
          episodes: media.episodes || 0,
          description: media.description || "",
          relation:
            media.relations?.edges
              ?.map((edge) => {
                const node = edge?.node;
                if (!node) return null;
                return {
                  id: String(node.id),
                  type: node.type || "ANIME",
                  format: node.format || "",
                  status: node.status || "",
                  averageScore: node.averageScore || 0,
                  episodes: node.episodes || 0,
                  coverImage: {
                    large: node.coverImage?.large || "",
                    color: node.coverImage?.color || "#900000",
                  },
                  title: {
                    english: node.title?.english || node.title?.romaji || "",
                    romaji: node.title?.romaji || "",
                  },
                };
              })
              .filter(Boolean) as RelationAnime[],
        };

        setAnimeInfo(animeData);
        updateWatchHistory(animeId);
        sessionStorage.setItem(cacheKey, JSON.stringify(animeData));
        setLoading(false);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("Error fetching data:", err);
        setError("Une erreur est survenue lors du chargement");
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
  }, [updateWatchHistory]);

  if (loading || !animeInfo || Object.keys(animeInfo).length === 0) {
    return <HeaderInfoSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] px-5">
        <p className="text-lg text-slate-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="header_mobile md:hidden">
        {animeInfo?.bannerImage ? (
          <img
            className="object-cover mobile_img"
            src={animeInfo.bannerImage}
            alt=""
            onContextMenu={(e) => e.preventDefault()}
            draggable="false"
          />
        ) : (
          <div
            className="mobile_img"
            style={{
              backgroundColor: animeInfo?.coverImage?.color || "#900000",
            }}
          />
        )}
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
        {animeInfo?.bannerImage ? (
          <img
            className="object-cover blur_img"
            src={animeInfo.bannerImage}
            alt=""
          />
        ) : (
          <div
            className="blur_img"
            style={{
              backgroundColor: animeInfo?.coverImage?.color || "#900000",
            }}
          />
        )}

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
                    / {animeInfo?.episodes || "?"}
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

      {/* Mobile description */}
      <div className="md:hidden px-5 mt-4 mb-6">
        <div className="flex items-center justify-center mb-3">
          <StarRating rating={animeInfo?.score.decimalScore || 0} />
        </div>
        <p
          className="text-sm overflow-hidden text-slate-600 dark:text-slate-300"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 8,
            WebkitBoxOrient: "vertical",
          }}
          dangerouslySetInnerHTML={{
            __html: animeInfo?.description || "",
          }}
        ></p>
      </div>

      {animeInfo?.relation && animeInfo.relation.length > 0 && (
        <div className="relations px-5 mb-5 md:px-8 md:mt-8">
          <Accordion type="single" collapsible defaultValue="related-anime">
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
                    .map((anime) => (
                      <SwiperSlide key={anime.id}>
                        <div
                          onClick={() => {
                            const currentPath = window.location.pathname;
                            const newPath = `/anime/${anime.id}`;

                            if (currentPath !== newPath) {
                              Object.keys(sessionStorage).forEach((key) => {
                                if (key.startsWith("anilist_anime_")) {
                                  sessionStorage.removeItem(key);
                                }
                              });
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
                                {anime.averageScore ? (
                                  <Badge
                                    className="text-xs mr-0.5 mt-0.5 md:mr-1 cursor-default h-6 flex items-center"
                                    variant="secondary"
                                  >
                                    <Star className="h-4 w-4 mr-1" />
                                    {(anime.averageScore / 20).toFixed(1)}
                                  </Badge>
                                ) : null}
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
