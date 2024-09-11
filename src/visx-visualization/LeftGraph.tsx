import { AxisBottom } from "@visx/axis";
import { max } from "d3";
import React from "react";
import { useData } from "../contexts/DataContext";
import { useDimensions } from "../contexts/DimensionsContext";
import { useFraction } from "../contexts/FractionContext";
import { useYScale } from "../contexts/ScaleContext";
import { Bars } from "./Bars";
import { useCountsScale } from "./hooks";
import Violins from "./Violin";

function LeftBar() {
  const {
    dimensions: {
      barLeft: { width, height, margin, offsetHeight, offsetWidth },
    },
  } = useDimensions();
  const { rowCounts } = useData();
  // Use same y scale as the heatmap
  const { scale: yScale } = useYScale();
  const xScale = useCountsScale(
    [0, max(Object.values(rowCounts)) || 0],
    [0, width],
  );

  const axisScale = xScale.copy().range([width, 0]);

  return (
    <g
      className="barleft"
      transform={`translate(${-margin.left},${-margin.top})`}
    >
      <Bars
        orientation="horizontal"
        categoricalScale={yScale}
        numericalScale={xScale}
        data={rowCounts}
        domainLimit={width}
        xOffset={margin.left + offsetWidth}
        yOffset={margin.top + offsetHeight}
      />
      <AxisBottom
        scale={axisScale}
        top={height}
        left={0}
        orientation="bottom"
      />
    </g>
  );
}

function LeftViolin() {
  return <Violins side="left" />;
}

export default function LeftGraph() {
  const {
    dimensions: {
      barLeft: { offsetHeight, offsetWidth, height, width, margin },
    },
  } = useDimensions();

  const { fraction } = useFraction();

  return (
    <g
      className="left-graph-container"
      transform={`translate(${offsetWidth + margin.left}, ${offsetHeight + margin.top})`}
      height={height}
      width={width}
    >
      {fraction ? <LeftViolin /> : <LeftBar />}
    </g>
  );
}
