import React from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";

import { Casino, TimeFrame } from "../interface/casino";
import { CasinoPopup } from "./casinopopup";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import L from "leaflet";
import "leaflet-defaulticon-compatibility";
import MapStyles from "../styles/Map.module.scss";

type MapProps = {
  casinos: Casino[]
  selectedTimeframe: TimeFrame
}

const Map: React.FC<MapProps> = (props) => {
  return (
    <MapContainer
      cont
      className={MapStyles.minmapContainer}
      center={[36.11095, -115.17285]}
      zoom={13}
    >
      <TileLayer
        detectRetina={true}
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {props.casinos.map( c => (
        <Marker
          icon={getMarkerIcon(c, props.selectedTimeframe)}
          key={c.coords.toString()}
          position={c.coords}
        >
          <CasinoPopup casino={c} />
        </Marker>
      ))}
    </MapContainer>
  );
}

const getMarkerIcon = (casino: Casino, timeframe: TimeFrame) => {
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

  return new L.Icon.Default({
    className: className
  });
}

export default Map;
