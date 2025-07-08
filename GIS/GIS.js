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
async function fetchPoetsAndRegions() {
  const { data: poetData, error: poetError } = await supabase.from('الشاعر').select('اسم_الشاعر');
  const { data: placeData, error: placeError } = await supabase.from('المكان').select('الامارة');

  if (poetError) console.error("Error fetching poets:", poetError.message);
  if (placeError) console.error("Error fetching regions:", placeError.message);

  const fillSelect = (id, items) => {
    const el = document.getElementById(id);
    el.innerHTML = '<option value="">اختر</option>';
    [...new Set(items.filter(Boolean))].sort().forEach(val => {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = val;
      el.appendChild(opt);
    });
  };

  fillSelect('poet', poetData?.map(p => p.اسم_الشاعر) || []);
  const cleanedRegions = [...new Set(placeData.map(p => p.الامارة ? p.الامارة.trim() : null).filter(Boolean))].sort();
  fillSelect('region', cleanedRegions);
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



async function plotAllPins(filteredPlaceIds = []) {
  const { data: places } = await supabase.from("المكان")
    .select("اسم_المكان, lat, lon, معرف_المكان, الامارة, المدينة");

  let pinsToShow = places;

  if (filteredPlaceIds.length > 0) {
    pinsToShow = places.filter(p => filteredPlaceIds.includes(p.معرف_المكان));
  }

  allPins = pinsToShow.filter(p => p.lat && p.lon);

  svg.selectAll(".place-pin").remove();

  svg.selectAll(".place-pin")
    .data(allPins)
    .enter()
    .append("text")
    .attr("class", "place-pin")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("font-size", "24px")
    .attr("transform", d => `translate(${projection([d.lon, d.lat])})`)
    .text("📍")
    .style("cursor", "pointer")
    .on("mouseover", function() {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("font-size", "30px");
    })
    .on("mouseout", function() {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("font-size", "24px");
    })
    .on("click", async (event, d) => {
      const { data, error } = await supabase
        .from("القصيدة")
        .select(`
          النص_الشهري,
          نوع_الشعر,
          الغرض_الشعري,
          العصر_الشعري,
          الشاعر:معرف_الشاعر (اسم_الشاعر, تاريخ_ولادة_الشاعر, تاريخ_وفاة_الشاعر, صورة_الشاعر),
          المصدر:معرف_المصدر (اسم_المصدر, اسم_المؤلف, تاريخ_النشر)
        `)
        .eq("معرف_المكان", d.معرف_المكان);

      const { data: imagesData } = await supabase
        .from("صورة_المكان")
        .select("رابط_الصورة")
        .eq("معرف_المكان", d.معرف_المكان);

      const images = imagesData?.map(img => img.رابط_الصورة) || [];

      if (!data || data.length === 0) {
        openModal("تفاصيل الموقع", "<p>لا توجد بيانات.</p>");
        return;
      }

      const poem = data[0];

      const contentHTML = `
        <div class="modal-details">
          <h3>${d.اسم_المكان}</h3>
          <p><strong>الإمارة:</strong> ${d.الامارة}</p>
          <p><strong>المدينة:</strong> ${d.المدينة}</p>
          <hr />
          <p><strong>النص:</strong> ${poem.النص_الشهري}</p>
          <p><strong>نوع الشعر:</strong> ${poem.نوع_الشعر}</p>
          <p><strong>الغرض:</strong> ${poem.الغرض_الشعري}</p>
          <p><strong>العصر:</strong> ${poem.العصر_الشعري}</p>
          <p><strong>الشاعر:</strong> ${poem.الشاعر?.اسم_الشاعر}</p>
          <p><strong>تاريخ الولادة:</strong> ${poem.الشاعر?.تاريخ_ولادة_الشاعر}</p>
          <p><strong>الوفاة:</strong> ${poem.الشاعر?.تاريخ_وفاة_الشاعر}</p>
          <p><strong>المصدر:</strong> ${poem.المصدر?.اسم_المصدر}</p>
          <div class="image-slider">
            <button id="prevImage">←</button>
            <img id="slider-image" src="${images[0] || ''}" alt="صورة للموقع" />
            <button id="nextImage">→</button>
          </div>
        </div>
      `;

      showInfoModal({
  اسم_المكان: d.اسم_المكان,
  النص_الشهري: poem.النص_الشهري,
  نوع_الشعر: poem.نوع_الشعر,
  الغرض_الشعري: poem.الغرض_الشعري,
  العصر_الشهري: poem.العصر_الشهري,
  المصدر: poem.المصدر?.اسم_المصدر,
  اسم_الشاعر: poem.الشاعر?.اسم_الشاعر,
  تاريخ_ولادة_الشاعر: poem.الشاعر?.تاريخ_ولادة_الشاعر,
  تاريخ_وفاة_الشاعر: poem.الشاعر?.تاريخ_وفاة_الشاعر,
  عدد_القصائد: poem.الشاعر?.عدد_القصائد,
  صورة_المكان: images[0] || '',
  صورة_الشاعر: poem.الشاعر?.صورة_الشاعر
});

      setTimeout(() => {
        let currentImageIndex = 0;
        const sliderImg = document.getElementById('slider-image');
        const prevBtn = document.getElementById('prevImage');
        const nextBtn = document.getElementById('nextImage');

        function showImage(index) {
          if (sliderImg && images.length > 0) {
            sliderImg.src = images[index];
          }
        }

        if (prevBtn && nextBtn) {
          prevBtn.onclick = () => {
            currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
            showImage(currentImageIndex);
          };

          nextBtn.onclick = () => {
            currentImageIndex = (currentImageIndex + 1) % images.length;
            showImage(currentImageIndex);
          };
        }
      }, 100);
    });
}
// Event listener for filter form submission
document.querySelector('.filter-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const poetName = document.getElementById('poet').value.trim();
  const region = document.getElementById('region').value.trim();

  let poetId = null;

  // 1️⃣ Retrieve poet ID based on the provided poet name (if selected)
if (poetName) {
  const { data: poetResult, error: poetError } = await supabase
    .from('الشاعر')
    .select('معرف_الشاعر, اسم_الشاعر')
    .ilike('اسم_الشاعر', `%${poetName}%`)
    .single();

  if (!poetError && poetResult) {
    poetId = poetResult.معرف_الشاعر;
  }
}

// 2️⃣ Build query to fetch places based on selected region (if any)
let query = supabase
  .from('المكان')
  .select('معرف_المكان, اسم_المكان, الامارة, lat, lon, المدينة');

if (region) query = query.eq('الامارة', region);

// 3️⃣ Execute the query to retrieve places data
const { data: placesData, error } = await query;

// 4️⃣ Handle case of error or no matching results
const alertBox = document.getElementById("alertBox");
if (error || !placesData) {
  alertBox.classList.add("show");
  plotAllPins([]);  // Display no pins
  return;
}

let filteredPlaces = placesData;

// 5️⃣ If a poet is selected, further filter places to those linked to the poet's poems
if (poetId) {
  const { data: poemsData } = await supabase
    .from('القصيدة')
    .select('معرف_المكان, معرف_الشاعر')
    .eq('معرف_الشاعر', poetId);

  const allowedPlacesIds = poemsData.map(p => p.معرف_المكان);
  filteredPlaces = filteredPlaces.filter(p => allowedPlacesIds.includes(p.معرف_المكان));
}

// 6️⃣ Display filtered results or show message if no matches found
if (filteredPlaces.length === 0) {
  alertBox.classList.add("show");
  plotAllPins([]);  // No matching pins to show
} else {
  alertBox.classList.remove("show");
  const placeIds = filteredPlaces.map(p => p.معرف_المكان);
  plotAllPins(placeIds);  // Plot matching pins
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
  filterModal.classList.add("show");
  document.body.style.overflow = 'hidden';
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
    fetchPoetsAndRegions();
    initSaudiMap();
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




function closeModal() {
  document.getElementById("infoModal").style.display = "none";
}

function showInfoModal(data) {
  const modal = document.getElementById('infoModal');
  const poemTab = document.getElementById('poemTab');
  const poetTab = document.getElementById('poetTab');
  const modalPlaceImage = document.getElementById('modalPlaceImage');
  const poetProfileImage = document.getElementById('poetProfileImage');

  // صورة المكان (يمين)
  document.querySelector('.modal-image').style.display = 'block';
  modalPlaceImage.src = data.صورة_المكان || '../pictures/missing-photo.png';

  // صورة الشاعر (يسار)
  poetProfileImage.src = data.صورة_الشاعر || '../pictures/user-icon.png';

  // تبويب الشعر

poemTab.innerHTML = `
  <div class="poem-info-modern">
    <div class="info-row">
      <span class="label">المكان:</span>
      <span class="value">${data.اسم_المكان || 'غير معروف'}</span>
    </div>

    <div class="info-row">
      <span class="label">نص الشعر:</span>
      <div class="value poem-text">
        ${data.النص_الشهري || 'غير متوفر'}
      </div>
    </div>

    <div class="info-row">
      <span class="label">نوع الشعر:</span>
      <span class="value">${data.نوع_الشعر || 'غير محدد'}</span>
    </div>

    <div class="info-row">
      <span class="label">الغرض الشعري:</span>
      <span class="value">${data.الغرض_الشهري || 'غير محدد'}</span>
    </div>

    <div class="info-row">
      <span class="label">العصر الشعري:</span>
      <span class="value">${data.العصر_الشهري || 'غير معروف'}</span>
    </div>

    <div class="info-row">
      <span class="label">المصدر:</span>
      <span class="value">${data.اسم_المصدر || 'غير معروف'}</span>
    </div>
  </div>
`;


  // تبويب الشاعر
poetTab.innerHTML = `
  <div class="poet-info-modern">
    <img id="poetProfileImage" src="${data.صورة_الشاعر || '../pictures/user-icon.png'}" alt="صورة الشاعر" class="poet-img" />
    
    <div class="info-row">
      <span class="label">اسم الشاعر:</span>
      <span class="value">${data.اسم_الشاعر || 'غير معروف'}</span>
    </div>

    <div class="info-row">
      <span class="label">تاريخ الولادة:</span>
      <span class="value">${data.تاريخ_ولادة_الشاعر || 'غير معروف'}</span>
    </div>

    <div class="info-row">
      <span class="label">تاريخ الوفاة:</span>
      <span class="value">${data.تاريخ_وفاة_الشاعر || 'غير معروف'}</span>
    </div>

    <div class="info-row">
      <span class="label">عدد الأشعار:</span>
      <span class="value">${data.عدد_القصائد || 'غير معروف'}</span>
    </div>
  </div>
`;

  modal.style.display = 'flex';
}

function nextImage() {
  if (placeImages.length === 0) return;
  currentImageIndex = (currentImageIndex + 1) % placeImages.length;
  document.getElementById('modalPlaceImage').src = placeImages[currentImageIndex];
}

function previousImage() {
  if (placeImages.length === 0) return;
  currentImageIndex = (currentImageIndex - 1 + placeImages.length) % placeImages.length;
  document.getElementById('modalPlaceImage').src = placeImages[currentImageIndex];
}

window.addEventListener('click', function(event) {
  const modal = document.getElementById('infoModal');
  const modalContent = document.querySelector('.modal-content-custom');

  if (modal.style.display === 'flex' && !modalContent.contains(event.target)) {
    closeModal();
  }
});


function switchTab(tabId, event) {
  event.stopPropagation(); // ← هذا هو المهم

  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.style.display = 'none';
  });

  document.getElementById(tabId).style.display = 'block';

  document.querySelectorAll('.tab-button-modern').forEach(btn => {
    btn.classList.remove('active');
  });

  event.target.classList.add('active');
}
document.getElementById('poemBtn').addEventListener('click', function (event) {
  switchTab('poemTab', event);
});

document.getElementById('poetBtn').addEventListener('click', function (event) {
  switchTab('poetTab', event);
});








