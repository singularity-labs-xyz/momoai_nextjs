import { Subtask } from "./subtask";

export interface Task {
    name: string,
    description: string,
    date: Date,
    completed: boolean,
    subtasks: Subtask[],
}