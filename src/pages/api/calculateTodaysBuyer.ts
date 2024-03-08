import { dynamoClient, router } from '@/api-libs';
import {
  QueryCommand,
  QueryCommandInput,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

interface CoffeeDrinker {
  coffeeDrinkerName: string;
  lastBought: string;
  favoriteDrink: string;
  favoriteDrinkPrice: number;
  totalExpense: number;
}

const fetchTodaysCoffeeDrinkers = async (coffeeDrinkerNames: string[]) => {
  // Second Query
  const secondQueries = coffeeDrinkerNames.map((coffeeDrinkerName: string) => {
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
    return dynamoClient.send(queryCommand);
  });

  const todaysCoffeeDrinkers = (await Promise.all(secondQueries)).reduce<
    CoffeeDrinker[]
  >((total, output) => {
    if (output.Items?.length) {
      total.push(unmarshall(output.Items[0]) as CoffeeDrinker);
    }
    return total;
  }, []);

  return todaysCoffeeDrinkers;
};

const calculateDifferentialDate = (numberOfCoffeeDrinkers: number) => {
  let today = new Date();

  let pastDate = new Date(today);
  pastDate.setDate(today.getDate() - numberOfCoffeeDrinkers);

  let pastDateString = pastDate.toISOString().split('T')[0];
  let todaysDate = today.toISOString().split('T')[0];
  console.log("Today's date:", todaysDate);
  console.log('Date ', numberOfCoffeeDrinkers, ' days ago:', pastDateString);
  return [pastDateString, todaysDate];
};

const calculateTodaysTotalExpense = (coffeeDrinkers: CoffeeDrinker[]) => {
  return coffeeDrinkers.reduce((total, item) => {
    total = total + Number(item.favoriteDrinkPrice);
    return total;
  }, 0);
};

const incrementTodaysBuyer = async (
  todaysBuyer: string,
  newExpense: number
) => {
  const lastBought = new Date().toISOString().split('T')[0];
  const updateItemCommand = new UpdateItemCommand({
    TableName: 'bertram_cappuccino_members_table',
    Key: { coffeeDrinkerName: { S: todaysBuyer } },
    UpdateExpression:
      'SET totalExpense = totalExpense + :newExpense, lastBought = :lastBought',
    ExpressionAttributeValues: {
      ':newExpense': { N: String(newExpense) },
      ':lastBought': { S: lastBought },
    },
  });

  await dynamoClient.send(updateItemCommand);
  return 'ok';
};

const fromMultipleChooseUnique = (
  queriedCoffeeDrinkers: Pick<
    CoffeeDrinker,
    'totalExpense' | 'coffeeDrinkerName' | 'lastBought'
  >[]
) => {
  if (queriedCoffeeDrinkers.length === 1) {
    return queriedCoffeeDrinkers[0].coffeeDrinkerName;
  }
  // Choose the person with the least expense, start from 0
  let max = Number(queriedCoffeeDrinkers[0].totalExpense);
  let chosenOne = queriedCoffeeDrinkers[0].coffeeDrinkerName;
  for (let i = 1; i < queriedCoffeeDrinkers.length; i++) {
    const currentExpense = Number(queriedCoffeeDrinkers[i].totalExpense);

    if (currentExpense < max) {
      chosenOne = queriedCoffeeDrinkers[i].coffeeDrinkerName;
      max = currentExpense;
    }
  }
  console.log('CHOSEN ONE: ', chosenOne);
  return chosenOne;
};

const calculateTodaysBuyer = router
  .clone()
  .post(async (req, res) => {
    const coffeeDrinkerNames = req.body.coffeeDrinkers;
    const [startDate, endDate] = calculateDifferentialDate(
      coffeeDrinkerNames.length
    );

    // First Query for Coffee Drinkers not found in last n days, but found today, n = number of todays coffee drinkers
    const firstQueries = coffeeDrinkerNames.map((coffeeDrinkerName: string) => {
      const queryCommandInput: QueryCommandInput = {
        TableName: 'bertram_cappuccino_members_table',
        KeyConditionExpression: '#coffeeDrinkerName = :coffeeDrinkerName',
        FilterExpression: 'NOT (#lastBought BETWEEN :startDate AND :endDate)',
        ExpressionAttributeNames: {
          '#coffeeDrinkerName': 'coffeeDrinkerName',
          '#lastBought': 'lastBought',
        },
        ExpressionAttributeValues: {
          ':coffeeDrinkerName': { S: coffeeDrinkerName },
          ':startDate': { S: startDate },
          ':endDate': { S: endDate },
        },
      };
      const queryCommand = new QueryCommand(queryCommandInput);
      return dynamoClient.send(queryCommand);
    });

    const queriedCoffeeDrinkers = (await Promise.all(firstQueries)).reduce<
      Pick<CoffeeDrinker, 'totalExpense' | 'coffeeDrinkerName' | 'lastBought'>[]
    >((total, output) => {
      if (output.Count && output.Items?.length) {
        total.push({
          coffeeDrinkerName: output.Items[0]!.coffeeDrinkerName.S!,
          totalExpense: output.Items[0]!.totalExpense.N!,
          lastBought: output.Items[0]!.lastBought.S!,
        });
      }
      return total;
    }, []);

    console.log(queriedCoffeeDrinkers.map((x) => x.coffeeDrinkerName));
    if (queriedCoffeeDrinkers.length) {
      // Determine who is paying from the group.
      const todaysBuyer = fromMultipleChooseUnique(queriedCoffeeDrinkers);
      // Fetch Todays Cofee Drinkers
      const todaysCoffeeDrinkers = await fetchTodaysCoffeeDrinkers(
        coffeeDrinkerNames
      );
      // Determine the total expense of their drinks
      const todaysTotalExpense =
        calculateTodaysTotalExpense(todaysCoffeeDrinkers);
      // DB Call- Update Todays Payer with todaysTotalExpense
      await incrementTodaysBuyer(todaysBuyer, todaysTotalExpense);
      return res.send(queriedCoffeeDrinkers);
    }

    const todaysCoffeeDrinkers = await fetchTodaysCoffeeDrinkers(
      coffeeDrinkerNames
    );
    // Determine who is paying from the Group
    const todaysBuyer = fromMultipleChooseUnique(todaysCoffeeDrinkers);
    // Determine the total expense of everyones drink
    const todaysTotalExpense =
      calculateTodaysTotalExpense(todaysCoffeeDrinkers);
    // DB Call - Update Todays Payer with todaysTotalExpense
    await incrementTodaysBuyer(todaysBuyer, todaysTotalExpense);
    return res.send(todaysCoffeeDrinkers);
  })
  .handler();

export default calculateTodaysBuyer;
