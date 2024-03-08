import { dynamoClient, router } from '@/api-libs';
import { ScanCommand, ScanCommandInput } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const fetchCoffeeDrinkers = router
  .clone()
  .get(async (_req, res) => {
    const scanCommandInput: ScanCommandInput = {
      TableName: 'bertram_cappuccino_members_table',
    };
    const scanCommand = new ScanCommand(scanCommandInput);
    const data = await dynamoClient.send(scanCommand);

    return res.send(data.Items?.map((item) => unmarshall(item)));
  })
  .handler();

export default fetchCoffeeDrinkers;
