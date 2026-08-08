import { lazy } from "react";

// Code-split the chart lib (react-native-gifted-charts + its SVG deps) out of the
// initial bundle for screens that don't render a chart.
export const LazyBarChart = lazy(() =>
  import("react-native-gifted-charts").then((mod) => ({ default: mod.BarChart }))
);
