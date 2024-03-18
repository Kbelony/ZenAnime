import React, { useEffect, useState } from "react";

const headerInfo = () => {
  interface Anime {
    coverImage: {
      large: string;
      medium: string;
      color: string;
    };
    title: string;
    status: string;
    genres: string;
    meanScore: number;
    id: number;
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [animeInfo, setAnimeInfo] = useState<Anime[]>([]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `https://api-amvstrm.nyt92.eu.org/api/v2/info/${window.location.pathname.split("/")[2]}`
      );
      const data = await response.json();
      console.log(data);
      setAnimeInfo(data);
    };

    fetchData();
  }, []);
  return (
    <div>
      <div className="big_img">
        <img
          className="blur-sm h-96 object-cover"
          src={animeInfo.bannerImage}
          alt=""
        />
      </div>
      <p>{animeInfo.status}</p>
    </div>
  );
};

export default headerInfo;
