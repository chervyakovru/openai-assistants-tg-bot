import { default as OpenAIApi } from "openai";
import config from "config";
import { threadsManager } from "./threadsManager.js";

class OpenAI {
  static statuses = {
    COMPLETED: "completed",
    QUEUED: "queued",
    IN_PROGRESS: "in_progress",
  };

  static roles = {
    ASSISTANT: "assistant",
    USER: "user",
    SYSTEM: "system",
  };

  constructor(apiKey, assistantId) {
    this.openai = new OpenAIApi({ apiKey });
    this.assistantId = assistantId;
  }

  async getOrCreateThreadId(chatId) {
    let threadId = threadsManager.getThreadId(chatId);
    if (!threadId) {
      const thread = await this.openai.beta.threads.create();
      threadId = thread.id;
      threadsManager.addThreadId(chatId, threadId);
    }
    return threadId;
  }
  deleteThread(threadId) {
    return this.openai.beta.threads.del(threadId);
  }
  createMessage(threadId, text) {
    return this.openai.beta.threads.messages.create(threadId, {
      role: OpenAI.roles.USER,
      content: text,
    });
  }
  createRun(threadId) {
    return this.openai.beta.threads.runs.create(threadId, {
      assistant_id: this.assistantId,
    });
  }
  async awaitRun(threadId, runId) {
    let status;
    while (
      status === undefined ||
      status === OpenAI.statuses.QUEUED ||
      status === OpenAI.statuses.IN_PROGRESS
    ) {
      const run = await this.openai.beta.threads.runs.retrieve(threadId, runId);
      status = run.status;
      if (status === OpenAI.statuses.COMPLETED) {
        break;
      }
    }

    if (status !== OpenAI.statuses.COMPLETED) {
      throw new Error(`After waiting Run is done status is ${status}`);
    }
  }
  async getLastMessageText(threadId) {
    const allMessages = await this.openai.beta.threads.messages.list(threadId);
    const response = allMessages.data[0].content[0].text.value;
    return response;
  }
}

export const openai = new OpenAI(
  config.get("OPENAI_KEY"),
  config.get("ASSISTANT_AI")
);
