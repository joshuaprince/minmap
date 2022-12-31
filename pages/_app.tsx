import React from "react";
import Head from "next/head";
import type { AppProps } from 'next/app'
import Shynet from "next-shynet";
import { ChakraProvider } from "@chakra-ui/react"
import { init as initMatomo } from "@socialgouv/matomo-next";

import '../styles/globals.css'

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;
const SHYNET_URL = process.env.NEXT_PUBLIC_SHYNET_URL;

function MyApp({ Component, pageProps }: AppProps) {
  React.useEffect(() => {
    console.log(MATOMO_URL + "  " + MATOMO_SITE_ID)
    if (!MATOMO_URL || !MATOMO_SITE_ID) {
      console.warn("Matomo disabled.")
      return;
    }
    initMatomo({
      url: MATOMO_URL, siteId: MATOMO_SITE_ID
    });
  }, []);

  return (
    <>
      <Head>
        <title>Craps Minimum Map</title>
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon.png"/>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
        <link rel="manifest" href="/site.webmanifest"/>
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5"/>
        <meta name="msapplication-TileColor" content="#da532c"/>
        <meta name="theme-color" content="#ffffff"/>
        <meta name="viewport"
              content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>
      </Head>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
      {SHYNET_URL && <Shynet scriptSrc={SHYNET_URL}/>}
    </>
  );
}
export default MyApp
