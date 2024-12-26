import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import axios from "axios";

interface AnimeResult {
  id: string;
  title: {
    english: string;
    native: string;
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
        setResults(response.data.results || []);
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
    <div className="search-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Rechercher un anime..."
          className="search-input"
        />
      </div>

      {isOpen && searchTerm && (
        <div className="search-dropdown">
          {isLoading ? (
            <div className="loading">Chargement...</div>
          ) : results.length > 0 ? (
            <ul className="search-results">
              {results.map((anime) => (
                <li key={anime.id}>
                  <Link
                    to={`/anime/$id`}
                    params={{ id: anime.id }}
                    onClick={() => setIsOpen(false)}
                  >
                    <img src={anime.image} alt={anime.title.english} />
                    <span>{anime.title.english}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-results">Aucun résultat trouvé</div>
          )}
        </div>
      )}
    </div>
  );
}
