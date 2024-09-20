import React from "react";

import { useColumnConfig } from "../../contexts/AxisConfigContext";
import { useColumns } from "../../contexts/AxisOrderContext";
import { usePanelDimensions } from "../../contexts/DimensionsContext";
import { AxisButtons } from "../heatmap/AxisButtons";
import HeatmapXAxis from "../heatmap/HeatmapXAxis";
import VisualizationPanel, { VisualizationPanelProps } from "./Panel";

export default function BottomCenterPanel({ id }: VisualizationPanelProps) {
  const [, { setSortOrder }] = useColumns();
  const { flipAxisPosition } = useColumnConfig();
  const { width, height } = usePanelDimensions("center_bottom");
  return (
    <VisualizationPanel id={id}>
      {!flipAxisPosition && (
        <svg width={width} height={height}>
          <HeatmapXAxis />
        </svg>
      )}
      <AxisButtons axis="X" setSortOrder={setSortOrder} />
    </VisualizationPanel>
  );
}
