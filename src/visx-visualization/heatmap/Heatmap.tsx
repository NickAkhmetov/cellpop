import {
  horizontalListSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import React, { Ref, useMemo } from "react";
import {
  useColumnConfig,
  useRowConfig,
} from "../../contexts/AxisConfigContext";
import { useColumns, useRows } from "../../contexts/AxisOrderContext";
import { useCellPopTheme } from "../../contexts/CellPopThemeContext";
import { useData } from "../../contexts/DataContext";
import { useHeatmapDimensions } from "../../contexts/DimensionsContext";
import {
  useColorScale,
  useXScale,
  useYScale,
} from "../../contexts/ScaleContext";
import { useSelectedDimension } from "../../contexts/SelectedDimensionContext";
import { useSetTooltipData } from "../../contexts/TooltipDataContext";
import DragOverlayContainer from "./DragOverlay";

interface HeatmapArrayProps {
  dataKey: string;
  selectedDimension: "X" | "Y";
}

/**
 * Component which renders one row or column of the heatmap.
 * @param props.dataKey The key of the row or column to render.
 * @param props.selectedDimension The dimension to render (either X or Y).
 * @returns
 */
function HeatmapArray({ dataKey, selectedDimension }: HeatmapArrayProps) {
  // If selectedDimension is X, dataKey is a column key
  // If selectedDimension is Y, dataKey is a row key
  const { dataMap } = useData();
  const { scale: xScale } = useXScale();
  const { scale: yScale } = useYScale();
  const { scale: colors } = useColorScale();
  const { width, height } = useHeatmapDimensions();
  const [rows] = useRows();
  const [columns] = useColumns();
  const { label: rowLabel } = useRowConfig();
  const { label: columnLabel } = useColumnConfig();
  const { openTooltip } = useSetTooltipData();

  const items = selectedDimension === "X" ? rows : columns;
  const widthScale = selectedDimension === "X" ? xScale : yScale;
  const rowWidth = selectedDimension === "X" ? widthScale.bandwidth() : width;
  const rowHeight = selectedDimension === "X" ? height : widthScale.bandwidth();

  const strategy =
    selectedDimension === "X"
      ? verticalListSortingStrategy
      : horizontalListSortingStrategy;
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: dataKey,
    strategy,
  });

  const cellWidth = xScale.bandwidth();
  const cellHeight = yScale.bandwidth();
  const { theme } = useCellPopTheme();

  return (
    <g
      className="cellpop__heatmap-array"
      width={rowWidth}
      height={rowHeight}
      x={xScale(dataKey)}
      y={yScale(dataKey)}
      ref={setNodeRef as unknown as Ref<SVGGElement>}
      {...attributes}
      {...listeners}
    >
      {items.map((itemKey) => {
        const row = selectedDimension === "X" ? itemKey : dataKey;
        const column = selectedDimension === "X" ? dataKey : itemKey;
        const counts = dataMap[`${row}-${column}`];
        return (
          <rect
            key={`${row}-${column}`}
            x={xScale(column)}
            y={yScale(row)}
            width={cellWidth}
            height={cellHeight}
            fill={colors(counts)}
            onMouseOver={(e) => {
              openTooltip(
                {
                  title: `${row} - ${column}`,
                  data: {
                    "cell count": counts,
                    [rowLabel]: row,
                    [columnLabel]: column,
                  },
                },
                e.clientX,
                e.clientY,
              );
            }}
          />
        );
      })}
      <rect
        x={xScale(dataKey)}
        y={yScale(dataKey)}
        width={rowWidth}
        height={rowHeight}
        fill="transparent"
        style={{
          outline: isDragging ? `1px solid ${theme.text}` : "none",
          outlineOffset: isDragging ? "-1px" : "none",
          pointerEvents: "none",
        }}
      />
    </g>
  );
}

export default function Heatmap() {
  const { width, height } = useHeatmapDimensions();
  const { selectedDimension } = useSelectedDimension();
  const [rows, { setOrderedValues: setRows, setSortOrder: setRowOrder }] =
    useRows();
  const [
    columns,
    { setOrderedValues: setColumns, setSortOrder: setColumnOrder },
  ] = useColumns();

  const { closeTooltip } = useSetTooltipData();

  // Dynamically determine which dimension to use based on the selected dimension
  const { items, setItems, setSort } = useMemo(() => {
    const items = selectedDimension === "X" ? columns : rows;
    const setItems = selectedDimension === "X" ? setColumns : setRows;
    const setSort = selectedDimension === "X" ? setColumnOrder : setRowOrder;
    return { items, setItems, setSort };
  }, [selectedDimension, columns, rows]);

  const { theme } = useCellPopTheme();

  return (
    <svg
      width={width}
      height={height}
      className="heatmap"
      style={{ outline: `1px solid ${theme.text}` }}
      onMouseOut={closeTooltip}
    >
      <DragOverlayContainer items={items} setItems={setItems} setSort={setSort}>
        {items.map((key) => (
          <HeatmapArray
            key={key}
            dataKey={key}
            selectedDimension={selectedDimension}
          />
        ))}
      </DragOverlayContainer>
    </svg>
  );
}
