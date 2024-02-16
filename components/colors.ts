import interpolate from "color-interpolate";
import type L from "leaflet";

import {
  Casino,
  TimeFrame,
} from "../interface/casino";
import MapStyles from "../styles/Map.module.scss";
import { ColorScheme } from "./colorSchemeRadioButtons";

export const casinoToMin = (casino: Casino, timeframe: TimeFrame) => {
  const mins = casino.minimums[timeframe];
  if (mins && mins.low) {
    return mins.low;
  } else {
    return null;
  }
}

export const getCircleMarkerColor = (value: number | null, scheme: ColorScheme) => {
  let color: string;

  if (!value) {
    return "#888888";
  }

  switch (scheme) {
    case ColorScheme.GRADIENT:
      const colormap = interpolate(["#39ff00", "#045200"]);
      color = colormap(Math.log10(value) - 0.5);
      break;

    case ColorScheme.CHIP_COLOR:
    default:
      if (value < 10) {
        color = "#ff0000";
      } else if (value < 15) {
        color = "#3333ff";
      } else if (value < 20) {
        color = "#aa00ff";
      } else if (value < 25) {
        color = "#ffd500";
      } else if (value < 50) {
        color = "#00ff00";
      } else {
        color = "#ff6600";
      }
      break;
  }

  return color;
}

const markerIconCache = new Map<string, L.Icon.Default>();
export const getStandardMarkerIcon = (casino: Casino, timeframe: TimeFrame) => {
  const STYLED_VALUES = [5, 10, 15, 20, 25];
  const mins = casino.minimums[timeframe];
  let className: string;

  if (!mins) {
    className = MapStyles["minbet-unknown"];
  } else if (mins.low < STYLED_VALUES[0]) {
    className = MapStyles["minbet-low"];
  } else {
    className = MapStyles["minbet-high"];  // fallback
    for (const styledVal of STYLED_VALUES) {
      if (mins.low <= styledVal) {
        className = MapStyles["minbet-" + mins.low];
        break;
      }
    }
  }

  const cacheEntry = markerIconCache.get(className);
  if (cacheEntry) {
    return cacheEntry;
  } else {
    // const newIcon = new L.Icon.Default({
    //   className: className
    // });
    // markerIconCache.set(className, newIcon);
    // return newIcon;
  }
}

export const getChipMarkerIcon = (casino: Casino, timeframe: TimeFrame) => {
  const STYLED_VALUES = [5, 10, 15, 20, 25];
  const mins = casino.minimums[timeframe];
  let chipName: string;

  if (!mins || !mins.low) {
    chipName = "unknown";
  } else if (mins.low < STYLED_VALUES[0]) {
    chipName = "low";
  } else {
    chipName = "high";  // fallback
    for (const styledVal of STYLED_VALUES) {
      if (mins.low <= styledVal) {
        chipName = styledVal.toString();
        break;
      }
    }
  }

  const cacheName = "chip" + chipName;
  const cacheEntry = markerIconCache.get(cacheName);
  if (cacheEntry) {
    return cacheEntry;
  } else {
    // const newIcon = new L.Icon({
    //   iconUrl: "/chip/" + chipName + ".svg",
    //   iconAnchor: undefined,  // center?,
    //   iconSize: [48, 48]
    // });
    // markerIconCache.set(cacheName, newIcon);
    // return newIcon;
  }
}
