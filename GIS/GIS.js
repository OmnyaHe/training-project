const supabase = window.supabase.createClient(
    'https://uuiyhcacxtbhffpwljix.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1aXloY2FjeHRiaGZmcHdsaml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExOTYyNjYsImV4cCI6MjA2Njc3MjI2Nn0.N1iXFjDfeXTLUsY51puvnHC-M-T2erCaQ1OTkXnT6uY'
);

let svg, projection, tooltip, allPins = [];
let path;

// Get references to filter modal elements
const openFilterBtn = document.getElementById("openFilterBtn"); // The filter icon
const filterModal = document.getElementById("filterModal");
const closeFilterModalBtn = document.getElementById("closeFilterModalBtn"); // The close button inside the filter modal

// Event listeners for opening and closing the filter modal
if (openFilterBtn) {
    openFilterBtn.onclick = () => {
        filterModal.classList.add("show");
        document.body.style.overflow = 'hidden'; // Disable body scroll
    };
}

if (closeFilterModalBtn) {
    closeFilterModalBtn.onclick = () => {
        filterModal.classList.remove("show");
        document.body.style.overflow = 'auto'; // Re-enable body scroll
    };
}

// Close filter modal if clicked outside of the modal content
if (filterModal) {
    window.addEventListener('click', (event) => {
        if (event.target === filterModal) {
            filterModal.classList.remove("show");
            document.body.style.overflow = 'auto';
        }
    });
}

// Fetch poets, places, and poem types for filter dropdowns
async function fetchPoetsAndTypes() {
    const { data: poetData, error: poetError } = await supabase.from('الشاعر').select('اسم_الشاعر');
    const { data: placeData, error: placeError } = await supabase.from('المكان').select('اسم_المكان');
    const { data: poemsData, error: poemsError } = await supabase.from('القصيدة').select('نوع_الشعر, الغرض_الشعري');

    if (poetError) console.error("Error fetching poets:", poetError.message);
    if (placeError) console.error("Error fetching places:", placeError.message);
    if (poemsError) console.error("Error fetching poem details:", poemsError.message);

    const fillSelect = (id, items) => {
        const el = document.getElementById(id);
        // Clear existing options except the "اختر" one
        el.innerHTML = '<option value="">اختر</option>';
        if (items) { 
            [...new Set(items.filter(Boolean))].sort().forEach(val => { 
                const opt = document.createElement('option');
                opt.value = val;
                opt.textContent = val;
                el.appendChild(opt);
            });
        }
    };

    fillSelect('poet', poetData?.map(p => p.اسم_الشاعر) || []);
    fillSelect('place', placeData?.map(p => p.اسم_المكان) || []);
    fillSelect('type', poemsData?.map(p => p.نوع_الشعر) || []);
    fillSelect('purpose', poemsData?.map(p => p.الغرض_الشعري) || []);
}

// Get colors for Saudi regions
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

// Initialize the Saudi map using D3.js
async function initSaudiMap() {
    const mapContainer = document.getElementById("map");
    // Ensure map-container has dimensions before getting clientWidth/Height
    if (!mapContainer.clientWidth || !mapContainer.clientHeight) {
        console.warn("Map container has no dimensions. Waiting for layout.");
        // Use requestAnimationFrame to ensure layout is computed
        requestAnimationFrame(initSaudiMap);
        return;
    }

    const width = mapContainer.clientWidth;
    const height = mapContainer.clientHeight;

    // Clear previous SVG content if re-initializing
    d3.select("#map svg").remove();

    svg = d3.select("#map").append("svg")
        .attr("width", "100%")
        .attr("height", "100%");

    projection = d3.geoMercator(); // Initialize projection
    path = d3.geoPath().projection(projection); // Initialize path

    tooltip = d3.select("body").append("div")
        .attr("class", "map-tooltip")
        .style("visibility", "hidden");

    try {
        const geojson = await d3.json("https://raw.githubusercontent.com/Lama-G/training/main/saudiMap.geojson");

        geojson.features.forEach(f => {
            const c = f.geometry.coordinates;
            if (f.geometry.type === "Polygon") {
                c.forEach(r => r.reverse());
            } else if (f.geometry.type === "MultiPolygon") {
                c.forEach(p => p.forEach(r => r.reverse()));
            }
        });

        // Fit projection to the GeoJSON data based on map container size
        projection.fitSize([width, height], geojson);

        // Draw regions
        svg.selectAll(".region")
            .data(geojson.features.filter(f => f.geometry.type !== "Point"))
            .enter().append("path")
            .attr("class", "region")
            .attr("d", path)
            .attr("fill", d => getSaudiColors()[d.properties.name] || "#ccc")
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .on("mouseover", (e, d) => {
                d3.select(e.currentTarget).attr("stroke-width", 2);
                tooltip.style("visibility", "visible").html(`<strong>${d.properties.name}</strong>`)
                    .style("left", (e.pageX + 15) + "px").style("top", (e.pageY - 20) + "px");
            })
            .on("mouseout", (e) => {
                d3.select(e.currentTarget).attr("stroke-width", 1);
                tooltip.style("visibility", "hidden");
            });

        plotAllPins();

    } catch (error) {
        console.error("Error loading GeoJSON or initializing map:", error);
        mapContainer.innerHTML = "<p>تعذر تحميل الخريطة. الرجاء المحاولة لاحقًا.</p>";
    }
}

