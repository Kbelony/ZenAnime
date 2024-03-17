import React, { useState } from "react";
import Logo from "../assets/img/Logo.svg";
import { MoonIcon } from "@heroicons/react/24/outline";
import { SunIcon } from "@heroicons/react/24/outline";

const navbar = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [darkMode, setDarkMode] = useState(true);
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  return (
    <div className={`${darkMode && "dark"}`}>
      <div className="navbar flex flex-col p-8 bg-neutral-100 dark:bg-neutral-950">
        <nav className="grid grid-flow-col">
          <div className="flex logo_label">
            <img className="logo h-12 w-12" src={Logo} alt="Logo" />
            <h4 className="ml-2 mt-2 dark:text-white">zenanime</h4>
          </div>
          <button className="justify-self-end" onClick={toggleDarkMode}>
            {darkMode ? (
              <SunIcon className="h-6 w-6 text-white" />
            ) : (
              <MoonIcon className="h-6 w-6 text-black" />
            )}
          </button>
        </nav>
      </div>
    </div>
  );
};

export default navbar;
