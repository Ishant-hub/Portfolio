document.addEventListener('DOMContentLoaded', () => {
  // --- Smooth Scrolling for Navigation ---
  const navLinks = document.querySelectorAll('.nav-item, .footer-nav-link, .hero-action-buttons a, .logo');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      
      // If it's just "#" or empty, scroll to top
      if (targetId === '#' || !targetId) {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        return;
      }
      
      if (targetId.startsWith('#')) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          
          // Calculate header offset
          const headerHeight = document.querySelector('.header').offsetHeight || 90;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // --- Scroll Spy: Highlight active nav link ---
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-item');
  
  const scrollSpyOptions = {
    root: null,
    rootMargin: '-30% 0px -60% 0px', // Trigger when section occupies the middle of the screen
    threshold: 0
  };

  const scrollSpyCallback = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(item => {
          item.classList.remove('active');
          if (item.getAttribute('href') === `#${id}`) {
            item.classList.add('active');
          }
        });
      }
    });
  };

  const observer = new IntersectionObserver(scrollSpyCallback, scrollSpyOptions);
  sections.forEach(section => observer.observe(section));

  // --- Contact Form Handling & Validation ---
  const contactForm = document.getElementById('contactForm');
  const successBox = document.getElementById('formSuccess');
  const successCloseBtn = document.getElementById('successCloseBtn');
  const submitBtn = document.getElementById('submitBtn');

  // Input elements
  const inputs = {
    firstName: document.getElementById('firstName'),
    lastName: document.getElementById('lastName'),
    email: document.getElementById('email'),
    message: document.getElementById('message')
  };

  // Error message elements
  const errors = {
    firstName: document.getElementById('firstNameError'),
    lastName: document.getElementById('lastNameError'),
    email: document.getElementById('emailError'),
    message: document.getElementById('messageError')
  };

  // Real-time validation on input/blur
  Object.keys(inputs).forEach(key => {
    const input = inputs[key];
    
    input.addEventListener('input', () => {
      clearValidationError(key);
    });

    input.addEventListener('blur', () => {
      validateField(key);
    });
  });

  function clearValidationError(fieldName) {
    inputs[fieldName].classList.remove('invalid');
    errors[fieldName].textContent = '';
  }

  function setValidationError(fieldName, message) {
    inputs[fieldName].classList.add('invalid');
    errors[fieldName].textContent = message;
  }

  function validateField(fieldName) {
    const val = inputs[fieldName].value.trim();
    
    if (!val) {
      setValidationError(fieldName, `${fieldName.replace(/([A-Z])/g, ' $1')} is required.`);
      return false;
    }

    if (fieldName === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        setValidationError(fieldName, 'Please enter a valid email address.');
        return false;
      }
    }

    clearValidationError(fieldName);
    return true;
  }

  function validateForm() {
    let isValid = true;
    Object.keys(inputs).forEach(key => {
      const fieldValid = validateField(key);
      if (!fieldValid) {
        isValid = false;
      }
    });
    return isValid;
  }

  // Handle Submit
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check frontend validation
    if (!validateForm()) {
      return;
    }

    // Set loading state on button
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = '...';
    submitBtn.disabled = true;

    // Build payload
    const formData = {
      firstName: inputs.firstName.value.trim(),
      lastName: inputs.lastName.value.trim(),
      email: inputs.email.value.trim(),
      message: inputs.message.value.trim()
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Show success overlay
        successBox.classList.remove('hidden');
        contactForm.reset();
      } else {
        // Display server-side error
        alert(result.error || 'An error occurred. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Failed to connect to the server. Please check your connection and try again.');
    } finally {
      // Restore button state
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    }
  });

  // Close success modal
  successCloseBtn.addEventListener('click', () => {
    successBox.classList.add('hidden');
  });

  // Close success modal when clicking outside
  document.addEventListener('click', (e) => {
    if (!successBox.classList.contains('hidden') && 
        !successBox.contains(e.target) && 
        e.target !== submitBtn) {
      successBox.classList.add('hidden');
    }
  });
});
