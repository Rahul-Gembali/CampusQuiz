// CampusQuiz AI - Student Profile Photo, 6 Groups & Marksheet Inspector Verification Suite
const fs = require('fs');
const path = require('path');

console.log("===============================================================================");
console.log("   CAMPUSQUIZ AI — PROFILE PHOTO, 6 GROUPS & MARKSHEET INSPECTOR QA SUITE      ");
console.log("===============================================================================\n");

// Read index.html
const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Set up mock DOM environment
const elements = {};
function createMockElement(id, tag = 'div') {
  return {
    id,
    tagName: tag.toUpperCase(),
    value: '',
    textContent: '',
    innerHTML: '',
    className: '',
    children: [],
    appendChild: function(c) { this.children.push(c); },
    classList: {
      _classes: new Set(),
      add: function(...cls) { cls.forEach(c => this._classes.add(c)); },
      remove: function(...cls) { cls.forEach(c => this._classes.delete(c)); },
      toggle: function(c, force) {
        if (force === undefined) {
          if (this._classes.has(c)) this._classes.delete(c);
          else this._classes.add(c);
        } else if (force) {
          this._classes.add(c);
        } else {
          this._classes.delete(c);
        }
      },
      contains: function(c) { return this._classes.has(c); }
    },
    style: {},
    attributes: {},
    setAttribute: function(k, v) { this.attributes[k] = v; if (k === 'disabled') this.disabled = true; },
    removeAttribute: function(k) { delete this.attributes[k]; if (k === 'disabled') this.disabled = false; },
    getAttribute: function(k) { return this.attributes[k]; },
    disabled: false,
    focus: function() {},
    click: function() {}
  };
}

const mockLocalStorage = {
  _store: {},
  getItem: function(k) { return this._store.hasOwnProperty(k) ? this._store[k] : null; },
  setItem: function(k, v) { this._store[k] = String(v); },
  removeItem: function(k) { delete this._store[k]; },
  clear: function() { this._store = {}; }
};

