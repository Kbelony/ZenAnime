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
  const [ImageLargeInfo, setImageLargeInfo] = useState();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `https://api-amvstrm.nyt92.eu.org/api/v2/info/${window.location.pathname.split("/")[2]}`
      );
      const data = await response.json();
      console.log(data);
      setAnimeInfo(data);
      setImageLargeInfo(data.coverImage.large);
    };

    fetchData();
  }, []);
  return (
    <div>
      <div className="big_img">
        <img
          className=" object-cover blur_img"
          src={animeInfo.bannerImage}
          alt=""
        />
        <div className="absolute top-72 left-1/2 transform -translate-x-1/2 md:left-36 md:top-72 -translate-y-1/2">
          <img className="md:w-auto max-w-7xl" src={ImageLargeInfo} alt="" />
        </div>
      </div>
      <p>{animeInfo.status}</p>
    </div>
  );
};

export default headerInfo;
