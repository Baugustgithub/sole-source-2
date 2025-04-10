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

// STEP 1
function createStepOneContent() {
  const stepContent = document.getElementById('step-content');
  stepContent.innerHTML = `
    <div class="mb-6 text-gray-700">
      <p class="mb-2 font-medium">Purpose</p>
      <p class="text-sm">
        This tool helps you determine if a procurement request might qualify as a sole source—meaning only one supplier can practicably meet your needs due to unique features, technical constraints, or other non-time-related factors.
        Answer the yes/no questions below to get instant feedback. No text input is required—just check the boxes.
        The procurement department will make the final determination, but this gives you a solid starting point.
      </p>
    </div>
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

// RESULT LOGIC
function evaluateResult() {
  const yesCount = formData.screeningAnswers.filter(Boolean).length;

  if (formData.amount === "under_10k") {
    return {
      title: "Not a Sole Source – Delegated Authority",
      message: "Procurements under $10,000 fall within your department’s delegated authority and do not require sole source documentation. Proceed using p-card or standard purchasing methods."
    };
  }

  if (yesCount >= 5) {
    return {
      title: "Strong Case for Sole Source",
      message: `Based on your answers, this request appears to have a strong case for a sole source. <a href="https://procurement.vcu.edu/media/procurement/documents/sole-source-form.pdf" target="_blank" class="underline text-blue-600">Download and complete the Sole Source Justification Form</a>, then attach it to your requisition in RealSource.`
    };
  } else if (yesCount >= 3) {
    return {
      title: "Potential Sole Source – Needs Stronger Justification",
      message: `This request might qualify as a sole source, but the justification could be stronger. <a href="https://procurement.vcu.edu/media/procurement/documents/sole-source-form.pdf" target="_blank" class="underline text-blue-600">Download the Justification Form</a> and complete it if you wish to proceed.`
    };
  } else {
    return {
      title: "Not Likely a Sole Source",
      message: "Based on your responses, this request likely does not meet sole source criteria. Consider exploring other suppliers or competitive procurement methods."
    };
  }
}

// SUBMIT + DISCLAIMER
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
      <div class="mt-10 border-t pt-6 text-sm text-gray-600 space-y-2">
        <p><strong>Disclaimer:</strong> This tool offers a preliminary assessment. The procurement department has the final authority to approve sole source requests.</p>
        <p>
          <strong>Support:</strong> Need help? Contact procurement at
          <a href="mailto:purchasing@vcu.edu" class="text-blue-600 underline">purchasing@vcu.edu</a>
          or <a href="https://vcu-amc.ivanticloud.com/Default.aspx?Scope=ObjectWorkspace&CommandId=Search&ObjectType=ServiceReq%23#1729080190081" target="_blank" class="text-blue-600 underline">submit a service ticket</a>.
        </p>
      </div>
    </div>
  `;

  document.getElementById('start-over').addEventListener('click', () => window.location.reload());
  // PDF logic can be added here if needed
}

// STEPS + INIT
const steps = [
  { title: "Step 1: Procurement Amount", createContent: createStepOneContent },
  { title: "Step 2: Screening Questions", createContent: createStepTwoContent },
  { title: "Step 3: Price Reasonableness", createContent: createStepThreeContent }
];

document.addEventListener('DOMContentLoaded', function () {
  updateProgressIndicator();
  createStepOneContent();
});