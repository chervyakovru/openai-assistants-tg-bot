import fs from "node:fs";
import path from "node:path";

class ThreadsManager {
  constructor(fileName) {
    this.fileName = fileName;
  }

  checkFileExist() {
    if (!fs.existsSync(this.fileName)) {
      fs.writeFileSync(this.fileName, "{}");
    }
  }

  addThreadId(chatId, threadId) {
    this.checkFileExist();
    const data = fs.readFileSync(this.fileName, "utf8");
    const parsedData = JSON.parse(data);
    if (!parsedData.threads) {
      parsedData.threads = {};
    }
    parsedData.threads[chatId] = threadId;
    fs.writeFileSync(this.fileName, JSON.stringify(parsedData));
  }
  getThreadId(chatId) {
    this.checkFileExist();
    const data = fs.readFileSync(this.fileName, "utf8");
    const parsedData = JSON.parse(data);
    return parsedData.threads?.[chatId];
  }
}

export const threadsManager = new ThreadsManager(path.resolve("./data.json"));
