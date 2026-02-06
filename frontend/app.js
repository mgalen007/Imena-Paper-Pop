// API Configuration
const API_URL = window.location.origin.includes('localhost')
    ? 'http://localhost:3000'
    : 'https://imena-backend.up.railway.app'; // Replace with your actual Railway backend URL

// DOM Elements
const form = document.getElementById('invitationForm');
const generateBtn = document.getElementById('generateBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const currentYear = document.getElementById('year');

currentYear.textContent = new Date().getFullYear();

// Form submission handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset messages
    successMessage.classList.add('hidden');
    errorMessage.classList.add('hidden');

    // Show loading state
    setLoadingState(true);

    try {
        // Gather form data
        const formData = {
            eventTitle: document.getElementById('eventTitle').value.trim(),
            eventDate: document.getElementById('eventDate').value,
            eventTime: document.getElementById('eventTime').value,
            location: document.getElementById('location').value.trim(),
            organizer: document.getElementById('organizer').value.trim(),
            description: document.getElementById('description').value.trim(),
            agenda: document.getElementById('agenda').value.trim()
        };

        // Validate required fields
        if (!formData.eventTitle || !formData.eventDate || !formData.eventTime) {
            throw new Error('Please fill in all required fields');
        }

        // Make API request
        const response = await fetch(`${API_URL}/api/generate-pdf`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate PDF');
        }

        // Get PDF blob
        const blob = await response.blob();

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Imena-Invitation-${formData.eventTitle.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Show success message
        successMessage.classList.remove('hidden');

        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Add success animation
        successMessage.style.animation = 'fadeInUp 0.5s ease-out';

        // Optional: Reset form after successful generation
        // form.reset();

    } catch (error) {
        console.error('Error:', error);

        // Show error message
        errorText.textContent = error.message || 'Something went wrong. Please try again.';
        errorMessage.classList.remove('hidden');

        // Scroll to error message
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Add error animation
        errorMessage.style.animation = 'fadeInUp 0.5s ease-out';

    } finally {
        // Reset loading state
        setLoadingState(false);
    }
});

// Set loading state
function setLoadingState(isLoading) {
    if (isLoading) {
        generateBtn.disabled = true;
        generateBtn.classList.add('opacity-75', 'cursor-not-allowed');
        btnText.textContent = 'Generating PDF...';
        btnSpinner.classList.remove('hidden');
    } else {
        generateBtn.disabled = false;
        generateBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        btnText.textContent = 'Generate Invitation PDF';
        btnSpinner.classList.add('hidden');
    }
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
const today = new Date().toISOString().split('T')[0];
dateInput.setAttribute('min', today);

// Auto-format time input
const timeInput = document.getElementById('eventTime');
timeInput.addEventListener('blur', function () {
    if (this.value) {
        // Ensure time is in 12-hour format for display purposes
        const [hours, minutes] = this.value.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;

        // Add a data attribute for display (optional)
        this.setAttribute('data-display', `${displayHour}:${minutes} ${ampm}`);
    }
});

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
console.log('%c🎉 Imena Paper Pop', 'color: #1A74ED; font-size: 24px; font-weight: bold;');
console.log('%cGenerate beautiful invitations for your family events!', 'color: #666; font-size: 14px;');
console.log('%c💡 Built with love for the Imena Family', 'color: #999; font-size: 12px; font-style: italic;');

// Check API health on load
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_URL}/api/health`);
        const data = await response.json();
        console.log('✅ API Status:', data.message);
    } catch (error) {
        console.warn('⚠️ API not reachable. Make sure the server is running on port 3000');
    }
}

// Check API health when page loads
checkAPIHealth();
