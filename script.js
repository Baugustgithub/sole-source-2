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

[Continued in next part...]
