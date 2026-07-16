"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const approverStore_1 = require("../data/approverStore");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    const loans = (0, approverStore_1.readLoans)();
    const totalLoans = loans.length;
    const totalAmount = loans.reduce((sum, l) => sum + l.amount, 0);
    const latestLoans = loans.slice(-5).reverse();
    res.render("index", { title: "Lending Dashboard", totalLoans, totalAmount, latestLoans });
});
exports.default = router;
