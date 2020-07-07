export interface TodoItem {
  userId: string
  todoId: string
  createdAt: number
  todoName: string
  name: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
