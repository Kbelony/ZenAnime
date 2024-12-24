/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

const episodeList = () => {
  interface Anime {
    number: string;
    season: string;
    title: string;
    status: string;
    meanScore: number;
    trailer: {
      thumbnail: string;
      id: string;
    };
    id: string;
    image: string;
  }
  const [loading, setLoading] = useState(false);
  const [episodeList, setEpisodeList] = useState<Anime[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.amvstr.me/api/v2/episodes/${window.location.pathname.split("/")[2]}`
      );
      await new Promise((resolve) => setTimeout(resolve, 1800));
      const data = await response.json();
      console.log("Data : ", data);
      const episodeData = data.results.map(
        (anime: {
          title: string;
          image: string;
          status: string;
          season: string;
          meanScore: number;
          number: number;
          id: string;
          animeId: number;
        }) => ({
          title: anime.title,
          image: anime.image,
          status: anime.status,
          season: anime.season,
          meanScore: anime.meanScore,
          id: anime.id,
          number: anime.number,
        })
      );

      setEpisodeList(episodeData);
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
        slidesPerView: 4,
        spaceBetween: 15,
      },
      1000: {
        slidesPerView: 3,
        spaceBetween: 20,
      },
      800: {
        slidesPerView: 4,
        spaceBetween: 25,
      },
    },
  };
  return (
    <div className="episode_list px-8 mt-2 md:px-20 md:mt-2 w-full">
      <div className="episode_mobile md:hidden">
        <div className="flex justify-between items-start"></div>

        {loading && episodeList.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
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

        {episodeList.length > 0 && (
          <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-5 portrait:landscape:grid-cols-4 portrait:grid-cols-1 gap-4">
            {episodeList.map((anime, index) => (
              <div key={index}>
                <div>
                  <div className="relative">
                    <img
                      className="max-h-40 md:min-h-60 md:max-h-80 portrait:min-h-10 rounded-lg"
                      src={anime.image}
                      alt={anime.title}
                    />
                  </div>
                  <h2
                    className="scroll-m-20 mt-2 text-sm font-extrabold tracking-tight lg:text-base"
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
                </div>
                <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                  {anime.number === null
                    ? "X number"
                    : `Episode ${anime.number} `}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="episode_desktop hidden md:block">
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
          {!loading && episodeList && (
            <Swiper
              {...settings}
              modules={[Navigation]}
              className="swiper-container"
            >
              {episodeList.map((anime, index) => (
                <SwiperSlide key={index}>
                  <div>
                    <div className="relative">
                      <div className="imgBadges flex absolute top-2 w-full px-2 z-10">
                        <div className="statusBadge hidden md:block"></div>
                      </div>
                      <img
                        className="md:min-h-40 rounded-lg"
                        src={anime.image}
                        alt={anime.title}
                      />
                    </div>
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
                    <p className="mb-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                      {anime.number === null
                        ? "X number"
                        : `Episode ${anime.number} `}
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </Swiper>
      </div>
    </div>
  );
};

export default episodeList;
