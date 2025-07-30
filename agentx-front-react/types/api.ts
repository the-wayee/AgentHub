export interface StreamResponse {
  content: string;       
  sessionId: string;     
  provider: string;      
  model: string;        
  done: boolean;        
}

export interface CreateSessionRequest {
  title: string;
  description?: string;
}

export interface SessionDTO {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  content: string;
  model?: string;
  tool?: string;
  knowledgeBase?: string;
}
