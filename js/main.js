// main.js
document.addEventListener("DOMContentLoaded", function () {
  const themeToggle = document.getElementById("theme-toggle");
  const html = document.documentElement;

  // Check for saved preference and apply
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    html.classList.remove("theme-light", "theme-dark");
    html.classList.add(savedTheme);
  }

  // Update icon and aria-pressed
  function updateToggleIcon() {
    const isDark = html.classList.contains("theme-dark");
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    themeToggle.setAttribute("aria-pressed", isDark);
  }

  // Set icon and accessibility state on load
  updateToggleIcon();

  themeToggle.addEventListener("click", () => {
    const isDarkMode = html.classList.toggle("theme-dark");
    html.classList.toggle("theme-light", !isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "theme-dark" : "theme-light");
    updateToggleIcon();
  });
});
