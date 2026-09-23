/* ==========================================================================
   Shuvam Overseas - Content Data & Renderers
   --------------------------------------------------------------------------
   All step/category/sector content lives here as plain data arrays, so it can
   be edited without touching the HTML. Renderers loop over the data to build
   the reusable components:

     - Numbered step list  → used by every step section on procedure.html
     - Sector cards        → the 9 category cards on services.html
     - Employer grid       → the 6 responsibility cards on procedure.html

   Elements opt in with data attributes, e.g.
       <ol class="steps" data-steps="recruitment"></ol>
       <div class="sectors-grid" data-cards="sectors"></div>
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     Icon set - Feather-style 24x24 stroke icons, currentColor, 1.5px stroke.
     Kept inline so the site stays dependency-free.
     ------------------------------------------------------------------------ */
  var ICONS = {
    bolt:        '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    settings:    '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    coffee:      '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>',
    briefcase:   '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    wrench:      '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    shield:      '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/>',
    scissors:    '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" x2="8.12" y1="4" y2="15.88"/><line x1="14.47" x2="20" y1="14.48" y2="20"/><line x1="8.12" x2="12" y1="8.12" y2="12"/>',
    users:       '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    factory:     '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>',
    file:        '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
    check:       '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    userCheck:   '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/>',
    send:        '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    heart:       '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    message:     '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    award:       '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
    target:      '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    globe:       '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    clock:       '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    plane:       '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>'
  };

  function iconSvg(name, size) {
    var s = size || 20;
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + s + '" height="' + s +
           '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ' +
           'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
           (ICONS[name] || ICONS.check) + '</svg>';
  }

  /* ------------------------------------------------------------------------
     Data: Services - Sectors & Categories (9 cards)
     ------------------------------------------------------------------------ */
  var SECTORS = [
    { icon: "bolt",     title: "Electrical",       jobs: ["Electricians", "Electrical Technicians", "Cable Jointers", "Panel Fitters"] },
    { icon: "settings", title: "Mechanical",       jobs: ["Fitters & Turners", "Welders", "Pipe Fitters", "Machinists"] },
    { icon: "coffee",   title: "Hospitality & Services", jobs: ["Chefs & Cooks", "Waiters & Stewards", "Housekeeping Staff", "Front Desk"] },
    { icon: "briefcase",title: "Administrative",   jobs: ["Office Assistants", "Accountants", "HR Coordinators", "Data Entry Operators"] },
    { icon: "wrench",   title: "Skilled Trades",   jobs: ["Carpenters", "Masons", "Plumbers", "Painters"] },
    { icon: "shield",   title: "Security & Safety",jobs: ["Security Guards", "Safety Officers", "Fire Fighters"] },
    { icon: "scissors", title: "Garments & Textiles", jobs: ["Tailors & Cutters", "Machine Operators", "Quality Inspectors"] },
    { icon: "users",    title: "Semi-Skilled & Unskilled", jobs: ["General Labourers", "Helpers", "Packers", "Cleaners"] },
    { icon: "factory",  title: "Production & Manufacturing", jobs: ["Production Operators", "Assembly Workers", "Machine Helpers", "QC Inspectors"] }
  ];

  /* ------------------------------------------------------------------------
     Data: Procedure - step lists (title + optional description)
     ------------------------------------------------------------------------ */
  var RECRUITMENT_STEPS = [
    { title: "Marketing & Client Outreach", desc: "We identify demand in target markets and connect with prospective employers requiring foreign manpower." },
    { title: "Demand Letter & Documentation", desc: "The employer issues a formal demand letter specifying job roles, wages and conditions of employment." },
    { title: "Agreement Signing", desc: "A service agreement is signed between Shuvam Overseas and the employer, defining scope, terms and responsibilities." },
    { title: "Power of Attorney & Legal Documents", desc: "The employer provides the Power of Attorney and supporting legal documents required by Nepali authorities." },
    { title: "Candidate Registration", desc: "Interested candidates register with us and complete the initial intake forms." },
    { title: "Document Collection from Candidates", desc: "We collect and verify each candidate's passport, certificates, references and personal documents." },
    { title: "Screening & Shortlisting", desc: "Profiles are screened against the employer's requirements to build a shortlist of suitable candidates." },
    { title: "Interviews (Physical / Video)", desc: "Candidates are interviewed directly by the employer, either in person or by video conference." },
    { title: "Skill Testing", desc: "Where required, practical skill assessments verify the candidate's ability to perform the job." },
    { title: "Medical Examination", desc: "Candidates undergo a government-approved medical examination to confirm fitness for employment." },
    { title: "Final Selection", desc: "The employer confirms the final selection and issues appointment letters to successful candidates." },
    { title: "Offer Letter & Contract Signing", desc: "Employment contracts are signed, clearly stating salary, working hours, accommodation and benefits." },
    { title: "Visa Process Initiation", desc: "Visa applications are prepared and submitted to the relevant embassy or consulate." },
    { title: "Embassy Submission", desc: "Complete documentation is submitted for embassy processing and authentication." },
    { title: "Visa Approval & Stamping", desc: "Approved visas are collected and stamped in each candidate's passport." },
    { title: "Pre-Departure Orientation", desc: "Candidates complete orientation on culture, labour rights, safety and contract terms before travel." },
    { title: "Flight Booking", desc: "International flights are arranged with confirmed itineraries for each candidate." },
    { title: "Airport Assistance", desc: "Our team assists with departure procedures at the airport, including document and baggage checks." },
    { title: "Travel & Arrival", desc: "Candidates travel to their destination, where local representatives assist with arrival formalities." },
    { title: "Feedback & Ongoing Support", desc: "We stay in touch with both candidate and employer to resolve any issues after deployment." }
  ];

  var DEPLOYMENT_STEPS = [
    { title: "Final Approval from DoFE", desc: "The Department of Foreign Employment reviews and approves the final recruitment documentation." },
    { title: "Visa Stamping", desc: "Approved visas are stamped into candidate passports ahead of departure." },
    { title: "Air Ticket & Travel Confirmation", desc: "Flight tickets are booked and confirmed, with travel dates communicated to candidates." },
    { title: "Pre-Departure Orientation Certificate", desc: "Candidates complete orientation and receive their certificate, a requirement for departure." },
    { title: "Final Document Verification", desc: "Passports, contracts, medical reports and certificates are verified one final time." },
    { title: "Airport Assistance", desc: "Our representatives accompany candidates through check-in, immigration and boarding." },
    { title: "Employer Notification", desc: "The employer is notified of arrival times and flight details for smooth reception." }
  ];

  var VISA_STEPS = [
    { title: "Document Verification", desc: "All passports, contracts and supporting papers are checked for accuracy and validity." },
    { title: "Embassy Submission", desc: "Complete visa files are submitted to the relevant embassy for processing." },
    { title: "Tracking & Follow-Up", desc: "We monitor the application and follow up with the embassy to keep it moving." },
    { title: "Medical & Security", desc: "Mandatory medical examinations and security clearances are completed and cleared." },
    { title: "Visa Stamping", desc: "The approved visa is collected and stamped in the candidate's passport." },
    { title: "Final Verification", desc: "The visa is cross-checked against the passport and contract before handover." }
  ];

  var SAUDI_STEPS = [
    { title: "Legal Docs & E-Wakala", desc: "The employer completes E-Wakala and all legal documents through Saudi channels." },
    { title: "Candidate Selection", desc: "Candidates are shortlisted and selected against the approved demand letter." },
    { title: "MOFA Number Acquisition", desc: "The Ministry of Foreign Affairs visa number is obtained and assigned to the file." },
    { title: "Medical Examination", desc: "Candidates complete the required medical screening for Saudi Arabia." },
    { title: "Visa Stamping", desc: "The final visa is stamped and the deployment process begins." }
  ];

  /* ------------------------------------------------------------------------
     Data: Procedure - Employer's Responsibility (6 cards)
     ------------------------------------------------------------------------ */
  var EMPLOYER_RESPONSIBILITIES = [
    { icon: "file",      title: "Legal Documentation", desc: "Providing demand letters, contracts and all documents required by Nepali law and the destination country." },
    { icon: "check",     title: "Regulatory Compliance", desc: "Meeting the labour, immigration and visa regulations of both Nepal and the host country." },
    { icon: "userCheck", title: "Selection Process", desc: "Actively participating in candidate interviews and confirming final selections." },
    { icon: "plane",     title: "Visa & Logistics", desc: "Supporting visa processing and covering approved costs for flights, medicals and permits." },
    { icon: "heart",     title: "Worker Welfare", desc: "Ensuring fair wages, safe accommodation and dignified working conditions for every worker." },
    { icon: "message",   title: "Ongoing Communication", desc: "Maintaining open, responsive contact with both the worker and our office throughout the contract." }
  ];

  /* ------------------------------------------------------------------------
     Renderers
     ------------------------------------------------------------------------ */

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  /* Escape user-authored text before it is injected as HTML. The current
     data arrays are trusted static content, but escaping here keeps every
     future edit (or API-sourced data) safe from markup injection (XSS). */
  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  /* Numbered step list - circle + number + connecting line + title + desc */
  function renderSteps(container, data) {
    var html = "";
    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      html += '<li class="step reveal">' +
                '<span class="step__marker">' + pad(i + 1) + "</span>" +
                '<div class="step__content">' +
                  "<h3>" + esc(item.title) + "</h3>" +
                  (item.desc ? "<p>" + esc(item.desc) + "</p>" : "") +
                "</div>" +
              "</li>";
    }
    container.innerHTML = html;
  }

  /* Sector card - icon + title + bullet list of job types */
  function renderSectors(container) {
    var html = "";
    for (var i = 0; i < SECTORS.length; i++) {
      var s = SECTORS[i];
      html += '<article class="sector-card reveal">' +
                '<span class="card-index">' + pad(i + 1) + "</span>" +
                '<span class="sector-card__icon">' + iconSvg(s.icon, 21) + "</span>" +
                "<h3>" + esc(s.title) + "</h3>" +
                '<ul class="sector-card__jobs">';
      for (var j = 0; j < s.jobs.length; j++) {
        html += "<li>" + esc(s.jobs[j]) + "</li>";
      }
      html += "</ul></article>";
    }
    container.innerHTML = html;
  }

  /* Employer responsibility card grid */
  function renderEmployer(container) {
    var html = "";
    for (var i = 0; i < EMPLOYER_RESPONSIBILITIES.length; i++) {
      var e = EMPLOYER_RESPONSIBILITIES[i];
      html += '<article class="employer-card reveal">' +
                '<span class="card-index">' + pad(i + 1) + "</span>" +
                '<span class="employer-card__icon">' + iconSvg(e.icon, 21) + "</span>" +
                "<h3>" + esc(e.title) + "</h3>" +
                "<p>" + esc(e.desc) + "</p>" +
              "</article>";
    }
    container.innerHTML = html;
  }

  /* ------------------------------------------------------------------------
     Boot - render whatever the page asks for. Runs after DOM is ready.
     ------------------------------------------------------------------------ */
  var STEP_LISTS = {
    recruitment: RECRUITMENT_STEPS,
    deployment: DEPLOYMENT_STEPS,
    visa: VISA_STEPS,
    saudi: SAUDI_STEPS
  };

  function boot() {
    var stepEls = document.querySelectorAll("[data-steps]");
    for (var i = 0; i < stepEls.length; i++) {
      var key = stepEls[i].getAttribute("data-steps");
      if (STEP_LISTS[key]) renderSteps(stepEls[i], STEP_LISTS[key]);
    }

    var sectorEls = document.querySelectorAll("[data-cards='sectors']");
    for (var j = 0; j < sectorEls.length; j++) renderSectors(sectorEls[j]);

    var employerEls = document.querySelectorAll("[data-cards='employer']");
    for (var k = 0; k < employerEls.length; k++) renderEmployer(employerEls[k]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  /* Expose for debugging / future use */
  window.SOData = {
    SECTORS: SECTORS,
    RECRUITMENT_STEPS: RECRUITMENT_STEPS,
    DEPLOYMENT_STEPS: DEPLOYMENT_STEPS,
    VISA_STEPS: VISA_STEPS,
    SAUDI_STEPS: SAUDI_STEPS,
    EMPLOYER_RESPONSIBILITIES: EMPLOYER_RESPONSIBILITIES
  };
})();
