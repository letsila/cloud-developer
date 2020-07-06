import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  const s3 = new AWS.S3({
    signatureVersion: 'v4' // Use Sigv4 algorithm
  })
  const presignedUrl = s3.getSignedUrl('putObject', { // The URL will allow to perform the PUT operation
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl: presignedUrl
    })
  }
}
