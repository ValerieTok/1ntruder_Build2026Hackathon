const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = document.querySelector("[data-nav-links]");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

const screenshotInput = document.getElementById("screenshotInput");
const screenshotPreview = document.getElementById("screenshotPreview");
const screenshotPreviewCard = document.getElementById("screenshotPreviewCard");

if (screenshotInput && screenshotPreview && screenshotPreviewCard) {
  screenshotInput.addEventListener("change", () => {
    const file = screenshotInput.files[0];

    if (!file) {
      screenshotPreviewCard.classList.add("hidden");
      return;
    }

    screenshotPreview.src = URL.createObjectURL(file);
    screenshotPreviewCard.classList.remove("hidden");
  });
}

document.querySelectorAll("[data-analysis-form]").forEach((form) => {
  form.addEventListener("submit", () => {
    const submitButton = form.querySelector('button[type="submit"]');
    const loadingIndicator = form.querySelector("[data-analysis-loading]");

    form.setAttribute("aria-busy", "true");

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="button-spinner" aria-hidden="true"></span><span>Analysing...</span>';
    }

    if (loadingIndicator) {
      loadingIndicator.classList.add("hidden");
    }
  });
});

const checkerModes = document.querySelectorAll("[data-checker-mode]");
const checkerPanels = document.querySelectorAll("[data-checker-panel]");
const checkerFileInput = document.getElementById("screenshotInput");
const selectedFile = document.querySelector("[data-selected-file]");
const imageDropzone = document.querySelector(".image-dropzone");
const inputType = document.querySelector("[data-input-type]");

function setActiveCheckerMode(mode) {
  checkerModes.forEach((item) => item.classList.toggle("active", item.dataset.checkerMode === mode));
  checkerPanels.forEach((panel) => {
    const isActive = panel.dataset.checkerPanel === mode;
    panel.classList.toggle("hidden", !isActive);
    panel.querySelectorAll("input, textarea, select").forEach((field) => {
      field.disabled = !isActive;
    });
  });

  if (inputType) {
    inputType.value = mode;
  }
}

checkerModes.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveCheckerMode(button.dataset.checkerMode);
  });
});

if (checkerModes.length) {
  setActiveCheckerMode(inputType?.value || "text");
}

function showSelectedFile() {
  const file = checkerFileInput && checkerFileInput.files[0];
  if (!file || !selectedFile) return;

  selectedFile.textContent = `Selected: ${file.name}`;
  selectedFile.classList.remove("hidden");
}

if (checkerFileInput) {
  checkerFileInput.addEventListener("change", showSelectedFile);
}

if (imageDropzone && checkerFileInput) {
  ["dragenter", "dragover"].forEach((eventName) => {
    imageDropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      imageDropzone.classList.add("dragging");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    imageDropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      imageDropzone.classList.remove("dragging");
    });
  });

  imageDropzone.addEventListener("drop", (event) => {
    checkerFileInput.files = event.dataTransfer.files;
    showSelectedFile();
  });
}
