import dynamic from "next/dynamic";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import { getCasinoDataFromGoogleSheet } from "../data/spreadsheet";
import { TimeFrame } from "../interface/casino";

export default function Home({ casinos }: InferGetStaticPropsType<typeof getStaticProps>) {
  const Map = dynamic(
    () => import('../components/map'),
    { ssr: false }
  );
  if (casinos !== undefined) {
    return (
      <Map selectedTimeframe={TimeFrame.WEEKENDNIGHT} casinos={casinos}/>
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
