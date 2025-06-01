// Game Authentication System JavaScript

class GameAuth {
  constructor() {
    this.users = this.loadUsers();
    this.currentUser = this.loadCurrentUser();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupPasswordToggle();
    this.addAnimations();
    this.checkAuthState();
  }

  // Local Storage Methods
  loadUsers() {
    const users = localStorage.getItem("gameauth_users");
    return users ? JSON.parse(users) : [];
  }

  saveUsers() {
    localStorage.setItem("gameauth_users", JSON.stringify(this.users));
  }

  loadCurrentUser() {
    const user = localStorage.getItem("gameauth_current_user");
    return user ? JSON.parse(user) : null;
  }

  saveCurrentUser(user) {
    localStorage.setItem("gameauth_current_user", JSON.stringify(user));
    this.currentUser = user;
  }

  clearCurrentUser() {
    localStorage.removeItem("gameauth_current_user");
    this.currentUser = null;
  }

  // Event Listeners
  setupEventListeners() {
    // Signup Form
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
      signupForm.addEventListener("submit", (e) => this.handleSignup(e));
    }

    // Login Form
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }

    // Input animations
    const inputs = document.querySelectorAll("input");
    inputs.forEach((input) => {
      input.addEventListener("focus", (e) =>
        this.animateInput(e.target, "focus")
      );
      input.addEventListener("blur", (e) =>
        this.animateInput(e.target, "blur")
      );
    });
  }

  setupPasswordToggle() {
    const toggleButtons = document.querySelectorAll(".toggle-password");
    toggleButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const input = e.target.closest(".input-group").querySelector("input");
        const icon = e.target.closest("button").querySelector("i");

        if (input.type === "password") {
          input.type = "text";
          icon.classList.remove("fa-eye");
          icon.classList.add("fa-eye-slash");
        } else {
          input.type = "password";
          icon.classList.remove("fa-eye-slash");
          icon.classList.add("fa-eye");
        }
      });
    });
  }

  // Authentication Methods
  handleSignup(e) {
    e.preventDefault();

    const formData = {
      firstName: document.getElementById("firstName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      username: document.getElementById("username").value.trim(),
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value,
    };

    // Validation
    const validation = this.validateSignupData(formData);
    if (!validation.isValid) {
      this.showMessage(validation.message, "error");
      this.shakeForm();
      return;
    }

    // Check if user already exists
    const existingUser = this.users.find(
      (user) =>
        user.email === formData.email || user.username === formData.username
    );

    if (existingUser) {
      this.showMessage(
        "User with this email or username already exists!",
        "error"
      );
      this.shakeForm();
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };

    this.users.push(newUser);
    this.saveUsers();

    this.showMessage(
      "Account created successfully! Redirecting to login...",
      "success"
    );

    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
  }

  handleLogin(e) {
    e.preventDefault();

    const loginData = {
      emailOrUsername: document.getElementById("loginEmail").value.trim(),
      password: document.getElementById("loginPassword").value,
      rememberMe: document.getElementById("rememberMe").checked,
    };

    // Validation
    if (!loginData.emailOrUsername || !loginData.password) {
      this.showMessage("Please fill in all fields!", "error");
      this.shakeForm();
      return;
    }

    // Find user
    const user = this.users.find(
      (u) =>
        u.email === loginData.emailOrUsername ||
        u.username === loginData.emailOrUsername
    );

    if (!user || user.password !== loginData.password) {
      this.showMessage("Invalid credentials! Please try again.", "error");
      this.shakeForm();
      return;
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    this.saveUsers();
    this.saveCurrentUser(user);

    this.showMessage("Login successful! Welcome back!", "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  }

  // Validation Methods
  validateSignupData(data) {
    if (
      !data.firstName ||
      !data.lastName ||
      !data.username ||
      !data.email ||
      !data.password
    ) {
      return { isValid: false, message: "Please fill in all fields!" };
    }

    if (data.firstName.length < 2 || data.lastName.length < 2) {
      return {
        isValid: false,
        message: "First and last name must be at least 2 characters!",
      };
    }

    if (data.username.length < 3) {
      return {
        isValid: false,
        message: "Username must be at least 3 characters!",
      };
    }

    if (!this.isValidEmail(data.email)) {
      return { isValid: false, message: "Please enter a valid email address!" };
    }

    if (data.password.length < 6) {
      return {
        isValid: false,
        message: "Password must be at least 6 characters!",
      };
    }

    return { isValid: true };
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // UI Methods
  showMessage(text, type) {
    // Remove existing messages
    const existingMessage = document.querySelector(".message");
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create new message
    const message = document.createElement("div");
    message.className = `message ${type}`;
    message.textContent = text;

    // Insert message
    const form =
      document.querySelector(".auth-form") ||
      document.querySelector(".action-buttons");
    if (form) {
      form.parentNode.insertBefore(message, form);
    }

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (message.parentNode) {
        message.remove();
      }
    }, 5000);
  }

  shakeForm() {
    const formSection = document.querySelector(".form-section");
    formSection.classList.add("shake");
    setTimeout(() => {
      formSection.classList.remove("shake");
    }, 500);
  }

  animateInput(input, action) {
    const inputGroup = input.closest(".input-group");
    if (action === "focus") {
      inputGroup.style.transform = "scale(1.02)";
    } else {
      inputGroup.style.transform = "scale(1)";
    }
  }

  addAnimations() {
    // Add fade-in animation to main elements
    const animatedElements = document.querySelectorAll(
      ".auth-card, .form-section, .character-section"
    );
    animatedElements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add("fade-in");
      }, index * 200);
    });
  }

  checkAuthState() {
    // If on home page and user is logged in, show welcome message
    if (
      window.location.pathname.includes("index.html") ||
      window.location.pathname === "/"
    ) {
      if (this.currentUser) {
        this.showWelcomeMessage();
      }
    }
  }

  showWelcomeMessage() {
    const welcomeText = document.querySelector(".welcome-text");
    if (welcomeText && this.currentUser) {
      const userGreeting = document.createElement("div");
      userGreeting.className = "user-greeting";
      userGreeting.innerHTML = `
                <p style="color: #ff6b35; font-weight: 600; margin-bottom: 10px;">
                    Welcome back, ${this.currentUser.firstName}!
                </p>
                <button onclick="gameAuth.logout()" class="btn btn-secondary" style="width: auto; padding: 10px 20px; font-size: 12px;">
                    Logout
                </button>
            `;
      welcomeText.appendChild(userGreeting);
    }
  }

  logout() {
    this.clearCurrentUser();
    this.showMessage("Logged out successfully!", "success");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  // Utility Methods
  generateUserId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
  }

  // Debug Methods (for development)
  getAllUsers() {
    console.log("All registered users:", this.users);
    return this.users;
  }

  getCurrentUser() {
    console.log("Current user:", this.currentUser);
    return this.currentUser;
  }

  clearAllData() {
    localStorage.removeItem("gameauth_users");
    localStorage.removeItem("gameauth_current_user");
    console.log("All data cleared!");
    window.location.reload();
  }
}

