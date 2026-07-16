"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const approverStore_1 = require("../data/approverStore");
const events_1 = require("../events");
const router = (0, express_1.Router)();
router.get("/:id", (req, res) => {
    const loans = (0, approverStore_1.readLoans)();
    const loan = loans.find(l => l.id === req.params.id);
    if (!loan) {
        res.status(404).send("Loan not found");
        return;
    }
    const approvers = (0, approverStore_1.readApprovers)();
    res.render("loan", { title: "Loan Detail", loan, approvers });
});
router.post("/:id", (req, res) => {
    var _a, _b, _c;
    const loans = (0, approverStore_1.readLoans)();
    const loan = loans.find(l => l.id === req.params.id);
    if (!loan) {
        res.status(404).send("Loan not found");
        return;
    }
    const { action, approver } = req.body;
    if (action === "assign-approver" && approver) {
        loan.approver = String(approver).trim();
        if (loan.status === "New")
            loan.status = "Pending";
        (0, approverStore_1.writeLoan)(loan);
        (0, events_1.notifyApp)(`${(_a = process.env.LOAN_WEBAPP_URL) !== null && _a !== void 0 ? _a : "https://localhost:3000"}/notify`);
    }
    else if (action === "approve") {
        loan.status = "Approved";
        (0, approverStore_1.writeLoan)(loan);
        (0, events_1.notifyApp)(`${(_b = process.env.LOAN_WEBAPP_URL) !== null && _b !== void 0 ? _b : "https://localhost:3000"}/notify`);
    }
    else if (action === "reject") {
        loan.status = "Rejected";
        (0, approverStore_1.writeLoan)(loan);
        (0, events_1.notifyApp)(`${(_c = process.env.LOAN_WEBAPP_URL) !== null && _c !== void 0 ? _c : "https://localhost:3000"}/notify`);
    }
    res.redirect(`/loan/${loan.id}`);
});
exports.default = router;
