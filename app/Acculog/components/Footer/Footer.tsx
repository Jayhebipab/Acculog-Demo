"use client";

import React, { useEffect, useState } from "react";
// Icons
import { FaArrowUp } from "react-icons/fa";

type FooterProps = {
  userRole?: string;
  systemStatus?: "operational" | "down";
};

const Footer: React.FC<FooterProps> = ({systemStatus = "operational" }) => {
  const [showButton, setShowButton] = useState(false);
  
  // Scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
   
  // Back to Top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {showButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 z-50 p-3 bg-cyan-400 hover:bg-cyan-500 text-white rounded-full shadow-lg transition duration-300"
          aria-label="Back to top"
        >
          <FaArrowUp />
        </button>
      )}

      <footer className="bg-green-700 text-white py-4 w-full relative p-2 rounded-t-lg">
        <div className="container mx-auto text-center text-xs px-4">
          <p className="font-bold">
            &copy; {new Date().getFullYear()} AccuLog
            <span className="bg-green-900 ml-2 px-2 py-1 rounded-md text-[10px]">Version 1.0</span>
          </p>

          <div className="mt-2 text-[10px] italic flex justify-center items-center gap-2">
            <span className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  systemStatus === "operational" ? "bg-green-400 animate-pulse" : "bg-red-500"
                }`}
              ></span>
              {systemStatus === "operational" ? "System Operational" : "System Down"}
            </span>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
