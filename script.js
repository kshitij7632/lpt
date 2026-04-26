
// Mobile Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
const navClose = document.querySelector('.nav-close');
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.nav-link');

navToggle.addEventListener('click', () => {
    navbar.classList.add('active');
});

navClose.addEventListener('click', () => {
    navbar.classList.remove('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navbar.classList.remove('active');
    });
});

// Header Scroll Effect
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Active Navigation on Scroll
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelector('.nav-link[href*=' + sectionId + ']')?.classList.add('active');
        } else {
            document.querySelector('.nav-link[href*=' + sectionId + ']')?.classList.remove('active');
        }
    });
});

// Scroll Reveal Animation
const scrollRevealElements = document.querySelectorAll('.scroll-reveal');

const revealOnScroll = () => {
    scrollRevealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (elementTop < windowHeight - 100) {
            element.classList.add('revealed');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
revealOnScroll(); // Initial check

// Back to Top Button
const backToTop = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
        backToTop.classList.add('active');
    } else {
        backToTop.classList.remove('active');
    }
});

// Smooth Scroll for All Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animated Counter for Stats
const statNumbers = document.querySelectorAll('.stat-number');
let countersAnimated = false;

const animateCounters = () => {
    if (countersAnimated) return;

    const statsSection = document.querySelector('.stats');
    const statsSectionTop = statsSection.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (statsSectionTop < windowHeight - 100) {
        countersAnimated = true;

        statNumbers.forEach(stat => {
            const target = parseInt(stat.textContent);
            const suffix = stat.querySelector('span') ? stat.querySelector('span').textContent : '';
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    stat.innerHTML = target + (suffix ? `<span>${suffix}</span>` : '');
                    clearInterval(timer);
                } else {
                    stat.innerHTML = Math.ceil(current) + (suffix ? `<span>${suffix}</span>` : '');
                }
            }, 30);
        });
    }
};

window.addEventListener('scroll', animateCounters);

// Form Submission Handler - Google Sheets Integration
const contactForm = document.querySelector('.contact-form form');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    // Collect form data
    const formData = {
        Name: document.getElementById('name').value,
        Phone: document.getElementById('phone').value,
        Email: document.getElementById('email').value,
        Course: document.getElementById('class').value,
        Message: document.getElementById('message').value,
        Timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    try {
        // Replace this URL with your Google Apps Script Web App URL
        const scriptURL = 'https://script.google.com/macros/s/AKfycbwHjfow_IzZODqp9jg2Ict84fY5MdX9atk05--GEDbVoRB394n2nhqMO6x3CSGlP9aRyQ/exec';

        const response = await fetch(scriptURL, {
            method: 'POST',
            mode: 'no-cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        // Show success message
        alert('âœ… Thank you for your interest! We have received your enrollment request and will contact you within 24 hours.');
        contactForm.reset();

    } catch (error) {
        console.error('Error:', error);
        // Even if there's an error, the data might have been submitted
        alert('âœ… Form submitted! We will contact you soon. For immediate assistance, call: +91 98765 43210');
        contactForm.reset();
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

//ADD hover effect to course cards
const courseCards = document.querySelectorAll('.course-card');
courseCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.zIndex = '10';
    });
    card.addEventListener('mouseleave', () => {
        card.style.zIndex = '1';
    });
});
// Add this to your existing JavaScript section

// Touch Effects for Mobile
if ('ontouchstart' in window) {
    // Course Cards
    document.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('touchstart', function () {
            this.style.transform = 'translateY(-15px) scale(1.02)';
            this.style.borderColor = 'var(--bright-yellow)';
        });

        card.addEventListener('touchend', function () {
            setTimeout(() => {
                this.style.transform = '';
                this.style.borderColor = '';
            }, 200);
        });
    });

    // Faculty Cards
    document.querySelectorAll('.faculty-card').forEach(card => {
        card.addEventListener('touchstart', function () {
            this.style.transform = 'translateY(-15px) scale(1.03)';
            this.style.borderColor = 'var(--bright-yellow)';
        });

        card.addEventListener('touchend', function () {
            setTimeout(() => {
                this.style.transform = '';
                this.style.borderColor = '';
            }, 200);
        });
    });

    // Stat Items
    document.querySelectorAll('.stat-item').forEach(item => {
        item.addEventListener('touchstart', function () {
            this.style.transform = 'translateY(-10px) scale(1.03)';
            this.style.borderColor = 'var(--bright-yellow)';
        });

        card.addEventListener('touchend', function () {
            setTimeout(() => {
                this.style.transform = '';
                this.style.borderColor = '';
            }, 200);
        });
    });
}



window.addEventListener('DOMContentLoaded', function () {
    fetch('data.json').then(function (r) { return r.json() }).then(function (data) {
        console.log('Loaded data.json', data);
        var coursesEl = document.getElementById('courses-list');
        if (coursesEl && Array.isArray(data.courses)) {
            coursesEl.innerHTML = data.courses.map(function (c) { return '<li>' + c + '</li>' }).join('');
        }
        var branchesEl = document.getElementById('branches-list');
        if (branchesEl && Array.isArray(data.branches)) {
            branchesEl.innerHTML = data.branches.map(function (b) { return '<li>' + b.name + ' - ' + b.phone + '</li>' }).join('');
        }
        var testimonialsEl = document.getElementById('testimonials-list');
        if (testimonialsEl && Array.isArray(data.testimonials)) {
            testimonialsEl.innerHTML = data.testimonials.map(function (t) { return '<li>' + t + '</li>' }).join('');
        }
        var faqEl = document.getElementById('faq-list');
        if (faqEl && Array.isArray(data.faq)) {
            faqEl.innerHTML = data.faq.map(function (f) { return '<li>' + f.question + ': ' + f.answer + '</li>' }).join('');
        }
    }).catch(function (e) { console.error('data.json load failed', e) });
});
// ===== DOWNLOADS DROPDOWN TOGGLE =====
function toggleDropdown(button) {
    const dropdownItem = button.parentElement;
    const allDropdowns = document.querySelectorAll('.dropdown-item');

    // Close all other dropdowns
    allDropdowns.forEach(item => {
        if (item !== dropdownItem) {
            item.classList.remove('active');
        }
    });

    // Toggle current dropdown
    dropdownItem.classList.toggle('active');
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-item')) {
        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.classList.remove('active');
        });
    }
});

// ===== MOBILE-FRIENDLY PDF DOWNLOAD + PREVIEW HANDLER =====
// On mobile: Download PDF AND open in browser for preview
// On desktop: Download directly
document.addEventListener('DOMContentLoaded', function () {
    // Get all download links in the downloads section
    const downloadLinks = document.querySelectorAll('.downloads-section a[href$=".pdf"]');
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    downloadLinks.forEach(link => {
        if (isMobile) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const href = this.getAttribute('href');
                const fileName = href.split('/').pop();

                // Step 1: Open PDF in new tab for preview
                window.open(href, '_blank');

                // Step 2: Trigger download simultaneously
                fetch(href)
                    .then(response => {
                        if (!response.ok) throw new Error('Network response was not ok');
                        return response.blob();
                    })
                    .then(blob => {
                        // Create download link
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = fileName;
                        a.style.display = 'none';
                        document.body.appendChild(a);
                        a.click();

                        // Clean up
                        setTimeout(() => {
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                        }, 100);
                    })
                    .catch(err => {
                        console.error('Download failed:', err);
                        // Fallback: If download fails, at least the preview is open
                    });
            });
        }
        // On desktop: Keep download attribute for direct download (default browser behavior)
    });
});