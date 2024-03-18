import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Gem, Star, Wand } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const carouselList = () => {
  interface Anime {
    coverImage: string;
    title: string;
    status: string;
    genres: string;
    meanScore: number;
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [animeListTrending, setAnimeListTrending] = useState<Anime[]>([]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [animeListPopular, setAnimeListPopular] = useState<Anime[]>([]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const fetchData = async () => {
      const response_trending = await fetch(
        "https://api-amvstrm.nyt92.eu.org/api/v2/trending?limit=24"
      );
      const response_popular = await fetch(
        "https://api-amvstrm.nyt92.eu.org/api/v2/popular?limit=24"
      );
      const data_trending = await response_trending.json();
      const data_popular = await response_popular.json();
      console.log(data_popular);
      const trendingData = data_trending.results.map(
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
      const popularData = data_popular.results.map(
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
      setAnimeListTrending(trendingData);
      setAnimeListPopular(popularData);
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

  return (
    <div className="carousel_list px-8 mt-7 md:px-20 md:mt-10">
      <div className="flex">
        <h3 className="font-semibold tracking-tight first:mt-0">Popular</h3>
        <Star className="ml-1 h-6 w-6" />
      </div>
      <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
        A selection of the most popular anime of all time !
      </p>
      <Swiper {...settings} modules={[Navigation]} className="swiper-container">
        <div className="flex mt-2 md:mt-8">
          <h3 className="font-semibold tracking-tight first:mt-0">Trending</h3>
          <TrendingUp className="ml-1 h-6 w-6" />
        </div>
        <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
          A selection of the most trending anime of the moment
        </p>
        {animeListPopular.slice(0, 12).map((anime, index) => (
          <SwiperSlide key={index}>
            <img
              className=" max-h-52 md:min-h-60 md:max-h-80"
              src={anime.coverImage}
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
              {anime.title}
            </h2>
            {/* <p>Status: {anime.status}</p> */}
            {anime.genres
              .split(",")
              .slice(0, 2)
              .map((genre, index) => (
                <Badge
                  className="text-xs mr-0.5 md:mr-1"
                  variant="secondary"
                  key={index}
                >
                  {genre}
                </Badge>
              ))}
            {/* <p>{anime.meanScore}% of people recommend this content</p> */}
          </SwiperSlide>
        ))}
      </Swiper>

      <Swiper {...settings} modules={[Navigation]} className="swiper-container">
        <div className="flex mt-2 md:mt-8">
          <h3 className="font-semibold tracking-tight first:mt-0">
            Our selection
          </h3>
          <Gem className="ml-1 h-6 w-6" />
        </div>
        <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
          Here is a selection of our current favourites
        </p>
        {animeListTrending.slice(0, 12).map((anime, index) => (
          <SwiperSlide key={index}>
            <img
              className=" max-h-52 md:min-h-60 md:max-h-80"
              src={anime.coverImage}
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
              {anime.title}
            </h2>
            {/* <p>Status: {anime.status}</p> */}
            {anime.genres
              .split(",")
              .slice(0, 2)
              .map((genre, index) => (
                <Badge
                  className="text-xs mr-0.5 md:mr-1"
                  variant="secondary"
                  key={index}
                >
                  {genre}
                </Badge>
              ))}
            {/* <p>{anime.meanScore}% of people recommend this content</p> */}
          </SwiperSlide>
        ))}
      </Swiper>
      <Swiper {...settings} modules={[Navigation]} className="swiper-container">
        {animeListTrending.slice(12, 24).map((anime, index) => (
          <SwiperSlide key={index}>
            <img
              className=" max-h-52 md:min-h-60 md:max-h-80"
              src={anime.coverImage}
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
              {anime.title}
            </h2>
            {/* <p>Status: {anime.status}</p> */}
            {anime.genres
              .split(",")
              .slice(0, 2)
              .map((genre, index) => (
                <Badge
                  className="text-xs mr-0.5 md:mr-1"
                  variant="secondary"
                  key={index}
                >
                  {genre}
                </Badge>
              ))}
            {/* <p>{anime.meanScore}% of people recommend this content</p> */}
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="flex mt-3">
        <h3 className="font-semibold tracking-tight first:mt-0">For you </h3>
        <Wand className="ml-1 h-6 w-6" />
      </div>
      <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
        A selection just for you !
      </p>
      <Swiper {...settings} modules={[Navigation]} className="swiper-container">
        {animeListPopular.slice(13, 24).map((anime, index) => (
          <SwiperSlide key={index}>
            <img
              className=" max-h-52 md:min-h-60 md:max-h-80"
              src={anime.coverImage}
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
              {anime.title}
            </h2>
            {/* <p>Status: {anime.status}</p> */}
            {anime.genres
              .split(",")
              .slice(0, 2)
              .map((genre, index) => (
                <Badge
                  className="text-xs mr-0.5 md:mr-1"
                  variant="secondary"
                  key={index}
                >
                  {genre}
                </Badge>
              ))}
            {/* <p>{anime.meanScore}% of people recommend this content</p> */}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default carouselList;
