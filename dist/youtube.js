"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comment = exports.search = void 0;
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var googleapis_1 = require("googleapis");
var moment_1 = __importDefault(require("moment"));
// https://developers.google.com/youtube/v3/docs/search/list
var search = function (auth, query) {
    return new Promise(function (resolve, reject) {
        var service = googleapis_1.google.youtube('v3');
        service.search.list({
            auth: auth,
            part: ['id', 'snippet'],
            type: ['video'],
            order: 'viewCount',
            publishedAfter: moment_1.default().add(-4, 'hours').format(),
            q: query,
            regionCode: 'US',
            maxResults: 20,
        }, function (error, response) {
            if (error) {
                reject(error);
                return;
            }
            resolve(response);
        });
    });
};
exports.search = search;
var comment = function (auth, videoId) {
    return new Promise(function (resolve, reject) {
        console.info('id:', videoId);
        var service = googleapis_1.google.youtube('v3');
        var text = fs_1.default.readFileSync(path_1.default.join(__dirname, '../comment.txt'), 'utf8');
        service.commentThreads.insert({
            auth: auth,
            part: ['id', 'snippet', 'replies'],
            requestBody: {
                snippet: {
                    videoId: videoId,
                    topLevelComment: {
                        snippet: {
                            textOriginal: text,
                        }
                    }
                },
            }
        }, function (error, response) {
            if (error) {
                reject(error);
                return;
            }
            console.info('Done');
            resolve(response);
        });
    });
};
exports.comment = comment;
