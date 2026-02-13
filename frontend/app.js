// DOM Elements
const form = document.getElementById('invitationForm');
const generateBtn = document.getElementById('generateBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const currentYear = document.getElementById('year');

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

// Real-time Preview Mapping
const previewInputs = ['eventTitle', 'description', 'eventDate', 'eventTime', 'location', 'agenda', 'organizer'];
previewInputs.forEach(id => {
    const input = document.getElementById(id);
    const prev = document.getElementById('prev' + id.charAt(0).toUpperCase() + id.slice(1));

    if (input && prev) {
        input.addEventListener('input', () => {
            if (id === 'eventDate') {
                const date = new Date(input.value);
                prev.textContent = isNaN(date.getTime()) ? 'October 25, 2025' : date.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });
            } else if (id === 'eventTime') {
                if (input.value) {
                    const [hours, minutes] = input.value.split(':');
                    const hour = parseInt(hours);
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    const displayHour = hour % 12 || 12;
                    prev.textContent = `${displayHour}:${minutes} ${ampm}`;
                } else {
                    prev.textContent = '11:00 AM';
                }
            } else if (id === 'location') {
                const container = document.getElementById('prevLocationContainer');
                prev.textContent = input.value || 'Imena Family Home, Kigali';
                if (container) container.style.display = input.value ? 'flex' : 'none';
            } else if (id === 'agenda') {
                const container = document.getElementById('prevAgendaContainer');
                prev.textContent = input.value || '11:00 AM - Arrival\n12:30 PM - Lunch';
                if (container) container.style.display = input.value ? 'block' : 'none';
            } else {
                let defaultValue = '';
                if (id === 'eventTitle') defaultValue = 'Family Gathering';
                if (id === 'organizer') defaultValue = 'Imena Family';

                prev.textContent = input.value || defaultValue;
            }
        });
    }
});

// Form submission handler (Fully Client-Side Generation)
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formatSelect = document.getElementById('exportFormat');
    const format = formatSelect ? formatSelect.value : 'pdf'; // Default to PDF

    // Reset messages
    successMessage.classList.add('hidden');
    errorMessage.classList.add('hidden');

    // Show loading state
    setLoadingState(true, format.toUpperCase());

    try {
        const { jsPDF } = window.jspdf;
        const element = document.getElementById('pdfCapture');

        if (!element) {
            throw new Error('Capture element not found');
        }

        // High quality capture
        const canvas = await html2canvas(element, {
            scale: 3, // Higher scale for better print quality
            useCORS: true,
            backgroundColor: null,
            logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const title = document.getElementById('eventTitle').value.trim().replace(/\s+/g, '-');
        const filename = `Imena-Invitation-${title || 'Event'}`;

        if (format === 'pdf') {
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Use a slight margin so it looks like a card on a page
            const margin = 10;
            const maxCardWidth = pdfWidth - (margin * 2);
            const maxCardHeight = pageHeight - (margin * 2);

            let finalWidth = maxCardWidth;
            let finalHeight = (canvas.height * maxCardWidth) / canvas.width;

            // Scale to fit page height if too tall
            if (finalHeight > maxCardHeight) {
                const scale = maxCardHeight / finalHeight;
                finalHeight = maxCardHeight;
                finalWidth = finalWidth * scale;
            }

            // Center on page
            const xOffset = (pdfWidth - finalWidth) / 2;
            const yOffset = (pageHeight - finalHeight) / 2;

            pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
            pdf.save(`${filename}.pdf`);
        } else {
            // PNG Download
            const link = document.createElement('a');
            link.href = imgData;
            link.download = `${filename}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        // Show success message
        successMessage.classList.remove('hidden');
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Update success message text
        const successText = successMessage.querySelector('.text-green-700');
        if (successText) {
            successText.textContent = `Your invitation (${format.toUpperCase()}) has been generated and downloaded.`;
        }

        // Add bounce animation
        successMessage.style.animation = 'fadeInUp 0.5s ease-out';

    } catch (error) {
        console.error('Error generating file:', error);
        errorText.textContent = 'Oops! Something went wrong while generating your invitation. Please try again.';
        errorMessage.classList.remove('hidden');
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } finally {
        // Reset loading state
        setLoadingState(false);
    }
});

// Set loading state
function setLoadingState(isLoading, format = 'PDF') {
    if (isLoading) {
        generateBtn.disabled = true;
        generateBtn.classList.add('opacity-75', 'cursor-not-allowed');
        btnText.textContent = `Generating ${format}...`;
        btnSpinner.classList.remove('hidden');
    } else {
        generateBtn.disabled = false;
        generateBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        // Reset to original text or dynamic text based on current selection
        const currentFormat = document.getElementById('exportFormat').value === 'pdf' ? 'PDF' : 'PNG';
        btnText.textContent = 'Generate Invitation';
        btnSpinner.classList.add('hidden');
    }
}

// Update button text when format changes (Optional UX improvement)
const exportFormatSelect = document.getElementById('exportFormat');
if (exportFormatSelect) {
    exportFormatSelect.addEventListener('change', (e) => {
        // We can keep it simple or make it specific like "Download PDF" / "Download PNG"
        // For now, "Generate Invitation" is clean enough, but let's keep it consistent.
    });
}

// Smooth scroll for anchor links
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

// Add input validation feedback
const inputs = form.querySelectorAll('input[required], textarea[required]');
inputs.forEach(input => {
    input.addEventListener('blur', function () {
        if (this.value.trim() === '') {
            this.classList.add('border-red-300');
            this.classList.remove('border-gray-200');
        } else {
            this.classList.remove('border-red-300');
            this.classList.add('border-green-300');
        }
    });

    input.addEventListener('input', function () {
        if (this.value.trim() !== '') {
            this.classList.remove('border-red-300');
            this.classList.add('border-green-300');
        }
    });
});

// Set minimum date to today
const dateInput = document.getElementById('eventDate');
if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
}

// Add character counter for textareas
const textareas = form.querySelectorAll('textarea');
textareas.forEach(textarea => {
    const maxLength = 500;

    // Create counter element
    const counter = document.createElement('div');
    counter.className = 'text-sm text-gray-500 mt-1 text-right';
    counter.textContent = `0 / ${maxLength} characters`;
    textarea.parentNode.appendChild(counter);

    textarea.addEventListener('input', function () {
        const length = this.value.length;
        counter.textContent = `${length} / ${maxLength} characters`;

        if (length > maxLength) {
            counter.classList.add('text-red-500');
            counter.classList.remove('text-gray-500');
        } else {
            counter.classList.remove('text-red-500');
            counter.classList.add('text-gray-500');
        }
    });
});

// Add entrance animations on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections for scroll animations
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(section);
});

// Console welcome message
console.log('%c🎉 Imena Paper Pop (Client-Side)', 'color: #1A74ED; font-size: 24px; font-weight: bold;');
console.log('%cEverything stays on your computer!', 'color: #666; font-size: 14px;');
