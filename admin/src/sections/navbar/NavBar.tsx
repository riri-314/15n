import {
  UpcScan,
  BarChartFill,
  JournalText,
  Box2,
  Gear,
  List,
  X,
  BoxArrowLeft,
} from "react-bootstrap-icons";
import MyIcon from "../../assets/15n.svg";
import "./NavBar.css";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

interface NavBarProps {
  children: React.ReactNode;
}

function NavBar({ children }: NavBarProps) {
  const [isNavVisible, setIsNavVisible] = useState(false);
  const auth = getAuth();
  const version = 34;

  async function logOut() {
    try {
      await signOut(auth);
      console.log("logout succes, user: ", auth.currentUser);
    } catch {
      console.log("logout error");
    }
  }

  useEffect(() => {
    if (isNavVisible) {
      document.body.classList.add("body-pd");
    } else {
      document.body.classList.remove("body-pd");
    }
  }, [isNavVisible]);

  const handleToggle = () => {
    setIsNavVisible(!isNavVisible);
  };

  return (
    <>
        <div>
          <header
            className={isNavVisible ? "header body-pd" : "header"}
            id="header"
          >
            <div className="header_toggle">
              {isNavVisible ? (
                <X onClick={handleToggle} />
              ) : (
                <List onClick={handleToggle} />
              )}
            </div>
            <h1 style={{ fontWeight: "bolder" }}>{version}</h1>
          </header>
          <div
            className={isNavVisible ? "l-navbar show" : "l-navbar"}
            id="nav-bar"
          >
            <nav className="nav">
              <div>
                <Link to="/" className="nav_logo">
                  <img src={MyIcon} id="custom-icon" />
                  <span className="nav_logo-name">Quinzaine</span>
                </Link>
                <div className="nav_list">
                  <NavLink
                    to="/stats"
                    className={({ isActive }) => {
                      return isActive ? "nav_link active" : "nav_link";
                    }}
                  >
                    <BarChartFill />
                    <span className="nav_name">Stats</span>
                  </NavLink>
                  <NavLink
                    to="/"
                    className={({ isActive }) => {
                      return isActive ? "nav_link active" : "nav_link";
                    }}
                  >
                    <UpcScan />
                    <span className="nav_name">Scanner</span>
                  </NavLink>
                  <NavLink
                    to="carte"
                    className={({ isActive }) => {
                      return isActive ? "nav_link active" : "nav_link";
                    }}
                  >
                    <JournalText />
                    <span className="nav_name">Carte</span>
                  </NavLink>
                  <NavLink
                    to="/stock"
                    className={({ isActive }) => {
                      return isActive ? "nav_link active" : "nav_link";
                    }}
                  >
                    <Box2 />
                    <span className="nav_name">Stock</span>
                  </NavLink>
                  <NavLink
                    to="/gestion"
                    className={({ isActive }) => {
                      return isActive ? "nav_link active" : "nav_link";
                    }}
                  >
                    <Gear />
                    <span className="nav_name">Gestion</span>
                  </NavLink>
                </div>
              </div>

              <NavLink
                to="#"
                className={({ isActive }) => {
                  return isActive ? "nav_link active" : "nav_link";
                }}
                onClick={logOut}
              >
                <BoxArrowLeft />
                <span className="nav_name">SignOut</span>
              </NavLink>
            </nav>
          </div>
          <div className="container-fluid"></div>
        </div>
        <div className="content" id="main-content">
          {children}
        </div>
    </>
  );
}

export default NavBar;
