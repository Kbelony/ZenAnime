import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dot } from "lucide-react";
import { Play, ChevronDown } from "lucide-react";
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
    title: string;
    status: string;
    genres: string;
    meanScore: number;
    id: number;
  }
  const [isOpen, setIsOpen] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [animeInfo, setAnimeInfo] = useState<Anime[]>([]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [ImageLargeInfo, setImageLargeInfo] = useState();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [titleEnglish, setTitleEnglish] = useState();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [titleRomaji, setTitleRomaji] = useState();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [id, setId] = useState();
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `https://api-amvstrm.nyt92.eu.org/api/v2/info/${window.location.pathname.split("/")[2]}`
      );
      const data = await response.json();
      console.log(data);
      setAnimeInfo(data);
      setImageLargeInfo(data.coverImage.large);
      setTitleEnglish(data.title.english);
      setTitleRomaji(data.title.romaji);
      setId(data.trailer.id);
    };

    fetchData();
  }, []);
  return (
    <div>
      <div className="header_mobile md:hidden">
        <img
          className="object-cover blur_img"
          src={animeInfo.bannerImage}
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
            className="scroll-m-20 mt-1 text-xl font-extrabold tracking-tight"
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
                color: animeInfo.status === "RELEASING" ? "#28FC06" : "#FF6C00",
              }}
            />
            <p className="scroll-m-20 mt-4 text-xs tracking-tight">
              {animeInfo.status === "RELEASING"
                ? "Production in progress"
                : "Production finish"}
            </p>
          </div>
        </div>
      </div>
      <div className="header_desktop p-4 hidden md:block">
        <div className="flex ml-7 mb-2">
          <h2
            style={{
              whiteSpace: "pre-wrap",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            className="scroll-m-20 mt-1 text-2xl font-extrabold tracking-tight lg:text-2xl mb-2"
          >
            {titleEnglish}
          </h2>
          <Dot
            className="mt-3"
            style={{
              color: animeInfo.status === "RELEASING" ? "#28FC06" : "#FF6C00",
            }}
          />
          <p className="scroll-m-20 mt-4 text-xs tracking-tight">
            {animeInfo.status === "RELEASING"
              ? "Production in progress"
              : "Production finish"}
          </p>
        </div>
        <div className="flex ml-7">
          <img
            className="mr-5 portrait:mr-5 portrait:w-46 portrait:max-h-72"
            src={ImageLargeInfo}
            alt=""
          />
          <iframe
            className="w-2/4 max-h-80 portrait:w-2/3 portrait:1/3 h-72"
            src={`https://www.youtube.com/embed/${id}`}
          ></iframe>
        </div>
      </div>
      <div className="flex justify-center mt-5">
        <Button className="text-white w-80" variant="">
          <Play className="mr-2 justify-center  items-center h-4 w-4 " /> Play
          E1
        </Button>
      </div>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-[350px] space-y-2"
      >
        <div className="flex items-center justify-between space-x-4 px-4">
          <CollapsibleTrigger asChild>
            <div className="flex justify-center items-center mt-2 ml-1">
              <ChevronDown className="mx-auto" />
              <p className="text-center mx-auto">See more</p>
            </div>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2">
          <p
            className="ml-6 text-sm"
            dangerouslySetInnerHTML={{ __html: animeInfo.description }}
          ></p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default headerInfo;
