import { router } from '../../api-libs';

const healthcheck = router.clone().get(async (_req, res) => {
  return res.send({ status: 'ok!' });
});

export default healthcheck;
