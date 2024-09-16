import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useEventCallback } from "@mui/material/utils";
import React, { ChangeEvent } from "react";
import { useData } from "./contexts/DataContext";

import { useCellPopTheme } from "./contexts/CellPopThemeContext";
import { useFraction } from "./contexts/FractionContext";
import { useMetadataField } from "./contexts/MetadataFieldContext";
import { useSelectedDimension } from "./contexts/SelectedDimensionContext";
import { getPossibleMetadataSelections } from "./visualization/metadata";

export default function CellPopConfig() {
  const { data } = useData();
  const { currentThemeName: theme, setTheme } = useCellPopTheme();
  const { fraction, setFraction } = useFraction();
  const { metadataField, setMetadataField } = useMetadataField();
  const { selectedDimension, setSelectedDimension } = useSelectedDimension();
  const metadataFields = getPossibleMetadataSelections(data);

  const undo = useEventCallback(() => {
    console.warn("Not yet implemented");
  });
  const changeTheme = useEventCallback((_, newTheme: "dark" | "light") => {
    if (newTheme) {
      setTheme(newTheme);
    }
  });

  const changeFraction = useEventCallback((_, newFraction: boolean) => {
    if (newFraction !== null) {
      setFraction(newFraction);
    }
  });

  const changeMetadataField = useEventCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setMetadataField(event.target.value);
    },
  );

  const changeSelectedDimension = useEventCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setSelectedDimension(
        (event.target as HTMLInputElement).value as "X" | "Y",
      );
    },
  );

  return (
    <Stack spacing={6} direction="row">
      <Button variant="outlined" onClick={undo}>
        Undo
      </Button>
      <ToggleButtonGroup
        color="primary"
        value={fraction}
        exclusive
        onChange={changeFraction}
        aria-label="Fraction"
      >
        <ToggleButton value={false}>Count</ToggleButton>
        <ToggleButton value={true}>Fraction</ToggleButton>
      </ToggleButtonGroup>
      <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel id="sort-by-metadata">Sort by metadata</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={metadataField}
          label="select-metadata"
          onChange={changeMetadataField}
        >
          <MenuItem value="None" key="None">
            None
          </MenuItem>
          {metadataFields.map((d) => {
            return (
              <MenuItem value={d[0]} key={d[0]}>
                {d[0]}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      <ToggleButtonGroup
        color="primary"
        value={theme}
        exclusive
        onChange={changeTheme}
        aria-label="Theme"
      >
        <ToggleButton value="light">Light</ToggleButton>
        <ToggleButton value="dark">Dark</ToggleButton>
      </ToggleButtonGroup>
      <ToggleButtonGroup
        color="primary"
        value={selectedDimension}
        exclusive
        onChange={changeSelectedDimension}
        aria-label="Axis"
      >
        <ToggleButton value="X">X</ToggleButton>
        <ToggleButton value="Y">Y</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}
