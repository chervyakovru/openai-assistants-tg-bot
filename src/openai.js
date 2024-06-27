import { default as OpenAIApi } from "openai";
import config from "config";
import { threadsManager } from "./threadsManager.js";

const Statuses = {
  Completed: "completed",
  Queued: "queued",
  InProgress: "in_progress",
};
const Roles = {
  ASSISTANT: "assistant",
  USER: "user",
  SYSTEM: "system",
};
class OpenAI {
  constructor(apiKey) {
    this.openai = new OpenAIApi({ apiKey });
  }

  async getOrCreateThreadId(chatId) {
    let threadId = threadsManager.getThreadId(chatId);
    if (!threadId) {
      const thread = await this.openai.beta.threads.create();
      threadId = thread.id;
      threadsManager.addTreadId(chatId, threadId);
    }
    return threadId;
  }
  deleteThread(threadId) {
    return this.openai.beta.threads.del(threadId);
  }
  createMessage(threadId, text) {
    return this.openai.beta.threads.messages.create(threadId, {
      role: Roles.USER,
      content: text,
    });
  }
  run(threadId) {
    return this.openai.beta.threads.runs.create(threadId, {
      assistant_id: config.get("ASSISTANT_AI"),
    });
  }
  async awaitRun(threadId, runId) {
    let status;
    while (
      status === undefined ||
      status === Statuses["Queued"] ||
      status === Statuses["InProgress"]
    ) {
      const run = await this.openai.beta.threads.runs.retrieve(threadId, runId);
      status = run.status;
      if (status === Statuses["Completed"]) {
        break;
      }
    }

    if (status !== Statuses["Completed"]) {
      throw new Error(`After waiting Run is done status is ", ${status}`);
    }
  }
  async getLastMessageText(threadId) {
    const allMessages = await this.openai.beta.threads.messages.list(threadId);
    const response = allMessages.data[0].content[0].text.value;
    return response;
  }
}

export const openai = new OpenAI(config.get("OPENAI_KEY"));
