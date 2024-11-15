import MyIcon from "../../assets/15n_white.svg";
import "./NavBar.css";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import Iconify from "../../components/iconify/Iconify";
import { useData } from "../../providers/DataProvider";

interface NavBarProps {
  children: React.ReactNode;
}

function NavBar({ children }: NavBarProps) {
  const [isNavVisible, setIsNavVisible] = useState(false);
  const [version, setVersion] = useState("Chargement");
  const auth = getAuth();
  const { publicDataListener } = useData();

  useEffect(() => {
    setVersion(publicDataListener?.edition || "");
  }, [publicDataListener]);

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
          <div>
            {isNavVisible ? (
              <div onClick={handleToggle} id="header_toggle">
                <Iconify icon="material-symbols:menu-open-rounded" />
              </div>
            ) : (
              <div onClick={handleToggle} id="header_toggle_small">
                <Iconify icon="material-symbols:menu-rounded" />
              </div>
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
              <Link to="/" className="nav_logo" onClick={() => {setIsNavVisible(false);}}>
                <img src={MyIcon} id="custom-icon" />
                <span className="nav_logo-name">Quinzaine</span>
              </Link>
              <div className="nav_list">
                <NavLink
                  to="/stats"
                  className={({ isActive }) => {
                    return isActive ? "nav_link active" : "nav_link";
                  }}
                  onClick={() => {setIsNavVisible(false);}}
                >
                  <Iconify icon="material-symbols:bar-chart-rounded" />
                  <span className="nav_name">Stats</span>
                </NavLink>
                <NavLink
                  to="/"
                  className={({ isActive }) => {
                    return isActive ? "nav_link active" : "nav_link";
                  }}
                  onClick={() => {setIsNavVisible(false);}}
                >
                  <Iconify icon="material-symbols:barcode-reader-outline-rounded" />
                  <span className="nav_name">Scanner</span>
                </NavLink>
                <NavLink
                  to="/carte"
                  className={({ isActive }) => {
                    return isActive ? "nav_link active" : "nav_link";
                  }}
                  onClick={() => {setIsNavVisible(false);}}
                >
                  <Iconify icon="material-symbols:article-outline-rounded" />
                  <span className="nav_name">Carte</span>
                </NavLink>
                <NavLink
                  to="/stock"
                  className={({ isActive }) => {
                    return isActive ? "nav_link active" : "nav_link";
                  }}
                  onClick={() => {setIsNavVisible(false);}}
                >
                  <Iconify icon="material-symbols:deployed-code-outline" />
                  <span className="nav_name">Stock</span>
                </NavLink>
                <NavLink
                  to="/admin"
                  className={({ isActive }) => {
                    return isActive ? "nav_link active" : "nav_link";
                  }}
                  onClick={() => {setIsNavVisible(false);}}
                >
                  <Iconify icon="material-symbols:admin-panel-settings-outline-rounded" />
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
              <Iconify icon="material-symbols:exit-to-app-rounded" />
              <span className="nav_name">SignOut</span>
            </NavLink>
          </nav>
        </div>
        <div className="container-fluid"></div>
      </div>
      <div className={`main-content ${isNavVisible ? 'blur' : ''}`} id="main-content">
        {children}
      </div>
    </>
  );
}

export default NavBar;
