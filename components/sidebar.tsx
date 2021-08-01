import React from "react";
import classNames from "classnames";
import { Heading, Link, Radio, RadioGroup, Stack, Text } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons"

import { TimeFrame } from "../interface/casino";
import { SidebarLinks } from "../interface/links";

import SidebarStyles from "../styles/Sidebar.module.scss";

type SidebarProps = {
  selectedTimeframe: TimeFrame
  selectTimeframe: (t: TimeFrame) => void
  links: SidebarLinks
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
      <Heading>&#127922;&#127922;<br/> Craps Table Minimum Map </Heading>
      <Text>
        This map plots the typical table minimums at each casino in the United States, as reported
        on Reddit's <Link href={"https://www.reddit.com/r/Craps/"}>/r/Craps</Link>
      </Text>

      <RadioGroup value={props.selectedTimeframe} onChange={props.selectTimeframe}>
        <Stack>
          {Object.values(TimeFrame).map(t => (
            <Radio key={t} value={t}>{t}</Radio>
          ))}
        </Stack>
      </RadioGroup>

      <a target="_blank" href="https://icons8.com/icon/35544/chip">Chip</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>
      <a href="https://www.vecteezy.com/free-vector/poker-chip">Poker Chip Vectors by Vecteezy</a>
    </div>
  );

  return (
    <div
      className={classNames(
        SidebarStyles.sidebar,
        { [SidebarStyles.shown]: state.shown }
      )}
      onMouseDown={(e) => {e.preventDefault(); return false;}}
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
