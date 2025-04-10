let currentStep = 0;
const formData = {};

const steps = [
  { title: "Procurement Info" },
  { title: "Screening Questions" },
  { title: "Acknowledgement" }
];

function updateProgressIndicator() {
  const progress = document.getElementById("progress-indicator");
  progress.innerHTML = "";
  steps.forEach((step, index) => {
    const dot = document.createElement("div");
    if (index === currentStep) {
      dot.classList.add("active-step");
    }
    progress.appendChild(dot);
  });

  document.getElementById("step-counter").innerText = `Step ${currentStep + 1} of ${steps.length}`;
  document.getElementById("step-title").innerText = steps[currentStep].title;
}

function nextStep() {
  if (currentStep < steps.length - 1) {
    currentStep++;
    updateProgressIndicator();
    renderStepContent();
  }
}

function renderStepContent() {
  const container = document.getElementById("step-content");
  container.innerHTML = "";

  if (currentStep === 0) {
    createStepOneContent(container);
  } else if (currentStep === 1) {
    createStepTwoContent(container);
  } else if (currentStep === 2) {
    createStepThreeContent(container);
  }
}

function createStepOneContent(container) {
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter item name";
  input.id = "item-name";

  const button = document.createElement("button");
  button.innerText = "Next";
  button.onclick = () => {
    formData.itemName = document.getElementById("item-name").value;
    nextStep();
  };

  container.appendChild(input);
  container.appendChild(document.createElement("br"));
  container.appendChild(button);
}

function createStepTwoContent(container) {
  const question = document.createElement("p");
  question.innerText = "Is this vendor the only provider of the product?";

  const yesButton = document.createElement("button");
  yesButton.innerText = "Yes";
  yesButton.onclick = () => {
    formData.onlyProvider = true;
    nextStep();
  };

  const noButton = document.createElement("button");
  noButton.innerText = "No";
  noButton.onclick = () => {
    formData.onlyProvider = false;
    nextStep();
  };

  container.appendChild(question);
  container.appendChild(yesButton);
  container.appendChild(noButton);
}

function createStepThreeContent(container) {
  const summary = document.createElement("p");
  summary.innerText = `You entered: ${JSON.stringify(formData, null, 2)}`;

  container.appendChild(summary);
}

document.addEventListener("DOMContentLoaded", () => {
  updateProgressIndicator();
  renderStepContent();
});