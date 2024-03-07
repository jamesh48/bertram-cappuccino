import { router } from '../../api-libs';

const newCoffeeDrinker = router
  .clone()
  .post(async (req, res) => {
    const coffeeDrinkerName = req.body.cofeeDrinkerName;
    const favoriteDrink = req.body.favoriteDrink;
    const lastBought = new Date().toISOString().split('T')[0];

    return res.send({ message: 'ok' });
  })
  .handler();

export default newCoffeeDrinker;
