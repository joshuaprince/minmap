import React from "react";
import { TimeFrame } from "../interface/casino";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCog, faTimes } from "@fortawesome/free-solid-svg-icons"

import MapStyles from "../styles/Map.module.scss";

type SidebarProps = {
  selectedTimeframe: TimeFrame
  selectTimeframe: (t: TimeFrame) => void
}

type SidebarState = {
  shown: boolean
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
  const [state, setState] = React.useState<SidebarState>({shown: false});

  return (
    <div
      className={MapStyles.sidebarContainer + (state.shown ? " " + MapStyles.shown : "")}
      onMouseDown={(e) => {e.preventDefault(); return false;}}
    >
      <button className={"leaflet-control " + MapStyles.sidebarButton} onClick={() => setState(s => ({...s, shown: !s.shown}))}>
        <FontAwesomeIcon icon={faCog}/>
      </button>
      <div className={MapStyles.sidebar}>
        <button className={MapStyles.sidebarCloseButton} onClick={() => setState(s => ({...s, shown: false}))}>
        <FontAwesomeIcon icon={faTimes}/>
        </button>
      </div>
    </div>
  );
}
