document.addEventListener('DOMContentLoaded', function() {
    
    // display form fields for share section
    const shareTypeSelect = document.getElementById('share-type'); 
    const addPoemFields = document.getElementById('addPoemFields');
    const editMistakeFields = document.getElementById('editMistakeFields');

    function showFields() {
        const selectedValue = shareTypeSelect.value;
        if (addPoemFields) addPoemFields.classList.add('hidden-fields'); 
        if (editMistakeFields) editMistakeFields.classList.add('hidden-fields');

        if (selectedValue === 'add-poem') {
            if (addPoemFields) addPoemFields.classList.remove('hidden-fields');
        } else if (selectedValue === 'edit-mistake') {
            if (editMistakeFields) editMistakeFields.classList.remove('hidden-fields');
        }
    }
    
    if (shareTypeSelect) {
        shareTypeSelect.addEventListener('change', showFields);
        showFields(); 
    }


    const dropdownBtn = document.getElementById('contactDropdownBtn');
    const dropdownContent = document.getElementById('contactDropdownContent'); 
    const dropdownArrow = document.querySelector('.dropdown-arrow');
    const scrollToShareLink = document.getElementById('scroll-to-share');
    const scrollToMap = document.getElementById('scroll-to-map');
    const openContactModalBtn = document.getElementById('open-contact-modal');
    const contactModal = document.getElementById('contactModal');
    const closeButton = contactModal ? contactModal.querySelector('.close-button') : null;

    // dropdown visibility
    if (dropdownBtn && dropdownContent && dropdownArrow) {
        dropdownBtn.addEventListener('click', function(event) {
            event.preventDefault(); 
            dropdownContent.classList.toggle('show');
            dropdownArrow.classList.toggle('rotate');
        });

        window.addEventListener('click', function(event) {
            if (!dropdownBtn.contains(event.target) && !dropdownContent.contains(event.target)) {
                if (dropdownContent.classList.contains('show')) {
                    dropdownContent.classList.remove('show');
                    dropdownArrow.classList.remove('rotate');
                }
            }
        });
    }

    // scroll to Share section
    if (scrollToShareLink && dropdownContent && dropdownArrow) {
        scrollToShareLink.addEventListener('click', function(event) {
            event.preventDefault(); 
            const shareSection = document.getElementById('share-section');
            if (shareSection) {
                shareSection.scrollIntoView({ behavior: 'smooth' });
            }
            dropdownContent.classList.remove('show');
            dropdownArrow.classList.remove('rotate');
        });
    }

    // scroll to map section
    if (scrollToMap && dropdownContent && dropdownArrow) {
        scrollToMap.addEventListener('click', function(event) {
            event.preventDefault(); 
            const mapSection = document.getElementById('map-section');
            if (mapSection) {
                mapSection.scrollIntoView({ behavior: 'smooth' });
            }
            dropdownContent.classList.remove('show');
            dropdownArrow.classList.remove('rotate');
        });
    }

    // open contact modal
    if (openContactModalBtn && contactModal) {
        openContactModalBtn.addEventListener('click', function(event) {
            event.preventDefault();
            contactModal.classList.add('show'); 
            document.body.style.overflow = 'hidden'; 
            
            if (dropdownContent && dropdownArrow) {
                dropdownContent.classList.remove('show');
                dropdownArrow.classList.remove('rotate');
            }
        });
    }

    // close contact modal when clicking on close button
    if (closeButton && contactModal) {
        closeButton.addEventListener('click', function() {
            contactModal.classList.remove('show'); 
            document.body.style.overflow = 'auto'; 
        });
    }

    // close contact modal when clicking outside of the modal content
    if (contactModal) {
        window.addEventListener('click', function(event) {
            if (event.target === contactModal) { 
                contactModal.classList.remove('show'); 
                document.body.style.overflow = 'auto'; 
            }
        });
    }

    // FAQ Modal functionality
    const faqModal = document.getElementById('faqModal');
    const openFaqModalBtns = document.querySelectorAll('#openFaqModal'); 
    const closeFaqModalBtn = faqModal.querySelector('.close-button-faq');
    const faqQuestions = faqModal.querySelectorAll('.faq-question');

    openFaqModalBtns.forEach(btn => {
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            faqModal.classList.add('show-modal');
            document.body.style.overflow = 'hidden';
        });
    });

    closeFaqModalBtn.addEventListener('click', () => {
        faqModal.classList.remove('show-modal');
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', (event) => {
        if (event.target === faqModal) {
            faqModal.classList.remove('show-modal');
            document.body.style.overflow = 'auto';
        }
    });

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isActive = question.classList.contains('active');

            faqQuestions.forEach(q => {
                if (q !== question && q.classList.contains('active')) {
                    q.classList.remove('active');
                    q.nextElementSibling.style.display = 'none';
                }
            });

            if (isActive) {
                question.classList.remove('active');
                answer.style.display = 'none';
            } else {
                question.classList.add('active');
                answer.style.display = 'block';
            }
        });
    });

});