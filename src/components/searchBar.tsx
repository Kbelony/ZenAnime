import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import axios from "axios";
import { Input } from "@/components/ui/input";

interface AnimeResult {
  id: string;
  title: {
    english: string;
    native: string;
  };
  coverImage: {
    large: string;
  };
  image: string;
}

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<AnimeResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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
      if (searchTerm.trim() === "") {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(
          `https://api.amvstr.me/api/v2/search?q=${encodeURIComponent(searchTerm)}`
        );
        const filteredResults = response.data.results.filter(
          (anime: AnimeResult) => anime.title.english
        );
        setResults(filteredResults);
        console.log(response.data.results);
      } catch (error) {
        console.error("Erreur lors de la recherche:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimeout = setTimeout(searchAnime, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  return (
    <div className="search-container w-72 md:w-96" ref={searchRef}>
      <div className="search-input-wrapper relative">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Rechercher un anime..."
          className="search-input pr-8 text-base"
          style={{ fontSize: "14px" }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="reset-button absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            &times;
          </button>
        )}
      </div>

      {isOpen && searchTerm && (
        <div className="search-dropdown absolute w-full mt-1 bg-white dark:bg-black rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 z-50">
          {isLoading ? (
            <div className="loading p-4 text-center text-slate-500 dark:text-slate-400">
              Chargement...
            </div>
          ) : results.length > 0 ? (
            <ul className="search-results max-h-96 overflow-y-auto">
              {results.map((anime) => (
                <li
                  key={anime.id}
                  className="hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  <Link
                    to={`/anime/$id`}
                    params={{ id: anime.id }}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center p-2 gap-3"
                  >
                    <img
                      src={anime.coverImage.large}
                      alt={anime.title.english}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <h2
                      className="text-sm font-bold text-slate-900 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-900"
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
              Aucun résultat trouvé
            </div>
          )}
        </div>
      )}
    </div>
  );
}
