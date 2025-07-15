// بيانات مشروع Supabase
const SUPABASE_URL = "https://uuiyhcacxtbhffpwljix.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1aXloY2FjeHRiaGZmcHdsaml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExOTYyNjYsImV4cCI6MjA2Njc3MjI2Nn0.N1iXFjDfeXTLUsY51puvnHC-M-T2erCaQ1OTkXnT6uY";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// نموذج تواصل معنا
document.getElementById("contactForm").addEventListener("submit", async function (e) {
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

  // Automatically closes the contact form modal after successful submission
  const contactFormModal = document.getElementById("contactModal");
  if (contactFormModal) {
    contactFormModal.style.display = "none";
  }

});

// ✅ نموذج شاركنا
document.getElementById("shareform").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const shareTypeInput = document.getElementById("share-type");

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();
  const shareType = shareTypeInput.value;

  clearError(nameInput);
  clearError(emailInput);
  clearError(phoneInput);
  clearError(shareTypeInput);

  let isValid = true;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^\+9665\d{8}$/;

  if (!name) {
    showError(nameInput, "فضلًا أدخل اسمك.");
    isValid = false;
  }

  if (!email) {
    showError(emailInput, "فضلًا أدخل بريدك الإلكتروني.");
    isValid = false;
  } else if (!emailPattern.test(email)) {
    showError(emailInput, "البريد الإلكتروني المدخل غير صحيح. مثال: example@email.com");
    isValid = false;
  }

  if (!phone) {
    showError(phoneInput, "فضلًا أدخل رقم الهاتف.");
    isValid = false;
  } else if (!phonePattern.test(phone)) {
    showError(phoneInput, "رقم الهاتف يجب أن يكون بالصيغة التاليه:+9665xxxxxxxxx");
    isValid = false;
  }

  if (!shareType) {
    showError(shareTypeInput, "فضلًا اختر نوع المشاركة.");
    isValid = false;
  }

  if (!isValid) return;

  let dataToInsert = {
    الاسم: name,
    الايميل: email,
    الهاتف: phone,
    نوع_المشاركة: shareType
  };

  // validation-  إضافة شعر
  if (shareType === "add-poem") {
    const poetNameInput = document.getElementById("poetName");
    const poemTitleInput = document.getElementById("poemTitle");
    const poemLocationInput = document.getElementById("poemLocation");
    const poemExcerptInput = document.getElementById("poemExcerpt");

    const poetName = poetNameInput.value.trim();
    const poemTitle = poemTitleInput.value.trim();
    const poemLocation = poemLocationInput.value.trim();
    const poemExcerpt = poemExcerptInput.value.trim();

    clearError(poetNameInput);
    clearError(poemTitleInput);
    clearError(poemLocationInput);
    clearError(poemExcerptInput);

    let isPoemValid = true;

    if (!poetName) {
      showError(poetNameInput, "فضلًا أدخل اسم الشاعر.");
      isPoemValid = false;
    }

    if (!poemTitle) {
      showError(poemTitleInput, "فضلًا أدخل الغرض الشعري.");
      isPoemValid = false;
    }

    if (!poemLocation) {
      showError(poemLocationInput, "فضلًا أدخل اسم المكان.");
      isPoemValid = false;
    }

    if (!poemExcerpt) {
      showError(poemExcerptInput, "فضلًا أدخل جزئية من الشعر.");
      isPoemValid = false;
    }

    if (!isPoemValid) return;

    dataToInsert = {
      ...dataToInsert,
      اسم_الشاعر: poetName,
      عنوان_الشعر: poemTitle,
      المكان: poemLocation,
      جزئية_الشعر: poemExcerpt
    };
  }

  // validation-  تعديل الخطأ
  else if (shareType === "edit-mistake") {
    const editTypeInput = document.getElementById("editType");
    const editTitleInput = document.getElementById("editTitle");
    const suggestedEditInput = document.getElementById("suggestedEdit");

    const editType = editTypeInput.value;
    const editTitle = editTitleInput.value.trim();
    const suggestedEdit = suggestedEditInput.value.trim();

    clearError(editTypeInput);
    clearError(editTitleInput);
    clearError(suggestedEditInput);

    let isEditValid = true;

    if (!editType) {
      showError(editTypeInput, "فضلًا اختر نوع التعديل.");
      isEditValid = false;
    }

    if (!editTitle) {
      showError(editTitleInput, "فضلًا أدخل عنوان التعديل.");
      isEditValid = false;
    }

    if (!suggestedEdit) {
      showError(suggestedEditInput, "فضلًا أدخل التعديل المقترح.");
      isEditValid = false;
    }

    if (!isEditValid) return;

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
    showError(document.getElementById("shareform"), "حدث خطأ أثناء الإرسال. حاول مرة أخرى.");
  } else {
    alert("تم الإرسال بنجاح! شكرًا لمساهمتك ❤️");
    e.target.reset();
    clearAllErrors();
    document.getElementById("addPoemFields").style.display = "none";
    document.getElementById("editMistakeFields").style.display = "none";
  }
});

// Displays an error message below the specified input field
function showError(inputElement, message) {
  clearError(inputElement);
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerText = message;
  inputElement.parentNode.appendChild(errorDiv);
}

// Clears the error message for a specific input field
function clearError(inputElement) {
  const parent = inputElement.parentNode;
  const oldError = parent.querySelector('.error-message');
  if (oldError) oldError.remove();
}

// Clears all error messages across the entire page
function clearAllErrors() {
  const allErrors = document.querySelectorAll(".error-message");
  allErrors.forEach(err => err.remove());
}

// Automatically removes the error message when the user types or changes input
[
  "contactName", "contactEmail", "contactSubject", "contactMessage",
  "name", "email", "phone", "share-type",
  "poetName", "poemTitle", "poemLocation", "poemExcerpt",
  "editType", "editTitle", "suggestedEdit"
].forEach(id => {
  const input = document.getElementById(id);
  if (input) {
    input.addEventListener("input", () => clearError(input));
    input.addEventListener("change", () => clearError(input));
  }
});

// Clears all errors and resets both forms when the modal is closed
document.querySelectorAll(".close-button").forEach(button => {
  button.addEventListener("click", () => {
    clearAllErrors();
    document.getElementById("contactForm").reset();
    document.getElementById("shareform").reset();
  });
});
