import dynamic from "next/dynamic";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import { TimeFrame } from "../interface/casino";
import React from "react";
import { Sidebar } from "../components/sidebar";
import { getCasinoDataFromJson } from "../data/json";

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
  // const casinos = await getCasinoDataFromGoogleSheet();
  const casinos = await getCasinoDataFromJson();
  return {
    props: {
      casinos: casinos
    },
    // revalidate: 5000  // TODO
  }
}
