import React from "react";
import "./assets/style/style.scss";
import { Button } from "@/components/ui/button";

const App = () => {
  return (
    <div className=" bg-black">
      <h1 className="text-5xl text-white font-bold underline">Test</h1>
      <Button>Click me</Button>
    </div>
  );
};

export default App;
