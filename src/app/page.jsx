"use client";
import React, { useEffect } from "react";
import Dashboard from "../components/Dashboard";
import { ThemeProvider, useTheme } from "next-themes";
import { useWeb3ModalTheme } from "@web3modal/wagmi/react";
// import { QueryClientProvider } from "@tanstack/react-query";
import WagmiConfigProvider from "../lib/provider/WagmiConfigProvider";

function ThemeWatcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const { setThemeMode } = useWeb3ModalTheme();

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    function onMediaChange() {
      const systemTheme = media.matches ? "dark" : "light";
      if (resolvedTheme === systemTheme) setTheme("system");
      setThemeMode(resolvedTheme);
    }

    onMediaChange();
    media.addEventListener("change", onMediaChange);
    return () => media.removeEventListener("change", onMediaChange);
  }, [resolvedTheme, setTheme, setThemeMode]);

  return null;
}

export default function Home() {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange>
      <ThemeWatcher />
      <WagmiConfigProvider>
        <main>
          <Dashboard />
        </main>
      </WagmiConfigProvider>
    </ThemeProvider>
  );
}
