import React from "react";

import interpolate from "color-interpolate";

import SidebarStyles from "../styles/Sidebar.module.scss";
import { getCircleMarkerColor } from "./colors";
import { ColorScheme } from "./colorSchemeRadioButtons";

type ColorKeyProps = {
  scheme: ColorScheme
}

const keyTypes = ["?", "<$5", 5, 10, 15, 20, 25, "$50+"]

export const ColorKey: React.FC<ColorKeyProps> = (props) => {
  return (
    <div className={SidebarStyles.colorKey}>
      {keyTypes.map(ct => {
        let key: number | null;
        switch (ct) {
          case "?":
            key = null;
            break;
          case "<$5":
            key = 1;
            break;
          case "$50+":
            key = 50;
            break;
          default:
            if (typeof ct !== "number") throw new Error("Unknown key " + ct);
            key = ct;
            break;
        }

        const color = getCircleMarkerColor(key, props.scheme);
        const fillColor = interpolate(["#ffffff", color])(0.8);

        return (
          <div key={ct}>
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="40" strokeWidth="14" stroke={color} fill={fillColor}/>
            </svg>
            <h4>{(typeof ct === "number") ? "$" + ct : ct}</h4>
          </div>
        );
      })}
    </div>
  );
}
