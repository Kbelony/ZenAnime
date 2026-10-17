/* eslint-disable react-hooks/exhaustive-deps */
import { Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import { fetchPopular, toListAnime } from "@/lib/anilist";

export const popularList = () => {
  interface Anime {
    episodes: number | null;
    coverImage: string;
    title: string;
    meanScore: number;
    id: string;
  }
  const [loading, setLoading] = useState(false);
  const [animeListPopular, setAnimeListPopular] = useState<Anime[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(250);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await fetchPopular(currentPage, 24);
      setAnimeListPopular(data.results.map(toListAnime));
      setTotalPages(Math.max(1, data.pageInfo.lastPage || 1));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 portrait:landscape:grid-cols-3 portrait:lg:grid-cols-4 portrait:md:grid-cols-3 portrait:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 portrait:landscape:grid-cols-3 portrait:lg:grid-cols-4 portrait:md:grid-cols-3 portrait:grid-cols-2 gap-4">
            {animeListPopular
              .filter((anime) => anime.title !== null)
              .map((anime) => (
                <div key={anime.id}>
                  <Link to="/anime/$id" params={{ id: anime.id }}>
                    <div className="relative">
                      <div className="imgBadges flex absolute top-2 w-full px-2 z-10">
                        <div className="meanScoreBadge md:ml-auto lg:ml-1">
                          {anime.meanScore ? (
                            <Badge className="text-xs mr-0.5 md:mr-1 cursor-default">
                              <Star className="h-4 w-4 mr-1" />
                              {(anime.meanScore / 20).toFixed(1)}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                      <img
                        className="w-[148.797px] h-[208px] md:w-[204px] md:h-[260.398px] rounded-lg transition-transform duration-300 group-hover:scale-110 object-cover"
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
                      : anime.episodes === 1
                        ? `Movie`
                        : `${anime.episodes} episodes`}
                  </p>
                </div>
              ))}
          </div>
        )}

        {animeListPopular.length > 0 && (
          <div className="flex justify-center items-center gap-1 mt-8 mb-4">
            <div className="flex items-center bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => handlePageChange(1)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  currentPage === 1
                    ? "bg-blue-500 text-white"
                    : "text-white hover:bg-slate-700"
                }`}
              >
                1
              </button>

              {currentPage > 3 && <span className="text-white px-2">|</span>}

              {[...Array(3)].map((_, index) => {
                const pageNumber = currentPage - 1 + index;
                if (pageNumber > 1 && pageNumber < totalPages) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        currentPage === pageNumber
                          ? "bg-blue-500 text-white"
                          : "text-white hover:bg-slate-700"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                return null;
              })}

              {currentPage < totalPages - 2 && (
                <span className="text-white px-2">|</span>
              )}

              <button
                onClick={() => handlePageChange(totalPages)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  currentPage === totalPages
                    ? "bg-blue-500 text-white"
                    : "text-white hover:bg-slate-700"
                }`}
              >
                {totalPages}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default popularList;
