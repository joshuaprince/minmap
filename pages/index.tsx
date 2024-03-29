import React from "react";

import { Map as LeafletMap } from "leaflet";
import {
  GetStaticProps,
  InferGetStaticPropsType,
} from "next";
import dynamic from "next/dynamic";

import { ColorScheme } from "../components/colorSchemeRadioButtons";
import {
  Sidebar,
  SidebarToggleMethod,
} from "../components/sidebar";
import { getCasinoDataFromJson } from "../data/json";
import { getCasinoDataFromGoogleSheet } from "../data/spreadsheet";
import {
  Casino,
  TimeFrame,
} from "../interface/casino";

type HomeState = {
  selectedTimeframe: TimeFrame
  selectedColorScheme: ColorScheme
  sidebarOpen: boolean
  openPopup?: (casino: Casino) => void
}

const DynamicMap = dynamic(
  () => import("../components/leafletMap"),
  { ssr: false }
);

export default function Home({ casinos, updated }: InferGetStaticPropsType<typeof getStaticProps>) {
  const [state, setState] = React.useState<HomeState>({
    selectedTimeframe: TimeFrame.WEEKDAY,
    selectedColorScheme: ColorScheme.CHIP_COLOR,
    sidebarOpen: true,
  });

  const mapRef = React.useRef<LeafletMap>(null);

  const setSidebarShown = (shown: boolean, method: SidebarToggleMethod) => {
    setState((st) => ({...st, sidebarOpen: shown}));
    setTimeout(() => mapRef.current?.invalidateSize(), 350);
  }

  const setTimeframe = (t: TimeFrame) => {
    setState(s => ({...s, selectedTimeframe: t}));
  }

  const setColorScheme = (c: ColorScheme) => {
    setState(s => ({...s, selectedColorScheme: c}));
  }

  let mapDiv;
  if (casinos !== undefined) {
    mapDiv = (
      <DynamicMap
        key={1}
        mapRef={mapRef}
        selectedTimeframe={state.selectedTimeframe}
        selectedColorScheme={state.selectedColorScheme}
        casinos={casinos}
        sidebarShown={state.sidebarOpen}
        setOpenPopupCb={(o) => setState(s => ({...s, openPopup: o}))}
      />
    )
  } else {
    mapDiv = (
      <div>Loading...</div>
    )
  }

  return (
    <>
      {mapDiv}
      <Sidebar
        shown={state.sidebarOpen}
        setShown={setSidebarShown}
        selectedTimeframe={state.selectedTimeframe}
        selectTimeframe={setTimeframe}
        selectedColorScheme={state.selectedColorScheme}
        selectColorScheme={setColorScheme}
        casinos={casinos.filter((c: Casino) => c.coords)}
        scrollTo={(c) => {
          if (!c.coords) {
            alert("Coordinates are missing from the spreadsheet for " + c.name + ".");
            return;
          }
          mapRef.current?.flyTo(c.coords, 15, {duration: 0.5, easeLinearity: 1});
          if (state.openPopup) state.openPopup(c);
        }}
        links={{
          spreadsheetComments: process.env.LINK_SPREADSHEET_COMMENTS!,
          spreadsheetDirect: process.env.LINK_SPREADSHEET_DIRECT!,
        }}
        lastUpdateJsonUtc={updated}
      />
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const sheetIdMins = process.env.SHEET_ID_MINS;
  const sheetsApiKey = process.env.SHEETS_API_KEY;
  const ignoredSheets = process.env.IGNORED_SHEETS?.split(";");

  let casinos: Casino[];
  if (!sheetIdMins || !sheetsApiKey) {
    console.warn("Missing environment variable for backing sheet:");
    console.log(
      "   SHEET_ID_MINS=" + !!sheetIdMins
      + " SHEETS_API_KEY=" + !!sheetsApiKey
    );
    console.log("Falling back to static JSON data.");
    casinos = await getCasinoDataFromJson();
  } else {
    casinos = await getCasinoDataFromGoogleSheet(sheetIdMins, sheetsApiKey, ignoredSheets);
    // await dumpCasinoDataToJson(casinos);
  }

  const revalidateTime = parseInt(process.env.REVALIDATE_TIME || "") || undefined
  console.log("Revalidation time: " + revalidateTime);

  const updatedTime = new Date().toJSON();
  console.log("Updated: " + updatedTime)

  return {
    props: {
      casinos: casinos,
      updated: updatedTime,
    },
    revalidate: revalidateTime
  }
}
