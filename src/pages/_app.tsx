import { AppProps } from 'next/app';
import Head from 'next/head';
import { MantineProvider, ColorSchemeProvider, ColorScheme } from '@mantine/core';
import Shell from '@/components/AppShell/Shell';
import { RouteTransition } from '@/components/RouteTransition';
import { ModalsProvider } from '@mantine/modals';
import { NextPage } from 'next';
import { ReactElement, ReactNode, useState } from 'react';
import { useHotkeys, useLocalStorage } from '@mantine/hooks';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}
 
type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}
 
export default function App(props: AppProps) {
  const { Component, pageProps }: AppPropsWithLayout = props;
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'mantine-color-scheme',
    defaultValue: 'light',
    getInitialValueInEffect: true,
  });  
  
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  const getLayout = Component.getLayout || ((page: any) => page);
  
  return (
    <>
      <Head>
        <title>Page title</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>

      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            /** Put your mantine theme override here */
            colorScheme,
          }}
        >
          <ModalsProvider>
            <RouteTransition />
            <Shell>
              {getLayout(<Component {...pageProps} />)}
            </Shell>
          </ModalsProvider>
        </MantineProvider>
      </ColorSchemeProvider>

    </>
  );
}