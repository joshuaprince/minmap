import React from "react";
import classNames from "classnames";
import { CircleMarker, MapContainer, TileLayer } from "react-leaflet";

import { Casino, TimeFrame } from "../interface/casino";
import { CasinoPopup } from "./casinopopup";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import L from "leaflet";
import "leaflet-defaulticon-compatibility";
import MapStyles from "../styles/Map.module.scss";

type MapProps = {
  setMap: (map: L.Map) => void
  casinos: Casino[]
  selectedTimeframe: TimeFrame
  sidebarShown: boolean
  setOpenPopupCb: (fn: (casino: Casino) => void) => void  /* good luck */
}

export class LeafletMap extends React.Component<MapProps> {
  markerMap = new Map<Casino, L.CircleMarker | null>();

  openPopup(casino: Casino) {
    this.markerMap.get(casino)?.openPopup();
  }

  componentDidMount() {
    this.props.setOpenPopupCb(this.openPopup.bind(this))
  }

  componentDidUpdate() {
    for (const casino of this.markerMap.keys()) {
      const mkr = this.markerMap.get(casino);
      mkr?.setStyle({color: getCircleMarkerColor(casino, this.props.selectedTimeframe)})
    }
  }

  render() {
    return (
      <div className={classNames(MapStyles.mapDiv, {[MapStyles.sidebarShown]: this.props.sidebarShown})}>
        <MapContainer
          preferCanvas={true}
          whenCreated={this.props.setMap}
          className={MapStyles.minmapContainer}
          center={[36.11095, -115.17285]}
          zoom={13}
        >
          <TileLayer
            detectRetina={true}
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {this.props.casinos.map((c, i) => {
            if (!c.coords) {
              console.warn("Missing coordinates for " + c.name);
              return <React.Fragment key={"missingcoord" + c.name + i} />;
            }

            return (
              <CircleMarker
                ref={r => (this.markerMap.set(c, r))}
                weight={6}
                fillOpacity={0.5}
                color={getCircleMarkerColor(c, this.props.selectedTimeframe)}
                // icon={getStandardMarkerIcon(c, props.selectedTimeframe)}
                key={c.coords.toString() + i}
                center={c.coords}
                radius={10}
              >
                <CasinoPopup casino={c} selectedTimeframe={this.props.selectedTimeframe} />
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>
    );
  }
}

const getCircleMarkerColor = (casino: Casino, timeframe: TimeFrame) => {
  const mins = casino.minimums[timeframe];
  let color: string;

  if (!mins) {
    color = "#888888";
  } else if (mins.low < 5) {
    color = "#ffffff";
  } else if (mins.low < 10) {
    color = "#ff0000";
  } else if (mins.low < 15) {
    color = "#3333ff";
  } else if (mins.low < 20) {
    color = "#aa00ff";
  } else if (mins.low < 25) {
    color = "#ffff00";
  } else if (mins.low < 50) {
    color = "#00ff00";
  } else {
    color = "#ff6600";
  }

  return color;
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
