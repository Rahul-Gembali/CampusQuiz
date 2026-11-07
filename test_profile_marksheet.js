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
    removeChild: function(c) { const i = this.children.indexOf(c); if (i !== -1) this.children.splice(i, 1); },
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
  body: createMockElement('body'),
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
global.FileReader = function() {
  this.readAsText = function(f) {
    if (this.onload) this.onload({ target: { result: f._content } });
  };
  this.readAsDataURL = function(b) {
    if (this.onloadend) {
      this.result = 'data:audio/mp3;base64,AAAA';
      this.onloadend();
    }
  };
};
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

// =========================================================================
// TEST SUITE 6: Cryptographic Checksum, Sealed Marksheet & State Persistence
// =========================================================================
console.log("\n--- 6. CRYPTOGRAPHIC CHECKSUMS, SEALED MARKSHEET & PERSISTENCE ---");

(async () => {
  // Test 6.1: Deterministic key sorting in computeSignature (Flaw 5)
  const sigA = await CampusQuiz.computeSignature('26A91A0500', 'quiz_1', { q1: 'opt_1', q2: 'opt_2', q3: 'opt_3' }, '2026-11-05T00:00:00.000Z', 'exam_salt_123');
  const sigB = await CampusQuiz.computeSignature('26A91A0500', 'quiz_1', { q3: 'opt_3', q1: 'opt_1', q2: 'opt_2' }, '2026-11-05T00:00:00.000Z', 'exam_salt_123');
  assert(sigA === sigB, "6.1 Deterministic key sorting produces identical signature regardless of key insertion order");

  // Test 6.2: Keyed hash via examSalt (Flaw 6)
  const sigC = await CampusQuiz.computeSignature('26A91A0500', 'quiz_1', { q1: 'opt_1', q2: 'opt_2', q3: 'opt_3' }, '2026-11-05T00:00:00.000Z', 'diff_salt_999');
  assert(sigA !== sigC, "6.2 Keyed hash with distinct examSalt produces distinct cryptographic signatures");

  // Test 6.3: Sealed Exam Marksheet CSV Export (Flaw 9)
  let exportedCsvContent = '';
  global.Blob = function(content) {
    if (Array.isArray(content)) exportedCsvContent = content.join('');
  };
  global.URL = { createObjectURL: () => 'blob://download', revokeObjectURL: () => {} };

  mockLocalStorage.setItem('campusquiz_attempts', JSON.stringify([
    {
      rollNo: '26A91A0500',
      name: 'Rahul Gembali',
      branch: 'CSE',
      score: '15 / 20 (Sealed)',
      isSealed: true,
      timestamp: '2026-11-05T10:00:00.000Z'
    }
  ]));

  CampusQuiz.exportOfficialMarksheetCsv();
  assert(exportedCsvContent.includes('"Sealed (Pending)"'), "6.3a Marksheet CSV exports Score as 'Sealed (Pending)' for sealed exams");
  assert(exportedCsvContent.includes('"N/A"'), "6.3b Marksheet CSV exports Percentage as 'N/A' for sealed exams");
  assert(exportedCsvContent.includes('SEALED'), "6.3c Marksheet CSV exports Status as 'SEALED'");

  // Test 6.4: Clear All Results Storage Scope (Flaw 8)
  mockLocalStorage.setItem('campusquiz_test_attempts', JSON.stringify([{ rollNo: 'TEST01' }]));
  mockLocalStorage.setItem('campusquiz_attempts', JSON.stringify([{ rollNo: 'TEST01' }]));
  mockLocalStorage.setItem('campusquiz_imported_results', JSON.stringify([{ rollNo: 'TEST01' }]));

  CampusQuiz.clearAllResults();
  assert(!mockLocalStorage.getItem('campusquiz_test_attempts'), "6.4a clearAllResults cleanly removes campusquiz_test_attempts");
  assert(!mockLocalStorage.getItem('campusquiz_attempts'), "6.4b clearAllResults cleanly removes campusquiz_attempts");
  assert(!mockLocalStorage.getItem('campusquiz_imported_results'), "6.4c clearAllResults cleanly removes campusquiz_imported_results");

  // Test 6.5: User Registry profile tracking for double-submission (Flaw 10)
  const userReg = CampusQuiz.getUserRegistry();
  assert(userReg && userReg.students && userReg.students['26A91A0500'], "6.5 User registry contains student profiles for double-submission tracking");

  // Test 6.6: Master Key Evaluation Unseals Records and Exports Calculated Scores (Bug 2)
  mockLocalStorage.setItem('campusquiz_attempts', JSON.stringify([
    {
      rollNo: '26A91A0500',
      name: 'Rahul Gembali',
      quizId: 'exam_cs101',
      score: '0 / 2 (Sealed)',
      isSealed: true,
      timestamp: '2026-11-05T10:00:00.000Z',
      fullPayload: {
        quizId: 'exam_cs101',
        isSealedExam: true,
        student: { rollNumber: '26A91A0500', name: 'Rahul Gembali' },
        selectedOptions: { q1: 'opt_1', q2: 'opt_4' },
        performance: { score: 0, isSealed: true }
      }
    }
  ]));

  const sampleMasterKey = {
    packageType: "FACULTY_KEY",
    quizId: 'exam_cs101',
    salt: 'master_salt_cs101',
    marking: { positive: 1.0, negative: 0.0 },
    keys: {
      q1: { correctOptionId: 'opt_1', correctText: 'Correct Option 1' },
      q2: { correctOptionId: 'opt_2', correctText: 'Correct Option 2' }
    }
  };

  CampusQuiz.handleMasterKeyFile({
    files: [{ name: "cs101.key.json", _content: JSON.stringify(sampleMasterKey) }],
    value: 'cs101.key.json'
  });

  const gradedAttempts = JSON.parse(mockLocalStorage.getItem('campusquiz_test_attempts') || mockLocalStorage.getItem('campusquiz_attempts'));
  assert(gradedAttempts && gradedAttempts[0].isSealed === false, "6.6a Master Key grading explicitly sets rec.isSealed = false");
  assert(gradedAttempts[0].fullPayload && gradedAttempts[0].fullPayload.isSealedExam === false, "6.6b Master Key grading explicitly sets fullPayload.isSealedExam = false");
  assert(gradedAttempts[0].fullPayload.performance && gradedAttempts[0].fullPayload.performance.isSealed === false, "6.6c Master Key grading sets performance.isSealed = false");

  CampusQuiz.exportOfficialMarksheetCsv();
  assert(!exportedCsvContent.includes('"Sealed (Pending)"'), "6.6d Marksheet CSV no longer exports 'Sealed (Pending)' after master key grading");
  assert(exportedCsvContent.includes('"50.00%"') || exportedCsvContent.includes('50%'), "6.6e Marksheet CSV exports calculated percentage after master key grading");

  // Test 6.7: Checksum value in CSV export uses authentic 64-char SHA-256 signature (Bug 9)
  CampusQuiz.clearAllResults();
  const fullChecksum = 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90';
  mockLocalStorage.setItem('campusquiz_attempts', JSON.stringify([
    {
      rollNo: '26A91A0500',
      name: 'Rahul Gembali',
      quizId: 'exam_cs101',
      score: '1 / 2',
      isSealed: false,
      timestamp: '2026-11-05T10:00:00.000Z',
      seedHash: 'SHORT_SEED',
      fullPayload: {
        checksum: fullChecksum,
        quizId: 'exam_cs101',
        student: { rollNumber: '26A91A0500', name: 'Rahul Gembali' }
      }
    }
  ]));
  CampusQuiz.exportOfficialMarksheetCsv();
  assert(exportedCsvContent.includes(fullChecksum), "6.7 Marksheet CSV exports authentic 64-character SHA-256 signature instead of short seed");

  // Test 6.8: Sealed Records in Gradebook UI Table & Analytics (Bug 4)
  CampusQuiz.clearAllResults();
  mockLocalStorage.setItem('campusquiz_attempts', JSON.stringify([
    {
      rollNo: '26A91A0501',
      name: 'P. Sai Kumar',
      quizId: 'exam_sealed_01',
      score: '10 / 20 (Sealed)',
      isSealed: true,
      tabSwitches: 1,
      fullPayload: { isSealedExam: true }
    },
    {
      rollNo: '26A91A0502',
      name: 'D. Divya',
      quizId: 'exam_sealed_01',
      score: '18 / 20',
      percentage: '90%',
      percentageNum: 90,
      isSealed: false,
      tabSwitches: 0,
      fullPayload: { isSealedExam: false }
    }
  ]));

  CampusQuiz.renderResultsHub();
  const tbodyHtml = document.getElementById('gradebookTableBody').innerHTML;
  assert(tbodyHtml.includes('Sealed (Pending)'), "6.8a Gradebook table renders 'Sealed (Pending)' for sealed candidate score");
  assert(tbodyHtml.includes('SEALED'), "6.8b Gradebook table renders 'SEALED' status badge for sealed record");

  const statFlagsText = document.getElementById('statIntegrityViolations').textContent;
  assert(statFlagsText.includes('1 Sealed'), "6.9a Analytics counters track and display '1 Sealed' count");
  const statAvgText = document.getElementById('statClassAverage').textContent;
  assert(statAvgText.includes('18.00') && statAvgText.includes('90.0%'), "6.9b Class average excludes sealed records from calculations");

  // Test 6.10: Answer Sheet Inspector for Sealed Records (Bug 5)
  CampusQuiz.openStudentInspection(0);
  assert(document.getElementById('modalStudentInspection').classList.contains('hidden') === false, "6.10a Student inspection modal opens");

  // Test 6.11: Answer Sheet Inspector maps violation log using v.type (Bug 6)
  CampusQuiz.clearAllResults();
  mockLocalStorage.setItem('campusquiz_attempts', JSON.stringify([
    {
      rollNo: '26A91A0599',
      name: 'V. Naresh',
      isSealed: false,
      score: '15 / 20',
      fullPayload: {
        integrity: {
          violationLog: [
            { type: 'FULLSCREEN_EXITED', count: 1, timestamp: Date.now() },
            { type: 'TAB_SWITCH', count: 2, timestamp: Date.now() }
          ]
        },
        breakdown: [
          { displayNumber: 1, id: 'q1', stem: 'Sample Stem', chosenText: 'Choice A', isCorrect: null }
        ]
      }
    }
  ]));
  CampusQuiz.openStudentInspection(0);
  const violHtml = document.getElementById('inspViolationsList').innerHTML;
  assert(violHtml.includes('Exited Fullscreen'), "6.11a Violation list correctly maps FULLSCREEN_EXITED to 'Exited Fullscreen'");
  assert(violHtml.includes('Tab switch / focus blur'), "6.11b Violation list correctly maps TAB_SWITCH to 'Tab switch / focus blur'");
  const qBreakdownHtml = document.getElementById('inspBreakdownContainer').innerHTML;
  assert(qBreakdownHtml.includes('SEALED') && qBreakdownHtml.includes('Sealed until Master Key applied'), "6.10b Sealed question card renders SEALED badge and 'Sealed until Master Key applied'");

  // Test 6.12: Compact QR & Result Code Ingestion (Bug 8)
  const compactPayload = {
    v: 1,
    q: "exam_cq_test",
    r: "26A91A0577",
    n: "K. Harika",
    b: "CSE",
    s: "Section B",
    sc: 0,
    mx: 5,
    p: 0,
    sw: 0,
    fs: 0,
    t: 120,
    cs: "dummy_checksum_64chars_abcdef0123456789abcdef0123456789abcdef0123456789",
    ans: { q1: "opt_2", q2: "opt_3" }
  };
  const compactStr = "CQ1:" + Buffer.from(unescape(encodeURIComponent(JSON.stringify(compactPayload)))).toString('base64');
  const importSuccess = await CampusQuiz.importResultCode(compactStr);
  assert(importSuccess === true, "6.12a CampusQuiz.importResultCode successfully parses and imports CQ1:... compact result string");
  const allResults = CampusQuiz.getAllResults();
  const importedRecord = allResults.find(r => r.rollNo === '26A91A0577');
  assert(importedRecord !== undefined, "6.12b Imported student record appears in marksheet results");
  assert(importedRecord.fullPayload && importedRecord.fullPayload.selectedOptions.q1 === 'opt_2', "6.12c Answers mapped by Question ID (q1 -> opt_2)");

  // Test 6.13: verifyResultChecksum prioritizes facultyMasterSalt over payload salt (Bug 7)
  const studentPayload = {
    quizId: "exam_salt_test",
    student: { rollNumber: "26A91A0500" },
    timing: { submittedAt: "2026-11-05T00:00:00.000Z" },
    selectedOptions: { q1: "opt_1" },
    examSalt: "tampered_student_salt",
    checksum: ""
  };
  const facultySecretSalt = "verified_faculty_secret_salt_2026";
  studentPayload.checksum = await CampusQuiz.computeSignature("26A91A0500", "exam_salt_test", { q1: "opt_1" }, "2026-11-05T00:00:00.000Z", facultySecretSalt);

  const isFacultySaltVerified = await CampusQuiz.verifyResultChecksum(studentPayload, facultySecretSalt);
  assert(isFacultySaltVerified === true, "6.13 verifyResultChecksum prioritizes facultyMasterSalt over untrusted payload.examSalt");

  console.log("\n===============================================================================");
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
  console.log("===============================================================================\n");

  if (passedTests === totalTests) {
    console.log("ALL PROFILE PHOTO, 6 GROUPS & MARKSHEET INSPECTOR TESTS PASSED WITH 100% SUCCESS!");
  } else {
    console.error("SOME TESTS FAILED!");
    process.exit(1);
  }
})();