// Global mocks
global.pdfjsLib = { GlobalWorkerOptions: {} };
global.lucide = { createIcons: () => {} };
global.window = {
  scrollTo: () => {},
  lucide: global.lucide,
  pdfjsLib: global.pdfjsLib
};
global.document = {
  createElement: (tag) => createMockElement('el_' + Math.random(), tag),
  getElementById: (id) => {
    if (!elements[id]) {
      elements[id] = createMockElement(id);
    }
    return elements[id];
  },
  getElementsByName: () => [{ checked: true, value: 'unrestricted' }],
  documentElement: {
    classList: {
      add: () => {},
      remove: () => {},
      toggle: () => {}
    },
    requestFullscreen: () => Promise.resolve()
  },
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.localStorage = mockLocalStorage;
global.alert = (msg) => { console.log(`   [ALERT]: ${msg}`); };
global.confirm = () => true;

// Extract main CampusQuiz script
const parts = html.split('<script>');
const mainScriptPart = parts.find(p => p.includes('const CampusQuiz ='));
if (!mainScriptPart) {
  console.error("FAIL: Main CampusQuiz script block not found");
  process.exit(1);
}
const scriptContent = mainScriptPart.split('<\/script>')[0];

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName}`);
    process.exitCode = 1;
  }
}

// Execute script
eval(scriptContent);
const CampusQuiz = global.window.CampusQuiz;

console.log("--- 1. THE 6 STRICT SELECTABLE ENGINEERING GROUPS & NORMALIZATION ---");
const branches = CampusQuiz.normalizeBranch ? [
  CampusQuiz.normalizeBranch('CSE'),
  CampusQuiz.normalizeBranch('CSM'),
  CampusQuiz.normalizeBranch('CSD'),
  CampusQuiz.normalizeBranch('ECE'),
  CampusQuiz.normalizeBranch('EEE'),
  CampusQuiz.normalizeBranch('Mechanical')
] : [];

assert(CampusQuiz.normalizeBranch('MECH') === 'Mechanical', "1.1 normalizeBranch('MECH') correctly resolves to 'Mechanical'");
assert(CampusQuiz.normalizeBranch('CSM') === 'CSM', "1.2 normalizeBranch('CSM') preserves 'CSM'");
assert(CampusQuiz.normalizeBranch('CSD') === 'CSD', "1.3 normalizeBranch('CSD') preserves 'CSD'");
assert(CampusQuiz.normalizeBranch('CIVIL') === 'CSE', "1.4 normalizeBranch('CIVIL') safely falls back to standard group");
assert(CampusQuiz.normalizeYear('2nd Year') === '2nd Year (B.Tech)', "1.5 normalizeYear('2nd Year') maps to '2nd Year (B.Tech)'");
assert(CampusQuiz.normalizeYear('4th Year (B.Tech)') === '4th Year (B.Tech)', "1.6 normalizeYear preserves '4th Year (B.Tech)'");

// Verify HTML templates do not have CIVIL and strictly have the 6 groups
assert(!html.includes('<option value="CIVIL">CIVIL</option>'), "1.7 index.html contains ZERO occurrences of <option value=\"CIVIL\">");
assert(!html.includes('<option value="MECH">MECH</option>'), "1.8 index.html contains ZERO occurrences of <option value=\"MECH\">");
assert(html.includes('<option value="Mechanical">Mechanical</option>'), "1.9 index.html contains official <option value=\"Mechanical\">");

console.log("\n--- 2. STUDENT PROFILE PHOTO & MONOGRAM AVATAR PIPELINE ---");
// Init registry
mockLocalStorage.clear();
const reg = CampusQuiz.initUserRegistry();
assert(reg && reg.students['26A91A0500'], "2.1 User registry initializes demo student 26A91A0500");
assert(reg.students['26A91A0500'].photoUrl && reg.students['26A91A0500'].photoUrl.startsWith('data:image'), "2.2 Demo student has pre-seeded authentic SVG data URL profile photo");

// Test monogram initials generator
assert(CampusQuiz.getStudentInitials("Rahul Gembali") === "RG", "2.3 getStudentInitials('Rahul Gembali') returns 'RG'");
assert(CampusQuiz.getStudentInitials("K. Sai Kumar") === "KK", "2.4 getStudentInitials('K. Sai Kumar') returns 'KK'");
assert(CampusQuiz.getStudentInitials("Venkatesh") === "VE", "2.5 getStudentInitials('Venkatesh') returns 2-char prefix 'VE'");

// Test getStudentAvatarHtml
const photoAvatar = CampusQuiz.getStudentAvatarHtml("Rahul Gembali", "data:image/jpeg;base64,sample123", 40);
assert(photoAvatar.includes('<img') && photoAvatar.includes('src="data:image/jpeg;base64,sample123"'), "2.6 getStudentAvatarHtml renders <img> tag when photoUrl is present");
assert(photoAvatar.includes('style="width:40px; height:40px;'), "2.7 getStudentAvatarHtml sets exact specified dimensions (40px)");

const monogramAvatar = CampusQuiz.getStudentAvatarHtml("Sai Kumar", null, 48);
assert(monogramAvatar.includes('SK'), "2.8 getStudentAvatarHtml renders student initials 'SK' when photo is null");
assert(monogramAvatar.includes('bg-red-900'), "2.9 Monogram avatar styled with Academic Crimson background");

// Test photo downscaling API
assert(typeof CampusQuiz.downscaleProfilePhoto === 'function', "2.10 CampusQuiz.downscaleProfilePhoto function is exposed");
CampusQuiz.downscaleProfilePhoto({ type: 'image/png' }, (dataUrl, err) => {
  assert(!err && dataUrl && dataUrl.startsWith('data:image'), "2.11 downscaleProfilePhoto executes callback with valid JPEG data URL");
});

console.log("\n--- 3. STUDENT REGISTRATION & PROFILE PHOTO INTEGRATION ---");
// Register a new student with photo
document.getElementById('regRollNo').value = '26A91A0588';
document.getElementById('regStudentName').value = 'Ananya Sharma';
document.getElementById('regYear').value = '3rd Year (B.Tech)';
document.getElementById('regBranch').value = 'CSM';
document.getElementById('regSection').value = 'Section B';
document.getElementById('regPassword').value = 'Avanthi#2026';
document.getElementById('regPhotoDataUrl').value = 'data:image/jpeg;base64,mockAnanyaPhotoData';

CampusQuiz.registerStudent();

const updatedReg = CampusQuiz.getUserRegistry();
assert(updatedReg.students['26A91A0588'], "3.1 Student 26A91A0588 successfully registered in local registry");
assert(updatedReg.students['26A91A0588'].photoUrl === 'data:image/jpeg;base64,mockAnanyaPhotoData', "3.2 Student photoUrl persisted in user profile");
assert(updatedReg.students['26A91A0588'].branch === 'CSM', "3.3 Registered branch CSM correctly saved");

// Test student profile modal save & photo clear
document.getElementById('profileStudentName').value = 'Ananya Sharma Updated';
document.getElementById('profileYear').value = '3rd Year (B.Tech)';
document.getElementById('profileBranch').value = 'CSM';
document.getElementById('profileSection').value = 'Section C';
document.getElementById('profilePhotoDataUrl').value = '__REMOVED__';

CampusQuiz.saveStudentProfile();

const postSaveReg = CampusQuiz.getUserRegistry();
assert(postSaveReg.students['26A91A0588'].name === 'Ananya Sharma Updated', "3.4 Student profile name updated");
assert(postSaveReg.students['26A91A0588'].section === 'Section C', "3.5 Student profile section updated to Section C");
assert(postSaveReg.students['26A91A0588'].photoUrl === '', "3.6 Student photoUrl cleared when removed in profile modal");

console.log("\n--- 4. FACULTY MARKSHEET COHORT FILTERS & OMNIBAR SEARCH ---");
// Seed sample test attempts in gradebook storage
const mockAttempts = [
  {
    rollNo: '26A91A0500',
    name: 'Rahul Gembali',
    year: '2nd Year (B.Tech)',
    branch: 'CSE',
    section: 'Section A',
    quizTitle: 'CS301PC Mid-Term I',
    score: '18.0',
    maxMarks: '20.0',
    percentage: '90.0%',
    percentageNum: 90.0,
    timeSpent: '14m 32s',
    tabSwitches: 0,
    forcedSubmission: false,
    timestamp: new Date().toISOString(),
    fullPayload: {
      breakdown: [
        { displayNumber: 1, topic: 'Pointers', stem: 'What is a pointer in C?', chosenText: 'Memory address', correctText: 'Memory address', isCorrect: true, explanation: 'A pointer stores the memory address of another variable.' },
        { displayNumber: 2, topic: 'Arrays', stem: 'What is array indexing base in C?', chosenText: '1', correctText: '0', isCorrect: false, explanation: 'C arrays use 0-based indexing.' }
      ]
    }
  },
  {
    rollNo: '26A91A0524',
    name: 'P. Sai Kumar',
    year: '2nd Year (B.Tech)',
    branch: 'CSM',
    section: 'Section B',
    quizTitle: 'CS301PC Mid-Term I',
    score: '15.0',
    maxMarks: '20.0',
    percentage: '75.0%',
    percentageNum: 75.0,
    timeSpent: '12m 10s',
    tabSwitches: 1,
    forcedSubmission: false,
    timestamp: new Date().toISOString(),
    fullPayload: { breakdown: [] }
  },
  {
    rollNo: '26A91A0412',
    name: 'V. Divya',
    year: '3rd Year (B.Tech)',
    branch: 'ECE',
    section: 'Section A',
    quizTitle: 'EC401PC Signals & Systems',
    score: '19.0',
    maxMarks: '20.0',
    percentage: '95.0%',
    percentageNum: 95.0,
    timeSpent: '15m 00s',
    tabSwitches: 0,
    forcedSubmission: false,
    timestamp: new Date().toISOString(),
    fullPayload: { breakdown: [] }
  }
];

mockLocalStorage.setItem('campusquiz_attempts', JSON.stringify(mockAttempts));

// Test Omnibar Instant Search by Roll Number
document.getElementById('filterSearchOmnibar').value = '0500';
document.getElementById('filterYearSelect').value = 'ALL';
document.getElementById('filterGroupSelect').value = 'ALL';
document.getElementById('filterSectionSelect').value = 'ALL';
document.getElementById('filterExamSelect').value = 'ALL';

CampusQuiz.renderResultsHub();
const tbodyHtmlRoll = document.getElementById('gradebookTableBody').innerHTML;
assert(tbodyHtmlRoll.includes('26A91A0500'), "4.1 Omnibar search for '0500' matches Rahul Gembali");
assert(!tbodyHtmlRoll.includes('26A91A0524') && !tbodyHtmlRoll.includes('26A91A0412'), "4.2 Omnibar excludes non-matching candidates (Sai Kumar & Divya)");

// Test Omnibar Search by Name
document.getElementById('filterSearchOmnibar').value = 'Divya';
CampusQuiz.renderResultsHub();
const tbodyHtmlName = document.getElementById('gradebookTableBody').innerHTML;
assert(tbodyHtmlName.includes('V. Divya') && tbodyHtmlName.includes('26A91A0412'), "4.3 Omnibar search for 'Divya' matches candidate name");
assert(!tbodyHtmlName.includes('Rahul Gembali'), "4.4 Non-matching candidate excluded");

// Test Filter by Group (Branch)
document.getElementById('filterSearchOmnibar').value = '';
document.getElementById('filterGroupSelect').value = 'CSM';
CampusQuiz.renderResultsHub();
const tbodyHtmlGroup = document.getElementById('gradebookTableBody').innerHTML;
assert(tbodyHtmlGroup.includes('26A91A0524') && tbodyHtmlGroup.includes('P. Sai Kumar'), "4.5 Group filter 'CSM' matches P. Sai Kumar");
assert(!tbodyHtmlGroup.includes('26A91A0500'), "4.6 Group filter 'CSM' excludes CSE student");

// Test Filter by Year
document.getElementById('filterGroupSelect').value = 'ALL';
document.getElementById('filterYearSelect').value = '3rd Year (B.Tech)';
CampusQuiz.renderResultsHub();
const tbodyHtmlYear = document.getElementById('gradebookTableBody').innerHTML;
assert(tbodyHtmlYear.includes('V. Divya'), "4.7 Year filter '3rd Year' matches 3rd year candidate Divya");
assert(!tbodyHtmlYear.includes('Rahul Gembali'), "4.8 Year filter '3rd Year' excludes 2nd year candidate Rahul");

// Test Filter Reset
CampusQuiz.resetMarksheetFilters();
const tbodyHtmlReset = document.getElementById('gradebookTableBody').innerHTML;
assert(document.getElementById('filterSearchOmnibar').value === '', "4.9 resetMarksheetFilters clears omnibar input");
assert(document.getElementById('filterGroupSelect').value === 'ALL', "4.10 resetMarksheetFilters resets group dropdown to ALL");
assert(tbodyHtmlReset.includes('Rahul Gembali') && tbodyHtmlReset.includes('P. Sai Kumar') && tbodyHtmlReset.includes('V. Divya'), "4.11 Full roster restored upon filter reset");

console.log("\n--- 5. DEEP STUDENT ANSWER SHEET & PROFILE INSPECTOR MODAL ---");
// Open inspection on record 0 (Rahul Gembali)
CampusQuiz.openStudentInspection(0);

const modal = document.getElementById('modalStudentInspection');
assert(!modal.classList.contains('hidden'), "5.1 modalStudentInspection opens and removes 'hidden' class");

assert(document.getElementById('inspStudentRoll').textContent === '26A91A0500', "5.2 Student Roll Number 26A91A0500 displayed in inspector header");
assert(document.getElementById('inspStudentName').textContent === 'Rahul Gembali', "5.3 Student Name Rahul Gembali displayed in inspector header");
assert(document.getElementById('inspStudentStanding').textContent.includes('Department of CSE'), "5.4 Academic Standing displays 'Department of CSE'");
assert(document.getElementById('inspStudentPhotoContainer').innerHTML.includes('<img') || document.getElementById('inspStudentPhotoContainer').innerHTML.includes('RG'), "5.5 72x72 photo container renders student avatar or monogram");
assert(document.getElementById('inspTimeSpent').textContent === '14m 32s', "5.6 Time Expended 14m 32s displayed");

// Verify question breakdown in Section 2
const breakdownHtml = document.getElementById('inspBreakdownContainer').innerHTML;
assert(breakdownHtml.includes('Pointers') && breakdownHtml.includes('What is a pointer in C?'), "5.7 Question 1 stem and topic rendered");
assert(breakdownHtml.includes('CORRECT'), "5.8 Correct question marked with CORRECT badge");
assert(breakdownHtml.includes('INCORRECT'), "5.9 Incorrect question marked with INCORRECT badge");
assert(breakdownHtml.includes('A pointer stores the memory address of another variable'), "5.10 Academic rationale and citation rendered");

CampusQuiz.closeStudentInspection();
assert(modal.classList.contains('hidden'), "5.11 closeStudentInspection hides inspector modal");

console.log("\n===============================================================================");
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
console.log("===============================================================================\n");

if (passedTests === totalTests) {
  console.log("ALL PROFILE PHOTO, 6 GROUPS & MARKSHEET INSPECTOR TESTS PASSED WITH 100% SUCCESS!");
} else {
  console.error("SOME TESTS FAILED!");
  process.exit(1);
}
