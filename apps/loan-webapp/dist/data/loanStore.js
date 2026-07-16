"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readLoans = readLoans;
exports.writeLoan = writeLoan;
exports.deleteLoan = deleteLoan;
exports.generateLoanId = generateLoanId;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_FILE = path_1.default.join(__dirname, "../../../data/loans.json");
function readLoans() {
    if (!fs_1.default.existsSync(DATA_FILE))
        return [];
    const raw = fs_1.default.readFileSync(DATA_FILE, "utf-8").trim();
    const loans = raw ? JSON.parse(raw) : [];
    return loans.map(loan => {
        var _a, _b;
        return (Object.assign(Object.assign({}, loan), { status: (_a = loan.status) !== null && _a !== void 0 ? _a : "New", approver: (_b = loan.approver) !== null && _b !== void 0 ? _b : "" }));
    });
}
function writeLoan(loan) {
    const loans = readLoans();
    loans.push(loan);
    fs_1.default.writeFileSync(DATA_FILE, JSON.stringify(loans, null, 2));
}
function deleteLoan(id) {
    const loans = readLoans();
    fs_1.default.writeFileSync(DATA_FILE, JSON.stringify(loans.filter(l => l.id !== id), null, 2));
}
function generateLoanId() {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `LOAN-${datePart}-${randPart}`;
}
