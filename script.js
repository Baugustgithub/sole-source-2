'use strict';

// Initialize jsPDF and FileSaver from libraries
const { jsPDF } = window.jspdf;

// Form data object to store all responses
let formData = {
    amount: null,
    single_source: null,
    justification: [],
    alternatives_researched: null,
    alternatives_reason_options: [],
    price_reasonable: []
};

// Current step tracker (1-based index)
let currentStep = 1;
const totalSteps = 5;

// Mapping for value display in results
const valueMappings = {
    less_than_10k: "Less than $10,000",
    "10k_to_200k": "$10,000 to $200,000",
    above_200k: "$200,000 and above",
    yes: "Yes",
    no: "No",
    unsure: "Unsure",
    exclusive_distribution: "Exclusive distribution",
    compatible_accessory: "Integral part or accessory compatible with existing equipment",
    maintenance: "Maintenance service for existing equipment",
    software_maintenance: "Upgrade or maintenance for existing software",
    research_continuity: "Used in research and required for continuity of results",
    patent: "Copyrighted or patented and only available from the recommended source",
    training: "Considerable re-orientation and training would be required",
    grant: "Vendor specifically named in a grant and/or grant proposal",
    specified_in_grant: "Specified in grant/funding",
    continuation_existing: "Continuation of existing project",
    exclusive_rights: "Vendor has exclusive rights",
    market_expertise: "Market expertise",
    early_planning: "Still in early planning",
    gathering_requirements: "Currently gathering requirements",
    timing_constraints: "Time limitations",
    previous_vendor_familiarity: "Familiarity with vendor",
    convenience: "Convenience",
    historical: "Historical/past pricing",
    similar: "Prices charged for similar items",
    other_customers: "Prices paid by other customers",
    public_price: "A public price list or public catalog",
    negotiated: "I have negotiated with the vendor or secured educational discounts",
    none: "None of the above"
};

// Step data with titles, descriptions, and content creator functions
const steps = [
    {
        title: "Step 1: Procurement Amount",
        description: "What is the estimated dollar amount of your procurement?",
        createContent: createStepOneContent
    },
    {
        title: "Step 2: Single Source Status",
        description: "Is this product or service available from only one source?",
        createContent: createStepTwoContent
    },
    {
        title: "Step 3: Justification",
        description: "Select all the reasons that apply to this procurement:",
        createContent: createStepThreeContent
    },
    {
        title: "Step 4: Alternatives Research",
        description: "Have you researched alternative products or services?",
        createContent: createStepFourContent
    },
    {
        title: "Step 5: Price Reasonableness",
        description: "How have you determined that the price is reasonable?",
        createContent: createStepFiveContent
    }
];

// Helper function to update the progress indicator
function updateProgressIndicator() {
    const percentComplete = (currentStep / totalSteps) * 100;
    document.getElementById('progress-indicator').style.width = `${percentComplete}%`;
    document.getElementById('step-counter').textContent = `Step ${currentStep} of ${totalSteps}`;
    document.getElementById('step-title').textContent = steps[currentStep - 1].title;
}

// Event handlers for selection options
function handleAmountSelection(element) {
    // Clear previous selections
    document.querySelectorAll('[data-value]').forEach(el => {
        el.classList.remove('selected');
        const radio = el.querySelector('input[type="radio"]');
        if (radio) radio.checked = false;
    });

    // Set new selection
    element.classList.add('selected');
    const radio = element.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;

    // Update form data
    formData.amount = element.dataset.value;

    // Enable next button
    document.getElementById('next-button').disabled = false;
}

function handleSingleSourceSelection(element) {
    // Clear previous selections
    document.querySelectorAll('[data-value]').forEach(el => {
        el.classList.remove('selected');
        const radio = el.querySelector('input[type="radio"]');
        if (radio) radio.checked = false;
    });

    // Set new selection
    element.classList.add('selected');
    const radio = element.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;

    // Update form data
    formData.single_source = element.dataset.value;

    // Enable next button
    document.getElementById('next-button').disabled = false;
}

