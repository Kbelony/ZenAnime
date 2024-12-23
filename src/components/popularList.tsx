/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";

export const popularList = () => {
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
  const [animeListPopular, setAnimeListPopular] = useState<Anime[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = async (pageNumber: number) => {
    try {
      setLoading(true);
      const response_popular = await fetch(
        `https://api.amvstr.me/api/v2/popular?p=${pageNumber}`
      );
      await new Promise((resolve) => setTimeout(resolve, 1800));
      const data_popular = await response_popular.json();
      console.log("Popular : ", data_popular);
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
          status: anime.status || "Unknown",
          genres: anime.genres.join(", "),
          meanScore: anime.meanScore ? anime.meanScore.toString() : null,
          id: anime.id,
          episodes: anime.episodes,
        })
      );
      setAnimeListPopular((prev) => [...prev, ...popularData]);
      setHasMore(popularData.length > 0);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop ===
      document.documentElement.offsetHeight
    ) {
      if (!loading && hasMore) {
        setPage((prev) => prev + 1);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  useEffect(() => {
    fetchData(page);
  }, [page]);

  return (
    <div className="popular_list px-8 mt-2 md:px-20 md:mt-2 w-full">
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
        </div>

        {loading && animeListPopular.length === 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, index) => (
              <div key={index}>
                <Skeleton className="h-52 md:min-h-60 mb-2 md:max-h-80 portrait:min-h-10" />
                <Skeleton className="h-4 w-36 mb-2" />
                <div className="flex">
                  <Skeleton className="h-4 w-16 mr-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {animeListPopular.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {animeListPopular.map((anime, index) => (
              <div key={index}>
                <Link to="/anime/$id" params={{ id: anime.id }}>
                  <div className="relative">
                    <div className="imgBadges flex absolute top-2 w-full px-2 z-10">
                      {/* <div className="statusBadge hidden md:block">
                        {anime.status && (
                          <Badge className="text-xs mr-0.5 md:mr-1 cursor-default">
                            {anime.status}
                          </Badge>
                        )}
                      </div> */}
                      <div className="meanScoreBadge lg:ml-auto">
                        {anime.meanScore && (
                          <Badge className="text-xs mr-0.5 md:mr-1 cursor-default">
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
              </div>
            ))}
          </div>
        )}

        {loading && hasMore && animeListPopular.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={`skeleton-${index}`}>
                <Skeleton className="h-52 md:min-h-60 mb-2 md:max-h-80 portrait:min-h-10" />
                <Skeleton className="h-4 w-36 mb-2" />
                <div className="flex">
                  <Skeleton className="h-4 w-16 mr-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default popularList;
