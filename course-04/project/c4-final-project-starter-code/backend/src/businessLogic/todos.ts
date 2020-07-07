import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'

const todosAccess = new TodosAccess()

export async function updateTodo(
  updatedTodoRequest: UpdateTodoRequest,
  todoId: string
): Promise<void> {
  return todosAccess.updateTodo(todoId, updatedTodoRequest)
}

export async function deleteTodo(todoId: string): Promise<void> {
  return todosAccess.deleteTodo(todoId)
}

export async function getAllTodos(jwtToken: string): Promise<TodoItem[]> {
  const userId = parseUserId(jwtToken)
  return todosAccess.getAllTodos(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {

  const todoId = uuid.v4()
  const userId = parseUserId(jwtToken)
  const createdAt = Date.now()

  return await todosAccess.createTodo({
    todoId,
    userId,
    createdAt,
    done: false,
    todoName: createTodoRequest.name,
    ...createTodoRequest
  })
}
