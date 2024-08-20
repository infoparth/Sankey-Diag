"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { ResponsiveSankey } from "@nivo/sankey";
import clsx from "clsx";
import _ from "lodash";

import { Spinner } from "./Spinner";
import { Number } from "./Number";

import { getChainData } from "../lib/config";
import { toArray } from "../lib/parser";
import { headString, lastString } from "../lib/string";
import { isNumber, numberFormat } from "../lib/number";
import { chainData } from "../constants/ChainData";

export function SankeyChart({
  i,
  data,
  topN = 25,
  totalValue,
  field = "num_txs",
  title = "",
  description = "",
  valueFormat = "0,0",
  valuePrefix = "",
  noBorder = false,
  className = "",
}) {
  const [x, setX] = useState(null);
  const { resolvedTheme } = useTheme();

  const chains = chainData;

  const d = toArray(data).find((d) => d.key === x);
  const value = d ? d[field] : data ? totalValue || _.sumBy(data, field) : null;
  const keyString = d ? d.key : data ? null : null;
  const chartData = _.slice(
    _.orderBy(
      toArray(data).map((d) => ({
        source: headString(d.key, "_"),
        target: lastString(d.key, "_"),
        value: parseInt(d[field]),
      })),
      ["value"],
      ["desc"]
    ),
    0,
    topN
  ).map((d) => ({
    ...d,
    source: getChainData(d.source, chains)?.name || d.source,
    target: `${getChainData(d.target, chains)?.name || d.target} `,
  }));

  console.log("The chart data is: ", chartData);

  return (
    <div
      className={clsx(
        "flex flex-col gap-y-2 border-zinc-200 dark:border-zinc-700",
        i % 2 !== 0 ? "sm:border-l-0" : "",
        !noBorder
          ? "border-l border-r border-t px-4 py-8 sm:px-6 xl:px-8"
          : "w-full"
      )}
    >
      <div className="flex items-start justify-between gap-x-4">
        <div className="flex flex-col gap-y-0.5">
          <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </span>
          {description && (
            <span className="hidden text-sm font-normal text-zinc-400 dark:text-zinc-500 lg:block">
              {description}
            </span>
          )}
        </div>
        {isNumber(value) && (
          <div className="flex flex-col items-end gap-y-0.5">
            <Number
              value={value}
              format={valueFormat}
              prefix={valuePrefix}
              noTooltip={true}
              className="!text-base font-semibold text-zinc-900 dark:text-zinc-100"
            />
            <span className="whitespace-nowrap text-right text-sm text-zinc-400 dark:text-zinc-500">
              {keyString}
            </span>
          </div>
        )}
      </div>
      <div className="-mb-2.5 h-full w-full">
        {!data ? (
          <div className="flex h-full w-full items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="h-[550px] w-full font-semibold bg-transparent">
            {chartData.length > 0 && (
              <ResponsiveSankey
                data={{
                  nodes: _.uniq(
                    chartData.flatMap((d) => [d.source, d.target])
                  ).map((d) => ({
                    id: d,
                    nodeColor: getChainData(d.trim(), chains)?.color,
                  })),
                  links: chartData,
                }}
                valueFormat={`>-${valuePrefix},`}
                margin={{ top: 10, bottom: 10 }}
                theme={{
                  tooltip: {
                    container: {
                      background:
                        resolvedTheme === "dark" ? "#18181b" : "#f4f4f5",
                      color: resolvedTheme === "dark" ? "#f4f4f5" : "#18181b",
                      fontSize: 12,
                      fontWeight: 400,
                    },
                  },
                }}
                colors={(d) => d.nodeColor}
                nodeOpacity={1}
                nodeHoverOpacity={1}
                nodeHoverOthersOpacity={0.35}
                nodeBorderWidth={0}
                nodeBorderRadius={3}
                linkOpacity={resolvedTheme === "dark" ? 0.2 : 0.4}
                linkHoverOpacity={resolvedTheme === "dark" ? 0.7 : 0.9}
                linkHoverOthersOpacity={resolvedTheme === "dark" ? 0.1 : 0.2}
                linkBlendMode={resolvedTheme === "dark" ? "lighten" : "darken"}
                enableLinkGradient={true}
                labelTextColor={
                  resolvedTheme === "dark" ? "#f4f4f5" : "#18181b"
                }
                nodeTooltip={(d) => {
                  const { id, formattedValue, nodeColor } = { ...d.node };
                  return (
                    <div className="flex flex-col space-y-0.5 rounded-sm bg-zinc-100 px-2 py-1.5 text-xs shadow-sm dark:bg-black">
                      <div className="flex items-center space-x-2">
                        <div
                          className="h-3 w-3"
                          style={{ backgroundColor: nodeColor }}
                        />
                        <span className="font-bold">{id}</span>
                      </div>
                      <span>Total: {formattedValue}</span>
                    </div>
                  );
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
