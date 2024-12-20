import { useEffect, useState } from "react";
import { TrendingUp, Gem, Star, Wand } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Link } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";

const CarouselList = () => {
  interface Anime {
    episodes: string;
    coverImage: string;
    title: string;
    status: string;
    genres: string;
    trailer: {
      thumbnail: string;
      id: string;
    };
    id: string;
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
          title: { english: string };
          status: string;
          genres: string[];
          // meanScore: number;
          episodes: number;
          id: string;
          animeId: number;
        }) => ({
          coverImage: anime.coverImage.extraLarge,
          title: anime.title.english,
          status: anime.status,
          genres: anime.genres.join(", "),
          // meanScore: anime.meanScore.toString(),
          id: anime.id,
          episodes: anime.episodes,
          trailer: {
            thumbnail: anime.trailer?.thumbnail,
            id: anime.trailer?.id,
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
          // meanScore: number;
          episodes: number;
          id: string;
          animeId: number;
        }) => ({
          coverImage: anime.coverImage.extraLarge,
          title: anime.title.english,
          status: anime.status,
          genres: anime.genres.join(", "),
          // meanScore: anime.meanScore.toString(),
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

  return (
    <div className="carousel_list px-8 mt-7 md:px-20 md:mt-10 w-full ">
      <div className="flex">
        <h3 className="font-semibold tracking-tight first:mt-0">Popular</h3>
        <Star className="ml-2 mt-0.5 h-5 w-5" />
      </div>
      <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
        A selection of the most popular anime of all time !
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
                    <img
                      className=" max-h-52 md:min-h-60 md:max-h-80 portrait:min-h-10 rounded-lg"
                      src={anime.coverImage}
                      alt={anime.title}
                    />
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
                  {/* {anime.genres
                    .split(",")
                    .slice(0, 2)
                    .map((genre, index) => (
                      <Badge
                        className="text-xs mr-0.5 md:mr-1 cursor-default"
                        variant="secondary"
                        key={index}
                      >
                        {genre}
                      </Badge>
                    ))} */}
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
      <div className="flex mt-2 md:mt-8">
        <h3 className="font-semibold tracking-tight first:mt-0">Trending</h3>
        <TrendingUp className="ml-2 mt-0.5 h-5 w-5" />
      </div>
      <p className="mb-3 text-xs md:text-sm text-slate-600 dark:text-slate-400">
        A selection of the most trending anime of the moment
      </p>

      <Swiper {...settings} modules={[Navigation]} className="swiper-container">
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
        {!loading && animeListPopular && (
          <Swiper
            {...settings}
            modules={[Navigation]}
            className="swiper-container"
          >
            {animeListTrending.slice(0, 12).map((anime, index) => (
              <SwiperSlide key={index}>
                <Link to="/anime/$id" params={{ id: anime.id }}>
                  <img
                    className=" max-h-52 md:min-h-60 md:max-h-80 portrait:min-h-10 rounded-lg"
                    src={anime.coverImage}
                    alt={anime.title}
                  />
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
                {/* {anime.genres
                  .split(",")
                  .slice(0, 2)
                  .map((genre, index) => (
                    <Badge
                      className="text-xs mr-0.5 md:mr-1 cursor-default"
                      variant="secondary"
                      key={index}
                    >
                      {genre}
                    </Badge>
                  ))} */}
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
          {animeListTrending.slice(13, 24).map((anime, index) => (
            <SwiperSlide key={index}>
              <Link to="/anime/$id" params={{ id: anime.id }}>
                <img
                  className=" max-h-52 md:min-h-60 md:max-h-80 portrait:min-h-10 rounded-lg"
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
              </Link>
              {/* {anime.genres
                  .split(",")
                  .slice(0, 2)
                  .map((genre, index) => (
                    <Badge
                      className="text-xs mr-0.5 md:mr-1 cursor-default"
                      variant="secondary"
                      key={index}
                    >
                      {genre}
                    </Badge>
                  ))} */}
              <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                {anime.episodes === null
                  ? "X episodes"
                  : `${anime.episodes} episodes`}
              </p>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
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
          {animeListPopular.slice(13, 24).map((anime, index) => (
            <SwiperSlide key={index}>
              <Link to="/anime/$id" params={{ id: anime.id }}>
                <img
                  className=" max-h-52 md:min-h-60 md:max-h-80 portrait:min-h-10 rounded-lg"
                  src={anime.trailer?.thumbnail || anime.coverImage}
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
              </Link>
              {/* {anime.genres
                  .split(",")
                  .slice(0, 2)
                  .map((genre, index) => (
                    <Badge
                      className="text-xs mr-0.5 md:mr-1 cursor-default"
                      variant="secondary"
                      key={index}
                    >
                      {genre}
                    </Badge>
                  ))} */}
              <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                {anime.episodes === null
                  ? "X episodes"
                  : `${anime.episodes} episodes`}
              </p>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      <div className="lg:hidden">
        <div className="flex mt-3">
          <h3 className="font-semibold tracking-tight first:mt-0">Trailer </h3>
          <Wand className="ml-2 mt-0.5 h-5 w-5" />
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
        {!loading && animeListPopular && (
          <Swiper
            {...settings}
            modules={[Navigation]}
            className="swiper-container"
          >
            {[...animeListTrending]
              .slice(13, 24)
              .sort(() => Math.random() - 0.5)
              .map((anime, index) => (
                <SwiperSlide key={index}>
                  <a
                    href={`https://www.youtube.com/watch?v=${anime.trailer.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      className=" max-h-52 md:min-h-60 md:max-h-80 portrait:min-h-10 rounded-lg"
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
                      {anime.title}
                    </h2>
                  </a>
                  {/* {anime.genres
                  .split(",")
                  .slice(0, 2)
                  .map((genre, index) => (
                    <Badge
                      className="text-xs mr-0.5 md:mr-1 cursor-default"
                      variant="secondary"
                      key={index}
                    >
                      {genre}
                    </Badge>
                  ))} */}
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
