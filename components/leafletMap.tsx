import React from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";

import { Casino, TimeFrame } from "../interface/casino";
import { CasinoPopup } from "./casinopopup";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import L from "leaflet";
import "leaflet-defaulticon-compatibility";
import MapStyles from "../styles/Map.module.scss";
import { Sidebar } from "./sidebar";

type MapProps = {
  casinos: Casino[]
  selectedTimeframe: TimeFrame
}

const LeafletMap: React.FC<MapProps> = (props) => {
  return (
    <MapContainer
      className={MapStyles.minmapContainer}
      center={[36.11095, -115.17285]}
      zoom={13}
    >
      <Sidebar selectedTimeframe={props.selectedTimeframe} selectTimeframe={() => {}}/>
      <TileLayer
        detectRetina={true}
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {props.casinos.map( (c, i) => {
        if (!c.coords) {
          console.warn("Missing coordinates for " + c.name);
          return <React.Fragment key={"missingcoord" + c.name + i}/>;
        } else return (
          <Marker
            icon={getStandardMarkerIcon(c, props.selectedTimeframe)}
            key={c.coords.toString() + i}
            position={c.coords}
          >
            <CasinoPopup casino={c} />
          </Marker>
        )})}
    </MapContainer>
  );
}

const markerIconCache = new Map<string, L.Icon.Default>();
const getStandardMarkerIcon = (casino: Casino, timeframe: TimeFrame) => {
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
    const newIcon = new L.Icon.Default({
      className: className
    });
    markerIconCache.set(className, newIcon);
    return newIcon;
  }
}

const getChipMarkerIcon = (casino: Casino, timeframe: TimeFrame) => {
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
    const newIcon = new L.Icon({
      iconUrl: "/chip/" + chipName + ".svg",
      iconAnchor: undefined,  // center?,
      iconSize: [48, 48]
    });
    markerIconCache.set(cacheName, newIcon);
    return newIcon;
  }
}

export default LeafletMap;
