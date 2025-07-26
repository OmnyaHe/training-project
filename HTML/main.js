import { Client } from "https://esm.sh/@gradio/client";

// ================== Validation Function ==================
function runValidation() {
  const inputElement = document.getElementById("poem-input");
  const outputElement = document.getElementById("output-box");

  const text = inputElement.value.trim();

  outputElement.style.display = "block";

  // Empty input
  if (!text) {
    outputElement.innerText = "⚠️ الرجاء إدخال النص";
    outputElement.className = "warning";
    return false;
  }

  // Only numbers
  if (/^\d+$/.test(text)) {
    outputElement.innerText = "⚠️ لا يمكن إدخال أرقام ";
    outputElement.className = "warning";
    return false;
  }

  // Split words
  const words = text.split(/\s+/);

  // Check word count (must be 2 or more words)
  if (words.length < 2) {
    outputElement.innerText = "⚠️ يرجى إدخال بيت شعر كامل (أكثر من كلمة واحدة)";
    outputElement.className = "warning";
    return false;
  }

  return true; // valid input
}

// ================== Main Function ==================
window.classifyText = async function () {
  // ---- Validate before API ----
  if (!runValidation()) return;

  const input = document.getElementById("poem-input").value;
  const output = document.getElementById("output-box");

  output.style.display = "block";
  output.innerText = "⏳ جاري التحليل...";
  output.className = "loading";

  try {
    const client = await Client.connect("omnyahe/Aiiapp");
    const result = await client.predict("/predict", { text: input });
    output.innerText = ` الغرض الشعري: ${result.data[0].label}`;
    output.className = "success";
  } catch (err) {
    console.error(err);
    output.innerText = "❌ حدث خطأ أثناء الاتصال.";
    output.className = "error";
  }
};

// ================== Reset Box on Input ==================
window.onload = function () {
  const poemInput = document.getElementById("poem-input");
  const outputBox = document.getElementById("output-box");

  function resetOutputBox() {
    outputBox.style.display = "none";
    outputBox.innerText = "";
    outputBox.className = "";
  }

  poemInput.addEventListener("input", function () {
    if (outputBox.style.display !== "none" && !outputBox.innerText.includes("جاري التحليل")) {
      resetOutputBox();
    }
  });
};


