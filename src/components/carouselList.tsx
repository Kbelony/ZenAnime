import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import "swiper/css";

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
      console.log(data);
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
  const settings = {
    centeredSlides: false,
    spaceBetween: 30,
    loop: false,
    navigation: true,
    breakpoints: {
      800: {
        slidesPerView: 4,
      },
      600: {
        slidesPerView: 3,
      },
      299: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
    },
  };
  return (
    <div className="carousel_list px-8 mt-12 md:px-20 md:mt-20">
      <Swiper {...settings} modules={[Navigation]} className="swiper-container">
        {animeList.map((anime, index) => (
          <SwiperSlide key={index}>
            <img src={anime.coverImage} alt={anime.title} />
            <h2>{anime.title}</h2>
            <p>Status: {anime.status}</p>
            <p>Genres: {anime.genres}</p>
            <p>Mean Score: {anime.meanScore}</p>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default carouselList;
