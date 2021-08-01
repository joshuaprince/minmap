import React from "react";
import { Popup } from "react-leaflet";

import { Casino, Minimum, TimeFrame } from "../interface/casino";

import MapStyles from "../styles/Map.module.scss"

type CasinoPopupProps = {
  casino: Casino
}

export const CasinoPopup: React.FC<CasinoPopupProps> = (props) => {
  const c = props.casino;
  return (
    <Popup>
      <h2>{c.name}</h2>
      <div className={MapStyles.popupMinimums}>
        {Object.values(TimeFrame).map(tf => (
          <div key={tf}>
            {tf}: <span>{minimumToString(c.minimums[tf])}</span>
          </div>
        ))}
      </div>
      <div className={MapStyles.lastUpdated}>
        <b>Last Updated: {c.updated}</b>
      </div>
      <br/>
      <div className={MapStyles.extras}>
        {Object.keys(c.extras).map(key => (
          <div key={key}>
            <b>{key}: </b> {c.extras[key]}
          </div>
        ))}
      </div>
    </Popup>
  );
}

const minimumToString = (minimum: Minimum): string => {
  if (!minimum) {
    return "Unknown";
  }

  if (minimum.high === null) {
    return "$" + minimum.low.toString();
  } else {
    return "$" + minimum.low.toString() + "-$" + minimum.high.toString()
  }
}
