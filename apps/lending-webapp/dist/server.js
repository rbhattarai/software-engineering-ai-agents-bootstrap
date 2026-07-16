"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const index_1 = __importDefault(require("./routes/index"));
const lendor_1 = __importDefault(require("./routes/lendor"));
const loan_1 = __importDefault(require("./routes/loan"));
const events_1 = require("./events");
const app = (0, express_1.default)();
const PORT = 3001;
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.set("view engine", "ejs");
app.set("views", path_1.default.join(__dirname, "views"));
app.use("/index", index_1.default);
app.use("/lendor", lendor_1.default);
app.use("/loan", loan_1.default);
app.get("/events", (req, res) => (0, events_1.addClient)(res));
app.post("/notify", (req, res) => {
    (0, events_1.broadcast)("loan-updated");
    res.sendStatus(204);
});
app.get("/", (req, res) => {
    res.redirect("/index");
});
// Reuse loan-webapp certs (both apps live in the same repo)
const certsDir = path_1.default.join(__dirname, "..", "..", "loan-webapp", "src", "certs");
const options = {
    key: fs_1.default.readFileSync(path_1.default.join(certsDir, "server-key.pem")),
    cert: fs_1.default.readFileSync(path_1.default.join(certsDir, "server-cert.pem")),
    requestCert: true,
    rejectUnauthorized: false,
    ca: [
        fs_1.default.readFileSync(path_1.default.join(certsDir, "client-ca.pem"))
    ]
};
https_1.default.createServer(options, app).listen(PORT, () => {
    console.log(`HTTPS server running at https://localhost:${PORT}`);
});
