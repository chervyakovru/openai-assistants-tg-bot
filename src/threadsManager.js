import fs from "node:fs";
import path from "node:path";

class ThreadsManager {
  constructor(fileName) {
    this.fileName = fileName;
  }
  checkFileExist() {
    if (!fs.existsSync(this.fileName)) {
      fs.writeFileSync(this.fileName, JSON.stringify({}));
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
  deleteThreadId(threadId) {
    this.checkFileExist();
    const data = fs.readFileSync(this.fileName, "utf8");
    const parsedData = JSON.parse(data);
    if (!parsedData.threads) {
      parsedData.threads = {};
    }
    const newData = {
      threads: Object.fromEntries(
        Object.entries(parsedData.threads).filter(
          ([, value]) => value !== threadId
        )
      ),
    };
    fs.writeFileSync(this.fileName, JSON.stringify(newData));
  }
}

export const threadsManager = new ThreadsManager(path.resolve("./data.json"));
