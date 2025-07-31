export interface MessageDTO {
    id: string;
    role: string;
    content: string;
    createdAt: string;
    provider?: string;
    model?: string;
    reasonContent?: string;
    reasoning?: boolean;
}
