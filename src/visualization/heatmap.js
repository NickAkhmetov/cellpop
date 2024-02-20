import * as d3 from "d3";

import { createBarChart } from "./barExtensions";

export function renderHeatmap(svg, data, dimensions) {
	let width = dimensions.heatmap.width - dimensions.heatmap.margin.left - dimensions.heatmap.margin.right;
	let height = dimensions.heatmap.height - dimensions.heatmap.margin.top - dimensions.heatmap.margin.bottom;

	// Add x-axis
	let x = d3.scaleBand()
		.range([ 0, width ])
		.domain(data.colNames)
		.padding(0.01);

	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x))
		.selectAll("text")
		.attr("transform", "translate(-10,0)rotate(-45)")
		.style("text-anchor", "end");

	svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width / 2)
        .attr("y", height + dimensions.heatmap.margin.bottom - 10)
        .text("Cell type");


	// Add y-axis
	let y = d3.scaleBand()
		.range([ height, 0 ])
		.domain(data.rowNames)
		.padding(0.01);

	svg.append("g")
		.call(d3.axisRight(y))
		.attr("transform", "translate(" + width + ",0)")
		//.style("text-anchor", "end");

    svg.append("text")
		.attr("class", "y label")
		.attr("text-anchor", "end")
		.attr("x", -30)
		.attr("y", -200)
		.attr("dy", ".75em")
		.attr("transform", "rotate(-90)")
		.text("Samples");

	// Add color
	let colorRange = d3.scaleLinear()
		.range(["white", "#69b3a2"])
		.domain([0,2000])


		console.log(data)

	// Add rows and columns behind
	let colsBehind = svg.selectAll()
		.data(data.colNames, function(d) {return d;})
		.enter()
		.append("rect")
			.attr("x", function(d) { return x(d) })
			.attr("y", 0)
			.attr("width", x.bandwidth() )
			.attr("height", height )
			.style("fill", colorRange(0))

	let rowsBehind = svg.selectAll()
		.data(data.rowNames, function(d) {return d;})
		.enter()
		.append("rect")
			.attr("x", 0)
			.attr("y", function(d) { return y(d) })
			.attr("width", width )
			.attr("height", y.bandwidth() )
			.style("fill", colorRange(1000))


	// Read the data
	let rects = svg.selectAll()
		.data(data.countsMatrix, function(d) {return d.row+":"+d.col;})
		.enter()
		.append("rect")
			.attr("x", function(d) { return x(d.col) })
			.attr("y", function(d) { return y(d.row) })
			.attr("width", x.bandwidth() )
			.attr("height", y.bandwidth() )
			.style("fill", function(d) { return colorRange(d.value)} )

    // highlight
    svg.append("rect")
		.attr("class", "highlight")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", width)
		.attr("height", height)
		.attr("stroke", "black")
		.attr("fill", "none")
		.attr("pointer-events", "none")
		.attr("visibility", "hidden")


    // create a tooltip
    const tooltip = d3.select("#app")
		.append("div")
		.attr("class", "tooltip")
		.style("background-color", "#FFFFFF")
		.attr("opacity", 0)
		.style("border", "solid")
		.style("border-width", "1px")
		.style("border-radius", "5px")
		.style("padding", "5px")
		.attr("pointer-events", "none")
		// .attr("visibility", "hidden")
		.style("position", "absolute")


    const mouseover = function(event,d) {
        if (event.ctrlKey) {
			addTooltip(tooltip, event, d);
        } else {
        	addHighlight(event.target.y.animVal.value, event.target.height.animVal.value);
        }
    }
    const mouseleave = function(d) {
		removeTooltip(tooltip);
        removeHighlight();
    }

    rects.on("mouseover", mouseover);
	rowsBehind.on("mouseover", mouseover);
    rects.on("mouseleave", mouseleave);
	rowsBehind.on("mouseleave", mouseleave);


    function addHighlight(y, currHeight) {
        svg.selectAll(".highlight")
            .attr("visibility", "shown")
            .attr("y", y)
            .attr("height", currHeight)
    }

    function removeHighlight() {
        svg.selectAll(".highlight")
            .attr("visibility", "hidden")
    }


    function addTooltip(tooltip, event, d) {
		tooltip
			.html(`Row: ${d.row}<br>Column: ${d.col}<br>Value: ${d.value}`)
			.style("opacity", 0.8)
			.attr("visibility", "shown")
			.style("left", (event.x) + "px")
			.style("top", (event.y) + "px")
    }

    function removeTooltip(tooltip) {
		tooltip
			.html(``)
			.style("opacity", 0)
    }

	function createBarExtension(d) {
		let target = d.target.__data__;
		if (d.target.__data__.row) {
			target = d.target.__data__.row
		}
		if (d3.selectAll(".bar").size() >= 2) {
			d3.select(".bar").remove();
		}
		createBarChart(data, target, dimensions);
	}
    
	rects.on("click", createBarExtension);
	rowsBehind.on("click", createBarExtension);

    return [x,y,colorRange];
}