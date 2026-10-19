// CampusQuiz AI - Comprehensive Authentication, Profile & Cohort Targeting Test Suite
const fs = require('fs');
const path = require('path');

console.log("===============================================================================");
console.log("   CAMPUSQUIZ AI — AUTHENTICATION, PROFILE & COHORT VERIFICATION SUITE       ");
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
global.alert = (msg) => { console.log(`   [ALERT CAPTURED]: ${msg.replace(/\n/g, ' ')}`); };
global.confirm = () => true;

// Extract main CampusQuiz script
const parts = html.split('<script>');
const mainScriptPart = parts.find(p => p.includes('const CampusQuiz ='));
if (!mainScriptPart) {
  console.error("FAIL: Main CampusQuiz script block not found");
  process.exit(1);
}
const scriptContent = mainScriptPart.split('<\/script>')[0];

// Execute script
eval(scriptContent);
const CQ = global.window.CampusQuiz;

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failed++;
  }
}

// =========================================================================
// TEST SUITE 1: Universal Master Credentials & Hashing
// =========================================================================
console.log("--- 1. UNIVERSAL MASTER CREDENTIALS & HASHING ---");

// Test 1.1: Password Hashing
const facultyHash = CQ.hashPassword("Avanthi#Faculty2026");
assert(facultyHash === "8a38262f0c8510a24441965f1bf3ddb33879e3c1cd9091cfd192236a1c755286", "1.1 SHA-256 for Avanthi#Faculty2026 matches standard hash");

const studentHash = CQ.hashPassword("Avanthi#Student2026");
assert(studentHash === "92f967d713d798abe2b9bece28318eed5a61119e63e656b4f4d1a968c3cba859", "1.2 SHA-256 for Avanthi#Student2026 matches standard hash");

const defaultRegHash = CQ.hashPassword("Avanthi@123");
assert(defaultRegHash === "0fc0e850d418d835b28eb00cf41138b44af44d28ec58393c91906b41bb82080f", "1.3 SHA-256 for Avanthi@123 matches standard hash");

// Test 1.4: User Registry Initialization
const registry = CQ.initUserRegistry();
assert(registry.faculty && registry.faculty['FACULTY_ADMIN'], "1.4 Faculty Admin pre-seeded in user registry");
assert(registry.students && registry.students['26A91A0500'], "1.5 Student Demo (Rahul Gembali) pre-seeded in registry");
assert(registry.students['26A91A0500'].branch === 'CSE' && registry.students['26A91A0500'].section === 'Section A', "1.6 Student Demo seeded with CSE - Section A - 2nd Year");

// =========================================================================
// TEST SUITE 2: Student Authentication & Quick-Fill Demo
// =========================================================================
console.log("\n--- 2. STUDENT AUTHENTICATION & DEMO LOGIN ---");

// Test 2.1: Quick Fill Demo
CQ.quickFillStudentDemo();
const activeStudent = JSON.parse(mockLocalStorage.getItem('campusquiz_logged_student'));
assert(activeStudent && activeStudent.rollNo === '26A91A0500', "2.1 Quick Fill Demo instantly signs in 26A91A0500");
assert(activeStudent.name === 'Rahul Gembali', "2.2 Quick Fill Demo populates student name Rahul Gembali");

// Test 2.3: Student Logout
CQ.logoutStudent();
assert(!mockLocalStorage.getItem('campusquiz_logged_student'), "2.3 logoutStudent() removes session from storage");

// Test 2.4: Invalid Password Rejection
document.getElementById('inputRollNo').value = '26A91A0500';
document.getElementById('inputStudentPassword').value = 'WrongPassword123';
CQ.loginStudent();
assert(!mockLocalStorage.getItem('campusquiz_logged_student'), "2.4 Invalid password rejected, session not created");

// Test 2.5: Valid Login with Master Credentials
document.getElementById('inputStudentPassword').value = 'Avanthi#Student2026';
CQ.loginStudent();
const loggedInAgain = JSON.parse(mockLocalStorage.getItem('campusquiz_logged_student'));
assert(loggedInAgain && loggedInAgain.rollNo === '26A91A0500', "2.5 Valid login with Avanthi#Student2026 succeeds");

// =========================================================================
// TEST SUITE 3: Student Registration with Permanent Roll Number
// =========================================================================
console.log("\n--- 3. STUDENT REGISTRATION & IMMUTABILITY ---");

// Test 3.1: Register a new student
document.getElementById('regRollNo').value = '26A91A0524';
document.getElementById('regStudentName').value = 'P. Sai Kumar';
document.getElementById('regYear').value = '3rd Year';
document.getElementById('regBranch').value = 'CSM';
document.getElementById('regSection').value = 'Section B';
document.getElementById('regPassword').value = 'Avanthi@123';
CQ.registerStudent();

