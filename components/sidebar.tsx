import React from "react";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGithub } from "@fortawesome/free-brands-svg-icons"
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons"
import { useMediaQuery } from "react-responsive";

import { TimeframeRadioButtons } from "./timeframeRadioButtons";
import { ColorScheme, ColorSchemeRadioButtons } from "./colorSchemeRadioButtons";
import { Search } from "./search";
import { Casino, TimeFrame } from "../interface/casino";
import { SidebarLinks } from "../interface/links";
import { ColorKey } from "./colorKey";

import SidebarStyles from "../styles/Sidebar.module.scss";

export type SidebarToggleMethod = "pageLoad" | "clickShow" | "clickHide" | "searchHide" | "buttonHide";

type SidebarProps = {
  shown?: boolean  /* If undefined, determine visibility by media query */
  setShown: (s: boolean, method: SidebarToggleMethod) => void
  selectedTimeframe: TimeFrame
  selectTimeframe: (t: TimeFrame) => void
  selectedColorScheme: ColorScheme
  selectColorScheme: (t: ColorScheme) => void
  casinos: Casino[]
  scrollTo: (casino: Casino) => void
  links: SidebarLinks
  lastUpdateJson: string
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
  /* On smaller screens, hide the sidebar at page load. We have to useEffect here instead of passing
   * the matchMedia to useState above because `window` is not available for SSR. Also,
   * useMediaQuery does not appear to work for initialState, likely also due to SSR issues. */
  React.useEffect(() => {
    props.setShown(!shouldHideByDefault(), "pageLoad");
  }, []);  /* No deps => only runs at first render */

  const isTap = useMediaQuery({ query: "(hover: none)" });

  const sidebarContent = (
    <div className={SidebarStyles.sidebarContent}>
      <h1>&#127922;&#127922;<br/> Craps Table Minimum Map </h1>
      <p>
        This map plots the typical table minimums at casinos in the United States. Data
        shown is collected directly from{" "}
        <a target="_blank" rel="noopener noreferrer" href="https://www.reddit.com/r/Craps/">/r/Craps</a>{"' "}
        <a target="_blank" rel="noopener noreferrer" href={props.links.spreadsheetComments}>Spreadsheet of Minimums</a>,
        which is maintained by{" "}
        <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/cochran10">@cochran10</a>.
      </p>
      <p>
        {isTap ? "Tap" : "Click on"} a location on the map to see more information about it.
      </p>
      <p>
        <b>All data is user-reported and not guaranteed to be accurate.</b> If any data is incorrect
        or missing,{" "}
        <a target="_blank" rel="noopener noreferrer" href={props.links.spreadsheetComments}><b>please report it here!</b></a>
      </p>

      <div className={SidebarStyles.searchContainer}>
        <h2>Search</h2>
        <Search casinos={props.casinos} onSelect={(c) => {
          if (shouldHideByDefault()) props.setShown(false, "searchHide");
          props.scrollTo(c);
        }}/>
      </div>

      <h2>Map Settings</h2>
      <div className={SidebarStyles.timeframeSelect}>
        <h3>Color markers by minimums as of:</h3>
        <TimeframeRadioButtons
          value={props.selectedTimeframe}
          update={(t) => {
            if (shouldHideByDefault()) props.setShown(false, "buttonHide");
            props.selectTimeframe(t);
          }}
        />
        <h3>Marker color scheme:</h3>
        <ColorSchemeRadioButtons
          value={props.selectedColorScheme}
          update={(t) => {
            if (shouldHideByDefault()) props.setShown(false, "buttonHide");
            props.selectColorScheme(t);
          }}
        />
        <ColorKey scheme={props.selectedColorScheme}/>
      </div>

      <div className={SidebarStyles.linkIcons}>
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/joshuaprince/minmap" title={"GitHub"}>
          <FontAwesomeIcon icon={faGithub}/>
        </a>
      </div>
      <div className={SidebarStyles.attributions}>
        <div>
          Last update from spreadsheet: {new Date(props.lastUpdateJson).toLocaleString()}
        </div>
        <div>
          Built by <a target="_blank" rel="noopener noreferrer" href="https://github.com/joshuaprince">Joshua Prince</a>.
        </div>
        <div>
          Data maintained by <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/cochran10">@cochran10</a>.
        </div>
        <p>
          Libraries used include:{" "}
          <a target="_blank" rel="noopener noreferrer" href="https://reactjs.org/">React</a>,{" "}
          <a target="_blank" rel="noopener noreferrer" href="https://nextjs.org/">Next</a>,{" "}
          <a target="_blank" rel="noopener noreferrer" href="https://leafletjs.com/">Leaflet</a>,{" "}
          <a target="_blank" rel="noopener noreferrer" href="https://osm.org/">OpenStreetMap</a>,{" "}
          <a target="_blank" rel="noopener noreferrer" href="https://fontawesome.com/">Font Awesome</a>.{" "}
        </p>
        <div>
          <a target="_blank" rel="noopener noreferrer" href="https://icons8.com/icon/35544/chip">Chip</a> favicon by <a target="_blank" rel="noopener noreferrer" href="https://icons8.com">Icons8</a>.{" "}
          <a target="_blank" rel="noopener noreferrer" href="https://www.vecteezy.com/free-vector/poker-chip">Poker Chip Vectors by Vecteezy</a>.
        </div>
      </div>
    </div>
  );

  return (
    <>
    {/* SHOW button */}
    <div
      className={classNames(
        "leaflet-control",
        SidebarStyles.sidebarButton,
        { [SidebarStyles.shown]: props.shown }
      )}
      onClick={() => props.setShown(!props.shown, props.shown ? "clickHide" : "clickShow")}
    >
      <FontAwesomeIcon icon={faBars}/>
    </div>
    <div
      className={classNames(
        SidebarStyles.sidebar,
        { [SidebarStyles.shown]: props.shown }
      )}
    >
      {/* CLOSE button */}
      <button
        className={SidebarStyles.sidebarCloseButton}
        onClick={() => props.setShown(false, "clickHide")}
      >
        <FontAwesomeIcon icon={faTimes}/>
      </button>

      {sidebarContent}
    </div>
    </>
  );
}

const shouldHideByDefault = () => {
  return window.matchMedia("(max-width: 960px)").matches;
}
