import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import Logo from "../assets/img/Logo.svg";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "../components/mode-toggle";
import "../assets/style/style.scss";
import SearchBar from "../components/searchBar";

export const Route = createRootRoute({
  component: () => (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="navbar flex flex-col p-3">
          <nav className="grid grid-flow-col">
            <Link to="/" className="[&.active]:font-bold">
              <div className="flex logo_label mt-1">
                <img
                  className="logo h-7 w-7 md:ml-8 ml-3"
                  src={Logo}
                  alt="Logo"
                />

                <h4 className="ml-1 text-lg">
                  <span className="dark:text-white">zen</span>
                  <span className="text-[#2E7CF6]">anime</span>
                </h4>
              </div>
            </Link>
            <div className="justify-self-end flex">
              {location.pathname !== "/" && (
                <div className="md:w-auto mr-2 md:mr-4">
                  <SearchBar />
                </div>
              )}
              <ModeToggle />
            </div>
          </nav>
        </div>
      </ThemeProvider>
      <Outlet />
    </>
  ),
});
