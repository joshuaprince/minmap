import React from "react";
import { Casino, Minimum, TimeFrame } from "../interface/casino";
import { Popup } from "react-leaflet";

type CasinoPopupProps = {
  casino: Casino
}

export const CasinoPopup: React.FC<CasinoPopupProps> = (props) => {
  const c = props.casino;
  return (
    <Popup>
      <h2>{c.name}</h2>
      <div>
        {Object.values(TimeFrame).map(tf => (
          <div key={tf}>
            {tf}: <span>{minimumToString(c.minimums[tf])}</span>
          </div>
        ))}
      </div>
    </Popup>
  );
}

const minimumToString = (minimum: Minimum): string => {
  if (minimum === null) {
    return "Unknown";
  }

  if (minimum.high === null) {
    return "$" + minimum.low.toString();
  } else {
    return "$" + minimum.low.toString() + "-$" + minimum.high.toString()
  }
}
