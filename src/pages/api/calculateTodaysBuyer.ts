import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { dynamoClient, router, querySingleUser } from '@/api-libs';

interface CoffeeDrinker {
  coffeeDrinkerName: string;
  lastBought: string;
  favoriteDrink: string;
  favoriteDrinkPrice: number;
  totalExpense: number;
}

const fetchTodaysCoffeeDrinkers = async (coffeeDrinkerNames: string[]) => {
  const queries = coffeeDrinkerNames.map((coffeeDrinkerName: string) =>
    querySingleUser(coffeeDrinkerName)
  );

  const todaysCoffeeDrinkers = (await Promise.all(queries)).reduce<
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
  return pastDateString;
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

export const filterForPeopleWhoShouldPay = (
  todaysCoffeeDrinkers: CoffeeDrinker[],
  startDateString: string
) => {
  return todaysCoffeeDrinkers.filter((coffeeDrinker) => {
    const lastBought = new Date(coffeeDrinker.lastBought);
    const startDate = new Date(startDateString);
    if (lastBought < startDate) {
      return coffeeDrinker;
    }
    return false;
  });
};

export const fromMultipleChooseBuyer = (
  queriedCoffeeDrinkers: Pick<
    CoffeeDrinker,
    'totalExpense' | 'coffeeDrinkerName' | 'lastBought'
  >[]
) => {
  if (queriedCoffeeDrinkers.length === 1) {
    return queriedCoffeeDrinkers[0].coffeeDrinkerName;
  }
  // Choose the person with the least expense, start from index 0
  let max = Number(queriedCoffeeDrinkers[0].totalExpense);
  let chosenOne = queriedCoffeeDrinkers[0].coffeeDrinkerName;

  for (let i = 1; i < queriedCoffeeDrinkers.length; i++) {
    const currentExpense = Number(queriedCoffeeDrinkers[i].totalExpense);
    if (currentExpense < max) {
      chosenOne = queriedCoffeeDrinkers[i].coffeeDrinkerName;
      max = currentExpense;
      // If there are multiple coffee Drinkers with the same expense, randomly pick one
      // Intermediary matches won't matter because it will still find the lowest total expense
    } else if (currentExpense === max) {
      const randomNumber = Math.random();
      if (randomNumber < 0.5) {
        chosenOne = queriedCoffeeDrinkers[i].coffeeDrinkerName;
      }
    }
  }
  return chosenOne;
};

const calculateTodaysBuyer = router
  .clone()
  .post(async (req, res) => {
    const coffeeDrinkerNames = req.body.coffeeDrinkers;
    const startDateString = calculateDifferentialDate(
      coffeeDrinkerNames.length
    );

    const todaysCoffeeDrinkers = await fetchTodaysCoffeeDrinkers(
      coffeeDrinkerNames
    );

    // First Query for Coffee Drinkers not found in last n days, but found today, n = number of todays coffee drinkers
    const peopleWhoShouldPay = filterForPeopleWhoShouldPay(
      todaysCoffeeDrinkers,
      startDateString
    );

    console.log(
      peopleWhoShouldPay.map((personToPay) => personToPay.coffeeDrinkerName)
    );

    // Determine Buyer
    if (peopleWhoShouldPay.length) {
      // Determine who is paying from the group.
      const todaysBuyer = fromMultipleChooseBuyer(peopleWhoShouldPay);
      // Determine the total expense of their drinks
      const todaysTotalExpense =
        calculateTodaysTotalExpense(todaysCoffeeDrinkers);
      // DB Call- Update Todays Payer with todaysTotalExpense
      await incrementTodaysBuyer(todaysBuyer, todaysTotalExpense);
      return res.send({
        result: {
          todaysBuyer,
          todaysTotalExpense,
        },
      });
    } else {
      // Determine who is paying from the Group
      const todaysBuyer = fromMultipleChooseBuyer(todaysCoffeeDrinkers);
      // Determine the total expense of everyones drink
      const todaysTotalExpense =
        calculateTodaysTotalExpense(todaysCoffeeDrinkers);
      // DB Call - Update Todays Payer with todaysTotalExpense
      await incrementTodaysBuyer(todaysBuyer, todaysTotalExpense);
      return res.send({
        result: {
          todaysBuyer,
          todaysTotalExpense,
        },
      });
    }
  })
  .handler();

export default calculateTodaysBuyer;
