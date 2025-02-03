import type { Document } from '@langchain/core/documents';

export enum MessageRole {
  user = 'userMessage',
  system = 'apiMessage',
}

export type Message = {
  type: MessageRole;
  message: string;
  isStreaming?: boolean;
  sourceDocs?: Document[];
};
