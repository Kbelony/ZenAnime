import Logo from "../assets/img/Logo.svg";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "./mode-toggle";
import "../assets/style/style.scss";

const navbar = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="navbar flex flex-col p-3">
        <nav className="grid grid-flow-col">
          <div className="flex logo_label">
            <img className="logo h-7 w-7 mt-1" src={Logo} alt="Logo" />
            <h4 className="ml-1 text-lg">
              <span className="dark:text-white">zen</span>
              <span className="text-[#2E7CF6]">anime</span>
            </h4>
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