const updatedReg = CQ.getUserRegistry();
assert(updatedReg.students['26A91A0524'] !== undefined, "3.1 New student 26A91A0524 successfully added to registry");
assert(updatedReg.students['26A91A0524'].branch === 'CSM', "3.2 New student branch is CSM");
assert(updatedReg.students['26A91A0524'].section === 'Section B', "3.3 New student section is Section B");

// Test 3.4: Duplicate registration prevention
const regMsg = document.getElementById('studentRegMessage');
CQ.registerStudent(); // Attempt to register same roll number
assert((regMsg.innerHTML || regMsg.textContent).includes('already registered'), "3.4 Duplicate registration of same Roll Number rejected");

// =========================================================================
// TEST SUITE 4: Student Profile Editing & Immutability Check
// =========================================================================
console.log("\n--- 4. STUDENT PROFILE EDITING & IMMUTABILITY ---");

// Logged in as 26A91A0524
CQ.openStudentProfile();
assert(document.getElementById('profileRollNoDisplay').textContent === '26A91A0524', "4.1 Profile modal displays permanent Roll Number 26A91A0524");

// Update editable fields
document.getElementById('profileStudentName').value = 'P. Sai Kumar (Updated)';
document.getElementById('profileSection').value = 'Section C';
document.getElementById('profileNewPassword').value = 'NewSecret#2026';
document.getElementById('profileConfirmPassword').value = 'NewSecret#2026';
CQ.saveStudentProfile();

const verifiedReg = CQ.getUserRegistry();
assert(verifiedReg.students['26A91A0524'].name === 'P. Sai Kumar (Updated)', "4.2 Full Name updated successfully in registry");
assert(verifiedReg.students['26A91A0524'].section === 'Section C', "4.3 Section updated to Section C");
assert(verifiedReg.students['26A91A0524'].rollNo === '26A91A0524', "4.4 Roll Number remained strictly immutable");

// Verify new password works
CQ.logoutStudent();
document.getElementById('inputRollNo').value = '26A91A0524';
document.getElementById('inputStudentPassword').value = 'NewSecret#2026';
CQ.loginStudent();
assert(JSON.parse(mockLocalStorage.getItem('campusquiz_logged_student')).rollNo === '26A91A0524', "4.5 Student successfully logged in with updated password");

// =========================================================================
// TEST SUITE 5: Faculty Admin Credentials & Gate
// =========================================================================
console.log("\n--- 5. FACULTY ADMIN CREDENTIALS & DEMO GATE ---");

// Test 5.1: Quick Fill Faculty Admin
CQ.quickFillFacultyDemo();
const facultySession = JSON.parse(mockLocalStorage.getItem('campusquiz_logged_faculty'));
assert(facultySession && facultySession.id === 'FACULTY_ADMIN', "5.1 Quick Fill Faculty Admin unlocks faculty portal");

// Test 5.2: Lock Faculty Mode
CQ.lockFacultyMode();
assert(!mockLocalStorage.getItem('campusquiz_logged_faculty'), "5.2 lockFacultyMode() locks faculty portal and clears session");

// Test 5.3: Passkey backward compatibility (avanthi2026)
document.getElementById('facultyIdInput').value = '';
document.getElementById('facultyPinInput').value = 'avanthi2026';
CQ.verifyFacultyPin();
assert(mockLocalStorage.getItem('campusquiz_logged_faculty') !== null, "5.3 Legacy passkey 'avanthi2026' still unlocks portal");

// =========================================================================
// TEST SUITE 6: Academic Cohort Targeting Engine
// =========================================================================
console.log("\n--- 6. ACADEMIC COHORT TARGETING & ENFORCEMENT ---");

// Set up targeted exam: 2nd Year, CSE, Section A
const targetExam = {
  id: "test-exam-01",
  title: "Operating Systems Lab Test",
  durationMinutes: 15,
  targetCohort: {
    years: ['2nd Year'],
    branches: ['CSE'],
    sections: ['Section A']
  }
};

// Test 6.1: Eligible student (26A91A0500 - 2nd Year, CSE, Section A)
const studentRahul = {
  rollNo: '26A91A0500',
  name: 'Rahul Gembali',
  year: '2nd Year',
  branch: 'CSE',
  section: 'Section A'
};
const checkEligible = CQ.isStudentEligibleForExam(studentRahul, targetExam);
assert(checkEligible.eligible === true, "6.1 Matching student (2nd Year, CSE, Section A) is eligible");

