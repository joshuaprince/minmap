import React from "react";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGithub } from "@fortawesome/free-brands-svg-icons"
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons"

import { TimeframeRadioButtons } from "./timeframeRadioButtons";
import { Search } from "./search";
import { Casino, TimeFrame } from "../interface/casino";
import { SidebarLinks } from "../interface/links";

import SidebarStyles from "../styles/Sidebar.module.scss";

type SidebarProps = {
  selectedTimeframe: TimeFrame
  selectTimeframe: (t: TimeFrame) => void
  casinos: Casino[]
  scrollTo: (casino: Casino) => void
  links: SidebarLinks
  lastUpdateJson: string
}

type SidebarState = {
  shown: boolean
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
  const [state, setState] = React.useState<SidebarState>({ shown: true });

  /* On smaller screens, hide the sidebar at page load. We have to useEffect here instead of passing
   * the matchMedia to useState above because `window` is not available for SSR. Also,
   * useMediaQuery does not appear to work for initialState, likely also due to SSR issues. */
  React.useEffect(() => {
    if (shouldHideByDefault()) {
      setState(s => ({...s, shown: false}));
    }
  }, []);  /* No deps => only runs at first render */

  const sidebarContent = (
    <div className={SidebarStyles.sidebarContent}>
      <h1>&#127922;&#127922;<br/> Craps Table Minimum Map </h1>
      <p>
        This map plots the typical table minimums at casinos in the United States. Data
        shown is collected daily from{" "}
        <a target="_blank" rel="noopener noreferrer" href="https://www.reddit.com/r/Craps/">/r/Craps</a>{"' "}
        <a target="_blank" rel="noopener noreferrer" href={props.links.spreadsheetComments}>Spreadsheet of Minimums</a>,
        which is maintained by{" "}
        <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/cochran10">@cochran10</a>.
      </p>
      <p>
        <b>All data is user-reported and not guaranteed to be accurate.</b> If any data is incorrect
        or missing,{" "}
        <a target="_blank" rel="noopener noreferrer" href={props.links.spreadsheetComments}><b>please report it here!</b></a>
      </p>

      <div className={SidebarStyles.searchContainer}>
        <h2>Search</h2>
        <Search casinos={props.casinos} onSelect={(c) => {
          if (shouldHideByDefault()) setState(s => ({...s, shown: false}));
          props.scrollTo(c);
        }}/>
      </div>

      <h2>Map Settings</h2>
      <div className={SidebarStyles.timeframeSelect}>
        <h3>Color markers by minimums as of:</h3>
        <TimeframeRadioButtons
          value={props.selectedTimeframe}
          update={(t) => {
            if (shouldHideByDefault()) setState(s => ({...s, shown: false}));
            props.selectTimeframe(t);
          }}
        />
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
    <div
      className={classNames(
        SidebarStyles.sidebar,
        { [SidebarStyles.shown]: state.shown }
      )}
    >
      {/* SHOW button */}
      <button
        className={classNames("leaflet-control", SidebarStyles.sidebarButton)}
        onClick={() => setState(s => ({...s, shown: !s.shown}))}
      >
        <FontAwesomeIcon icon={faBars}/>
      </button>

      {/* CLOSE button */}
      <button
        className={SidebarStyles.sidebarCloseButton}
        onClick={() => setState(s => ({...s, shown: false}))}
      >
        <FontAwesomeIcon icon={faTimes}/>
      </button>

      {sidebarContent}
    </div>
  );
}

const shouldHideByDefault = () => {
  return window.matchMedia("(max-width: 960px)").matches;
}