// Plot pins on the map
async function plotAllPins(filterPlaces = []) {
    const { data: places, error } = await supabase.from('المكان').select('اسم_المكان, lat, lon');
    if (error) {
        console.error("Error fetching places:", error.message);
        return;
    }

    // Remove existing pins before plotting new ones
    svg.selectAll(".place-pin").remove();

    const toPlot = filterPlaces.length > 0 ? places.filter(p => filterPlaces.includes(p.اسم_المكان)) : places;
    allPins = toPlot.filter(p => p.lat && p.lon); // Ensure lat/lon exist

    svg.selectAll(".place-pin")
        .data(allPins)
        .enter().append("circle")
        .attr("class", "place-pin")
        .attr("r", 6)
        .attr("fill", filterPlaces.length > 0 ? "orange" : "crimson")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .attr("transform", d => {
            // Ensure projection is ready before transforming coordinates
            if (projection && d.lon && d.lat) {
                const coords = projection([d.lon, d.lat]);
                // Check if coords are valid numbers (projection might return null/NaN for invalid input)
                if (coords && !isNaN(coords[0]) && !isNaN(coords[1])) {
                    return `translate(${coords})`;
                }
            }
            return `translate(0,0)`; // Fallback if projection fails
        })
        .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
                .html(`<strong>${d.اسم_المكان}</strong>`)
                .style("left", event.pageX + 15 + "px")
                .style("top", event.pageY - 20 + "px");
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));
}

// Event listener for filter form submission
document.querySelector('.filter-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const poet = document.getElementById('poet').value;
    const place = document.getElementById('place').value;
    const type = document.getElementById('type').value;
    const purpose = document.getElementById('purpose').value;

    let query = supabase.from('القصيدة').select(`
        نوع_الشعر,
        الغرض_الشعري,
        الشاعر:معرف_الشاعر (اسم_الشاعر),
        المكان:معرف_المكان (اسم_المكان)
    `);

    if (poet) query = query.eq('الشاعر.اسم_الشاعر', poet);
    if (place) query = query.eq('المكان.اسم_المكان', place);
    if (type) query = query.eq('نوع_الشعر', type);
    if (purpose) query = query.eq('الغرض_الشعري', purpose);

    const { data, error } = await query;

    if (error) {
        console.error("Error filtering data:", error.message);
        document.getElementById("alertBox").classList.add("show");
        plotAllPins([]); // Show no pins if there's an error
        return;
    }

    const placesMatched = [...new Set(data.map(d => d.المكان?.اسم_المكان).filter(Boolean))];

    if (placesMatched.length === 0) {
        document.getElementById("alertBox").classList.add("show");
        plotAllPins([]);
    } else {
        document.getElementById("alertBox").classList.remove("show");
        plotAllPins(placesMatched);
    }

    filterModal.classList.remove("show"); 
    document.body.style.overflow = 'auto';
});

// Restore all pins (show all locations)
function restoreAllPins() {
    document.getElementById("alertBox").classList.remove("show");
    plotAllPins();
}

// Function to reset filters and hide relevant elements
function resetFilters() {
    document.querySelectorAll(".filter-form select").forEach(select => select.value = "");
    document.getElementById("alertBox").classList.remove("show");
    plotAllPins();
    filterModal.classList.remove("show");
    document.body.style.overflow = 'auto';
}

// Event listener for the search button
const mainSearchBtn = document.querySelector('.main-content .search-btn');
if (mainSearchBtn) {
    mainSearchBtn.addEventListener('click', () => {
        plotAllPins();
        document.getElementById('map-section').scrollIntoView({ behavior: 'smooth' });
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchPoetsAndTypes();
    initSaudiMap();
    resetFilters();
});

// Handle window resize to make map responsive
window.addEventListener('resize', () => {
    // Debounce resize to prevent excessive re-renders
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
        if (svg && projection) {
            const mapContainer = document.getElementById("map");
            const width = mapContainer.clientWidth;
            const height = mapContainer.clientHeight;

            // Update SVG dimensions (already 100%, but good to re-confirm)
            svg.attr("width", "100%").attr("height", "100%");

            // Re-fit projection to new container size
            d3.json("https://raw.githubusercontent.com/Lama-G/training/main/saudiMap.geojson").then(geojson => {
                geojson.features.forEach(f => { // Re-reverse coordinates if needed by the specific GeoJSON
                    const c = f.geometry.coordinates;
                    if (f.geometry.type === "Polygon") c.forEach(r => r.reverse());
                    else if (f.geometry.type === "MultiPolygon") c.forEach(p => p.forEach(r => r.reverse()));
                });
                projection.fitSize([width, height], geojson);
                path.projection(projection); // Update path with new projection

                // Redraw map paths
                svg.selectAll(".region").attr("d", path);
                plotAllPins(); 

            }).catch(error => console.error("Error reloading GeoJSON on resize:", error));
        }
    }, 250); // Adjust debounce time as needed
});