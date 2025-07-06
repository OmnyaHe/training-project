// Define colors for each region in Saudi Arabia
function getSaudiColors() {
    return {
        "منطقة الرياض": "#1A6566",
        "منطقة مكة المكرمة": "#0c9560",
        "منطقة المدينة المنورة": "#BEAD9D",
        "منطقة الشرقية": "#DBD1C5",
        "منطقة عسير": "#737476",
        "منطقة تبوك": "#293242",
        "منطقة الحدود الشمالية": "#BEAD9D",
        "منطقة الجوف": "#0c9560",
        "منطقة جازان": "#621d52",
        "منطقة نجران": "#21445B",
        "منطقة الباحة": "#323050",
        "منطقة القصيم": "#21445B",
        "منطقة حائل": "#621d52"
    };
}

// Draw responsive Saudi Arabia map
function initSaudiMap() {
    const mapContainer = document.getElementById("map");
    const width = mapContainer.clientWidth;
    const height = Math.min(window.innerHeight * 0.8, 800);

    // Create the SVG element for the map
    const svg = d3.select("#map")
        .append("svg")
        .attr("width", "100%")
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // Load GeoJSON map data
    d3.json("https://raw.githubusercontent.com/Lama-G/training/main/saudiMap.geojson").then(function (geojson) {
        // Set up the map projection
        const projection = d3.geoMercator()
        .center([44.5, 23])
        .scale(width * 1.1) // Enlarged map content
        .translate([width / 2, height / 2]);

        const path = d3.geoPath().projection(projection);

        // Reverse coordinates if needed
        geojson.features.forEach(feature => {
        const coords = feature.geometry.coordinates;
        if (feature.geometry.type === "Polygon") {
            coords.forEach(ring => ring.reverse());
        } else if (feature.geometry.type === "MultiPolygon") {
            coords.forEach(polygon => polygon.forEach(ring => ring.reverse()));
        }
        });

        // Filter only features with type Polygon or MultiPolygon (used to draw regions)
        const features = geojson.features.filter(f =>
        f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon"
        );

        const regionColors = getSaudiColors();

        // Create tooltip element
        const tooltip = d3.select("body").append("div")
        .attr("class", "map-tooltip")
        .style("visibility", "hidden");

        // Draw the regions with colors
        svg.selectAll(".region")
        .data(features)
        .enter()
        .append("path")
        .attr("class", "region")
        .attr("d", path)
        .attr("fill", d => regionColors[d.properties.name] || "#ccc")
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .on("mouseover", function (event, d) {
            d3.select(this).attr("stroke-width", 2);
            tooltip
            .style("visibility", "visible")
            .html(`<strong>${d.properties.name}</strong>`)
            .style("left", event.pageX + 15 + "px")
            .style("top", event.pageY - 20 + "px");
        })
        .on("mouseout", function () {
            d3.select(this).attr("stroke-width", 1);
            tooltip.style("visibility", "hidden");
        });

    if (window.innerWidth > 768) {
        svg.selectAll(".region-label")
            .data(features)
            .enter()
            .append("text")
            .attr("class", "region-label")
            .attr("transform", d => `translate(${path.centroid(d)})`)
            .attr("text-anchor", "middle")
            .style("font-size", "10px")
            .style("fill", "#fff")
            .style("pointer-events", "none")
        }

        // add a specific point to the map 
        // احداثيات (من الداتا بيس)
        const locations = [
            { name: "آبار الحفائر", coordinates: [43.05, 18.487] },
            { name: "جدة", coordinates: [39.27, 21.43] },
            { name: "الطائف", coordinates: [40.476, 21.39] },
            { name: "الخيف", coordinates: [38.93, 24.02] },
            { name: "جبال الرجم", coordinates: [41.38, 31.11] }
        ];

        // project the geographic coordinates to screen coordinates
        const pointsGroup = svg.selectAll(".point-group")
        .data(locations)
        .enter()
        .append("g") // create a group for each point (circle + text)
        .attr("class", "point-group");

        // add a circle (or any other SVG element) at the projected coordinates
        pointsGroup.append("circle")
        .attr("cx", d => projection(d.coordinates)[0])
        .attr("cy", d => projection(d.coordinates)[1])
        .attr("r", 3) // حجم نقطة الموقع
        .attr("fill", "#007BFF") // لون النقطة
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .on("mouseover", function (event, d) {
            d3.select(this).attr("r", 5); // هوفر لنقطة الموقع
            tooltip
                .style("visibility", "visible")
                .html(`<strong>${d.name}</strong>`) 
                .style("left", event.pageX + 15 + "px")
                .style("top", event.pageY - 20 + "px");
        })
        .on("mouseout", function () {
            d3.select(this).attr("r", 3); 
            tooltip.style("visibility", "hidden");
        });

            
    });
}
