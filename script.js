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

// ========== STEP 1 ==========
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

function handleAmountChange(input) {
  formData.amount = input.value;
  document.getElementById('next-button').disabled = false;
}

// ========== STEP 2 ==========
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

// ========== STEP 3 ==========
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

// ========== STEP NAVIGATION ==========
function handleNext() {
  if (currentStep === 1 && formData.amount === 'under_10k') {
    return submitForm();
  }
  if (currentStep === totalSteps) {
    return submitForm();
  }
  currentStep++;
  updateProgressIndicator();
  steps[currentStep - 1].createContent();
  document.getElementById('prev-button').classList.remove('invisible');
}

function handlePrevious() {
  if (currentStep > 1) {
    currentStep--;
    updateProgressIndicator();
    steps[currentStep - 1].createContent();
    if (currentStep === 1) {
      document.getElementById('prev-button').classList.add('invisible');
    }
  }
}

// ========== RESULT ==========
function evaluateResult() {
  if (formData.amount === "under_10k") {
    return {
      title: "Not a Sole Source – Delegated Authority",
      message: "Procurements under $10,000 fall within your department’s delegated authority and do not require sole source documentation."
    };
  }

  const yesAnswers = formData.screeningAnswers.filter(Boolean).length;
  const q4Yes = formData.screeningAnswers[3] === true;

  if (yesAnswers >= 4 && q4Yes) {
    return {
      title: "Strong Case for Sole Source",
      message: "This request appears to have a strong case for a sole source. Download and complete the Justification Form and submit it through RealSource."
    };
  } else if (yesAnswers === 3 && q4Yes) {
    return {
      title: "Potential Sole Source – Needs Stronger Justification",
      message: "This request might qualify as a sole source, but justification could be stronger. Consider expanding responses before proceeding."
    };
  } else {
    return {
      title: "Not Likely a Sole Source",
      message: "This request likely does not meet sole source criteria. Explore alternative procurement methods."
    };
  }
}

// ========== SUBMIT ==========
function submitForm() {
  const result = evaluateResult();
  const container = document.getElementById('form-container');

  container.innerHTML = `
    <div class="p-6 fade-in">
      <h2 class="text-xl font-semibold mb-4">Sole Source Screening Results</h2>
      <div class="bg-green-50 border border-green-200 p-4 mb-6 rounded-md">
        <h3 class="text-lg font-medium text-green-800 mb-2">${result.title}</h3>
        <p class="text-green-700">${result.message}</p>
      </div>
      <div class="flex space-x-4 mt-6">
        <button id="start-over" class="btn-secondary px-4 py-2 rounded-md">Start Over</button>
        <button id="download-pdf" class="btn-primary px-4 py-2 rounded-md">Download PDF</button>
      </div>
    </div>
  `;

  document.getElementById('start-over').addEventListener('click', () => window.location.reload());

  document.getElementById('download-pdf').addEventListener('click', () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('VCU Sole Source Initial Screening Summary', 20, 20);
    let y = 35;

    const questions = [
      "Does the product or service have unique features or capabilities that only one supplier can provide?",
      "Are there legal or technical barriers that prevent other suppliers from offering an equivalent solution?",
      "Are there practical constraints (e.g., location, expertise, or compatibility) that make other suppliers impracticable?",
      "Have you conducted a reasonable market check and found no other suppliers that can practicably meet your needs?",
      "Would adapting or modifying another supplier’s product or service be technically or financially unfeasible?",
      "Is the supplier’s solution critical to meeting a specific regulatory, safety, or operational standard that others can’t satisfy?"
    ];

    function addSection(title, value) {
      doc.setFont(undefined, 'bold');
      doc.text(`${title}:`, 20, y);
      y += 6;
      doc.setFont(undefined, 'normal');
      const lines = doc.splitTextToSize(value || 'N/A', 170);
      doc.text(lines, 20, y);
      y += lines.length * 6 + 4;
    }

    addSection('Procurement Amount', formData.amount === "under_10k" ? "Less than $10,000" : "$10,000 or more");

    doc.setFont(undefined, 'bold');
    doc.text("Screening Questions & Answers:", 20, y);
    y += 8;
    doc.setFont(undefined, 'normal');

    questions.forEach((q, i) => {
      const answer = formData.screeningAnswers[i] ? "Yes" : "No";
      const qLines = doc.splitTextToSize(`${i + 1}. ${q}`, 170);
      doc.text(qLines, 20, y);
      y += qLines.length * 6;
      doc.text(`Answer: ${answer}`, 25, y);
      y += 10;
    });

    addSection("Acknowledgment", formData.acknowledged
      ? "Acknowledged: I understand that all sole source requests must include documentation showing the proposed price is fair and reasonable."
      : "Not acknowledged");

    addSection('Final Result', result.title);
    addSection('Guidance', result.message);

    doc.save('VCU-Sole-Source-Screening.pdf');
  });
}

// ========== INIT ==========
const steps = [
  { title: "Step 1: Procurement Amount", createContent: createStepOneContent },
  { title: "Step 2: Screening Questions", createContent: createStepTwoContent },
  { title: "Step 3: Price Reasonableness", createContent: createStepThreeContent }
];

document.addEventListener('DOMContentLoaded', function () {
  updateProgressIndicator();
  createStepOneContent();
});