// Initialize the authentication system
const gameAuth = new GameAuth();

// Make it globally available for debugging
window.gameAuth = gameAuth;

// Additional utility functions
function showLoadingState(button) {
  button.classList.add("loading");
  button.disabled = true;
}

function hideLoadingState(button) {
  button.classList.remove("loading");
  button.disabled = false;
}

// Social media click handlers
document.addEventListener("DOMContentLoaded", function () {
  const socialLinks = document.querySelectorAll(".social-icons a");
  socialLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const platform = this.querySelector("i").classList[1].split("-")[1];
      gameAuth.showMessage(
        `${
          platform.charAt(0).toUpperCase() + platform.slice(1)
        } integration coming soon!`,
        "success"
      );
    });
  });
});

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  // Enter key on forms
  if (e.key === "Enter" && e.target.tagName === "INPUT") {
    const form = e.target.closest("form");
    if (form) {
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.click();
      }
    }
  }

  // Escape key to clear messages
  if (e.key === "Escape") {
    const message = document.querySelector(".message");
    if (message) {
      message.remove();
    }
  }
});

// Auto-save form data (except passwords)
function autoSaveFormData() {
  const inputs = document.querySelectorAll('input:not([type="password"])');
  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      if (this.value.trim()) {
        localStorage.setItem(`form_${this.id}`, this.value);
      }
    });

    // Restore saved data
    const savedValue = localStorage.getItem(`form_${input.id}`);
    if (savedValue) {
      input.value = savedValue;
    }
  });
}

// Initialize auto-save
autoSaveFormData();

console.log("🎮 Game Anywhere Authentication System Loaded!");
console.log(
  "Available methods: gameAuth.getAllUsers(), gameAuth.getCurrentUser(), gameAuth.clearAllData()"
);
