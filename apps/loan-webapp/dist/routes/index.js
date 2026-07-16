"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loanStore_1 = require("../data/loanStore");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    const loans = (0, loanStore_1.readLoans)();
    const totalLoans = loans.length;
    const totalAmount = loans.reduce((sum, l) => sum + l.amount, 0);
    const latestLoans = loans.slice(-5).reverse();
    res.render("index", { title: "App Dashboard", totalLoans, totalAmount, latestLoans });
});
exports.default = router;
