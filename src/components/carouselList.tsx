import { useEffect, useState } from "react";

const carouselList = () => {
  interface Anime {
    coverImage: string;
    title: string;
    status: string;
    genres: string;
    meanScore: number;
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [animeList, setAnimeList] = useState<Anime[]>([]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        "https://api-amvstrm.nyt92.eu.org/api/v2/trending?limit=30"
      );
      const data = await response.json();
      const extractedData = data.results
        .slice(0, 12)
        .map(
          (anime: {
            coverImage: string;
            title: { english: string };
            status: string;
            genres: string[];
            meanScore: number;
          }) => ({
            coverImage: anime.coverImage.extraLarge,
            title: anime.title.english,
            status: anime.status,
            genres: anime.genres.join(", "),
            meanScore: anime.meanScore,
          })
        );
      setAnimeList(extractedData);
    };

    fetchData();
  }, []);
  return (
    <div className="carousel_list px-8 mt-12 md:px-20 md:mt-20">
      <ul>
        {animeList.map((anime, index) => (
          <li key={index}>
            <img src={anime.coverImage} alt={anime.title} />
            <div>
              <h2>{anime.title}</h2>
              <p>Status: {anime.status}</p>
              <p>Genres: {anime.genres}</p>
              <p>Mean Score: {anime.meanScore}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default carouselList;
