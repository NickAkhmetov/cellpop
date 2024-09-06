import { scaleBand, scaleLinear } from "@visx/scale";
import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getUpperBound } from "../visualization/util";

import { useOrderedArrayState } from "../hooks/useOrderedArray";
import { useSet } from "../hooks/useSet";
import { createContext, useContext } from "../utils/context";
import { useCellPopTheme } from "./CellPopThemeContext";
import { useData } from "./DataContext";
import { useDimensions } from "./DimensionsContext";

const SCALES = ["X", "Y", "Color"] as const;
type ScaleType = (typeof SCALES)[number];

type ScaleLinear<T> = ReturnType<typeof scaleLinear<T>>;
type ScaleBand<T> = ReturnType<typeof scaleBand<T>>;

interface DimensionScaleContext {
  scale: ScaleBand<string>;
  selectedValues: Set<string>;
  toggleSelection: (value: string) => void;
}

interface ColorScaleContext {
  scale: ScaleLinear<string>;
}

const [XScaleContext, YScaleContext] = SCALES.map((dimension: ScaleType) => {
  return createContext<DimensionScaleContext>(`${dimension}ScaleContext`);
});
const ColorScaleContext = createContext<ColorScaleContext>("ColorScaleContext");

export const useXScale = () => useContext(XScaleContext);
export const useYScale = () => useContext(YScaleContext);
export const useColorScale = () => useContext(ColorScaleContext);

export function ScaleProvider({ children }: PropsWithChildren) {
  const { data } = useData();
  const {
    dimensions: {
      heatmap: { width, height },
    },
  } = useDimensions();
  const {
    theme: { heatmapZero, heatmapMax },
  } = useCellPopTheme();

  const [columns, columnsActions] = useOrderedArrayState(data.colNames);
  const [rows, rowsActions] = useOrderedArrayState(data.rowNames);

  const selectedDimension = useState<"X" | "Y">("X");

  const x = useMemo(() => {
    return scaleBand<string>({
      range: [0, width],
      domain: columns,
      padding: 0.01,
    });
  }, [width, columns]);

  const y = useMemo(() => {
    return scaleBand<string>().range([height, 0]).domain(rows).padding(0.01);
  }, [height, rows]);

  const colors = useMemo(() => {
    return scaleLinear<string>({
      range: [heatmapZero, heatmapMax],
      domain: [0, getUpperBound(data.countsMatrix.map((r) => r.value))],
    });
  }, [data.countsMatrix, heatmapZero, heatmapMax]);

  const { set: selectedX, toggle: toggleX } = useSet<string>();
  const { set: selectedY, toggle: toggleY } = useSet<string>();

  const xScaleContext = useMemo(
    () => ({ scale: x, selectedValues: selectedX, toggleSelection: toggleX }),
    [x, selectedX, toggleX],
  );
  const yScaleContext = useMemo(
    () => ({ scale: y, selectedValues: selectedY, toggleSelection: toggleY }),
    [y, selectedY, toggleY],
  );
  const colorScaleContext = useMemo(() => ({ scale: colors }), [colors]);

  return (
    <XScaleContext.Provider value={xScaleContext}>
      <YScaleContext.Provider value={yScaleContext}>
        <ColorScaleContext.Provider value={colorScaleContext}>
          <SelectedDimensionContext.Provider value={selectedDimension}>
            {children}
          </SelectedDimensionContext.Provider>
        </ColorScaleContext.Provider>
      </YScaleContext.Provider>
    </XScaleContext.Provider>
  );
}
