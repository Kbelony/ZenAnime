import React from "react";
import HeroSection from "../components/heroSection";
import CarouselList from "../components/carouselList";
import { createFileRoute } from "@tanstack/react-router";

const homepage = () => {
  return (
    <div>
      <HeroSection />
      <CarouselList />
    </div>
  );
};

export default homepage;

export const Route = createFileRoute("/")({
  component: homepage,
});
