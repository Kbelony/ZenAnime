import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import DOMPurify from "dompurify";
import { fetchSearch, getMediaTitle } from "@/lib/anilist";

interface AnimeResult {
  id: string;
  title: {
    english: string;
    romaji?: string;
  };
  coverImage: {
    large: string;
  };
}

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<AnimeResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchCache = useRef<Record<string, AnimeResult[]>>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  const sanitizeInput = (input: string): string => {
    const sanitized = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
    return sanitized.replace(/[^a-zA-Z0-9\s-]/g, "").trim();
  };

  const isValidSearchTerm = (term: string): boolean => {
    return term.length >= 2 && term.length <= 50;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchAnime = async () => {
      const cleanedSearchTerm = sanitizeInput(searchTerm);

      if (!isValidSearchTerm(cleanedSearchTerm)) {
        setResults([]);
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const cacheKey = cleanedSearchTerm.toLowerCase();
      if (searchCache.current[cacheKey]) {
        setResults(searchCache.current[cacheKey]);
        return;
      }

      setIsLoading(true);
      abortControllerRef.current = new AbortController();

      try {
        const data = await fetchSearch(
          cleanedSearchTerm,
          10,
          abortControllerRef.current.signal
        );

        const filteredResults: AnimeResult[] = data.results
          .map((anime) => ({
            id: String(anime.id),
            title: {
              english: getMediaTitle(anime.title),
              romaji: anime.title?.romaji || undefined,
            },
            coverImage: {
              large: anime.coverImage?.large || anime.coverImage?.extraLarge || "",
            },
          }))
          .filter((anime) => anime.title.english && anime.coverImage.large)
          .slice(0, 10);

        setResults(filteredResults);
        searchCache.current[cacheKey] = filteredResults;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        console.error("Error during search:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimeout = setTimeout(searchAnime, 500);
    return () => {
      clearTimeout(debounceTimeout);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchTerm]);

  return (
    <div className="search-container w-72 md:w-96" ref={searchRef}>
      <div className="search-input-wrapper relative">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= 50) {
              setSearchTerm(value);
              setIsOpen(true);
            }
          }}
          onKeyDown={(e) => {
            if (
              e.key === "<" ||
              e.key === ">" ||
              e.key === "{" ||
              e.key === "}"
            ) {
              e.preventDefault();
            }
          }}
          placeholder="Search an anime..."
          className="search-input pr-8 text-base"
          style={{ fontSize: "14px" }}
          maxLength={50}
          aria-label="Search anime"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="reset-button absolute right-2 top-1/2 transform -translate-y-1/2"
            aria-label="Clear search"
          >
            &times;
          </button>
        )}
      </div>

      {isOpen && searchTerm && (
        <div className="search-dropdown absolute w-full mt-1 bg-white dark:bg-black rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 z-50">
          {isLoading ? (
            <div className="loading p-4 text-center text-slate-500 dark:text-slate-400">
              Loading...
            </div>
          ) : results.length > 0 ? (
            <ul className="search-results max-h-96 overflow-y-auto">
              {results.map((anime) => (
                <li
                  key={anime.id}
                  className="hover:bg-slate-100 dark:hover:bg-slate-900 group"
                >
                  <Link
                    to={`/anime/$id`}
                    params={{ id: anime.id }}
                    onClick={() => {
                      setIsOpen(false);
                      if (location.pathname.startsWith("/anime/")) {
                        window.location.href = `/anime/${anime.id}`;
                      }
                    }}
                    className="flex items-center p-2 gap-3"
                  >
                    <img
                      src={anime.coverImage.large}
                      alt={anime.title.english}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <h2
                      className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:dark:text-slate-900"
                      style={{
                        whiteSpace: "pre-wrap",
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {anime.title.english}
                    </h2>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-results p-4 text-center text-slate-500 dark:text-slate-400">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
