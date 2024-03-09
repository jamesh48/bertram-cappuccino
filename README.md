# Betram Cappuccino

## Tech Stack

- The frontend and server-side of this project is facilitated by [Next.js](https://nextjs.org/), which is a react framework that simplifies and abstracts complex operations like server side rendering, build optimization, and app routing. The code is written 100% in Typescript. There are no environment variables associated with the service.

- This project uses the AWS Cloud for hosting and infrastructure. betramcappuccino.com is registered as a domain with AWS Route53, and this domain is setup to point to an application load balancer (ALB) that in turn forwards traffic to an ECS Service and Container where the production server is running and frontend code is hosted as an static asset. This project uses DynamoDB as a database where information like the coffeeDrinker's names, favorite drink and price, totalExpense, and lastBought date data is stored. The Infrastructure as Code (IAC) CDK templates can found in the iac folder in the root of this project.

## Running the Program Locally

It is possible to run the program locally, however it won't work on someone elses local computer unless they either have my AWS account credentials stored locally (I won't give them), or if they have their own AWS Account configured and deploy the needed infrastructure, most notably the database first. Since I took the effort to deploy and host the project myself, I'd recommend just validating with the deployed [Betram Cappuccino](https://betramcappuccino.com) website directly. In a real world, client-based scenario, I would hope that the client would either already have a Cloud Provider account like AWS with Identity Access Management (IAM), policy in place for allowing multiple users to access their cloud account securely or that I would take the time to set that up for them. But this undertaking would most definitely be outside of the scope of this take home challenge.

However if you did want to run the code locally you would use the CLI/Terminal from within the root of this project to install the required packages using [npm](https://www.npmjs.com/).

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

## Given More Time...

1. If given more time and interest, I would want to work with a UI/UX designer expand the applications functionality to be able to delete users from the list of coffee drinkers. Currently, finding a place in the UI for such a modal is challenging considering that I want the application to be "mobile first", and there just is less room on a phone (ET=2-4 hours).

2. I would also want to create a separate database table to host the prices and names of the various coffee drinks, and use that as static data both when creating a new user (think drop down menus instead of typed inputs), and when calculating the total expense (4 hours).

3. Currently when a user clicks submit, the program and algorithm not only select a buyer for today, but it also increments that buyers total expense and changes their lastBought date to today before returning a result. As in real life, as humans are imperfect for a number of reasons the final improvement is that I would want to extend the logic with selecting a buyer such that before incrementing that persons totalExpense and changing the lastBought date to today, that the program would confirm with the user that the person it selected will indeed be the todays coffee buyer. This would be as simple as having a second POST api endpoint at /api/confirmTodaysBuyer that takes the result it generated at /api/calculateTodaysBuyer and updates that buyers information accordingly (ET=2-4 hours).

4. On the infrastructure and deployment side, if this were a project that I would want to continue iterating on I would make a CICD workflow using github actions. I have templates from other projects for this and this would be easy to implement (ET=30 minutes).
