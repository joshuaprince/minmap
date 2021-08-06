import React from "react";
import dynamic from "next/dynamic";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import { Map as LeafletMap } from "leaflet";

import { Casino, TimeFrame } from "../interface/casino";
import { Sidebar } from "../components/sidebar";
import { getCasinoDataFromJson } from "../data/json";
import { getCasinoDataFromGoogleSheet } from "../data/spreadsheet";

type HomeState = {
  map?: LeafletMap
  selectedTimeframe: TimeFrame
}

const DynamicMap = dynamic(
  () => import("../components/leafletMap"),
  { ssr: false }
);

export default function Home({ casinos, updated }: InferGetStaticPropsType<typeof getStaticProps>) {
  const [state, setState] = React.useState<HomeState>({
    map: undefined,
    selectedTimeframe: TimeFrame.WEEKDAY,
  });

  let mapDiv;
  if (casinos !== undefined) {
    mapDiv = (
      <DynamicMap
        key={1}
        setMap={(m) => setState(s => ({...s, map: m}))}
        selectedTimeframe={state.selectedTimeframe}
        casinos={casinos}
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
        selectedTimeframe={state.selectedTimeframe}
        selectTimeframe={(t: TimeFrame) => setState(s => ({...s, selectedTimeframe: t}))}
        casinos={casinos}
        scrollTo={(c) => {
          state.map?.setView(c.coords!, 16);
          // TODO: Open a popup
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
