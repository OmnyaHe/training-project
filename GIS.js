// Set up the SVG container
const width = 900;
const height = 1500;

const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Load the GeoJSON data
d3.json("https://raw.githubusercontent.com/OmnyaHe/geo/main/hijaz-map.geojson").then(function (geojson) {

    // Create a projection
    const projection = d3.geoMercator()
        .center([40.1, 21.3891])
        .scale(4500)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // إصلاح الاتجاه لو لازم
    geojson.features.forEach(function (feature) {
        if (feature.geometry.type == "MultiPolygon") {
            feature.geometry.coordinates.forEach(polygon => polygon.forEach(ring => ring.reverse()));
        } else if (feature.geometry.type == "Polygon") {
            feature.geometry.coordinates.forEach(ring => ring.reverse());
        }
    });

    // التحديد بالمناطق المطلوبة فقط
    const targetRegions = ["منطقة مكة المكرمة", "منطقة المدينة المنورة", "منطقة تبوك", "منطقة الباحة"]
    const filteredFeatures = geojson.features.filter(f => targetRegions.includes(f.properties.name));

    // الألوان
    function getColor(name) {
        switch (name) {
            case "منطقة تبوك": return "#2196f3";
            case "منطقة الباحة": return "#4caf50";
            case "منطقة المدينة المنوره ": return "#ff9800";
            case "منطقة مكة المكرمة": return "#9c27b0";
            default: return "#ccc";
        }
    }

    // Tooltip
    const tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("background", "#FFF")
        .style("padding", "5px")
        .style("border", "1px solid #000")
        .style("border-radius", "5px")
        .style("opacity", 10)
        .style("pointer-events", "none")
        .style("visibility", "hidden");

    // رسم المناطق
    svg.selectAll(".region")
        .data(filteredFeatures)
        .enter()
        .append("path")
        .attr("class", "region")
        .attr("d", path)
        .style("fill", d => getColor(d.properties.name))
        .style("stroke", "#000")
        .style("stroke-width", 1)
        .on("mouseover", function (event, d) {
            d3.select(this).style("fill", "#eeeeee");
            tooltip
                .style("visibility", "visible")
                .style("opacity", 0.9)
                .html(`<strong>${d.properties.name}</strong><br>المساحة: ${d.properties.area}<br>عدد السكان: ${d.properties.people}`)
                .style("left", `${event.pageX + 5}px`)
                .style("top", `${event.pageY - 20}px`);
        })
        .on("mouseout", function (event, d) {
            d3.select(this).style("fill", getColor(d.properties.name));
            tooltip.style("visibility", "hidden");
        });

    // إضافة أسماء المناطق على الخريطة
    svg.selectAll("text")
        .data(filteredFeatures)
        .enter()
        .append("text")
        .attr("transform", function (d) {
            const centroid = path.centroid(d);
            return `translate(${centroid[0]}, ${centroid[1]})`;
        })
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .style("fill", "#fff")
        .text(d => d.properties.name);

}).catch(function (error) {
    console.error('Error loading GeoJSON data:', error);
});
