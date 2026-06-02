/**
 * ==========================================================================
 * ADMISSION PORTAL JAVASCRIPT (admission.js)
 * Lakshya Private Tuitions - Online Admission Portal Logic
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('admissionForm');
    const stepPanels = document.querySelectorAll('.form-step-panel');
    const stepItems = document.querySelectorAll('#steps-indicator-list .step-item');
    const prevBtn = document.getElementById('prevStepBtn');
    const nextBtn = document.getElementById('nextStepBtn');
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    const submitBtn = document.getElementById('submitAdmissionBtn');
    
    // Address Sync
    const sameAddressToggle = document.getElementById('sameAddressToggle');
    const permAddressInput = document.getElementById('permanentAddress');
    const corrAddressInput = document.getElementById('correspondenceAddress');
    
    // File Upload Zones
    const fileInputs = {
        photo: {
            input: document.getElementById('studentPhoto'),
            zone: document.getElementById('photo-upload-zone'),
            card: document.getElementById('photo-preview-card'),
            name: document.getElementById('photo-file-name'),
            size: document.getElementById('photo-file-size'),
            remove: document.getElementById('photo-remove-btn'),
            error: document.getElementById('photo-error'),
            allowedTypes: ['image/png', 'image/jpeg', 'image/jpg'],
            maxSize: 2 * 1024 * 1024 // 2MB
        },
        aadhaar: {
            input: document.getElementById('aadhaarCopy'),
            zone: document.getElementById('aadhaar-upload-zone'),
            card: document.getElementById('aadhaar-preview-card'),
            name: document.getElementById('aadhaar-file-name'),
            size: document.getElementById('aadhaar-file-size'),
            remove: document.getElementById('aadhaar-remove-btn'),
            error: document.getElementById('aadhaar-error'),
            allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'],
            maxSize: 5 * 1024 * 1024 // 5MB
        },
        marksheet: {
            input: document.getElementById('marksheetCopy'),
            zone: document.getElementById('marksheet-upload-zone'),
            card: document.getElementById('marksheet-preview-card'),
            name: document.getElementById('marksheet-file-name'),
            size: document.getElementById('marksheet-file-size'),
            remove: document.getElementById('marksheet-remove-btn'),
            error: document.getElementById('marksheet-error'),
            allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'],
            maxSize: 5 * 1024 * 1024 // 5MB
        }
    };

    // Terms scroll control and consent checkboxes
    const termsScrollContainer = document.getElementById('termsScrollContainer');
    const scrollIndicator = document.getElementById('scrollIndicator');
    const consentTerms = document.getElementById('consentTerms');
    const consentRefund = document.getElementById('consentRefund');
    const consentCommunication = document.getElementById('consentCommunication');
    
    // Signature Elements
    const signatureInput = document.getElementById('signature');
    const signaturePreview = document.getElementById('signature-preview');
    
    // Modal Overlays
    const spinnerOverlay = document.getElementById('spinnerOverlay');
    const successModal = document.getElementById('successModal');
    const successCloseBtn = document.getElementById('successCloseBtn');
    
    // Stepper State Variable
    let currentStep = 1;
    const totalSteps = 8;
    
    // Required fields mapping per step for validation
    const stepFields = {
        1: ['firstName', 'lastName', 'dob', 'gender', 'bloodGroup', 'studentMobile', 'studentEmail', 'aadhaarNo'],
        2: ['fatherName', 'motherName', 'parentMobile', 'fatherOccupation', 'motherOccupation'],
        3: ['permanentAddress', 'correspondenceAddress', 'state', 'city', 'pinCode'],
        4: ['courses', 'preferredTiming', 'branch'], // Custom check for courses checkbox group
        5: ['schoolCollege', 'board', 'previousPercentage', 'scholarship', 'subjects'],
        6: ['studentPhoto', 'aadhaarCopy', 'marksheetCopy'], // Custom check for file inputs
        7: ['consentTerms', 'consentRefund', 'consentCommunication'],
        8: ['signature']
    };

    // All required input fields for global progress tracker calculation
    const allRequiredTextIds = [
        'firstName', 'lastName', 'dob', 'gender', 'bloodGroup', 'studentMobile', 'studentEmail', 'aadhaarNo',
        'fatherName', 'motherName', 'parentMobile', 'fatherOccupation', 'motherOccupation',
        'permanentAddress', 'correspondenceAddress', 'state', 'city', 'pinCode',
        'preferredTiming', 'branch',
        'schoolCollege', 'board', 'previousPercentage', 'scholarship', 'subjects',
        'signature'
    ];

    // ==========================================================================
    // STEP PANEL NAVIGATION & ANIMATIONS
    // ==========================================================================
    
    function showStep(stepNum) {
        // Slide out old step, slide in new step
        stepPanels.forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`step-${stepNum}-panel`).classList.add('active');

        // Update Desktop Sidebar Indicators
        stepItems.forEach(item => {
            const itemStep = parseInt(item.getAttribute('data-step'));
            item.classList.remove('active');
            
            if (itemStep === stepNum) {
                item.classList.add('active');
            }
            if (itemStep < stepNum) {
                item.classList.add('completed');
            } else {
                item.classList.remove('completed');
            }
        });

        // Set Navigation Buttons State
        if (stepNum === 1) {
            prevBtn.disabled = true;
        } else {
            prevBtn.disabled = false;
        }

        if (stepNum === totalSteps) {
            nextBtn.style.display = 'none';
            // Sync summary page values
            populateSummaryCard();
        } else {
            nextBtn.style.display = 'inline-flex';
            nextBtn.querySelector('span').innerText = stepNum === totalSteps - 1 ? 'Review Details' : 'Next Step';
        }

        // Scroll main form panel into view on mobile
        if (window.innerWidth <= 768) {
            document.querySelector('.admission-form-card').scrollIntoView({ behavior: 'smooth' });
        }
        
        currentStep = stepNum;
    }

    // Next Step handler
    function handleNextStep() {
        if (validateStep(currentStep)) {
            if (currentStep < totalSteps) {
                showStep(currentStep + 1);
                updateProgress();
            }
        } else {
            // Scroll to the first invalid element inside panel
            const firstInvalid = document.querySelector(`.form-step-panel.active .form-group.invalid`);
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    // Prev Step handler
    function handlePrevStep() {
        if (currentStep > 1) {
            showStep(currentStep - 1);
            updateProgress();
        }
    }

    // Attach Stepper Navigation click event handlers
    nextBtn.addEventListener('click', handleNextStep);
    prevBtn.addEventListener('click', handlePrevStep);

    // Sidebar quick jump (only for completed or previous steps)
    stepItems.forEach(item => {
        item.addEventListener('click', () => {
            const clickedStep = parseInt(item.getAttribute('data-step'));
            
            // Allow clicking if transitioning backwards or jumping forwards to adjacent validated steps
            if (clickedStep < currentStep) {
                showStep(clickedStep);
            } else if (clickedStep > currentStep) {
                // To go forward, we must validate all steps in between
                let canGoForward = true;
                for (let i = currentStep; i < clickedStep; i++) {
                    if (!validateStep(i)) {
                        canGoForward = false;
                        showStep(i);
                        break;
                    }
                }
                if (canGoForward) {
                    showStep(clickedStep);
                }
            }
        });
    });

    // ==========================================================================
    // INLINE FORM VALIDATIONS
    // ==========================================================================
    
    // Core validator for a single step
    function validateStep(stepNum) {
        let isStepValid = true;
        const fields = stepFields[stepNum];

        fields.forEach(fieldName => {
            // Custom validations for checkboxes
            if (fieldName === 'courses') {
                const checkboxes = document.querySelectorAll('input[name="courses"]:checked');
                const cbGroup = document.querySelector('.required-checkbox-group');
                if (checkboxes.length === 0) {
                    cbGroup.classList.add('invalid');
                    isStepValid = false;
                } else {
                    cbGroup.classList.remove('invalid');
                }
                return;
            }

            // Custom validations for file inputs
            if (fieldName === 'studentPhoto' || fieldName === 'aadhaarCopy' || fieldName === 'marksheetCopy') {
                const configKey = fieldName === 'studentPhoto' ? 'photo' : (fieldName === 'aadhaarCopy' ? 'aadhaar' : 'marksheet');
                const fileObj = fileInputs[configKey];
                const formGroup = fileObj.zone.closest('.upload-box-group');
                
                if (!fileObj.input.files || fileObj.input.files.length === 0) {
                    formGroup.classList.add('invalid');
                    fileObj.error.style.display = 'flex';
                    fileObj.error.innerText = 'This document is mandatory. Please upload a file.';
                    isStepValid = false;
                } else {
                    formGroup.classList.remove('invalid');
                    fileObj.error.style.display = 'none';
                }
                return;
            }

            // Regular field validation
            const field = document.getElementById(fieldName);
            if (!field) return;

            const formGroup = field.closest('.form-group');
            if (!formGroup) return;

            let isFieldValid = true;

            // Empty field checks
            if (field.hasAttribute('required') && !field.value.trim()) {
                isFieldValid = false;
            } 
            // Email pattern checks
            else if (field.type === 'email' && field.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(field.value.trim())) {
                    isFieldValid = false;
                    formGroup.querySelector('.error-msg').innerText = 'Please enter a valid email address.';
                }
            } 
            // Tel/Mobile pattern checks
            else if (field.type === 'tel' && field.value.trim()) {
                const phoneRegex = /^[0-9]{10}$/;
                if (!phoneRegex.test(field.value.trim())) {
                    isFieldValid = false;
                }
            }
            // Aadhaar pattern check
            else if (fieldName === 'aadhaarNo' && field.value.trim()) {
                const aadhaarRegex = /^[0-9]{12}$/;
                if (!aadhaarRegex.test(field.value.trim())) {
                    isFieldValid = false;
                }
            }
            // PIN Code pattern check
            else if (fieldName === 'pinCode' && field.value.trim()) {
                const pinRegex = /^[0-9]{6}$/;
                if (!pinRegex.test(field.value.trim())) {
                    isFieldValid = false;
                }
            }
            // Percentage limit check
            else if (fieldName === 'previousPercentage' && field.value.trim()) {
                const pct = parseFloat(field.value);
                if (isNaN(pct) || pct < 0 || pct > 100) {
                    isFieldValid = false;
                }
            }
            // Consent checkbox checks
            else if (field.type === 'checkbox' && field.hasAttribute('required')) {
                if (!field.checked) {
                    isFieldValid = false;
                }
            }

            if (!isFieldValid) {
                formGroup.classList.add('invalid');
                isStepValid = false;
            } else {
                formGroup.classList.remove('invalid');
            }
        });

        return isStepValid;
    }

    // Real-time error removal as user corrects input
    const inputSelectors = 'input, select, textarea';
    form.querySelectorAll(inputSelectors).forEach(input => {
        // Clear invalid style on input
        input.addEventListener('input', () => {
            const formGroup = input.closest('.form-group');
            if (formGroup && formGroup.classList.contains('invalid')) {
                // If it is non-empty or matches basic checks, remove invalid state
                if (input.value.trim()) {
                    formGroup.classList.remove('invalid');
                }
            }
            // Special trigger for live signature cursive updates
            if (input.id === 'signature') {
                updateSignaturePreview();
            }
            updateProgress();
        });

        // Dropdowns clear instantly on change
        input.addEventListener('change', () => {
            const formGroup = input.closest('.form-group');
            if (formGroup && formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid');
            }
            
            // Courses specific checkbox updates
            if (input.name === 'courses') {
                const cbGroup = document.querySelector('.required-checkbox-group');
                const checkedCount = document.querySelectorAll('input[name="courses"]:checked').length;
                if (checkedCount > 0) {
                    cbGroup.classList.remove('invalid');
                }
            }
            updateProgress();
        });
    });

    // ==========================================================================
    // PROGRESS PERCENTAGE CALCULATOR (REAL-TIME)
    // ==========================================================================
    
    function updateProgress() {
        let totalRequired = allRequiredTextIds.length + 3 + 3; // text ids + 3 uploads + 3 consent check boxes
        let completedCount = 0;

        // 1. Text, Select and Textarea Required Fields
        allRequiredTextIds.forEach(id => {
            const el = document.getElementById(id);
            if (el && el.value.trim()) {
                // Perform additional pattern checking to count as validated
                let isValid = true;
                if (el.type === 'email') {
                    isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
                } else if (el.type === 'tel') {
                    isValid = /^[0-9]{10}$/.test(el.value.trim());
                } else if (id === 'aadhaarNo') {
                    isValid = /^[0-9]{12}$/.test(el.value.trim());
                } else if (id === 'pinCode') {
                    isValid = /^[0-9]{6}$/.test(el.value.trim());
                } else if (id === 'previousPercentage') {
                    const pct = parseFloat(el.value);
                    isValid = !isNaN(pct) && pct >= 0 && pct <= 100;
                }
                
                if (isValid) {
                    completedCount++;
                }
            }
        });

        // 2. Courses selection check (at least 1 checked counts as completed field)
        const checkedCourses = document.querySelectorAll('input[name="courses"]:checked').length;
        if (checkedCourses > 0) {
            completedCount++;
        }

        // 3. Mandatory document uploads (1 point each)
        if (fileInputs.photo.input.files && fileInputs.photo.input.files.length > 0) completedCount++;
        if (fileInputs.aadhaar.input.files && fileInputs.aadhaar.input.files.length > 0) completedCount++;
        if (fileInputs.marksheet.input.files && fileInputs.marksheet.input.files.length > 0) completedCount++;

        // 4. Consent Checkboxes (1 point each)
        if (consentTerms.checked) completedCount++;
        if (consentRefund.checked) completedCount++;
        if (consentCommunication.checked) completedCount++;

        // Calculate and round off percentage
        let percentage = Math.round((completedCount / totalRequired) * 100);
        if (percentage > 100) percentage = 100;

        // Update UI
        const progressFill = document.getElementById('progress-fill');
        const progressLabel = document.getElementById('progress-percentage');
        
        progressFill.style.width = `${percentage}%`;
        progressLabel.innerText = `${percentage}%`;
        
        // Sticky progress wrapper glow effect when full
        const progressWrapper = document.querySelector('.progress-bar-wrapper');
        if (percentage === 100) {
            progressWrapper.style.boxShadow = '0 0 20px rgba(0, 102, 255, 0.2)';
            progressWrapper.style.borderColor = 'rgba(0, 102, 255, 0.4)';
        } else {
            progressWrapper.style.boxShadow = 'var(--shadow-sm)';
            progressWrapper.style.borderColor = 'rgba(0, 71, 171, 0.1)';
        }
    }

    // ==========================================================================
    // SAME AS PERMANENT ADDRESS COPY LOGIC
    // ==========================================================================
    
    sameAddressToggle.addEventListener('change', () => {
        syncAddressDetails();
    });

    permAddressInput.addEventListener('input', () => {
        if (sameAddressToggle.checked) {
            corrAddressInput.value = permAddressInput.value;
            // Clear invalid borders if copied successfully
            const corrGroup = corrAddressInput.closest('.form-group');
            if (corrGroup) corrGroup.classList.remove('invalid');
        }
    });

    function syncAddressDetails() {
        if (sameAddressToggle.checked) {
            corrAddressInput.value = permAddressInput.value;
            corrAddressInput.readOnly = true;
            // Visual locking feedback styling
            corrAddressInput.style.background = 'rgba(239, 243, 250, 0.7)';
            corrAddressInput.style.borderColor = 'rgba(0, 71, 171, 0.1)';
            
            const corrGroup = corrAddressInput.closest('.form-group');
            if (corrGroup) corrGroup.classList.remove('invalid');
        } else {
            corrAddressInput.readOnly = false;
            corrAddressInput.style.background = 'rgba(255, 255, 255, 0.9)';
            corrAddressInput.style.borderColor = 'rgba(0, 71, 171, 0.15)';
        }
        updateProgress();
    }

    // ==========================================================================
    // MODERN DOCUMENTS DRAG & DROP FILE UPLOAD
    // ==========================================================================
    
    Object.keys(fileInputs).forEach(key => {
        const fileObj = fileInputs[key];
        const input = fileObj.input;
        const zone = fileObj.zone;
        const card = fileObj.card;
        const nameEl = fileObj.name;
        const sizeEl = fileObj.size;
        const removeBtn = fileObj.remove;
        const errorEl = fileObj.error;
        const formGroup = zone.closest('.upload-box-group');

        // Trigger input select on zone click
        zone.addEventListener('click', (e) => {
            if (e.target !== input) {
                input.click();
            }
        });

        // Drag & drop visual events
        ['dragenter', 'dragover'].forEach(eventName => {
            zone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                zone.classList.add('drag-active');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            zone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                zone.classList.remove('drag-active');
            }, false);
        });

        // Drop file handler
        zone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0) {
                input.files = files;
                handleFileSelection(fileObj, files[0]);
            }
        });

        // Manual select file handler
        input.addEventListener('change', () => {
            if (input.files.length > 0) {
                handleFileSelection(fileObj, input.files[0]);
            }
        });

        // File remove button handler
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Clear input files and base64 properties
            input.value = '';
            fileObj.base64 = '';
            fileObj.fileName = '';
            
            // Visual toggles
            card.style.display = 'none';
            zone.style.display = 'flex';
            formGroup.classList.remove('invalid');
            errorEl.style.display = 'none';
            
            updateProgress();
        });
    });

    // Process file checks (types, size limitations) and show cards
    function handleFileSelection(fileObj, file) {
        const zone = fileObj.zone;
        const card = fileObj.card;
        const nameEl = fileObj.name;
        const sizeEl = fileObj.size;
        const errorEl = fileObj.error;
        const formGroup = zone.closest('.upload-box-group');

        // Check Type
        if (!fileObj.allowedTypes.includes(file.type)) {
            formGroup.classList.add('invalid');
            errorEl.style.display = 'flex';
            errorEl.innerText = 'Unsupported file format. Please upload approved formats only.';
            fileObj.input.value = '';
            fileObj.base64 = '';
            fileObj.fileName = '';
            return;
        }

        // Check Size
        if (file.size > fileObj.maxSize) {
            formGroup.classList.add('invalid');
            errorEl.style.display = 'flex';
            errorEl.innerText = `File is too large. Maximum size allowed is ${Math.round(fileObj.maxSize / (1024 * 1024))}MB.`;
            fileObj.input.value = '';
            fileObj.base64 = '';
            fileObj.fileName = '';
            return;
        }

        // Valid File - Read as Base64 for Sheets/Drive storage
        const reader = new FileReader();
        reader.onload = function(e) {
            fileObj.base64 = e.target.result.split(',')[1]; // pure base64
            fileObj.fileName = file.name;
        };
        reader.readAsDataURL(file);

        // Render UI Preview details
        formGroup.classList.remove('invalid');
        errorEl.style.display = 'none';
        
        nameEl.innerText = file.name;
        sizeEl.innerText = formatFileSize(file.size);
        
        // Toggle view
        zone.style.display = 'none';
        card.style.display = 'flex';
        
        updateProgress();
    }

    // Helper format size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // ==========================================================================
    // TERMS SCROLL AND REQUIRED CONSENT CONTROLLER
    // ==========================================================================
    
    let scrolledToBottom = false;

    // Check if terms box scrolled to bottom
    termsScrollContainer.addEventListener('scroll', () => {
        // Offset of 10px to account for browser sizing differences
        const isBottom = termsScrollContainer.scrollHeight - termsScrollContainer.scrollTop <= termsScrollContainer.clientHeight + 10;
        
        if (isBottom && !scrolledToBottom) {
            scrolledToBottom = true;
            scrollIndicator.classList.add('reached-bottom');
            scrollIndicator.querySelector('span').innerText = 'You have read all terms. You can now tick the checkboxes below.';
            scrollIndicator.querySelector('ion-icon').setAttribute('name', 'checkmark-circle-outline');
        }
    });

    // Consent checkboxes require scrolling first to feel highly professional
    const consents = [consentTerms, consentRefund, consentCommunication];
    consents.forEach(cb => {
        cb.addEventListener('change', (e) => {
            if (!scrolledToBottom) {
                e.preventDefault();
                cb.checked = false;
                
                // Highlight the terms box and prompt user
                termsScrollContainer.style.borderColor = 'var(--accent-red)';
                termsScrollContainer.style.boxShadow = '0 0 12px rgba(220, 53, 69, 0.2)';
                
                scrollIndicator.style.color = 'var(--accent-red)';
                scrollIndicator.querySelector('span').innerText = 'ATTENTION: Please scroll to the bottom of terms before agreeing.';
                
                setTimeout(() => {
                    termsScrollContainer.style.borderColor = 'rgba(0, 71, 171, 0.15)';
                    termsScrollContainer.style.boxShadow = 'inset 0 4px 8px rgba(0,0,0,0.03)';
                    scrollIndicator.style.color = 'var(--cobalt-blue)';
                    scrollIndicator.querySelector('span').innerText = 'Please scroll to the bottom of the terms to read the full policy.';
                }, 4000);
                
                return;
            }
            
            // Clear invalid box
            const formGroup = cb.closest('.custom-checkbox-container');
            if (formGroup && cb.checked) {
                cb.closest('.consent-checkboxes-wrapper').querySelectorAll('.inline-error').forEach(err => {
                    err.style.display = 'none';
                });
            }
            
            checkConsentSubmissionStatus();
            updateProgress();
        });
    });

    // Check if all consents are active to unlock the submit button
    function checkConsentSubmissionStatus() {
        const signatureFilled = signatureInput.value.trim().length > 0;
        
        if (consentTerms.checked && consentRefund.checked && consentCommunication.checked && signatureFilled) {
            submitBtn.removeAttribute('disabled');
        } else {
            submitBtn.setAttribute('disabled', 'true');
        }
    }

    // ==========================================================================
    // ELEGANT CURSIVE SIGNATURE DECLARATION PREVIEW
    // ==========================================================================
    
    signatureInput.addEventListener('input', () => {
        updateSignaturePreview();
        checkConsentSubmissionStatus();
    });

    function updateSignaturePreview() {
        const sigVal = signatureInput.value.trim();
        
        if (sigVal) {
            signaturePreview.innerText = sigVal;
            signaturePreview.classList.add('signed');
        } else {
            signaturePreview.innerText = 'Your digital signature will appear here';
            signaturePreview.classList.remove('signed');
        }
    }

    // ==========================================================================
    // DYNAMIC POPULATION FOR SUMMARY SCREEN
    // ==========================================================================
    
    function populateSummaryCard() {
        const first = document.getElementById('firstName').value.trim();
        const last = document.getElementById('lastName').value.trim();
        const email = document.getElementById('studentEmail').value.trim();
        const mobile = document.getElementById('studentMobile').value.trim();
        
        // Selected Courses string representation
        const courses = Array.from(document.querySelectorAll('input[name="courses"]:checked'))
                             .map(cb => cb.value)
                             .join(', ');
                             
        const branchVal = document.getElementById('branch').value;
        const branchClean = branchVal ? branchVal.split(' Branch')[0] : '—';

        document.getElementById('summary-name').innerText = `${first} ${last}` || '—';
        document.getElementById('summary-email').innerText = email || '—';
        document.getElementById('summary-mobile').innerText = mobile || '—';
        document.getElementById('summary-courses').innerText = courses || 'No courses selected';
        document.getElementById('summary-branch').innerText = branchClean || '—';
    }

    // ==========================================================================
    // LOCALSTORAGE DRAFT MANAGEMENT (SAVE & LOAD)
    // ==========================================================================
    
    saveDraftBtn.addEventListener('click', (e) => {
        e.preventDefault();
        saveFormDraft();
    });

    function saveFormDraft() {
        const draftData = {};
        
        // 1. Save Text, Select, Textareas
        const inputs = form.querySelectorAll('input:not([type="file"]):not([type="checkbox"]), select, textarea');
        inputs.forEach(input => {
            if (input.id) {
                draftData[input.id] = input.value;
            }
        });

        // 2. Save Address sync state
        draftData['sameAddressToggle'] = sameAddressToggle.checked;

        // 3. Save Selected Courses
        const checkedCourses = Array.from(document.querySelectorAll('input[name="courses"]:checked')).map(cb => cb.value);
        draftData['selectedCourses'] = checkedCourses;

        localStorage.setItem('lpt_admission_draft', JSON.stringify(draftData));
        
        // Show Toast/Notification that Draft is Saved
        showNotification('Form Draft Saved Successfully!', 'info');
    }

    function loadFormDraft() {
        const savedDraft = localStorage.getItem('lpt_admission_draft');
        if (!savedDraft) return;

        try {
            const draftData = JSON.parse(savedDraft);
            
            // Restore Text, Select, Textareas
            Object.keys(draftData).forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.value = draftData[id];
                }
            });

            // Restore address toggle
            if (draftData['sameAddressToggle'] !== undefined) {
                sameAddressToggle.checked = draftData['sameAddressToggle'];
                syncAddressDetails();
            }

            // Restore Selected Courses Checkboxes
            if (draftData['selectedCourses'] && Array.from(draftData['selectedCourses']).length > 0) {
                const coursesArray = draftData['selectedCourses'];
                coursesArray.forEach(val => {
                    const cb = document.querySelector(`input[name="courses"][value="${val}"]`);
                    if (cb) {
                        cb.checked = true;
                    }
                });
            }

            // Live Updates
            updateSignaturePreview();
            updateProgress();
            checkConsentSubmissionStatus();
            
            showNotification('Welcome back! Your saved application draft has been loaded.', 'success');
        } catch (error) {
            console.error('Error loading admission draft:', error);
        }
    }

    // Call draft loader on start
    loadFormDraft();

    // Custom Elegant Notification Toast
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.bottom = '30px';
        notification.style.right = '30px';
        notification.style.padding = '16px 24px';
        notification.style.borderRadius = '12px';
        notification.style.background = type === 'success' ? '#2e7d32' : '#0047AB';
        notification.style.color = '#fff';
        notification.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
        notification.style.fontFamily = 'Inter, sans-serif';
        notification.style.fontSize = '0.92rem';
        notification.style.fontWeight = '600';
        notification.style.zIndex = '999999';
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.gap = '10px';
        notification.style.transform = 'translateY(100px)';
        notification.style.opacity = '0';
        notification.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

        const iconName = type === 'success' ? 'checkmark-circle-outline' : 'information-circle-outline';
        notification.innerHTML = `<ion-icon name="${iconName}" style="font-size: 1.4rem;"></ion-icon> <span>${message}</span>`;
        
        document.body.appendChild(notification);
        
        // Trigger reflow
        notification.offsetHeight;
        
        // Slide up
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateY(50px)';
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 450);
        }, 4000);
    }

    // ==========================================================================
    // FORM SUBMISSION & SUCCESS OVERLAY HANDLER
    // ==========================================================================
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Final sanity check of steps 1 to 7
        let allValid = true;
        for (let i = 1; i <= totalSteps; i++) {
            if (!validateStep(i)) {
                allValid = false;
                showStep(i);
                break;
            }
        }

        if (allValid) {
            // Trigger Intermediate loading animation spinner overlay
            spinnerOverlay.style.display = 'flex';
            
            // Collect all form details for Excel/Google Sheets storage
            const checkedCourses = Array.from(document.querySelectorAll('input[name="courses"]:checked')).map(cb => cb.value).join(', ');
            
            const formData = {
                FormType: 'Admission',
                FirstName: document.getElementById('firstName').value,
                LastName: document.getElementById('lastName').value,
                DateOfBirth: document.getElementById('dob').value,
                Gender: document.getElementById('gender').value,
                BloodGroup: document.getElementById('bloodGroup').value,
                StudentMobile: document.getElementById('studentMobile').value,
                StudentEmail: document.getElementById('studentEmail').value,
                AadhaarNo: document.getElementById('aadhaarNo').value,
                InstagramId: document.getElementById('instagramId').value || 'N/A',
                FatherName: document.getElementById('fatherName').value,
                MotherName: document.getElementById('motherName').value,
                GuardianName: document.getElementById('guardianName').value || 'N/A',
                ParentMobile: document.getElementById('parentMobile').value,
                FatherOccupation: document.getElementById('fatherOccupation').value,
                MotherOccupation: document.getElementById('motherOccupation').value,
                PermanentAddress: document.getElementById('permanentAddress').value,
                CorrespondenceAddress: document.getElementById('correspondenceAddress').value,
                State: document.getElementById('state').value,
                City: document.getElementById('city').value,
                PinCode: document.getElementById('pinCode').value,
                Courses: checkedCourses,
                PreferredTiming: document.getElementById('preferredTiming').value,
                Branch: document.getElementById('branch').value,
                SchoolCollege: document.getElementById('schoolCollege').value,
                Board: document.getElementById('board').value,
                PreviousPercentage: document.getElementById('previousPercentage').value,
                Scholarship: document.getElementById('scholarship').value,
                Subjects: document.getElementById('subjects').value,
                Signature: document.getElementById('signature').value,
                PhotoBase64: fileInputs.photo.base64 || '',
                PhotoName: fileInputs.photo.fileName || '',
                AadhaarBase64: fileInputs.aadhaar.base64 || '',
                AadhaarName: fileInputs.aadhaar.fileName || '',
                MarksheetBase64: fileInputs.marksheet.base64 || '',
                MarksheetName: fileInputs.marksheet.fileName || '',
                Timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
            };

            // Send to Google Sheets (Excel) database using same Apps Script endpoint
            const scriptURL = 'https://script.google.com/macros/s/AKfycbwHjfow_IzZODqp9jg2Ict84fY5MdX9atk05--GEDbVoRB394n2nhqMO6x3CSGlP9aRyQ/exec';
            
            fetch(scriptURL, {
                method: 'POST',
                mode: 'no-cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            }).then(() => {
                console.log('Admission data saved successfully to Google Sheets database!');
            }).catch(err => {
                console.error('Error saving admission data:', err);
            });
            
            // Simulate API transmission delay (2 seconds)
            setTimeout(() => {
                // Clear draft from LocalStorage upon successful submission
                localStorage.removeItem('lpt_admission_draft');
                
                // Hide spinner
                spinnerOverlay.style.display = 'none';
                
                // Populate dynamic success modal variables
                const first = document.getElementById('firstName').value.trim();
                const last = document.getElementById('lastName').value.trim();
                const branchVal = document.getElementById('branch').value;
                const branchClean = branchVal ? branchVal.split(' Branch')[0] : 'Mulund West Branch';
                const randomAppId = 'LPT-2026-' + Math.floor(1000 + Math.random() * 9000);

                document.getElementById('receipt-id').innerText = randomAppId;
                document.getElementById('receipt-name').innerText = `${first} ${last}`;
                document.getElementById('receipt-branch').innerText = branchClean;

                // Show Success modal
                successModal.style.display = 'flex';
                
                // Generate confetti burst
                generateConfetti();
            }, 2000);
        }
    });

    // Confetti Generator function for "Wow" factor
    function generateConfetti() {
        const holder = document.querySelector('.confetti-holder');
        holder.innerHTML = '';
        
        const colors = ['#FFD700', '#0066FF', '#0047AB', '#FF0040', '#4CAF50', '#FFBF00'];
        const totalConfetti = 80;

        for (let i = 0; i < totalConfetti; i++) {
            const dot = document.createElement('div');
            dot.style.position = 'absolute';
            
            // Random properties
            const size = Math.floor(Math.random() * 8) + 6;
            const left = Math.floor(Math.random() * 100);
            const top = Math.floor(Math.random() * 20) - 10; // start slightly offscreen top
            const color = colors[Math.floor(Math.random() * colors.length)];
            const delay = Math.random() * 2;
            const duration = Math.random() * 3 + 2;

            dot.style.width = `${size}px`;
            dot.style.height = `${size}px`;
            dot.style.backgroundColor = color;
            dot.style.left = `${left}%`;
            dot.style.top = `${top}%`;
            dot.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            dot.style.opacity = '0.9';
            dot.style.zIndex = '999';
            
            // CSS Animation
            dot.style.animation = `fallAndSpin ${duration}s linear ${delay}s infinite`;
            
            holder.appendChild(dot);
        }

        // Add Keyframe dynamically if not present
        if (!document.getElementById('confettiKeyframe')) {
            const style = document.createElement('style');
            style.id = 'confettiKeyframe';
            style.innerHTML = `
                @keyframes fallAndSpin {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(450px) rotate(720deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Success close back home button
    successCloseBtn.addEventListener('click', () => {
        successModal.style.display = 'none';
        window.location.href = 'index.html';
    });
});
