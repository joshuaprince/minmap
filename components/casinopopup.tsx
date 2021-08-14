import React from "react";
import { Popup } from "react-leaflet";

import { Casino, Minimum, TimeFrame } from "../interface/casino";

import MapStyles from "../styles/Map.module.scss"
import classNames from "classnames";

type CasinoPopupProps = {
  casino: Casino
  selectedTimeframe: TimeFrame
}

export const CasinoPopup: React.FC<CasinoPopupProps> = (props) => {
  const c = props.casino;
  return (
    <Popup className={MapStyles.popup}>
      <h2>{c.name}</h2>
      <h3>{c.city}, {c.state}</h3>
      <div className={MapStyles.popupMinimums}>
        {Object.values(TimeFrame).map(tf => (
          <div
            key={tf}
            className={classNames(
              { [MapStyles.selectedTimeframe]: tf === props.selectedTimeframe }
            )}
          >
            {tf}: <span>{minimumToString(c.minimums[tf])}</span>
          </div>
        ))}
      </div>
      <div className={MapStyles.lastUpdated}>
        Last Updated: {c.updated}
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
