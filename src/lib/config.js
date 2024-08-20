import _ from "lodash";
import { toCase, toArray } from "./parser";
import { equalsIgnoreCase, removeDoubleQuote } from "./string";




export const getChainKey = (chain, chainsData, exact = false) => {
  let key;
  if (chain) {
    chain = toCase(removeDoubleQuote(chain), "lower");
    key = _.head(
      toArray(chainsData)
        .filter((d) => {
          const {
            id,
            chain_id,
            chain_name,
            maintainer_id,
            name,
            prefix_address,
            prefix_chain_ids,
            chain_type,
          } = { ...d };
          return (
            toArray([
              id,
              chain_type === "cosmos" && chain_id,
              chain_name,
              maintainer_id,
              name,
              !exact && prefix_address,
            ]).findIndex(
              (s) =>
                equalsIgnoreCase(s, chain) ||
                (!exact && chain_type !== "evm" && chain.startsWith(s))
            ) > -1 ||
            (!exact &&
              toArray(prefix_chain_ids).findIndex((p) => chain.startsWith(p)) >
                -1)
          );
        })
        .map((d) => d.id)
    );
    key = key || chain;
  }
  return key;
};

export const getChainData = (chain, chainsData, exact = true) =>
  chain &&
  toArray(chainsData).find(
    (d) => d.id === getChainKey(chain, chainsData, exact)
  );
