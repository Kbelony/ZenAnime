import Logo from "../assets/img/Logo.svg";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "./mode-toggle";

const navbar = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="navbar flex flex-col p-8 bg-neutral-100 dark:bg-neutral-950">
        <nav className="grid grid-flow-col">
          <div className="flex logo_label">
            <img className="logo h-12 w-12" src={Logo} alt="Logo" />
            <h4 className="ml-2 mt-2 dark:text-white">zenanime</h4>
          </div>
          <div className="justify-self-end">
            <ModeToggle />
          </div>
        </nav>
      </div>
    </ThemeProvider>
  );
};

export default navbar;
