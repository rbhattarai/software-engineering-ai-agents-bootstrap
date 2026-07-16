"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loanStore_1 = require("../data/loanStore");
const events_1 = require("../events");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    const loans = (0, loanStore_1.readLoans)();
    res.render("loan", { title: "Loan Management", loans });
});
router.post("/", (req, res) => {
    var _a;
    const { applicantName, amount } = req.body;
    const loan = {
        id: (0, loanStore_1.generateLoanId)(),
        applicantName: String(applicantName).trim(),
        amount: Number(amount),
        status: "New",
        approver: "",
        createdAt: new Date().toISOString(),
    };
    (0, loanStore_1.writeLoan)(loan);
    (0, events_1.notifyApp)(`${(_a = process.env.LENDING_WEBAPP_URL) !== null && _a !== void 0 ? _a : "https://localhost:3001"}/notify`);
    res.redirect("/loan");
});
router.post("/:id/delete", (req, res) => {
    var _a;
    (0, loanStore_1.deleteLoan)(String(req.params.id));
    (0, events_1.notifyApp)(`${(_a = process.env.LENDING_WEBAPP_URL) !== null && _a !== void 0 ? _a : "https://localhost:3001"}/notify`);
    res.redirect("/loan");
});
router.get("/api/loans", (req, res) => {
    res.json({ loans: (0, loanStore_1.readLoans)() });
});
exports.default = router;
