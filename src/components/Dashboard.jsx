"use client";
import { useEffect, useState } from "react";
import clsx from "clsx";
import _ from "lodash";
import { PiRadioButtonFill } from "react-icons/pi";
import { Spinner } from "./Spinner";
import { ThemeToggle } from "./ThemeToggle";
import Table from "./Table";
import { SankeyChart } from "./Sankey";
import NetworkGraph from "./NetworkGraph";
import { getChainData } from "../lib/config";
import { toArray } from "../lib/parser";
import { toNumber } from "../lib/number";
import { _formattedData } from "../constants/FormatData";
import { _networkGraph } from "../constants/NetworkGraphData";
import { chainData } from "../constants/ChainData";
import EuclidLogo from "../components/icons/EuclidLogo";

const sankeyTabs = ["transactions", "volume"];

const demo = {
  transaction: "102565135",
  volume: "102565135",
  connectedChains: 35,
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [networkGraph, setNetworkGraph] = useState(null);
  const [chainFocus, setChainFocus] = useState(null);
  const [sankeyTab, setSankeyTab] = useState(sankeyTabs[0]);
  const chains = chainData;

  useEffect(() => {
    setData(_formattedData);
    setNetworkGraph(_networkGraph);
  }, []);

  const groupData = (data, by = "key") =>
    Object.entries(_.groupBy(toArray(data), by)).map(([k, v]) => ({
      key: _.head(v)?.key || k,
      num_txs: _.sumBy(v, "num_txs"),
      volume: _.sumBy(v, "volume"),
      chain: _.orderBy(
        toArray(
          _.uniq(
            toArray(
              by === "customKey" ? _.head(v)?.chain : v.map((d) => d.chain)
            )
          ).map((d) => getChainData(d, chains))
        ),
        ["i"],
        ["asc"]
      ).map((d) => d.id),
    }));

  const chainPairs = groupData(
    _.concat(
      toArray(data?.GMPStats?.messages).flatMap((m) =>
        toArray(m.sourceChains || m.source_chains).flatMap((s) =>
          toArray(s.destinationChains || s.destination_chains)
            .filter((d) => !chainFocus || [s.key, d.key].includes(chainFocus))
            .map((d) => ({
              key: `${s.key}_${d.key}`,
              num_txs: d.num_txs,
              volume: d.volume,
            }))
        )
      ),
      toArray(data?.transfersStats?.data)
        .filter(
          (d) =>
            !chainFocus ||
            [d.source_chain, d.destination_chain].includes(chainFocus)
        )
        .map((d) => ({
          key: `${d.source_chain}_${d.destination_chain}`,
          num_txs: d.num_txs,
          volume: d.volume,
        }))
    )
  );

  return (
    <>
      <main className="mx-auto max-w-7xl px-4">
        <div className="w-full flex justify-between m-5 p-5">
          <EuclidLogo  />
          <ThemeToggle className="h-[10px]" />
        </div>

        {!data ? (
          <Spinner />
        ) : (
          <div className="flex flex-col gap-y-8">
            <div className="flex flex-col gap-y-4">
              <div className="flex flex-col gap-y-4 sm:flex-row sm:items-center sm:justify-between sm:gap-x-4 sm:gap-y-0">
                <h2 className="text-2xl font-semibold dark:text-zinc-100">
                  Cross-Chain Activity
                </h2>
                {
                  <div className="flex w-fit items-center gap-x-1.5 bg-zinc-100 capitalize text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 rounded-xl font-display text-xs font-medium px-2.5 py-1">
                    <PiRadioButtonFill
                      size={18}
                      className="-ml-0.5 mt-0.5 text-green-600 dark:text-green-500"
                    />
                    <span className="text-lg font-normal">
                      Connected chains:{" "}
                      <span className="ml-0.5 text-2xl font-medium">
                        {demo?.connectedChains}
                      </span>
                    </span>
                  </div>
                }
              </div>

              <Table data={data} />
            </div>
            <div className="flex flex-col gap-y-4">
              <h2 className="text-2xl font-semibold dark:text-zinc-100">
                Network Graph
              </h2>
              <div className="grid gap-y-8 sm:justify-center lg:grid-cols-3 lg:justify-end lg:gap-x-4 lg:gap-y-0">
                <div className="lg:col-span-2">
                  <NetworkGraph
                    data={networkGraph}
                    hideTable={true}
                    setChainFocus={(chain) => setChainFocus(chain)}
                  />
                </div>
                <div className="flex max-w-xs sm:max-w-2xl sm:justify-center lg:max-w-none lg:justify-end">
                  <SankeyChart
                    data={chainPairs}
                    topN={40}
                    totalValue={
                      sankeyTab === "transactions"
                        ? toNumber(
                            _.sumBy(data.GMPStats?.messages, "num_txs")
                          ) + toNumber(data.transfersStats?.total)
                        : toNumber(data.GMPTotalVolume) +
                          toNumber(data.transfersTotalVolume)
                    }
                    field={sankeyTab === "transactions" ? "num_txs" : "volume"}
                    title={
                      <div className="flex max-w-xl flex-wrap items-center">
                        {sankeyTabs.map((d, i) => {
                          const selected = d === sankeyTab;
                          return (
                            <div
                              key={i}
                              onClick={() => setSankeyTab(d)}
                              className={clsx(
                                "flex min-w-max cursor-pointer items-center whitespace-nowrap font-medium capitalize",
                                selected
                                  ? "text-blue-600 dark:text-blue-500"
                                  : "text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300",
                                i > 0 ? "ml-4" : ""
                              )}
                            >
                              <span>{d}</span>
                            </div>
                          );
                        })}
                      </div>
                    }
                    valuePrefix={sankeyTab === "transactions" ? "" : "$"}
                    noBorder={true}
                    className="h-144"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
