import { PutItemCommand, PutItemCommandInput } from '@aws-sdk/client-dynamodb';
import { dynamoClient, router } from '../../api-libs';

const newCoffeeDrinker = router
  .clone()
  .post(async (req, res) => {
    const coffeeDrinkerName = req.body.coffeeDrinkerName;
    const favoriteDrink = req.body.favoriteDrink;
    const favoriteDrinkPrice = req.body.favoriteDrinkPrice;
    const lastBought = new Date().toISOString().split('T')[0];
    const totalExpense = 0;

    const putItemCommandInput: PutItemCommandInput = {
      TableName: 'bertram_cappuccino_members_table',
      Item: {
        coffeeDrinkerName: { S: coffeeDrinkerName },
        favoriteDrink: { S: favoriteDrink },
        favoriteDrinkPrice: { S: favoriteDrinkPrice },
        lastBought: { S: lastBought },
        totalExpense: { N: String(totalExpense) },
      },
    };
    const putItemCommand = new PutItemCommand(putItemCommandInput);
    await dynamoClient.send(putItemCommand);
    return res.send({ message: 'ok' });
  })
  .handler();

export default newCoffeeDrinker;