// Test 6.2: Wrong Year student (3rd Year, CSE, Section A)
const studentWrongYear = { ...studentRahul, year: '3rd Year' };
const checkWrongYear = CQ.isStudentEligibleForExam(studentWrongYear, targetExam);
assert(checkWrongYear.eligible === false, "6.2 Ineligible year (3rd Year) correctly restricted");

// Test 6.3: Wrong Branch student (2nd Year, ECE, Section A)
const studentWrongBranch = { ...studentRahul, branch: 'ECE' };
const checkWrongBranch = CQ.isStudentEligibleForExam(studentWrongBranch, targetExam);
assert(checkWrongBranch.eligible === false, "6.3 Ineligible branch (ECE) correctly restricted");

// Test 6.4: Wrong Section student (2nd Year, CSE, Section B)
const studentWrongSection = { ...studentRahul, section: 'Section B' };
const checkWrongSec = CQ.isStudentEligibleForExam(studentWrongSection, targetExam);
assert(checkWrongSec.eligible === false, "6.4 Ineligible section (Section B) correctly restricted");

// Test 6.5: Multi-Section Targeting (Sections A and C)
const multiCohortExam = {
  id: "test-exam-02",
  targetCohort: {
    years: ['2nd Year', '3rd Year'],
    branches: ['CSE', 'CSM'],
    sections: ['Section A', 'Section C']
  }
};
assert(CQ.isStudentEligibleForExam({ year: '3rd Year', branch: 'CSM', section: 'Section C' }, multiCohortExam).eligible === true, "6.5 Multi-cohort student (3rd Year, CSM, Section C) is eligible");
assert(CQ.isStudentEligibleForExam({ year: '3rd Year', branch: 'CSM', section: 'Section B' }, multiCohortExam).eligible === false, "6.6 Section B correctly excluded from multi-cohort target");

// Test 6.6: Scheduler Cohort Tiers rendering
CQ.selectAllYears(true);
CQ.selectAllBranches(true);
CQ.selectAllSections(true);
CQ.renderSchedulerCohortTiers();
assert(document.getElementById('schedYearsContainer').innerHTML.includes('1st Year'), "6.7 Scheduler renders 1st Year chip");
assert(document.getElementById('schedBranchesContainer').innerHTML.includes('CSE'), "6.8 Scheduler renders CSE branch chip");
assert(document.getElementById('schedSectionsContainer').innerHTML.includes('Section F'), "6.9 Scheduler renders Section F chip (all 6 sections present)");

// =========================================================================
// TEST SUITE 7: End-to-End Exam Startup & Cohort Gating
// =========================================================================
console.log("\n--- 7. END-TO-END EXAM STARTUP & COHORT GATING ---");

// Test 7.1: Start exam with eligible student (Rahul Gembali 26A91A0500)
CQ.quickFillStudentDemo();
CQ.startExam();
assert(document.getElementById('hudRollNo').textContent === '26A91A0500', "7.1 Examination HUD populated with verified Roll No 26A91A0500");
assert(document.getElementById('hudStudentName').textContent === 'Rahul Gembali', "7.2 Examination HUD populated with candidate Full Name");
assert(document.getElementById('hudBranchSec').textContent.includes('CSE'), "7.3 Examination HUD displays verified Academic Branch");

// Test 7.2: Ineligible cohort cannot start exam
CQ.logoutStudent();
// Register a Mech student in Section E
document.getElementById('regRollNo').value = '26A91A0301';
document.getElementById('regStudentName').value = 'K. Ramesh';
document.getElementById('regYear').value = '4th Year';
document.getElementById('regBranch').value = 'MECH';
document.getElementById('regSection').value = 'Section E';
document.getElementById('regPassword').value = 'Avanthi@123';
CQ.registerStudent();

// Deploy exam targeting CSE only
CQ.selectAllYears(true);
CQ.selectAllBranches(false);
CQ.toggleTargetBranch('CSE');
CQ.selectAllSections(true);
CQ.saveScheduleAndDeploy();

// Attempt to start exam as Mech student
let alertCaptured = false;
const originalAlert = global.alert;
global.alert = (msg) => { alertCaptured = true; };
CQ.startExam();
global.alert = originalAlert;

assert(alertCaptured === true, "7.4 Ineligible cohort student correctly blocked from starting exam with alert");

// =========================================================================
// SUMMARY
// =========================================================================
console.log("\n===============================================================================");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("===============================================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("ALL AUTHENTICATION, PROFILE & COHORT TESTS PASSED WITH 100% SUCCESS!");
  process.exit(0);
}
