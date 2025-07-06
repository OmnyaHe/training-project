

// بيانات مشروع Supabase
const SUPABASE_URL = "https://uuiyhcacxtbhffpwljix.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1aXloY2FjeHRiaGZmcHdsaml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExOTYyNjYsImV4cCI6MjA2Njc3MjI2Nn0.N1iXFjDfeXTLUsY51puvnHC-M-T2erCaQ1OTkXnT6uY";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.getElementById("shareForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nameInput = document.getElementById("contactName");
  const emailInput = document.getElementById("contactEmail");
  const subjectInput = document.getElementById("contactSubject");
  const messageInput = document.getElementById("contactMessage");

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const subject = subjectInput.value.trim();
  const message = messageInput.value.trim();

  clearError(nameInput);
  clearError(emailInput);
  clearError(subjectInput);
  clearError(messageInput);

  let isValid = true;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name) {
    showError(nameInput, "فضلًا أدخل اسمك.");
    isValid = false;
  }

  if (!email) {
    showError(emailInput, "فضلًا أدخل بريدك الإلكتروني.");
    isValid = false;
  } else if (!emailPattern.test(email)) {
    showError(emailInput, "الرجاء إدخال بريد إلكتروني صالح. مثال: example@email.com");
    isValid = false;
  }

  if (!subject) {
    showError(subjectInput, "فضلًا أدخل موضوع الرسالة.");
    isValid = false;
  }

  if (!message) {
    showError(messageInput, "فضلًا أدخل الرسالة.");
    isValid = false;
  } else if (message.length > 300) {
    showError(messageInput, "فضلًا لا تتجاوز ٣٠٠ حرف.");
    isValid = false;
  }

  if (!isValid) return;

  const { data, error } = await supabaseClient
    .from("رسائل_التواصل")
    .insert([{ الاسم: name, الايميل: email, الموضوع: subject, الرسالة: message }]);

  if (error) {
    console.error("❌ Error:", error);
    showError(messageInput, "حدث خطأ أثناء الإرسال.");
  } else {
    alert("تم إرسال الرسالة بنجاح!");
    e.target.reset();
    clearAllErrors();
  }
});

// Function to display an error message below the input field
function showError(inputElement, message) {
  clearError(inputElement);

  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerText = message;
  inputElement.parentNode.appendChild(errorDiv);
}

// Function to remove the error message from a specific field
function clearError(inputElement) {
  const parent = inputElement.parentNode;
  const oldError = parent.querySelector('.error-message');
  if (oldError) oldError.remove();
}

// Function to remove all error messages from the form
function clearAllErrors() {
  const allErrors = document.querySelectorAll(".error-message");
  allErrors.forEach(err => err.remove());
}

// Automatically clear the error message when the user types in the input
["contactName", "contactEmail", "contactSubject", "contactMessage"].forEach(id => {
  const input = document.getElementById(id);
  input.addEventListener("input", () => clearError(input));
});

// Clear all errors and reset the form when closing the modal
document.querySelector(".close-button").addEventListener("click", () => {
  clearAllErrors();
  document.getElementById("shareForm").reset();
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