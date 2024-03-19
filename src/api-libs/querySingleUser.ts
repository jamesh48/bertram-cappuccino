import { QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { dynamoClient } from './dynamoClient';

export const querySingleUser = async (coffeeDrinkerName: string) => {
  const queryCommandInput: QueryCommandInput = {
    TableName: 'bertram_cappuccino_members_table',
    KeyConditionExpression: '#coffeeDrinkerName = :coffeeDrinkerName',
    ExpressionAttributeNames: {
      '#coffeeDrinkerName': 'coffeeDrinkerName',
    },
    ExpressionAttributeValues: {
      ':coffeeDrinkerName': { S: coffeeDrinkerName },
    },
  };
  const queryCommand = new QueryCommand(queryCommandInput);
  const data = await dynamoClient.send(queryCommand);
  return data;
};
