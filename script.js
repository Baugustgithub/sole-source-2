'use strict';

const { jsPDF } = window.jspdf;

let formData = {
  amount: null,
  screeningAnswers: [null, null, null, null, null, null],
  acknowledged: false
};

let currentStep = 1;
const totalSteps = 3;

function updateProgressIndicator() {
  const percentComplete = (currentStep / totalSteps) * 100;
  document.getElementById('progress-indicator').style.width = `${percentComplete}%`;
  document.getElementById('step-counter').textContent = `Step ${currentStep} of ${totalSteps}`;
  document.getElementById('step-title').textContent = steps[currentStep - 1].title;
}

function goToNextStep() {
  if (currentStep === 1 && formData.amount === 'under_10k') return submitForm();
  if (currentStep === totalSteps) return submitForm();

  currentStep++;
  updateProgressIndicator();
  steps[currentStep - 1].createContent();
  document.getElementById('prev-button').classList.remove('invisible');
}

function goToPreviousStep() {
  if (currentStep > 1) {
    currentStep--;
    updateProgressIndicator();
    steps[currentStep - 1].createContent();
    if (currentStep === 1) {
      document.getElementById('prev-button').classList.add('invisible');
    }
  }
}

// STEP 1: PROCUREMENT AMOUNT
function createStepOneContent() {
  const stepContent = document.getElementById('step-content');
  stepContent.innerHTML = `
    <p class="mb-4 text-gray-700 font-medium">What is the estimated dollar amount of your procurement?</p>
    <div class="space-y-3">
      <label class="form-check block">
        <input type="radio" name="amount" value="under_10k" onclick="handleAmountChange(this)" ${formData.amount === 'under_10k' ? 'checked' : ''}>
        <span class="ml-2">Less than $10,000</span>
      </label>
      <label class="form-check block">
        <input type="radio" name="amount" value="10k_or_more" onclick="handleAmountChange(this)" ${formData.amount === '10k_or_more' ? 'checked' : ''}>
        <span class="ml-2">$10,000 or more</span>
      </label>
    </div>
  `;
  document.getElementById('next-button').disabled = !formData.amount;
}

function handleAmountChange(radio) {
  formData.amount = radio.value;
  document.getElementById('next-button').disabled = false;
}

// STEP 2: SCREENING QUESTIONS
function createStepTwoContent() {
  const questions = [
    "Does the product or service have unique features or capabilities that only one supplier can provide?",
    "Are there legal or technical barriers that prevent other suppliers from offering an equivalent solution?",
    "Are there practical constraints (e.g., location, expertise, or compatibility) that make other suppliers impracticable?",
    "Have you conducted a reasonable market check and found no other suppliers that can practicably meet your needs?",
    "Would adapting or modifying another supplier’s product or service be technically or financially unfeasible?",
    "Is the supplier’s solution critical to meeting a specific regulatory, safety, or operational standard that others can’t satisfy?"
  ];

  const stepContent = document.getElementById('step-content');
  stepContent.innerHTML = `<p class="mb-4 text-gray-700 font-medium">Answer the following six questions to evaluate your request:</p>`;

  questions.forEach((text, index) => {
    const selected = formData.screeningAnswers[index];
    stepContent.innerHTML += `
      <div class="mb-4">
        <p class="font-semibold text-gray-800">${index + 1}. ${text}</p>
        <div class="mt-1 space-x-4">
          <label class="inline-flex items-center">
            <input type="radio" name="q${index}" ${selected === true ? 'checked' : ''} onclick="handleScreening(${index}, true)">
            <span class="ml-2">Yes</span>
          </label>
          <label class="inline-flex items-center">
            <input type="radio" name="q${index}" ${selected === false ? 'checked' : ''} onclick="handleScreening(${index}, false)">
            <span class="ml-2">No</span>
          </label>
        </div>
      </div>
    `;
  });

  document.getElementById('next-button').disabled = !formData.screeningAnswers.every(v => v !== null);
}

function handleScreening(index, value) {
  formData.screeningAnswers[index] = value;
  document.getElementById('next-button').disabled = !formData.screeningAnswers.every(v => v !== null);
}

// STEP 3: PRICE REASONABLENESS
function createStepThreeContent() {
  const stepContent = document.getElementById('step-content');
  stepContent.innerHTML = `
    <p class="mb-4 text-gray-700 font-medium">Before viewing your results, please confirm:</p>
    <label class="inline-flex items-start space-x-2">
      <input type="checkbox" id="ack-check" onclick="handleAckToggle()" ${formData.acknowledged ? 'checked' : ''}>
      <span>I understand that all sole source requests must include documentation showing that the proposed price is fair and reasonable (e.g., market comparisons, historical pricing, written justification).</span>
    </label>
  `;
  document.getElementById('next-button').disabled = !formData.acknowledged;
}

function handleAckToggle() {
  formData.acknowledged = document.getElementById('ack-check').checked;
  document.getElementById('next-button').disabled = !formData.acknowledged;
}