function handleJustificationSelection(element) {
    element.classList.toggle('selected');
    const checkbox = element.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;

    const value = element.dataset.value;

    // Update the form data
    if (checkbox.checked) {
        if (!formData.justification.includes(value)) {
            formData.justification.push(value);
        }
    } else {
        formData.justification = formData.justification.filter(item => item !== value);
    }

    // Enable next button if at least one option is selected
    document.getElementById('next-button').disabled = formData.justification.length === 0;
}

function handleAlternativesSelection(element) {
    // Clear previous selections
    document.querySelectorAll('[data-value]').forEach(el => {
        el.classList.remove('selected');
        const radio = el.querySelector('input[type="radio"]');
        if (radio) radio.checked = false;
    });

    // Set new selection
    element.classList.add('selected');
    const radio = element.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;

    // Update form data
    formData.alternatives_researched = element.dataset.value;

    // Show/hide additional options based on selection
    const additionalOptions = document.getElementById('alternatives-additional-options');
    if (additionalOptions) {
        additionalOptions.style.display = formData.alternatives_researched === 'no' ? 'block' : 'none';
    }

    // Reset alternatives reasons if "yes" is selected
    if (formData.alternatives_researched === 'yes') {
        formData.alternatives_reason_options = [];
        document.querySelectorAll('[name="alternatives_reason_options"]').forEach(checkbox => {
            checkbox.checked = false;
            checkbox.closest('.form-check').classList.remove('selected');
        });
    }

    // Enable next button
    document.getElementById('next-button').disabled = false;
}

function handleAlternativesReasonSelection(element) {
    element.classList.toggle('selected');
    const checkbox = element.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;

    const value = element.dataset.value;

    // Update the form data
    if (checkbox.checked) {
        if (!formData.alternatives_reason_options.includes(value)) {
            formData.alternatives_reason_options.push(value);
        }
    } else {
        formData.alternatives_reason_options = formData.alternatives_reason_options.filter(item => item !== value);
    }
}

function handlePriceSelection(element) {
    element.classList.toggle('selected');
    const checkbox = element.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;

    const value = element.dataset.value;

    // Update the form data
    if (checkbox.checked) {
        if (!formData.price_reasonable.includes(value)) {
            formData.price_reasonable.push(value);
        }
    } else {
        formData.price_reasonable = formData.price_reasonable.filter(item => item !== value);
    }

    // Enable next button if at least one option is selected
    document.getElementById('next-button').disabled = formData.price_reasonable.length === 0;
}

// Content creator functions for each step
function createStepOneContent() {
    const stepContent = document.getElementById('step-content');
    stepContent.innerHTML = `
        <p class="mb-4 text-gray-700">What is the estimated dollar amount of your procurement?</p>
        <div class="space-y-3">
            <div class="form-check" data-value="less_than_10k" onclick="handleAmountSelection(this)">
                <input type="radio" name="amount" value="less_than_10k">
                <label>
                    <span class="font-medium">Less than $10,000</span>
                    <span class="text-gray-600 block text-sm">Delegated authority threshold</span>
                </label>
            </div>
            <div class="form-check" data-value="10k_to_200k" onclick="handleAmountSelection(this)">
                <input type="radio" name="amount" value="10k_to_200k">
                <label>
                    <span class="font-medium">$10,000 to $200,000</span>
                    <span class="text-gray-600 block text-sm">Standard sole source documentation required</span>
                </label>
            </div>
            <div class="form-check" data-value="above_200k" onclick="handleAmountSelection(this)">
                <input type="radio" name="amount" value="above_200k">
                <label>
                    <span class="font-medium">$200,000 and above</span>
                    <span class="text-gray-600 block text-sm">Additional approval required</span>
                </label>
            </div>
        </div>
    `;

    // Reset next button state based on selection
    document.getElementById('next-button').textContent = 'Next';
    document.getElementById('next-button').disabled = !formData.amount;

    // Update any pre-selected options
    if (formData.amount) {
        const selectedElement = document.querySelector(`[data-value="${formData.amount}"]`);
        if (selectedElement) {
            selectedElement.classList.add('selected');
            const radio = selectedElement.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
        }
    }
}

