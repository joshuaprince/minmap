import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet-defaulticon-compatibility";

import React from "react";

import classNames from "classnames";
import L from "leaflet";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import Control from "react-leaflet-custom-control";

import { faLocationCrosshairs } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  Casino,
  TimeFrame,
} from "../interface/casino";
import MapStyles from "../styles/Map.module.scss";
import { CasinoPopup } from "./casinopopup";
import {
  casinoToMin,
  getCircleMarkerColor,
} from "./colors";
import { ColorScheme } from "./colorSchemeRadioButtons";

type MapProps = {
  mapRef: React.RefObject<L.Map>
  casinos: Casino[]
  selectedTimeframe: TimeFrame
  selectedColorScheme: ColorScheme
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
      mkr?.setStyle({
        color: getCircleMarkerColor(casinoToMin(casino, this.props.selectedTimeframe), this.props.selectedColorScheme)
      })
    }
  }

  render() {
    return (
      <div className={classNames(MapStyles.mapDiv, {[MapStyles.sidebarShown]: this.props.sidebarShown})}>
        <MapContainer
          preferCanvas={true}
          ref={this.props.mapRef}
          className={MapStyles.minmapContainer}
          center={[36.11095, -115.17285]}
          zoom={13}
        >
          <Events map={this.props}/>
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
                weight={4}
                fillOpacity={0.5}
                color={getCircleMarkerColor(casinoToMin(c, this.props.selectedTimeframe), this.props.selectedColorScheme)}
                // icon={getStandardMarkerIcon(c, props.selectedTimeframe)}
                key={c.coords.toString() + i}
                center={c.coords}
                radius={10}
              >
                <CasinoPopup casino={c} selectedTimeframe={this.props.selectedTimeframe} />
              </CircleMarker>
            )
          })}
          <Control position="bottomleft" container={{ className: classNames("leaflet-bar", "leaflet-control") }}>
            <a color="inherit" role="button" className={classNames(MapStyles.locationButton)} onClick={() => this.props.mapRef?.current?.locate()}>
              <FontAwesomeIcon className={MapStyles.locationIcon} icon={faLocationCrosshairs}/>
            </a>
          </Control>
        </MapContainer>
      </div>
    );
  }
}

function Events(props: {map: MapProps}) {
  useMapEvents({
    locationfound(e) {
      props.map.mapRef?.current?.flyTo(e.latlng, 10, {duration: 1})
    },
    locationerror(e) {
      // props.map.mapRef?.current?.flyTo(new L.LatLng(40, -75), 10, {duration: 1})
      alert("Couldn't locate you: " + e.message)
    }
  });
  return null;
}

export default LeafletMap;
