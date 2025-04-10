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

function handleAmountSelection(value) {
  formData.amount = value;
  document.getElementById('next-button').disabled = false;
}

function createStepOneContent() {
  const stepContent = document.getElementById('step-content');
  stepContent.innerHTML = `
    <p class="mb-4 text-gray-700 font-medium">What is the estimated dollar amount of your procurement?</p>
    <div class="space-y-3">
      <div class="form-check" onclick="handleAmountSelection('under_10k')">
        <label class="flex items-start">
          <input type="radio" name="amount" class="mt-1 h-4 w-4 text-yellow-500"> <span class="ml-3">Less than $10,000</span>
        </label>
      </div>
      <div class="form-check" onclick="handleAmountSelection('10k_or_more')">
        <label class="flex items-start">
          <input type="radio" name="amount" class="mt-1 h-4 w-4 text-yellow-500"> <span class="ml-3">$10,000 or more</span>
        </label>
      </div>
    </div>
  `;

  document.getElementById('next-button').disabled = !formData.amount;
}

function handleNext() {
  if (currentStep === 1 && formData.amount === 'under_10k') {
    submitForm();
    return;
  }

  if (currentStep === totalSteps) {
    submitForm();
    return;
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
function handleScreeningSelection(index, value) {
  formData.screeningAnswers[index] = value;
  const allAnswered = formData.screeningAnswers.every(ans => ans !== null);
  document.getElementById('next-button').disabled = !allAnswered;
}

function createStepTwoContent() {
  const questions = [
    {
      text: "Does the product or service have unique features or capabilities that only one supplier can provide?",
      guidance: "Consider specific technical specifications, proprietary technology, or specialized functionality that no other supplier offers."
    },
    {
      text: "Are there legal or technical barriers that prevent other suppliers from offering an equivalent solution?",
      guidance: "Think about patents, copyrights, exclusive licenses, compatibility requirements with existing systems—or if the supplier is explicitly named in a grant or funding award."
    },
    {
      text: "Are there practical constraints (e.g., location, expertise, or compatibility) that make other suppliers impracticable?",
      guidance: "Would alternatives fail due to geographic limitations, lack of necessary skills, or incompatibility with existing systems?"
    },
    {
      text: "Have you conducted a reasonable market check and found no other suppliers that can practicably meet your needs?",
      guidance: "A quick online search, contacting vendors, or reviewing industry sources can help confirm availability."
    },
    {
      text: "Would adapting or modifying another supplier’s product or service be technically or financially unfeasible?",
      guidance: "Would it require excessive cost, complexity, or risk to adjust an alternative?"
    },
    {
      text: "Is the supplier’s solution critical to meeting a specific regulatory, safety, or operational standard that others can’t satisfy?",
      guidance: "Does compliance with laws, safety, or operations tie you to this vendor?"
    }
  ];

  const stepContent = document.getElementById('step-content');
  stepContent.innerHTML = `<p class="mb-4 text-gray-700 font-medium">Answer the following six questions to evaluate your request:</p>`;

  questions.forEach((q, index) => {
    const answer = formData.screeningAnswers[index];
    stepContent.innerHTML += `
      <div class="mb-5">
        <p class="font-semibold text-gray-800">${index + 1}. ${q.text}</p>
        <p class="text-sm text-gray-500 italic mb-2">Guidance: ${q.guidance}</p>
        <div class="space-x-4">
          <label class="inline-flex items-center">
            <input type="radio" name="q${index}" ${answer === true ? "checked" : ""} onclick="handleScreeningSelection(${index}, true)">
            <span class="ml-2">Yes</span>
          </label>
          <label class="inline-flex items-center">
            <input type="radio" name="q${index}" ${answer === false ? "checked" : ""} onclick="handleScreeningSelection(${index}, false)">
            <span class="ml-2">No</span>
          </label>
        </div>
      </div>
    `;
  });

  document.getElementById('next-button').disabled = !formData.screeningAnswers.every(ans => ans !== null);
}

function handleAcknowledgmentChange(checkbox) {
  formData.acknowledged = checkbox.checked;
  document.getElementById('next-button').disabled = !formData.acknowledged;
}

function createStepThreeContent() {
  const stepContent = document.getElementById('step-content');
  stepContent.innerHTML = `
    <p class="mb-4 text-gray-700 font-medium">Before viewing your results, please confirm:</p>
    <label class="inline-flex items-start space-x-2">
      <input type="checkbox" onclick="handleAcknowledgmentChange(this)">
      <span>I understand that all sole source requests must include documentation showing that the proposed price is fair and reasonable (e.g., market comparisons, historical pricing, written justification).</span>
    </label>
  `;

  document.getElementById('next-button').disabled = !formData.acknowledged;
}
function evaluateResult() {
  if (formData.amount === "under_10k") {
    return {
      title: "Not a Sole Source – Delegated Authority",
      message: "Procurements under $10,000 fall within your department’s delegated authority and do not require sole source documentation. Proceed with purchasing through an appropriate method (e.g., p-card or small-dollar PO) without submitting a sole source justification."
    };
  }

  const yesAnswers = formData.screeningAnswers.filter(Boolean).length;
  const answeredYesToQ4 = formData.screeningAnswers[3] === true;

  if (yesAnswers >= 4 && answeredYesToQ4) {
    return {
      title: "Strong Case for Sole Source",
      message: "Based on your answers, this request appears to have a strong case for a sole source. Download and complete the Sole Source Justification Form, attach it to your requisition in RealSource, and submit it for procurement review."
    };
  } else if (yesAnswers === 3 && answeredYesToQ4) {
    return {
      title: "Potential Sole Source – Needs Stronger Justification",
      message: "Your request might qualify as a sole source, but the justification could be stronger. Review your answers to see if additional factors apply. If you choose to proceed, complete the Justification Form and submit it through RealSource."
    };
  } else {
    return {
      title: "Not Likely a Sole Source",
      message: "Your request likely does not meet sole source criteria. Explore whether other suppliers could practicably meet your needs and consider alternative procurement methods."
    };
  }
}

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
    formData.screeningAnswers.forEach((ans, i) => {
      addSection(`Question ${i + 1}`, ans ? "Yes" : "No");
    });
    addSection('Price Reasonableness Acknowledged', formData.acknowledged ? "Yes" : "No");
    addSection('Result', result.title);
    addSection('Guidance', result.message);

    doc.save('VCU-Sole-Source-Screening.pdf');
  });
}

const steps = [
  { title: "Step 1: Procurement Amount", createContent: createStepOneContent },
  { title: "Step 2: Screening Questions", createContent: createStepTwoContent },
  { title: "Step 3: Price Reasonableness", createContent: createStepThreeContent }
];

document.addEventListener('DOMContentLoaded', function () {
  updateProgressIndicator();
  createStepOneContent();
});