function createStepTwoContent() {
    const stepContent = document.getElementById('step-content');
    stepContent.innerHTML = `
        <p class="mb-4 text-gray-700">${steps[1].description}</p>
        <div class="space-y-3">
            <div class="form-check" data-value="yes" onclick="handleSingleSourceSelection(this)">
                <input type="radio" name="single_source" value="yes">
                <label>
                    <span class="font-medium">Yes</span>
                    <span class="text-gray-600 block text-sm">Only one supplier can provide this product or service</span>
                </label>
            </div>
            <div class="form-check" data-value="no" onclick="handleSingleSourceSelection(this)">
                <input type="radio" name="single_source" value="no">
                <label>
                    <span class="font-medium">No</span>
                    <span class="text-gray-600 block text-sm">Multiple suppliers can provide this product or service</span>
                </label>
            </div>
            <div class="form-check" data-value="unsure" onclick="handleSingleSourceSelection(this)">
                <input type="radio" name="single_source" value="unsure">
                <label>
                    <span class="font-medium">I'm not sure</span>
                    <span class="text-gray-600 block text-sm">More research needed to determine available sources</span>
                </label>
            </div>
        </div>
    `;

    // Reset next button state based on selection
    document.getElementById('next-button').disabled = !formData.single_source;

    // Update any pre-selected options
    if (formData.single_source) {
        const selectedElement = document.querySelector(`[data-value="${formData.single_source}"]`);
        if (selectedElement) {
            selectedElement.classList.add('selected');
            const radio = selectedElement.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
        }
    }
}

function createStepThreeContent() {
    const stepContent = document.getElementById('step-content');
    
    const justificationOptions = [
        {
            value: 'exclusive_distribution',
            label: 'Exclusive distribution',
            description: 'The recommended source has exclusive distribution rights for this item'
        },
        {
            value: 'compatible_accessory',
            label: 'Compatible accessory',
            description: 'This is an integral part or accessory that is compatible with existing equipment'
        },
        {
            value: 'maintenance',
            label: 'Maintenance service',
            description: 'This is for maintenance service of existing equipment'
        },
        {
            value: 'software_maintenance',
            label: 'Software maintenance',
            description: 'This is for upgrade or maintenance for existing software'
        },
        {
            value: 'research_continuity',
            label: 'Research continuity',
            description: 'This is used in research and required for continuity of results'
        },
        {
            value: 'patent',
            label: 'Patent/Copyright',
            description: 'This is copyrighted or patented and only available from the recommended source'
        },
        {
            value: 'training',
            label: 'Training requirements',
            description: 'Considerable re-orientation and training would be required'
        },
        {
            value: 'grant',
            label: 'Grant specified',
            description: 'Vendor specifically named in a grant and/or grant proposal'
        }
    ];

    let html = `
        <p class="mb-4 text-gray-700">${steps[2].description}</p>
        <div class="space-y-3">
    `;

    justificationOptions.forEach(option => {
        html += `
            <div class="form-check${formData.justification.includes(option.value) ? ' selected' : ''}" 
                data-value="${option.value}" 
                onclick="handleJustificationSelection(this)">
                <input type="checkbox" name="justification" value="${option.value}"
                    ${formData.justification.includes(option.value) ? 'checked' : ''}>
                <label>
                    <span class="font-medium">${option.label}</span>
                    <span class="text-gray-600 block text-sm">${option.description}</span>
                </label>
            </div>
        `;
    });

    html += '</div>';
    stepContent.innerHTML = html;

    // Reset next button state based on selection
    document.getElementById('next-button').disabled = formData.justification.length === 0;
}

function createStepFourContent() {
    const stepContent = document.getElementById('step-content');
    
    let html = `
        <p class="mb-4 text-gray-700">${steps[3].description}</p>
        <div class="space-y-3">
            <div class="form-check${formData.alternatives_researched === 'yes' ? ' selected' : ''}" 
                data-value="yes" 
                onclick="handleAlternativesSelection(this)">
                <input type="radio" name="alternatives_researched" value="yes"
                    ${formData.alternatives_researched === 'yes' ? 'checked' : ''}>
                <label>
                    <span class="font-medium">Yes</span>
                    <span class="text-gray-600 block text-sm">I have researched other options but this is the only one that meets our needs</span>
                </label>
            </div>
            <div class="form-check${formData.alternatives_researched === 'no' ? ' selected' : ''}" 
                data-value="no" 
                onclick
