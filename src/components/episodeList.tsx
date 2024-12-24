import React, { useEffect, useState } from "react";

const episodeList = () => {
  interface Anime {
    nextAiringEpisode: {
      airingAt: number;
      episode: number;
    } | null;
    episodes: string;
    season: string;
    title: string;
    status: string;
    meanScore: number;
    trailer: {
      thumbnail: string;
      id: string;
    };
    id: string;
    bannerImage: string;
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
          trailer: {
            thumbnail: string;
            id: string;
          };
          nextAiringEpisode: {
            airingAt: number;
            episode: number;
          };
          title: { english: string };
          bannerImage: string;
          status: string;
          season: string;
          meanScore: number;
          episodes: number;
          id: string;
          animeId: number;
        }) => ({
          title: anime.title.english,
          bannerImage: anime.bannerImage,
          status: anime.status,
          season: anime.season,
          meanScore: anime.meanScore,
          id: anime.id,
          episodes: anime.episodes,
          trailer: {
            thumbnail: anime.trailer?.thumbnail,
            id: anime.trailer?.id,
          },
          nextAiringEpisode: {
            airingAt: anime.nextAiringEpisode?.airingAt,
            episode: anime.nextAiringEpisode?.episode,
          },
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
        slidesPerView: 4,
      },
      299: {
        slidesPerView: 2,
        spaceBetween: 10,
      },
    },
  };
  return <div>episodeList</div>;
};

export default episodeList;
