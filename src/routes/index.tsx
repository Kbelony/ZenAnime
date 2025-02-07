/* eslint-disable react-refresh/only-export-components */

import HeroSection from "../components/heroSection";
import CarouselList from "../components/carouselList";
import { createFileRoute } from "@tanstack/react-router";

const homepage = () => {
  return (
    <div className="mt-2 dark:bg-grid bg-[size:5vw_5vw]">
      <HeroSection />
      <CarouselList />
    </div>
  );
};

export default homepage;

export const Route = createFileRoute("/")({
  component: homepage,
});
