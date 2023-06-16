import { Document } from './document';
import { Conversation } from './chat';
import { Task } from './task';

export interface Course {
    name: string,
    description: string,
    professor: string,
    professorEmail: string,
    Conversations: Conversation[],
    Tasks: Task[],
    Documents: Document[],
}