import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly userIndexName = process.env.USER_INDEX_NAME,
    private readonly bucketName = process.env.IMAGES_S3_BUCKET,
    ) {
  }

  async updateTodo(todoId: string, updatedTodo: TodoUpdate): Promise<void> {
    var params = {
      TableName: this.todosTable,
      Key:{
          "todoId": todoId
      },
      UpdateExpression: "set todoName = :n, dueDate=:D, done=:d",
      ExpressionAttributeValues:{
          ":n": updatedTodo.name,
          ":D": updatedTodo.dueDate,
          ":d": updatedTodo.done
      }
    };
  
    await this.docClient.update(params).promise()
  }

  async deleteTodo(todoId: string): Promise<void>{
    var params = {
      TableName: this.todosTable,
      Key:{
          "todoId": todoId
      }
    }
  
    await this.docClient.delete(params).promise()
  }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    console.log('Getting all groups')

    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.userIndexName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()
  
    const items = result.Items.map(item => {
      return {
        ...item,
        name: item.todoName,
        attachmentUrl: `https://${this.bucketName}.s3.amazonaws.com/${item.todoId}`
      }
    })

    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    return todo
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}