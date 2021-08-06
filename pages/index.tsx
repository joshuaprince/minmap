import dynamic from "next/dynamic";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import { Casino, TimeFrame } from "../interface/casino";
import React from "react";
import { Sidebar } from "../components/sidebar";
import { getCasinoDataFromJson } from "../data/json";
import { getCasinoDataFromGoogleSheet } from "../data/spreadsheet";

type HomeState = {
  selectedTimeframe: TimeFrame
}

const DynamicMap = dynamic(
  () => import('../components/leafletMap'),
  { ssr: false }
);

export default function Home({ casinos }: InferGetStaticPropsType<typeof getStaticProps>) {
  const [state, setState] = React.useState<HomeState>({selectedTimeframe: TimeFrame.WEEKDAY});

  let mapDiv;
  if (casinos !== undefined) {
    mapDiv = (
      <DynamicMap key={1} selectedTimeframe={state.selectedTimeframe} casinos={casinos}/>
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
        links={{
          spreadsheetComments: process.env.LINK_SPREADSHEET_COMMENTS!,
          spreadsheetDirect: process.env.LINK_SPREADSHEET_DIRECT!,
        }}
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

  return {
    props: {
      casinos: casinos
    },
    revalidate: revalidateTime
  }
}
