import { router } from '../../api-libs';

const healthcheck = router
  .clone()
  .get(async (_req, res) => {
    return res.status(200).send({ status: 'ok!' });
  })
  .handler();

export default healthcheck;
