import { Client } from "https://esm.sh/@gradio/client";

window.classifyText = async function () {
  const input = document.getElementById("poem-input").value;
  const output = document.getElementById("output-box");

  output.innerText = "⏳ جاري التحليل...";

  try {
    const client = await Client.connect("omnyahe/Aiiapp");
    const result = await client.predict("/predict", { text: input });
    output.innerText = `✅ الغرض الشعري: ${result.data[0].label}`;
  } catch (err) {
    console.error(err);
    output.innerText = "❌ حدث خطأ أثناء الاتصال.";
  }
};
