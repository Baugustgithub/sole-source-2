'use strict';

const { jsPDF } = window.jspdf;

let formData = {
  amount: null,
  screeningAnswers: Array(8).fill(null),
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
function createStepTwoContent() {
  const questions = [
    {
      text: "Does the product or service have unique features or capabilities that only one supplier can provide?",
      guidance: "Consider specific technical specifications, proprietary technology, or specialized functionality that no other supplier offers."
    },
    {
      text: "Are there legal or technical barriers that prevent other suppliers from offering an equivalent solution?",
      guidance: "Think about patents, copyrights, exclusive licenses, or compatibility requirements with existing systems or equipment."
    },
    {
      text: "Are there practical constraints (e.g., location, expertise, or compatibility) that make other suppliers impracticable?",
      guidance: "Reflect on whether alternatives would fail due to geographic limitations, lack of necessary skills, or incompatibility with existing systems."
    },
    {
      text: "Have you conducted a reasonable market check and found no other suppliers that can practicably meet your needs?",
      guidance: "This could be an online search, contacting a few vendors, or reviewing industry resources to confirm availability."
    },
    {
      text: "Would adapting or modifying another supplier’s product or service be technically or financially unfeasible?",
      guidance: "Evaluate if alternatives could be adjusted but would involve excessive cost, complexity, or risk."
    },
    {
      text: "Is the supplier’s solution critical to meeting a specific regulatory, safety, or operational standard that others can’t satisfy?",
      guidance: "Consider whether compliance with laws, safety rules, or operational protocols ties you to this supplier."
    },
    {
      text: "My preferred vendor, they offer the best price, they can meet my timeline, I’ve worked with them before, it’s about convenience, etc.",
      guidance: null
    },
    {
      text: "Other",
      guidance: null
    }
  ];

  const stepContent = document.getElementById('step-content');
  stepContent.innerHTML = `<p class="mb-4 text-gray-700 font-medium">Answer the following questions to evaluate your request:</p>`;

  questions.forEach((q, index) => {
    const selected = formData.screeningAnswers[index];
    stepContent.innerHTML += `
      <div class="mb-4">
        <p class="font-semibold text-gray-800">${index + 1}. ${q.text}</p>
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
        ${q.guidance ? `
          <p class="guidance-toggle text-blue-600 underline cursor-pointer text-sm mt-1" onclick="toggleGuidance(${index})">Show guidance</p>
          <div id="guidance-${index}" class="text-sm text-gray-600 mt-1 hidden">
            Guidance: ${q.guidance}
          </div>
        ` : ''}
      </div>
    `;
  });

  document.getElementById('next-button').disabled = !formData.screeningAnswers.slice(0, 6).every(v => v !== null);
}
}

function handleScreening(index, value) {
  formData.screeningAnswers[index] = value;
  document.getElementById('next-button').disabled = !formData.screeningAnswers.slice(0, 6).every(v => v !== null);
}

function toggleGuidance(index) {
  const guidance = document.getElementById(`guidance-${index}`);
  if (guidance) {
    guidance.classList.toggle('hidden');
  }
}
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

function evaluateResult() {
  const yesCount = formData.screeningAnswers.slice(0, 6).filter(Boolean).length;

  if (formData.amount === "under_10k") {
    return {
      title: "Not a Sole Source – Delegated Authority",
      message: "Procurements under $10,000 fall within your department’s delegated authority and do not require sole source documentation. Proceed using p-card or standard purchasing methods."
    };
  }

  if (yesCount >= 5) {
    return {
      title: "Strong Case for Sole Source",
      message: `Based on your answers, this request appears to have a strong case for a sole source. <a href="https://procurement.vcu.edu/media/procurement/docs/word/Sole_Source_Documentation.docx" target="_blank" class="underline text-blue-600">Download and complete the Sole Source Documentation Form</a>, then attach it to your requisition in RealSource.`
    };
  } else if (yesCount >= 3) {
    return {
      title: "Potential Sole Source – Needs Stronger Justification",
      message: `This request might qualify as a sole source, but the justification could be stronger. <a href="https://procurement.vcu.edu/media/procurement/docs/word/Sole_Source_Documentation.docx" target="_blank" class="underline text-blue-600">Download the Sole Source Documentation Form</a> and complete it if you wish to proceed.`
    };
  } else {
    return {
      title: "Not Likely a Sole Source",
      message: "Based on your responses, this request likely does not meet sole source criteria. Consider exploring other suppliers or competitive procurement methods."
    };
  }
}

function handleNext() {
  if (currentStep === 1 && formData.amount === 'under_10k') return submitForm();
  if (currentStep === totalSteps) return submitForm();

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

  document.getElementById('download-pdf').addEventListener('click', () => {
    const doc = new jsPDF();
    const questions = [
      "Does the product or service have unique features or capabilities that only one supplier can provide?",
      "Are there legal or technical barriers that prevent other suppliers from offering an equivalent solution?",
      "Are there practical constraints (e.g., location, expertise, or compatibility) that make other suppliers impracticable?",
      "Have you conducted a reasonable market check and found no other suppliers that can practicably meet your needs?",
      "Would adapting or modifying another supplier’s product or service be technically or financially unfeasible?",
      "Is the supplier’s solution critical to meeting a specific regulatory, safety, or operational standard that others can’t satisfy?",
      "My preferred vendor, they offer the best price, they can meet my timeline, I’ve worked with them before, it’s about convenience, etc.",
      "Other"
    ];

    const headers = [["#", "Question", "Answer"]];
    const rows = questions.map((q, i) => [
      i + 1,
      q,
      formData.screeningAnswers[i] === true ? "Yes" :
      formData.screeningAnswers[i] === false ? "No" : "Not Answered"
    ]);

    doc.setFontSize(16);
    doc.text("VCU Sole Source Initial Screening Summary", 14, 18);

    doc.setFontSize(11);
    doc.text(`Procurement Amount: ${formData.amount === 'under_10k' ? 'Less than $10,000' : '$10,000 or more'}`, 14, 28);

    doc.autoTable({
      startY: 35,
      head: headers,
      body: rows,
      styles: { fontSize: 9, cellPadding: 3, valign: 'top' },
      headStyles: { fillColor: [60, 60, 60], textColor: 255 }
    });

    let y = doc.previousAutoTable.finalY + 10;
    doc.setFontSize(11);

    doc.setFont(undefined, "bold");
    doc.text("Final Result:", 14, y);
    y += 6;
    doc.setFont(undefined, "normal");
    const resultLines = doc.splitTextToSize(result.title, 180);
    doc.text(resultLines, 14, y);
    y += resultLines.length * 6;

    doc.setFont(undefined, "bold");
    doc.text("Guidance:", 14, y);
    y += 6;
    doc.setFont(undefined, "normal");
    const msgLines = doc.splitTextToSize(result.message.replace(/<[^>]+>/g, ''), 180);
    doc.text(msgLines, 14, y);

    doc.save("VCU-Sole-Source-Screening.pdf");
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
