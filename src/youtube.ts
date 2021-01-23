import path from 'path';
import fs from 'fs';
import { google } from 'googleapis';
import moment from 'moment';

// https://developers.google.com/youtube/v3/docs/search/list
export const search = (auth: any, query: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const service = google.youtube('v3');

    service.search.list({
      auth: auth,
      part: ['id', 'snippet'],
      type: ['video'],
      order: 'viewCount',
      publishedAfter: moment().add(-4, 'hours').format(),
      q: query,
      regionCode: 'US',
      maxResults: 20,
    }, function(error: any, response: unknown) {
      if (error) {
        reject(error);
        return;
      }
      resolve(response);
    });
  })
}

export const comment = (auth: any, videoId: string) => {
  return new Promise((resolve, reject) => {
    console.info('id:', videoId);
    
    const service = google.youtube('v3');
    const text = fs.readFileSync(path.join(__dirname, '../comment.txt'), 'utf8');

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
    }, function(error: any, response: unknown) {
      if (error) {
        reject(error);
        return;
      }
      console.info('Done');
      resolve(response);
    });
  });
}