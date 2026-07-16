"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    res.render("cms", { title: "CMS Management" });
});
router.get("/api/cms", (req, res) => {
    res.json({
        content: ["CMS Loand 1", "CMS Loan 2", "CMS Loan 3"]
    });
});
exports.default = router;
