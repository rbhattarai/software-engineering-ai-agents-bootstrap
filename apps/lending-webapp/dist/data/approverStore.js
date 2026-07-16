"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readApprovers = readApprovers;
exports.writeApprover = writeApprover;
exports.readLoans = readLoans;
exports.writeLoan = writeLoan;
exports.deleteApprover = deleteApprover;
exports.generateApproverId = generateApproverId;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_DIR = path_1.default.join(__dirname, "../../../data");
const APPROVERS_FILE = path_1.default.join(DATA_DIR, "loan-approvers.json");
const LOANS_FILE = path_1.default.join(DATA_DIR, "loans.json");
function readApprovers() {
    if (!fs_1.default.existsSync(APPROVERS_FILE))
        return [];
    const raw = fs_1.default.readFileSync(APPROVERS_FILE, "utf-8").trim();
    return raw ? JSON.parse(raw) : [];
}
function writeApprover(approver) {
    const approvers = readApprovers();
    approvers.push(approver);
    fs_1.default.writeFileSync(APPROVERS_FILE, JSON.stringify(approvers, null, 2));
}
function readLoans() {
    if (!fs_1.default.existsSync(LOANS_FILE))
        return [];
    const raw = fs_1.default.readFileSync(LOANS_FILE, "utf-8").trim();
    const loans = raw ? JSON.parse(raw) : [];
    return loans.map(loan => {
        var _a, _b;
        return (Object.assign(Object.assign({}, loan), { status: (_a = loan.status) !== null && _a !== void 0 ? _a : "New", approver: (_b = loan.approver) !== null && _b !== void 0 ? _b : "" }));
    });
}
function writeLoan(updated) {
    const loans = readLoans();
    const idx = loans.findIndex(l => l.id === updated.id);
    if (idx === -1)
        return;
    loans[idx] = updated;
    fs_1.default.writeFileSync(LOANS_FILE, JSON.stringify(loans, null, 2));
}
function deleteApprover(id) {
    const approvers = readApprovers();
    fs_1.default.writeFileSync(APPROVERS_FILE, JSON.stringify(approvers.filter(a => a.id !== id), null, 2));
}
function generateApproverId() {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `APPR-${datePart}-${randPart}`;
}
