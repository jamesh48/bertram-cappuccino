import {
  filterForPeopleWhoShouldPay,
  fromMultipleChooseBuyer,
} from '../pages/api/calculateTodaysBuyer';

describe('Calculate Buyer Tests', () => {
  describe('filterForPeopleWhoShouldPay', () => {
    it('should find one person who should pay of 3', () => {
      const peopleWhoShouldPay = filterForPeopleWhoShouldPay(
        [
          // Today is 2024-03-09
          {
            coffeeDrinkerName: 'James',
            lastBought: '2024-03-08',
            favoriteDrink: 'Cappuccino',
            favoriteDrinkPrice: 2.5,
            totalExpense: 0,
          },
          {
            coffeeDrinkerName: 'John',
            lastBought: '2024-03-07',
            favoriteDrink: 'Cappuccino',
            favoriteDrinkPrice: 2.5,
            totalExpense: 0,
          },
          {
            coffeeDrinkerName: 'Jacob',
            lastBought: '2024-03-05',
            favoriteDrink: 'Cappuccino',
            favoriteDrinkPrice: 2.5,
            totalExpense: 0,
          },
        ],
        '2024-03-06'
      );

      expect(peopleWhoShouldPay.length).toBe(1);
      expect(peopleWhoShouldPay[0].coffeeDrinkerName).toBe('Jacob');
    });
  });
  describe('fromMultipleChooseBuyer', () => {
    it('should return 1 coffee drinker if only one is present', () => {
      const todaysBuyer = fromMultipleChooseBuyer([
        {
          totalExpense: 5,
          coffeeDrinkerName: 'John',
          lastBought: '2024-03-08',
        },
      ]);
      expect(todaysBuyer).toBe('John');
    });
    it('should return the coffee drinker with the lowest expense given multiple coffee drinkers', () => {
      const todaysBuyer = fromMultipleChooseBuyer([
        {
          totalExpense: 0,
          coffeeDrinkerName: 'John',
          lastBought: '2024-03-08',
        },
        {
          totalExpense: 5,
          coffeeDrinkerName: 'James',
          lastBought: '2024-03-08',
        },
      ]);
      expect(todaysBuyer).toBe('John');
    });
  });
});
