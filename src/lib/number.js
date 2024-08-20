import _ from "lodash";
import { toCase, split } from "./parser";
import { isString } from "./string";
import numeral from "numeral";

export const isNumber = (
  number //
) =>
  (typeof number === "number" && !isNaN(number)) ||
  (isString(number) && number && !isNaN(split(number).join("")));

export const toNumber = (number) => (isNumber(number) ? Number(number) : 0); //

export const toFixed = (
  number = 0,
  decimals = 18 //
) => toNumber(number).toFixed(decimals);
export const numberFormat = (number, format, exact) => {
  //
  if (number === Infinity) return number.toString();

  let formattedNumber = numeral(number).format(
    format.includes(".000") && Math.abs(Number(number)) >= 1.01
      ? format.substring(0, format.indexOf(".") + (exact ? 7 : 3))
      : format === "0,0" && toNumber(number) < 1
      ? "0,0.00"
      : format
  );
  if (
    ["NaN", "e+", "e-", "t"].findIndex((s) => formattedNumber.includes(s)) > -1
  ) {
    formattedNumber = number.toString();

    if (formattedNumber.includes("e-")) formattedNumber = toDecimals(number);
    else if (formattedNumber.includes("e+")) {
      const [n, e] = formattedNumber.split("e+");

      if (toNumber(e) <= 72) {
        const fixedDecimals = 2;

        let _number = `${parseInt(
          toNumber(toFixed(n, fixedDecimals)) * Math.pow(10, fixedDecimals)
        )}${_.range(Number(e))
          .map((i) => "0")
          .join("")}`;
        _number = formatUnits(BigInt(_number), 16 + fixedDecimals);

        const _format = `0,0${
          _number >= 100000
            ? ".00a"
            : _number >= 100
            ? ""
            : _number >= 1
            ? ".00"
            : ".000000"
        }`;
        return toCase(`${numberFormat(_number, _format)}t`, "upper");
      } else return numeral(number).format("0,0e+0");
    } else
      return toCase(
        numeral(number).format(`0,0${number < 1 ? ".00" : ".0"}a`),
        "upper"
      );
  } else if (
    isNumber(number) &&
    ["a", "+"].findIndex((c) => format.includes(c)) < 0 &&
    toNumber(split(formattedNumber).join("")).toString() !==
      removeDecimals(split(formattedNumber).join(""))
  )
    formattedNumber = number.toString();

  let string = removeDecimals(formattedNumber);
  if (string.toLowerCase().endsWith("t") && split(string).length > 1)
    string = numeral(number).format("0,0e+0");
  if (["0.0", ""].includes(string)) string = "0";

  return toCase(string, "upper");
};

export const removeDecimals = (number) => {
  if (isNumber(number)) number = number.toString();
  if (!number) return "";
  if (number.includes("NaN")) return number.replace("NaN", "< 0.00000001");
  if (!(number.indexOf(".") > -1)) return number;

  let decimals = number.substring(number.indexOf(".") + 1);
  while (decimals.endsWith("0"))
    decimals = decimals.substring(0, decimals.length - 1);

  if (
    number.substring(0, number.indexOf(".")).length >= 7 &&
    decimals.length > 2 &&
    isNumber(`0.${decimals}`)
  ) {
    decimals = toFixed(`0.${decimals}`, 2);
    if (decimals.indexOf(".") > -1) {
      decimals = decimals.substring(decimals.indexOf(".") + 1);
      while (decimals.endsWith("0"))
        decimals = decimals.substring(0, decimals.length - 1);
    }
  }

  return `${number.substring(0, number.indexOf("."))}${
    decimals ? "." : ""
  }${decimals}`;
};
