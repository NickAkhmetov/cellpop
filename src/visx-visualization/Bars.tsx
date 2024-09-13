import { ScaleBand, ScaleLinear } from "d3";
import React from "react";
import { useCellPopTheme } from "../contexts/CellPopThemeContext";
import { useSetTooltipData } from "../contexts/TooltipDataContext";

interface BarsProps {
  orientation: "horizontal" | "vertical";
  categoricalScale: ScaleBand<string>;
  numericalScale: ScaleLinear<number, number>;
  data: Record<string, number>;
  domainLimit: number;
}

export function Bars({
  orientation,
  categoricalScale,
  numericalScale,
  data,
  domainLimit,
}: BarsProps) {
  const entries = Object.entries(data);
  const barWidth = categoricalScale.bandwidth();
  const { theme } = useCellPopTheme();

  const { openTooltip, closeTooltip } = useSetTooltipData();
  const onMouse = (key: string) => (e: React.MouseEvent<SVGRectElement>) => {
    openTooltip(
      {
        title: key,
        data: {
          "Cell Count": data[key],
          [orientation === "vertical" ? "column" : "row"]: key,
        },
      },
      e.clientX,
      e.clientY,
    );
  };
  return (
    <>
      {entries.map(([key, value]) => {
        const scaledKey = categoricalScale(key);
        const scaledValue = numericalScale(value);
        const x =
          orientation === "vertical" ? scaledKey : domainLimit - scaledValue;
        const y =
          orientation === "vertical" ? domainLimit - scaledValue : scaledKey;
        const barHeight = scaledValue;
        const height = orientation === "vertical" ? barHeight : barWidth;
        const width = orientation === "vertical" ? barWidth : barHeight;
        return (
          <rect
            key={key}
            x={x}
            y={y}
            width={width}
            height={height}
            fill={theme.sideCharts}
            onMouseOver={onMouse(key)}
            onMouseMove={onMouse(key)}
            onMouseOut={closeTooltip}
          />
        );
      })}
    </>
  );
}
