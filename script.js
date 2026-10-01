const form = document.getElementById("jobForm");
const steps = [...document.querySelectorAll(".step")];
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");
const message = document.getElementById("message");
const settingsPanel = document.getElementById("settingsPanel");
const settingsOverlay = document.getElementById("settingsOverlay");
const deadline = new Date("2026-11-30T23:59:59+03:00");
let currentStep = Number(localStorage.getItem("careerApplyStep") || 0);

const fields = ["fullName","idNumber","gender","country","phone","email","position","photo","cv","consent"];

function openSettings() {
  settingsPanel.classList.add("open");
  settingsOverlay.classList.add("show");
  settingsPanel.setAttribute("aria-hidden","false");
  updateSettings();
}
function closeSettings() {
  settingsPanel.classList.remove("open");
  settingsOverlay.classList.remove("show");
  settingsPanel.setAttribute("aria-hidden","true");
}

document.getElementById("settingsBtn").onclick = openSettings;
document.getElementById("closeSettings").onclick = closeSettings;
settingsOverlay.onclick = closeSettings;

function valueFor(id) {
  const el = document.getElementById(id);
  if (!el) return "";
  if (el.type === "checkbox") return el.checked ? "1" : "";
  if (el.type === "file") return el.files.length ? el.files[0].name : "";
  return el.value.trim();
}

function validateCurrent() {
  const id = fields[currentStep];
  const el = document.getElementById(id);
  if (!el) return true;

  if (el.type === "checkbox" && !el.checked) {
    message.textContent = "Please confirm the information is accurate before continuing.";
    el.focus(); return false;
  }
  if (el.type === "file") {
    if (!el.files.length) {
      message.textContent = "Please select a file before continuing.";
      el.focus(); return false;
    }
    const f = el.files[0];
    const max = id === "cv" ? 5 : 3;
    if (f.size > max * 1024 * 1024) {
      message.textContent = `${id === "cv" ? "CV" : "Profile picture"} must be smaller than ${max} MB.`;
      return false;
    }
  } else if (!el.value.trim()) {
    message.textContent = "Please complete this field before continuing.";
    el.focus(); return false;
  }
  if (id === "email" && !el.validity.valid) {
    message.textContent = "Please enter a valid email address.";
    el.focus(); return false;
  }
  message.textContent = "";
  return true;
}

function saveDraft() {
  const draft = {};
  ["fullName","idNumber","gender","country","phone","email","position","coverLetter"].forEach(id => {
    draft[id] = document.getElementById(id).value;
  });
  draft.step = currentStep;
  localStorage.setItem("careerApplyDraft", JSON.stringify(draft));
  localStorage.setItem("careerApplyStep", currentStep);
  message.textContent = "Draft saved on this device.";
  updateProgress();
}

function loadDraft() {
  const raw = localStorage.getItem("careerApplyDraft");
  if (!raw) return;
  const draft = JSON.parse(raw);
  Object.keys(draft).forEach(id => {
    const el = document.getElementById(id);
    if (el && id !== "step") el.value = draft[id];
  });
  currentStep = Number(draft.step || 0);
  showStep();
}

function showStep() {
  steps.forEach((s,i) => s.classList.toggle("active", i === currentStep));
  const percent = Math.round(((currentStep) / steps.length) * 100);
  document.getElementById("progressPercent").textContent = `${percent}%`;
  document.getElementById("progressBar").style.width = `${percent}%`;
  document.getElementById("stepTitle").textContent = `Step ${currentStep+1} of ${steps.length}`;
  document.getElementById("settingsStep").textContent = `Step ${currentStep+1} of ${steps.length}`;
  document.getElementById("settingsPercent").textContent = `${percent}%`;
  backBtn.disabled = currentStep === 0;
  nextBtn.textContent = currentStep === steps.length-1 ? "Submit Application ✓" : "Continue →";
  window.scrollTo({top:0,behavior:"smooth"});
  updateSettings();
}
function updateProgress() {
  const completed = fields.filter(id => valueFor(id)).length;
  const percent = Math.round((completed / fields.length) * 100);
  document.getElementById("settingsPercent").textContent = `${percent}%`;
}

nextBtn.onclick = () => {
  if (!validateCurrent()) return;
  if (currentStep < steps.length - 1) {
    currentStep++;
    localStorage.setItem("careerApplyStep", currentStep);
    saveDraft();
    showStep();
  } else {
    saveDraft();
    message.textContent = "Application completed. The front-end demo is ready for backend submission.";
    alert("Application completed successfully.");
  }
};
backBtn.onclick = () => {
  if (currentStep > 0) {
    currentStep--;
    localStorage.setItem("careerApplyStep", currentStep);
    showStep();
  }
};

document.getElementById("saveDraftBtn").onclick = saveDraft;
document.getElementById("resumeBtn").onclick = () => { loadDraft(); closeSettings(); };
document.getElementById("themeBtn").onclick = () => {
  document.body.classList.toggle("light");
  localStorage.setItem("careerApplyTheme", document.body.classList.contains("light") ? "light" : "dark");
};
document.getElementById("logoutBtn").onclick = () => {
  localStorage.removeItem("careerApplyDraft");
  localStorage.removeItem("careerApplyStep");
  form.reset();
  currentStep = 0;
  showStep();
  closeSettings();
  alert("You have been logged out of this application session.");
};
document.getElementById("feedbackBtn").onclick = () =>
  document.getElementById("feedbackArea").classList.toggle("hidden");
document.getElementById("sendFeedback").onclick = () => {
  const text = document.getElementById("feedback").value.trim();
  alert(text ? "Thank you for your feedback." : "Please enter feedback first.");
};

function updateCountdown() {
  const diff = deadline - new Date();
  let text;
  if (diff <= 0) text = "Applications closed";
  else {
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    text = `${days}d ${hours}h ${mins}m remaining`;
  }
  document.getElementById("countdown").textContent = text;
  document.getElementById("panelCountdown").textContent = text;
}
function updateSettings() {
  document.getElementById("panelDeadline").textContent = "30 November 2026";
  updateProgress();
}
const savedTheme = localStorage.getItem("careerApplyTheme");
if (savedTheme === "light") document.body.classList.add("light");

loadDraft();
showStep();
updateCountdown();
setInterval(updateCountdown, 60000);

form.addEventListener("input", updateProgress);
form.addEventListener("change", updateProgress);
