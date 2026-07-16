"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const approverStore_1 = require("../data/approverStore");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    const approvers = (0, approverStore_1.readApprovers)();
    res.render("lendor", { title: "Lendor Management", approvers });
});
router.post("/", (req, res) => {
    const { approverName } = req.body;
    const approver = {
        id: (0, approverStore_1.generateApproverId)(),
        name: String(approverName).trim(),
        createdAt: new Date().toISOString(),
    };
    (0, approverStore_1.writeApprover)(approver);
    res.redirect("/lendor");
});
router.post("/:id/delete", (req, res) => {
    (0, approverStore_1.deleteApprover)(String(req.params.id));
    res.redirect("/lendor");
});
exports.default = router;
