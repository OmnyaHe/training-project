import { Client } from "https://esm.sh/@gradio/client";

window.classifyText = async function () {
  const input = document.getElementById("poem-input").value;
  const output = document.getElementById("output-box");

  output.style.display = "block";

  output.innerText = "⏳ جاري التحليل...";
  output.className = "loading";

  try {
    const client = await Client.connect("omnyahe/Aiiapp");
    const result = await client.predict("/predict", { text: input });
    output.innerText = `✅ الغرض الشعري: ${result.data[0].label}`;
    output.className = "success";
  } catch (err) {
    console.error(err);
    output.innerText = "❌ حدث خطأ أثناء الاتصال.";
    output.className = "error";
  }
};

window.onload = function() {
  const poemInput = document.getElementById("poem-input");
  const outputBox = document.getElementById("output-box");

  function resetOutputBox() {
    outputBox.style.display = "none";
    outputBox.innerText = "";
    outputBox.className = "";
  }

  poemInput.addEventListener("input", function() {
    if (outputBox.style.display !== "none" && outputBox.innerText.indexOf("جاري التحليل") === -1) {
      resetOutputBox();
    }
  });
};