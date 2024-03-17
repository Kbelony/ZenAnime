import { useEffect } from "react";

const carouselList = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const fetchData = async () => {
      const trendingResponse = await fetch(
        "https://api-amvstrm.nyt92.eu.org/api/v2/trending?limit=30"
      );
      const trendingData = await trendingResponse.json();
      console.log("Trending Data:", trendingData);

      const popularResponse = await fetch(
        "https://api-amvstrm.nyt92.eu.org/api/v2/popular?limit=30"
      );
      const popularData = await popularResponse.json();
      console.log("Popular Data:", popularData);
    };

    fetchData();
  }, []);
  return <div>carouselList</div>;
};

export default carouselList;
