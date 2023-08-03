import "../styles/globals.css";

import React from "react";

import Shynet from "next-shynet";
import type { AppProps } from "next/app";
import Head from "next/head";

import { ChakraProvider } from "@chakra-ui/react";

const SHYNET_URL = process.env.NEXT_PUBLIC_SHYNET_URL;

function MyApp({ Component, pageProps }: AppProps) {
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
