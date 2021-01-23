"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var readline_1 = __importDefault(require("readline"));
var googleapis_1 = require("googleapis");
var OAuth2 = googleapis_1.google.auth.OAuth2;
var SCOPES = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.force-ssl',
];
var TOKEN_DIR = path_1.default.join(__dirname, '../');
var TOKEN_PATH = TOKEN_DIR + 'token.json';
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
var authorize = function (credentials) {
    return new Promise(function (resolve, reject) {
        var clientSecret = credentials.installed.client_secret;
        var clientId = credentials.installed.client_id;
        var redirectUrl = credentials.installed.redirect_uris[0];
        var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
        // Check if we have previously stored a token.
        fs_1.default.readFile(TOKEN_PATH, 'utf-8', function (error, token) {
            if (error) {
                getNewToken(oauth2Client).then(function (auth) {
                    resolve(auth);
                }).catch(reject);
            }
            else {
                oauth2Client.credentials = JSON.parse(token);
                resolve(oauth2Client);
            }
        });
    });
};
exports.authorize = authorize;
/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
var getNewToken = function (oauth2Client) {
    return new Promise(function (resolve, reject) {
        var authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        console.log('Authorize this app by visiting this url: ', authUrl);
        var rl = readline_1.default.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Enter the code from that page here: ', function (code) {
            rl.close();
            oauth2Client.getToken(code, function (error, token) {
                if (error) {
                    reject(error);
                    return;
                }
                oauth2Client.credentials = token;
                storeToken(token);
                resolve(oauth2Client);
            });
        });
    });
};
/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
var storeToken = function (token) {
    try {
        fs_1.default.mkdirSync(TOKEN_DIR);
    }
    catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs_1.default.writeFile(TOKEN_PATH, JSON.stringify(token), function (err) {
        if (err)
            throw err;
        console.log('Token stored to ' + TOKEN_PATH);
    });
};
