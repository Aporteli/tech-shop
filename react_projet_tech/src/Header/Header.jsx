import { useState, useEffect } from "react";
import HeaderDesktop from "./components/HeaderDesktop";
import HeaderTablet from "./components/HeaderTablet";

function Header() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (windowWidth > 1180) {
    return <HeaderDesktop />;
  } else {
    return <HeaderTablet />;
  }
}

export default Header;
