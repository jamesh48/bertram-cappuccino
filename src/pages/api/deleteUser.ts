import {
  DeleteItemCommand,
  DeleteItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { router, dynamoClient } from '../../api-libs';

const deleteUser = router
  .clone()
  .delete(async (req, res) => {
    const coffeeDrinkerName = req.query.coffeeDrinkerName as string;
    const deleteItemCommandInput: DeleteItemCommandInput = {
      TableName: 'bertram_cappuccino_members_table',
      Key: { coffeeDrinkerName: { S: coffeeDrinkerName } },
    };

    const deleteItemCommand = new DeleteItemCommand(deleteItemCommandInput);
    await dynamoClient.send(deleteItemCommand);
    return res.status(200).send({ status: 'ok!' });
  })
  .handler();

export default deleteUser;
