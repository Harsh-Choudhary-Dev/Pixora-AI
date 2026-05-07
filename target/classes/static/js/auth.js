// Auth Pages JavaScript - Login & Signup

// Theme toggle functionality
function toggleTheme() {
    const html = document.documentElement;
    const themeIcon = document.getElementById('theme-icon');
    
    if (html.getAttribute('data-theme') === 'dark') {
        html.removeAttribute('data-theme');
        themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    } else {
        html.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('theme-icon');
    
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
    }

    // Initialize login form if present
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        initializeLoginForm();
    }

    // Initialize signup form if present
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        initializeSignupForm();
    }
});

// Login form functionality
function initializeLoginForm() {
    const loginForm = document.getElementById('login-form');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('error-message');
        
        // Basic validation
        if (!email || !password) {
            errorMessage.textContent = 'Please fill in all fields.';
            errorMessage.style.display = 'block';
            return;
        }
        
        if (!email.includes('@')) {
            errorMessage.textContent = 'Please enter a valid email address.';
            errorMessage.style.display = 'block';
            return;
        }
        
        // Hide error message on successful validation
        errorMessage.style.display = 'none';
        
        // Submit form using standard form submission
        this.submit();
    });

    // Hide error message when user starts typing
    document.getElementById('email').addEventListener('input', function() {
        document.getElementById('error-message').style.display = 'none';
    });
    
    document.getElementById('password').addEventListener('input', function() {
        document.getElementById('error-message').style.display = 'none';
    });
}

// Signup form functionality
function initializeSignupForm() {
    const signupForm = document.getElementById('signup-form');
    
    // Password strength checker
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            checkPasswordStrength(this.value);
        });
    }
    
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const termsAccepted = document.getElementById('terms').checked;
        
        const errorMessage = document.getElementById('error-message');
        const successMessage = document.getElementById('success-message');
        
        // Reset messages
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
        
        // Validation
        if (!name || !email || !password || !confirmPassword) {
            errorMessage.textContent = 'Please fill in all fields.';
            errorMessage.style.display = 'block';
            return;
        }
        
        if (name.length < 2) {
            errorMessage.textContent = 'Name must be at least 2 characters long.';
            errorMessage.style.display = 'block';
            return;
        }
        
        if (!email.includes('@') || !email.includes('.')) {
            errorMessage.textContent = 'Please enter a valid email address.';
            errorMessage.style.display = 'block';
            return;
        }
        
        if (password.length < 8) {
            errorMessage.textContent = 'Password must be at least 8 characters long.';
            errorMessage.style.display = 'block';
            return;
        }
        
        if (password !== confirmPassword) {
            errorMessage.textContent = 'Passwords do not match.';
            errorMessage.style.display = 'block';
            return;
        }
        
        if (!termsAccepted) {
            errorMessage.textContent = 'Please accept the Terms of Service and Privacy Policy.';
            errorMessage.style.display = 'block';
            return;
        }
        
        // Hide error message on successful validation
        errorMessage.style.display = 'none';
        
        // Submit form using standard form submission
        this.submit();
    });

    // Hide error message when user starts typing
    const inputs = ['name', 'email', 'password', 'confirm-password'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function() {
                document.getElementById('error-message').style.display = 'none';
            });
        }
    });
}

// Password strength checker
function checkPasswordStrength(password) {
    const strengthBar = document.getElementById('password-strength-bar');
    const strengthIndicator = document.getElementById('password-strength');
    const passwordHint = document.getElementById('password-hint');
    
    if (!strengthBar || !strengthIndicator || !passwordHint) return;
    
    if (password.length === 0) {
        strengthIndicator.style.display = 'none';
        passwordHint.style.display = 'none';
        return;
    }
    
    strengthIndicator.style.display = 'block';
    passwordHint.style.display = 'block';
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Character variety checks
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    // Update strength bar
    strengthBar.className = 'password-strength-bar';
    
    if (strength <= 2) {
        strengthBar.classList.add('strength-weak');
    } else if (strength <= 4) {
        strengthBar.classList.add('strength-medium');
    } else {
        strengthBar.classList.add('strength-strong');
    }
}
