/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dot } from "lucide-react";
import { Play, ChevronDown, Star } from "lucide-react";
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
    meanScore: number;
    id: number;
    season: string;
    episodes: number;
    description: string;
  }
  const [isOpen, setIsOpen] = useState(false);
  const [animeInfo, setAnimeInfo] = useState<Anime | null>(null);
  const [ImageLargeInfo, setImageLargeInfo] = useState();
  const [titleEnglish, setTitleEnglish] = useState();
  const [titleRomaji, setTitleRomaji] = useState();
  const [score, setScore] = useState();
  const [year, setYear] = useState();
  const [curentEp, setCurrentEp] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `https://api.amvstr.me/api/v2/info/${window.location.pathname.split("/")[2]}`
      );
      const data = await response.json();
      console.log(data);
      setAnimeInfo(data);
      setImageLargeInfo(data.coverImage.large);
      setTitleEnglish(data.title.english);
      setTitleRomaji(data.title.romaji);
      setScore(data.score.decimalScore);
      setYear(data.startIn.year);
      setCurrentEp(data.nextair.episode);
    };

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
          <img className="md:w-auto max-w-7xl" src={ImageLargeInfo} alt="" />
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
            {titleEnglish}
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
            {titleRomaji}
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
              src={ImageLargeInfo}
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
                {titleEnglish}
              </h2>

              <div className="flex mb-5">
                <Star />
                <p className="ml-2">{score}</p>
              </div>
              <div className="flex">
                <div className="flex mb-3">
                  <p className="mr-2">Year :</p>
                  <p> {year}</p>
                </div>
                <div className="flex mb-3">
                  <p className="mr-2 ml-20">Season :</p>
                  <p> {animeInfo?.season}</p>
                </div>
                <div className="flex mb-3">
                  <p className="mr-2 ml-20">Episode :</p>
                  <p>
                    {curentEp === "" ? curentEp : animeInfo?.episodes} /{" "}
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
        <div className="flex justify-center mt-5">
          <Button className="text-white w-80">
            <Play className="mr-2 justify-center  items-center h-4 w-4 " /> Play
            E1
          </Button>
        </div>
      </div>
    </div>
  );
};

export default headerInfo;
