import dynamic from "next/dynamic";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import { getCasinoDataFromGoogleSheet } from "../data/spreadsheet";
import { TimeFrame } from "../interface/casino";
import React from "react";

type HomeState = {
  selectedTimeframe: TimeFrame
}

export default function Home({ casinos }: InferGetStaticPropsType<typeof getStaticProps>) {
  const Map = dynamic(
    () => import('../components/leafletMap'),
    { ssr: false }
  );

  const [state, setState] = React.useState<HomeState>({selectedTimeframe: TimeFrame.WEEKDAY});

  if (casinos !== undefined) {
    return (
      <Map selectedTimeframe={state.selectedTimeframe} casinos={casinos}/>
    )
  } else {
    return (
      <div>Loading...</div>
    )
  }
}

export const getStaticProps: GetStaticProps = async () => {
  const casinos = await getCasinoDataFromGoogleSheet();
  return {
    props: {
      casinos: casinos
    },
    // revalidate: 5000  // TODO
  }
}
