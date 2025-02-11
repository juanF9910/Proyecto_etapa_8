"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reqHandler = void 0;
var node_1 = require("@angular/ssr/node");
var express_1 = require("express");
var node_path_1 = require("node:path");
var node_url_1 = require("node:url");
var serverDistFolder = (0, node_path_1.dirname)((0, node_url_1.fileURLToPath)(import.meta.url));
var browserDistFolder = (0, node_path_1.resolve)(serverDistFolder, '../browser');
// Import CORS
var cors = require('cors');
var app = (0, express_1.default)();
var angularApp = new node_1.AngularNodeAppEngine();
// Enable CORS for requests from http://localhost:39893
app.use(cors({
    origin: 'http://localhost:39893', // Allow requests from this origin
}));
/**
 * Serve static files from /browser
 */
app.use(express_1.default.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
}));
/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', function (req, res, next) {
    angularApp
        .handle(req)
        .then(function (response) {
        return response ? (0, node_1.writeResponseToNodeResponse)(response, res) : next();
    })
        .catch(next);
});
/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if ((0, node_1.isMainModule)(import.meta.url)) {
    var port_1 = process.env['PORT'] || 4000;
    app.listen(port_1, function () {
        console.log("Node Express server listening on http://localhost:".concat(port_1));
    });
}
/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
exports.reqHandler = (0, node_1.createNodeRequestHandler)(app);
