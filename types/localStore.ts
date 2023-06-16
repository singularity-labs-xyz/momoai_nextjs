import { Conversation } from "./chat";
import { Course } from "./course";

export interface LocalStore {
    chat: Conversation[]
    courses: Course[],
}