import { Badge } from "@/components/ui/badge";
import { Tv, RefreshCw, Library } from "lucide-react";
import SearchBar from "./searchBar";
import { Alert, AlertDescription } from "@/components/ui/alert";

const heroSection = () => {
  const handleAlertClick = (e: React.MouseEvent<HTMLParagraphElement>) => {
    if (window.innerWidth < 768) {
      // Fermer toutes les alertes mobiles visibles
      const visibleAlerts = document.querySelectorAll(
        ".mobile-alert:not(.hidden)"
      );
      visibleAlerts.forEach((alert) => {
        alert.classList.add("animate-fadeOut");
        setTimeout(() => {
          alert.classList.add("hidden");
          alert.classList.remove("opacity-100", "animate-fadeOut");
        }, 500);
      });

      // Afficher la nouvelle alerte
      const newAlert =
        e.currentTarget.parentElement?.querySelector(".mobile-alert");
      if (newAlert) {
        setTimeout(() => {
          newAlert.classList.remove("hidden");
          newAlert.classList.add("opacity-100", "animate-fadeIn");
          setTimeout(() => {
            newAlert.classList.remove("animate-fadeIn");
            newAlert.classList.add("animate-fadeOut");
            setTimeout(() => {
              newAlert.classList.add("hidden");
              newAlert.classList.remove("opacity-100", "animate-fadeOut");
            }, 500);
          }, 4000);
        }, 500); // Attendre que l'animation de fermeture soit terminée
      }
    }
  };

  return (
    <div className="hero_section ">
      <div className="flex text-center flex-col items-center justify-center ">
        <Badge
          className="mb-4 mt-8 lg:mt-28 xl:mt-32 2xl:mt-28 xl:mb-24"
          variant="outline"
        >
          Created by a enthusiast 👨🏾‍💻
        </Badge>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl md:text-4xl xl:text-6xl 2xl:text-7xl  px-4 mb-4 md:px-40 xl:px-40 portrait:px-10">
          <span className="dark:text-white">Your Ultimate </span>
          <span className="text-[#2E7CF6]">Anime Escape</span>
          <span className="dark:text-white"> : Modern, Ad-Free Streaming</span>
        </h1>
        <p className="mb-7 text-sm px-10 md:px-52 text-slate-800 dark:text-white">
          Discover a vast collection of anime series and movies, all in one
          place. Stream your favorite shows in high quality, with a clean and
          modern interface designed for the best viewing experience
        </p>
        <SearchBar />
        <div className="icon mt-6 flex justify-center text-xs md:text-base">
          <div className="grid content-center grid-flow-col">
            {/* Alerte Ad-free */}
            <div className="flex mr-4 ml-4 md:ml-20 md:mr-10 relative group">
              <Tv className="mr-2 h-4 w-4 mt-0 md:mt-1" />
              <p
                className="cursor-pointer hover:text-blue-500 underline transition-colors"
                onClick={handleAlertClick}
              >
                <span>*</span> Ad-free
              </p>
              <div className="hidden group-hover:hidden md:group-hover:block absolute top-full left-2 mt-2 z-10">
                <Alert>
                  <AlertDescription className="whitespace-nowrap">
                    Some video players may contain ads that are beyond our
                    control.
                  </AlertDescription>
                </Alert>
              </div>
              <div className="mobile-alert hidden md:hidden absolute top-full left-1/2 -translate-x-8 mt-2 z-10 w-80 transition-all duration-500">
                <Alert>
                  <AlertDescription className="px-4 whitespace-normal">
                    Some video players may contain ads that are beyond our
                    control.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            {/* Alerte Updated instantly */}
            <div className="flex mr-1 md:mr-7 relative group">
              <RefreshCw className="mr-2 h-4 w-4 mt-0 md:mt-1" />
              <p
                className="cursor-pointer hover:text-blue-500 underline transition-colors"
                onClick={handleAlertClick}
              >
                <span>*</span> Updated instantly
              </p>
              <div className="hidden group-hover:hidden md:group-hover:block absolute top-full -left-64 mt-2 z-10">
                <Alert>
                  <AlertDescription className="whitespace-nowrap">
                    We rely on external services to provide anime releases, so
                    release times may not be under our control.
                  </AlertDescription>
                </Alert>
              </div>
              <div className="mobile-alert hidden md:hidden absolute top-full left-1/2 -translate-x-1/2 mt-2 z-10 w-80 transition-all duration-500">
                <Alert>
                  <AlertDescription className="px-4 whitespace-normal">
                    We rely on external services to provide anime releases, so
                    release times may not be under our control.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            {/* Alerte +4000 animes */}
            <div className="flex mr-4 ml-2 md:mr-10">
              <Library className="mr-2 h-4 w-4 mt-0 md:mt-1" />
              <p>+4000 animes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default heroSection;
