"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addClient = addClient;
exports.broadcast = broadcast;
exports.notifyApp = notifyApp;
const https_1 = __importDefault(require("https"));
const clients = new Set();
function addClient(res) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    clients.add(res);
    res.on("close", () => clients.delete(res));
}
function broadcast(event) {
    const payload = `event: ${event}\ndata: {}\n\n`;
    clients.forEach(res => res.write(payload));
}
function notifyApp(targetUrl) {
    try {
        const url = new URL(targetUrl);
        const req = https_1.default.request({
            hostname: url.hostname,
            port: Number(url.port),
            path: url.pathname,
            method: "POST",
            rejectUnauthorized: false,
        });
        req.on("error", () => { });
        req.end();
    }
    catch (_a) {
        // fire-and-forget
    }
}
