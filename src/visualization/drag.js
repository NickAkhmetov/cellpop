import * as d3 from "d3";

import { reorderArray } from "./util";


// Drag start function
export function dragstarted(event, d, element) {
    const rects = d3.selectAll(".heatmap-rects");

    // Set dragged elements to active
    d3.select(element).raise().classed("active", true);
    rects.filter(r => r.row === d.row).raise().classed("active", true);
}


// Dragging function
export function dragged(event, d, element, data, y) {
    const rects = d3.selectAll(".heatmap-rects");
    const rowsBehind = d3.selectAll(".heatmap-rows");

    // Let the selected row and rects on that row move with the cursor
    d3.select(element).attr("y", d.y = event.y);
    rects.filter(r => r.row === d.row).attr("y", d.y = event.y)

    // Calculate the current index of the dragged row
    let currentIndex = data.rowNames.indexOf(d.row);
    
    // Calculate the new index based on the y-coordinate of the drag event
    let newIndex = data.rowNames.length - 1 - Math.floor(event.y / y.bandwidth());

    // If row goes beyond boundaries, set it to the first/last item
    if (newIndex < 0) {
        newIndex = 0;
    }
    if (newIndex >= data.rowNames.length) {
        newIndex = data.rowNames.length - 1
    }

    // If row stays at the same place, return
    if (newIndex === currentIndex) {
        return data;
    }

    // Calculate the displacement of the dragged row
    let displacement = newIndex - currentIndex;

    // For each row, calculate the new y position
    rowsBehind.each(function(rowName) {
        let rowIndex = data.rowNames.indexOf(rowName.row);
        // Get the rows that are affected (between the currentIndex and newIndex)
        if (rowIndex !== currentIndex && rowIndex >= Math.min(currentIndex, newIndex) && rowIndex <= Math.max(currentIndex, newIndex)) {
            // Shift the row up or down depending on the direction of the moved row
            if (displacement > 0) {
                d3.select(this).attr("y", y(data.rowNames[rowIndex - 1]));
                rects.filter(r => r.row === rowName.row).attr("y", y(data.rowNames[rowIndex - 1]));
            } else {
                d3.select(this).attr("y", y(data.rowNames[rowIndex + 1]));
                rects.filter(r => r.row === rowName.row).attr("y", y(data.rowNames[rowIndex + 1]));
            }
        }
    })

    // Update the ordering of rowNames
    data.rowNames = reorderArray(data.rowNames, currentIndex, newIndex);
    data.rowNamesWrapped = reorderArray(data.rowNamesWrapped, currentIndex, newIndex);
    data.counts = reorderArray(data.counts, currentIndex, newIndex);

    return data;
}


// Drag end function
export function dragended(event, d, element, data, y) {
    const rects = d3.selectAll(".heatmap-rects");

    // Get the current index and set the y-coordinate of this row when drag ends
    let currentIndex = data.rowNames.indexOf(d.row);
    d3.select(element).attr("y", y(data.rowNames[currentIndex]));
    rects.filter(r => r.row === d.row).attr("y", y(data.rowNames[currentIndex]));

    // Set dragged elements to inactive
    d3.select(element).classed("active", false);
    rects.filter(r => r.row === d.row).raise().classed("active", false);
}