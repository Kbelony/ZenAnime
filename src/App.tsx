import "./assets/style/style.scss";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shuffle, Tv, RefreshCw, Library } from "lucide-react";

const App = () => {
  return (
    <div className="hero_section mt-8 md:mt-18">
      <div className="flex text-center flex-col items-center justify-center">
        <Badge className="mb-4" variant="outline">
          Created by a enthusiast 👨🏾‍💻
        </Badge>
        <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl px-8 mb-4 md:px-56">
          <span className="dark:text-white">Your Ultimate </span>
          <span className="text-[#2E7CF6]">Anime Escape</span>
          <span className="dark:text-white"> : Modern, Ad-Free Streaming</span>
        </h1>
        <p className="mb-7 text-sm px-10 md:px-52 text-slate-800 dark:text-white">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Maiores, ex
          necessitatibus. Nihil facilis atque eaque voluptate nam quis sapiente
        </p>
        <Button variant="secondary">
          <Shuffle className="mr-2 h-4 w-4" /> Recommendation
        </Button>
        <div className="icon mt-6 flex justify-center text-xs md:text-base	">
          <div className="grid content-center grid-flow-col">
            <div className="flex mr-4 ml-6 md:ml-20 md:mr-10">
              <Tv className="mr-2 h-4 w-4 mt-0 md:mt-1" />
              <p>Ad-free</p>
            </div>
            <div className="flex mr-3 md:mr-7">
              <RefreshCw className="mr-2 h-4 w-4 mt-0 md:mt-1" />
              <p>Updated instantly</p>
            </div>
            <div className="flex mr-4 md:mr-10">
              <Library className="mr-2 h-4 w-4 mt-0 md:mt-1" />
              <p>+300 animes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
