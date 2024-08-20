import _ from "lodash";

export const toCase = (string, _case = "normal") => {
  if (typeof string !== "string") return string;
  string = string.trim();
  switch (_case) {
    case "upper":
      string = string.toUpperCase();
      break;
    case "lower":
      string = string.toLowerCase();
      break;
    default:
      break;
  }
  return string;
};

export const split = (string, options) => {
  let { delimiter, toCase: _toCase, filterBlank } = { ...options };
  delimiter = typeof delimiter === "string" ? delimiter : ",";
  _toCase = _toCase || "normal";
  filterBlank = typeof filterBlank === "boolean" ? filterBlank : true;
  return (
    typeof string !== "string" && ![undefined, null].includes(string)
      ? [string]
      : (typeof string === "string" ? string : "")
          .split(delimiter)
          .map((s) => toCase(s, _toCase))
  ).filter((s) => !filterBlank || s);
};

export const toArray = (x, options) => {
  let { delimiter, toCase: _toCase, filterBlank } = { ...options };
  delimiter = typeof delimiter === "string" ? delimiter : ",";
  _toCase = _toCase || "normal";
  filterBlank = typeof filterBlank === "boolean" ? filterBlank : true;
  if (Array.isArray(x))
    return x
      .map((_x) => toCase(_x, _toCase))
      .filter((_x) => !filterBlank || _x);
  return split(x, { delimiter, toCase: _toCase, filterBlank });
};
