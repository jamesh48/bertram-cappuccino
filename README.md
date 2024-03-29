# Bertram Cappuccino

## Tech Stack

The frontend and server-side of this project is facilitated by [Next.js](https://nextjs.org/), which is a react framework that simplifies and abstracts complex operations like server side rendering, build optimization, and app routing. The project is written 100% in [Typescript](https://www.typescriptlang.org/). There are no environment variables associated with the service.

This project uses the [AWS Cloud](https://aws.amazon.com/) for hosting and infrastructure. [bertramcappuccino.com](bertramcappuccino.com) is registered as a domain with AWS Route53, and this domain is setup to point to an application load balancer (ALB) that in turn forwards traffic to an ECS Service and Container where the production server is running and frontend code is hosted as an static asset. This project uses [DynamoDB](https://aws.amazon.com/dynamodb) as a database where information like the `coffeeDrinkerName`, `favoriteDrink`, `favoriteDrinkPrice`, `totalExpense`, and `lastBought` data points are stored. The Infrastructure as Code (IAC) [CDK](https://aws.amazon.com/cdk/) templates can found in the iac folder in the root of this project.

There are four environment variables needed for deployment, which is proprietary to my personal AWS Cloud setup:

- `AWS_ALB_LISTENER_ARN`
- `AWS_CLUSTER_ARN`
- `AWS_DEFAULT_SG`
- `AWS_VPC_ID`

I also setup a deployment [CI/CD Pipeline](https://www.synopsys.com/glossary/what-is-cicd.html) using [Github Actions](https://github.com/features/actions), it completes automated unit testing using [jest](https://jestjs.io/) before deploying any updates to the AWS Service.

## Running the Program Locally

It is possible to run the program locally, however the backend integrations won't work on someone elses local computer unless they either have my AWS account credentials stored locally (I won't give them), or if they have their own AWS Account configured and deploy the needed infrastructure, most notably the database first. Since I took the effort to deploy and host the project myself, I'd recommend just validating with the deployed [Bertram Cappuccino](https://bertramcappuccino.com) website directly. In a real world, client-based scenario, I would hope that the client would either already have a Cloud Provider account like AWS with [Identity Access Management (IAM)](https://aws.amazon.com/iam), policy in place for allowing multiple users to access their cloud account securely or that I would take the time to set that up for them. But this undertaking would most definitely be outside of the scope of this take home challenge.

However if you did still want to run the code locally you would use the CLI/Terminal from within the root of this project to install the required packages using [npm](https://www.npmjs.com/).

```bash
npm install
```

And then run the development server:

```bash
npm run dev
```

At this point you would expect to see the code running locally at http://localhost:3000

## Algorithm Logic and Assumptions

I thought carefully about what should be considered as 'fair', in the context of who should be responsible for paying for coffee on a given day.

The way of choosing the current days coffee drink buyer is done by two consecutive methods.

1. First, the program evaluates who should buy coffee today based on who has not bought coffee recently. Recently in this case, is defined by anyone who has not bought coffee within the last 'n' days, with 'n' equating to the number of coffee drinkers found today. To simplify the explanation, given 5 days in a workweek with 5 workers exchanging days to buy coffee for their coworkers, no one worker should buy coffee twice in the workweek. If after 5 days of each of 5 workers paying once each for coffee, if a sixth worker appeared for the coffee outing, the program would find them responsible to pay because within the last 6 days (including today), that sixth worker has not paid for coffee once, so out of fairness it is their turn regardless of the total expense of any of the other workers. The algorithm however is nuanced such that on any given day, any number of workers could show up, and this rule of fairness would apply - preferring those who have not bought recently, and excluding those who have.

- If the algorithm finds that multiple workers should be responsible to pay for todays coffee based on not having paid recently, it will then pick the worker from that group with the lowest total expense to pay.

2. Secondly, if the algorithm finds NO workers responsible to pay for todays coffee based on not having paid recently, it will pick from todays coffee drinkers the one with the lowest total expense to pay. For example, if the same 3 coffee drinkers have gone out three days in a row for coffee and each has paid respectively, if on the fourth day the same three go out together again, then no worker is responsible for paying based on not having paid recently, and the program will pick from the 3 the one with the lowest total expense to pay for todays coffee.

- Also I made it so that when a new coffee drinker is saved in the database that their lastBought date is saved as today, that way they can receive some hospitality and generally not have to buy a coffee for everyone else on their first outing if there are other coffee buyers who have not bought recently.

## Given More Time...

1. I would want to create a separate database table to host the prices and names of the various coffee drinks, and use that as static data both when creating a new user (think drop down menus instead of typed inputs), and when calculating the total expense (ET=4-6 hours).

2. Currently when a user clicks submit, the program and algorithm not only select a buyer for today, but it also increments that buyers total expense and changes their lastBought date to today before returning a result. As in real life, as humans are imperfect for a number of reasons the final improvement is that I would want to extend the logic with selecting a buyer such that before incrementing that persons totalExpense and changing the lastBought date to today, that the program would confirm with the user that the person it selected will indeed be the todays coffee buyer. This would be as simple as having a second POST api endpoint at /api/confirmTodaysBuyer that takes the result it generated at /api/calculateTodaysBuyer and updates that buyers information accordingly (ET=1-2 hours).

- I didn't implement this on the take home challenge simply because its an added layer of complexity that is outside of the scope of the instructions, in a real world scenario, I feel like this kind of addition that would need to be discussed with business before being implemented.
