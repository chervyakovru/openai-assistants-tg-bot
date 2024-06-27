import fs from "node:fs";
import path from "node:path";

const dataFileName = path.resolve("./data.json");

function checkFileExist() {
  if (!fs.existsSync(dataFileName)) {
    fs.writeFileSync(dataFileName, "{}");
  }
}

class ThreadsManager {
  addTreadId(chatId, threadId) {
    checkFileExist();
    const data = fs.readFileSync(dataFileName, "utf8");
    const parsedData = JSON.parse(data);
    if (!parsedData.threads) {
      parsedData.threads = {};
    }
    parsedData.threads[chatId] = threadId;
    fs.writeFileSync(dataFileName, JSON.stringify(parsedData));
  }
  getThreadId(chatId) {
    checkFileExist();
    const data = fs.readFileSync(dataFileName, "utf8");
    const parsedData = JSON.parse(data);
    return parsedData.threads?.[chatId];
  }
}

export const threadsManager = new ThreadsManager();
