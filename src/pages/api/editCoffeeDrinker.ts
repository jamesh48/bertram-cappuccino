import {
  UpdateItemCommand,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { dynamoClient, router } from '../../api-libs';

const editCoffeeDrinker = router
  .clone()
  .put(async (req, res) => {
    const coffeeDrinkerName = req.body.coffeeDrinkerName;
    const favoriteDrink = req.body.favoriteDrink;
    const favoriteDrinkPrice = req.body.favoriteDrinkPrice;
    const onVacationUntil = req.body.onVacationUntil;

    const updateItemCommandInput: UpdateItemCommandInput = (() => {
      if (onVacationUntil) {
        return {
          TableName: 'bertram_cappuccino_members_table',
          Key: {
            coffeeDrinkerName: { S: coffeeDrinkerName },
          },
          UpdateExpression:
            'SET favoriteDrink = :drink, favoriteDrinkPrice = :price, lastBought = :last',
          ExpressionAttributeValues: {
            ':drink': { S: favoriteDrink },
            ':price': { S: favoriteDrinkPrice },
            ':last': { S: onVacationUntil },
          },
        } as UpdateItemCommandInput;
      } else {
        return {
          TableName: 'bertram_cappuccino_members_table',
          Key: {
            coffeeDrinkerName: { S: coffeeDrinkerName },
          },
          UpdateExpression:
            'SET favoriteDrink = :drink, favoriteDrinkPrice = :price',
          ExpressionAttributeValues: {
            ':drink': { S: favoriteDrink },
            ':price': { S: favoriteDrinkPrice },
          },
        } as UpdateItemCommandInput;
      }
    })();

    const updateItemCommand = new UpdateItemCommand(updateItemCommandInput);
    await dynamoClient.send(updateItemCommand);
    return res.send({ message: 'ok' });
  })
  .handler();

export default editCoffeeDrinker;
