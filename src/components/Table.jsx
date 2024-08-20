"use client";

import { TooltipComponent } from "./Tooltip";

// Demo JSON data
const demoData = {
  transactions: {
    total: 2334045,
    gmp: 1750000,
    transfer: 587580,
  },
  volume: {
    total: 9508807278,
    gmp: 2660000000,
    transfer: 6850000000,
  },
  averageVolume: {
    total: 4074,
    gmp: 1520,
    transfer: 11660,
  },
  gmpContracts: {
    total: 798,
    chains: 66,
  },
};

export default function Table({ data }) {
  // if (!data) return null;

  function abbreviateNumber(num) {
    if (num < 1000) return num.toString(); // Return as string if less than 1000

    const suffixes = ["", "k", "M", "B", "T"]; // Add more as needed
    const index = Math.floor(Math.log10(num) / 3); // Determine the suffix index
    const abbrNum = (num / Math.pow(1000, index)).toFixed(1); // Divide by the appropriate power of 1000

    return abbrNum + suffixes[index]; // Append the corresponding suffix
  }

  return (
    <div className="border-b lg:border-t border-b-zinc-200 dark:border-b-zinc-700 lg:border-t-zinc-200 lg:dark:border-t-zinc-700">
      <dl className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:px-2 xl:px-0">
        <div className="border-t lg:border-t-0 border-l border-r border-zinc-200 dark:border-zinc-700 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 px-4 sm:px-6 xl:px-8 py-8">
          <dt className="text-zinc-400 dark:text-zinc-500 text-sm font-medium leading-6">
            Transactions
          </dt>
          <dd className="w-full flex-none">
            <span className="flex justify-start text-zinc-900 dark:text-zinc-100 !text-3xl font-medium leading-10 tracking-tight">
              <TooltipComponent
                content={demoData.transactions.total.toLocaleString()}
              >
                {abbreviateNumber(demoData.transactions.total)}
              </TooltipComponent>
            </span>
          </dd>
          <dd className="w-full grid grid-cols-2 gap-x-2 mt-1">
            <span className="flex justify-start text-zinc-400 dark:text-zinc-500 text-xs">
              GMP:{" "}
              <TooltipComponent
                content={demoData.transactions.gmp.toLocaleString()}
              >
                {abbreviateNumber(demoData.transactions.gmp)}
              </TooltipComponent>
            </span>
            <span className="flex justify-start text-zinc-400 dark:text-zinc-500 text-xs">
              Transfer:{" "}
              <TooltipComponent
                content={demoData.transactions.transfer.toLocaleString()}
              >
                {abbreviateNumber(demoData.transactions.transfer)}
              </TooltipComponent>
            </span>
          </dd>
        </div>
        <div className="border-t lg:border-t-0 border-l sm:border-l-0 border-r border-zinc-200 dark:border-zinc-700 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 px-4 sm:px-6 xl:px-8 py-8">
          <dt className="text-zinc-400 dark:text-zinc-500 text-sm font-medium leading-6">
            Volume
          </dt>
          <dd className="w-full flex-none">
            <span className="flex justify-start text-zinc-900 dark:text-zinc-100 !text-3xl font-medium leading-10 tracking-tight">
              <TooltipComponent
                content={demoData.volume.total.toLocaleString()}
              >
                ${abbreviateNumber(demoData.volume.total)}
              </TooltipComponent>
            </span>
          </dd>
          <dd className="w-full grid grid-cols-2 gap-x-2 mt-1">
            <span className="flex justify-start text-zinc-400 dark:text-zinc-500 text-xs">
              GMP:{" "}
              <TooltipComponent content={demoData.volume.gmp.toLocaleString()}>
                ${abbreviateNumber(demoData.volume.gmp)}
              </TooltipComponent>
            </span>
            <span className="flex justify-start text-zinc-400 dark:text-zinc-500 text-xs">
              Transfer:{" "}
              <TooltipComponent
                content={demoData.volume.transfer.toLocaleString()}
              >
                ${abbreviateNumber(demoData.volume.transfer)}
              </TooltipComponent>
            </span>
          </dd>
        </div>
        <div className="border-t lg:border-t-0 border-l lg:border-l-0 border-r border-zinc-200 dark:border-zinc-700 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 px-4 sm:px-6 xl:px-8 py-8">
          <dt className="text-zinc-400 dark:text-zinc-500 text-sm font-medium leading-6">
            Average Volume / Transaction
          </dt>
          <dd className="w-full flex-none">
            <span className="flex justify-start text-zinc-900 dark:text-zinc-100 !text-3xl font-medium leading-10 tracking-tight">
              <TooltipComponent
                content={demoData.averageVolume.total.toLocaleString()}
              >
                ${abbreviateNumber(demoData.averageVolume.total)}
              </TooltipComponent>
            </span>
          </dd>
          <dd className="w-full grid grid-cols-2 gap-x-2 mt-1">
            <span className="flex justify-start text-zinc-400 dark:text-zinc-500 text-xs">
              GMP:{" "}
              <TooltipComponent
                content={demoData.averageVolume.gmp.toLocaleString()}
              >
                ${abbreviateNumber(demoData.averageVolume.gmp)}
              </TooltipComponent>
            </span>
            <span className="flex justify-start text-zinc-400 dark:text-zinc-500 text-xs">
              Transfer:{" "}
              <TooltipComponent
                content={demoData.averageVolume.transfer.toLocaleString()}
              >
                ${abbreviateNumber(demoData.averageVolume.transfer)}
              </TooltipComponent>
            </span>
          </dd>
        </div>
        <div className="border-t lg:border-t-0 border-l sm:border-l-0 border-r border-zinc-200 dark:border-zinc-700 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 px-4 sm:px-6 xl:px-8 py-8">
          <dt className="text-zinc-400 dark:text-zinc-500 text-sm font-medium leading-6">
            GMP Contracts
          </dt>
          <dd className="w-full flex-none">
            <span className="flex justify-start text-zinc-900 dark:text-zinc-100 !text-3xl font-medium leading-10 tracking-tight">
              <TooltipComponent
                content={demoData.gmpContracts.total.toLocaleString()}
              >
                {abbreviateNumber(demoData.gmpContracts.total)}
              </TooltipComponent>
            </span>
          </dd>
          <dd className="w-full grid grid-cols-2 gap-x-2 mt-1">
            <span className="flex justify-start text-zinc-400 dark:text-zinc-500 text-xs">
              Number of chains:{" "}
              <TooltipComponent
                content={demoData.gmpContracts.chains.toLocaleString()}
              >
                {abbreviateNumber(demoData.gmpContracts.chains)}
              </TooltipComponent>
            </span>
          </dd>
        </div>
      </dl>
    </div>
  );
}
