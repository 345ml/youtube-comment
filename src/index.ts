import path from 'path';
import fs from 'fs';
import { authorize } from './auth';
import { search, comment } from './youtube';

const query = process.argv[2];

const sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));

const readFile = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, '../client_secret_946795683361-71vp2u3eo9b34vm7fq2s18h6t67am5il.apps.googleusercontent.com.json'), 'utf8', function processClientSecrets(error, content) {
      if (error) {
        reject(error);
        return;
      }

      resolve(content);
    });
  })
}

const main = async () => {
  try {
    const data = await readFile();
    const oauth2Client = await authorize(JSON.parse(data));    
    const videos = await search(oauth2Client, query);
    const videoIds = videos.data.items.map((v: any) => v.id.videoId);
    console.info(videoIds);
    
    for (let index = 0; index < videoIds.length; index++) {
      await comment(oauth2Client, videoIds[index]);
      await sleep(1000);
    }
  } catch (error) {
    console.error(error);
  }
};

main();