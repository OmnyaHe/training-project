

// بيانات مشروع Supabase
const SUPABASE_URL = "https://uuiyhcacxtbhffpwljix.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1aXloY2FjeHRiaGZmcHdsaml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExOTYyNjYsImV4cCI6MjA2Njc3MjI2Nn0.N1iXFjDfeXTLUsY51puvnHC-M-T2erCaQ1OTkXnT6uY";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.getElementById("shareForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("contactName").value;
  const email = document.getElementById("contactEmail").value;
  const subject = document.getElementById("contactSubject").value;
  const message = document.getElementById("contactMessage").value;

  const { data, error } = await supabaseClient
    .from("رسائل_التواصل")
    .insert([{ الاسم: name, الايميل: email, الموضوع: subject, الرسالة: message }]);

  if (error) {
    console.error("❌ Error:", error);
    alert("حدث خطأ أثناء الإرسال");
  } else {
    alert("تم إرسال الرسالة بنجاح!");
    e.target.reset();
  }
});

///////////////////////////////////////////////////////
// ✅ نموذج "شاركنا"
document.getElementById("shareform2").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const shareType = document.getElementById("share-type").value;

  if (!name || !email || !phone || !shareType) {
    alert("يرجى تعبئة جميع الحقول الأساسية.");
    return;
  }

  let dataToInsert = {
    الاسم: name,
    الايميل: email,
    الهاتف: phone,
    نوع_المشاركة: shareType
  };

  if (shareType === "add-poem") {
    const poetName = document.getElementById("poetName").value.trim();
    const poemTitle = document.getElementById("poemTitle").value.trim();
    const poemLocation = document.getElementById("poemLocation").value.trim();
    const poemExcerpt = document.getElementById("poemExcerpt").value.trim();

    if (!poetName || !poemTitle || !poemLocation || !poemExcerpt) {
      alert("يرجى تعبئة جميع الحقول الخاصة بإضافة الشعر.");
      return;
    }

    dataToInsert = {
      ...dataToInsert,
      اسم_الشاعر: poetName,
      عنوان_الشعر: poemTitle,
      المكان: poemLocation,
      جزئية_الشعر: poemExcerpt
    };
  } else if (shareType === "edit-mistake") {
    const editType = document.getElementById("editType").value;
    const editTitle = document.getElementById("editTitle").value.trim();
    const suggestedEdit = document.getElementById("suggestedEdit").value.trim();

    if (!editType || !editTitle || !suggestedEdit) {
      alert("يرجى تعبئة جميع الحقول الخاصة بتعديل الخطأ.");
      return;
    }

    dataToInsert = {
      ...dataToInsert,
      نوع_التعديل: editType,
      عنوان_التعديل: editTitle,
      التعديل_المقترح: suggestedEdit
    };
  }

  const { data, error } = await supabaseClient
    .from("مشاركات_المستخدم")
    .insert([dataToInsert]);

  if (error) {
    console.error("خطأ أثناء الإرسال:", error.message);
    alert("حدث خطأ أثناء الإرسال، حاول مرة أخرى.");
  } else {
    alert("تم الإرسال بنجاح! شكرًا لمساهمتك ❤️");
    e.target.reset();
    document.getElementById("addPoemFields").style.display = "none";
    document.getElementById("editMistakeFields").style.display = "none";
  }
});