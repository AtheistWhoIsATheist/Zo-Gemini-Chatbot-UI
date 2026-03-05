export interface KnowledgeDocument {
    id: string;
    title: string;
    content: string;
    uploadDate: number;
    tags?: string[];
    embedding?: number[];
}
