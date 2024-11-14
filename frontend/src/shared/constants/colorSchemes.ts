export const COLOR_SCHEMES = {
  green: {
    id: "green",
    backgroundColor: "rgba(185, 255, 102, 0.2)",
    borderColor: "rgb(185, 255, 102)",
    baseColor: "rgb(185, 255, 102)",
  },
  blue: {
    id: "blue",
    backgroundColor: "rgba(76, 201, 254, 0.2)",
    borderColor: "rgb(76, 201, 254)",
    baseColor: "rgb(76, 201, 254)",
  },
  red: {
    id: "red",
    backgroundColor: "rgba(255, 129, 129, 0.2)",
    borderColor: "rgb(255, 129, 129)",
    baseColor: "rgb(255, 129, 129)",
  },
  purple: {
    id: "purple",
    backgroundColor: "rgba(238, 113, 158, 0.2)",
    borderColor: "rgb(238, 113, 158)",
    baseColor: "rgb(238, 113, 158)",
  },
  yellow: {
    id: "yellow",
    backgroundColor: "rgba(255, 171, 1, 0.2)",
    borderColor: "rgb(255, 171, 1)",
    baseColor: "rgb(255, 171, 1)",
  },
  default: {
    id: "default",
    backgroundColor: "rgba(77, 255, 219, 0.2)",
    borderColor: "#4DFFDB",
    baseColor: "#4DFFDB",
  },
} as const;

export type ColorSchemeType = keyof typeof COLOR_SCHEMES;
