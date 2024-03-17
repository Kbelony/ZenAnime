import "./assets/style/style.scss";
import { Button } from "@/components/ui/button";

const App = () => {
  return (
    <div className="bg-neutral-100 dark:bg-neutral-950">
      <h1 className="text-5xl dark:text-white font-bold underline">Test</h1>
      <Button>Click me</Button>
    </div>
  );
};

export default App;
