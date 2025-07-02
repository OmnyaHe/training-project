// إعداد خريطة SVG
const width = 900;
const height = 1500;

const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// تحميل الملف 
d3.json("https://raw.githubusercontent.com/Lama-G/training/main/saudiMap.geojson").then(function (geojson) {
    const projection = d3.geoMercator()
        .center([44.5, 23]) // مركز المملكة
        .scale(2500)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // تصحيح الاتجاه إن لزم
    geojson.features.forEach(function (feature) {
        if (feature.geometry.type === "MultiPolygon") {
            feature.geometry.coordinates.forEach(polygon => polygon.forEach(ring => ring.reverse()));
        } else if (feature.geometry.type === "Polygon") {
            feature.geometry.coordinates.forEach(ring => ring.reverse());
        }
    });

    // تصفية فقط للمناطق التي نوعها Polygon أو MultiPolygon (لتجاهل النقاط)
    const polygonFeatures = geojson.features.filter(f =>
        f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon"
    );

    // ألوان مخصصة لكل إمارة أو منطقة
    function getColor(name) {
        switch (name) {
            case "منطقة مكة المكرمة": return "#1A6566";
            case "منطقة المدينة المنورة": return "#21445B";
            case "منطقة تبوك": return "#BEAD9D";
            case "منطقة الباحة": return "#737476";
            case "منطقة الرياض": return "#621d52";
            case "منطقة عسير": return "#0c9560";
            case "منطقة الشرقية": return "#323050";
            case "منطقة نجران": return "#293242";
            case "منطقة الجوف": return "#DBD1C5";
            case "منطقة الحدود الشمالية": return "#1A6566";
            case "منطقة القصيم": return "#323050";
            case "منطقة حائل": return "#0c9560";
            default: return "#ccc";
        }
    }

    // التولتيب
    const tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("background", "#FFF")
        .style("padding", "5px")
        .style("border", "1px solid #000")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("visibility", "hidden");

    // رسم الخريطة
    svg.selectAll(".region")
        .data(polygonFeatures)
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
                .html(`<strong>${d.properties.name}</strong>`)
                .style("left", `${event.pageX + 5}px`)
                .style("top", `${event.pageY - 20}px`);
        })
        .on("mouseout", function (event, d) {
            d3.select(this).style("fill", getColor(d.properties.name));
            tooltip.style("visibility", "hidden");
        });

    // أسماء المناطق
    svg.selectAll("text")
        .data(polygonFeatures)
        .enter()
        .append("text")
        .attr("transform", function (d) {
            const centroid = path.centroid(d);
            return `translate(${centroid[0]}, ${centroid[1]})`;
        })
        .attr("text-anchor", "middle")
        .style("font-size", "9px")
        .style("fill", "#fff")
        .text(d => d.properties.name);
});
