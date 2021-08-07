import React from "react";
import dynamic from "next/dynamic";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import { Map as LeafletMap } from "leaflet";

import { Casino, TimeFrame } from "../interface/casino";
import { ColorScheme } from "../components/colorSchemeRadioButtons";
import { Sidebar } from "../components/sidebar";
import { getCasinoDataFromJson } from "../data/json";
import { getCasinoDataFromGoogleSheet } from "../data/spreadsheet";

type HomeState = {
  map?: LeafletMap
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
    map: undefined,
    selectedTimeframe: TimeFrame.WEEKDAY,
    selectedColorScheme: ColorScheme.CHIP_COLOR,
    sidebarOpen: true,
  });

  let mapDiv;
  if (casinos !== undefined) {
    mapDiv = (
      <DynamicMap
        key={1}
        setMap={(m) => setState(s => ({...s, map: m}))}
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
        setShown={(s) => {
          setState((st) => ({...st, sidebarOpen: s}));
          setTimeout(() => state.map?.invalidateSize(), 350);
        }}
        selectedTimeframe={state.selectedTimeframe}
        selectTimeframe={(t: TimeFrame) => setState(s => ({...s, selectedTimeframe: t}))}
        selectedColorScheme={state.selectedColorScheme}
        selectColorScheme={(c: ColorScheme) => setState(s => ({...s, selectedColorScheme: c}))}
        casinos={casinos}
        scrollTo={(c) => {
          state.map?.flyTo(c.coords!, 15, {duration: 0.5, easeLinearity: 1});
          if (state.openPopup) state.openPopup(c);
        }}
        links={{
          spreadsheetComments: process.env.LINK_SPREADSHEET_COMMENTS!,
          spreadsheetDirect: process.env.LINK_SPREADSHEET_DIRECT!,
        }}
        lastUpdateJson={updated}
      />
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const sheetIdMins = process.env.SHEET_ID_MINS;
  const sheetIdCoords = process.env.SHEET_ID_COORDINATES;
  const sheetsApiKey = process.env.SHEETS_API_KEY;

  let casinos: Casino[];
  if (!sheetIdMins || !sheetIdCoords || !sheetsApiKey) {
    console.warn("Missing environment variable for backing sheet:");
    console.log(
      "   SHEET_ID_MINS=" + !!sheetIdMins
      + " SHEET_ID_COORDS=" + !!sheetIdCoords
      + " SHEETS_API_KEY=" + !!sheetsApiKey
    );
    console.log("Falling back to static JSON data.");
    casinos = await getCasinoDataFromJson();
  } else {
    casinos = await getCasinoDataFromGoogleSheet(sheetIdMins, sheetIdCoords, sheetsApiKey);
    // console.log(JSON.stringify(casinos));
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
