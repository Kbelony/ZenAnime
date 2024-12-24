/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dot } from "lucide-react";
import { ChevronDown, Star } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const headerInfo = () => {
  interface Anime {
    coverImage: {
      large: string;
      medium: string;
      color: string;
    };
    bannerImage: string;
    title: string;
    status: string;
    genres: string[];
    // meanScore: number;
    id: number;
    season: string;
    episodes: number;
    description: string;
    year: number;
    score: {
      decimalScore: number;
    };
  }
  const [isOpen, setIsOpen] = useState(false);
  const [animeInfo, setAnimeInfo] = useState<Anime | null>(null);

  const fetchData = async () => {
    const response = await fetch(
      `https://api.amvstr.me/api/v2/info/${window.location.pathname.split("/")[2]}`
    );
    const data = await response.json();
    console.log(data);
    const animeData = data?.results?.map(
      (anime: {
        coverImage: {
          large: string;
        };
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
        genres: string[];
        meanScore: number;
        episodes: number;
        id: string;
        animeId: number;
        year: number;
        score: {
          decimalScore: number;
        };
      }) => ({
        coverImage: anime.coverImage.large,
        title: anime.title.english,
        bannerImage: anime.bannerImage,
        status: anime.status,
        season: anime.season,
        year: anime.year,
        averageScore: anime.score.decimalScore,
        genres: anime.genres.join(", "),
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
    setAnimeInfo(animeData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <div className="header_mobile md:hidden">
        <img
          className="object-cover blur_img"
          src={animeInfo?.bannerImage}
          alt=""
        />
        <div className="absolute top-72 left-1/2 transform -translate-x-1/2 md:left-36 md:top-72 -translate-y-1/2">
          <img
            className="md:w-auto max-w-7xl"
            src={animeInfo?.coverImage.large}
            alt=""
          />
        </div>
        <div className="mt-6 ml-6">
          <h2
            style={{
              whiteSpace: "pre-wrap",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            className="scroll-m-20 mt-1 text-2xl font-extrabold tracking-tight"
          >
            {animeInfo?.title}
          </h2>
          <h3
            style={{
              whiteSpace: "pre-wrap",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            className="scroll-m-20 text-sm tracking-tight text-[#a0a0a0]"
          >
            {animeInfo?.title}
          </h3>
          <div
            className="flex"
            style={{ marginLeft: "-0.5rem", marginTop: "-0.7rem" }}
          >
            <Dot
              className="mt-3"
              style={{
                color:
                  animeInfo?.status === "RELEASING" ? "#28FC06" : "#FF6C00",
              }}
            />
            <p className="scroll-m-20 mt-4 text-xs tracking-tight">
              {animeInfo?.status === "RELEASING"
                ? "Production in progress"
                : "Production finish"}
            </p>
          </div>
        </div>
      </div>
      <div className="header_desktop hidden md:block">
        <img
          className="object-cover blur_img"
          src={animeInfo?.bannerImage}
          alt=""
        />
        <div className="absolute top-20 p-4">
          <div className="flex ml-7">
            <img
              className="mr-5 portrait:mr-5 portrait:w-46 portrait:max-h-72 rounded-lg"
              src={animeInfo?.coverImage?.large || ""}
              alt=""
            />
            <div className="ml-2 mb-2">
              <h2
                style={{
                  whiteSpace: "pre-wrap",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
                className="scroll-m-20 mt-1 text-4xl font-extrabold tracking-tight lg:text-4xl mb-2"
              >
                {animeInfo?.title}
              </h2>

              <div className="flex mb-5">
                <Star />
                <p className="ml-2">{animeInfo?.score.decimalScore}</p>
              </div>
              <div className="flex">
                <div className="flex mb-3">
                  <p className="mr-2">Year :</p>
                  <p> {animeInfo?.year}</p>
                </div>
                <div className="flex mb-3">
                  <p className="mr-2 ml-20">Season :</p>
                  <p> {animeInfo?.season}</p>
                </div>
                <div className="flex mb-3">
                  <p className="mr-2 ml-20">Episode :</p>
                  <p>
                    {/* {curentEp === "" ? curentEp : animeInfo?.episodes} /{" "} */}
                    {animeInfo?.episodes}
                  </p>
                </div>
                <div className="flex">
                  <Dot
                    className="mt-3"
                    style={{
                      color:
                        animeInfo?.status === "RELEASING"
                          ? "#28FC06"
                          : "#FF6C00",
                    }}
                  />
                  <p className="scroll-m-20 mt-4 text-xs tracking-tight">
                    {animeInfo?.status === "RELEASING"
                      ? "Production in progress"
                      : "Production finish"}
                  </p>
                </div>
              </div>
              <div className="flex mt-2">
                <p className="mt-0.5 mr-2">Genre :</p>
                {Array.isArray(animeInfo?.genres) &&
                  animeInfo?.genres.map((genre, index) => (
                    <Badge
                      className="text-xs py-1.5 mr-3 cursor-default"
                      variant="secondary"
                      key={index}
                    >
                      {genre}
                    </Badge>
                  ))}
              </div>
              <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className="space-y-2 items-center"
              >
                <p
                  className="text-sm"
                  style={{
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    display: "-webkit-box",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: animeInfo?.description || "",
                  }}
                ></p>
                <div className="flex mt-2 items-center justify-between space-x-4 px-4">
                  <CollapsibleTrigger asChild>
                    <div className="flex justify-center items-center mt-2 ml-1">
                      <ChevronDown className="mx-auto" />
                      <p className="text-center mx-auto">See more</p>
                    </div>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="space-y-2 pr-10">
                  <p
                    className="ml-6 text-sm"
                    dangerouslySetInnerHTML={{
                      __html: animeInfo?.description || "",
                    }}
                  ></p>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default headerInfo;
