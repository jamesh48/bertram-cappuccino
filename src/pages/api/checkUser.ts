import { router, querySingleUser } from '@/api-libs';

const fetchCoffeeDrinkers = router
  .clone()
  .get(async (req, res) => {
    const data = await querySingleUser(req.query.coffeeDrinkerName as string);

    if (!data.Items?.length) {
      return res.send({ message: 'Valid!' });
    }

    return res.send({ message: 'User Already Exists' });
  })
  .handler();

export default fetchCoffeeDrinkers;
