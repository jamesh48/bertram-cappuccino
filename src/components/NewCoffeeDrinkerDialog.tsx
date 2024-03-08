import {
  Box,
  Dialog,
  Typography,
  OutlinedInput,
  CircularProgress,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import { CoffeeDrinker } from './Home';

interface NewCoffeeDrinkerDialogProps {
  newCoffeeDrinkerOpen: boolean;
  handleNewCoffeeDrinkerOpen: (flag: boolean) => void;
  refetch: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<CoffeeDrinker[], Error>>;
}

const NewCoffeeDrinkerDialog = (props: NewCoffeeDrinkerDialogProps) => {
  const handleSubmit = async (values: {}) => {
    await fetch('/api/newCoffeeDrinker', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });
    // Invalidate Cache
    await props.refetch();

    // Close Dialog
    props.handleNewCoffeeDrinkerOpen(false);
  };

  return (
    <Dialog open={props.newCoffeeDrinkerOpen}>
      <Box>
        <Box
          sx={{
            borderBottom: '1px solid black',
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '.25rem .5rem',
          }}
        >
          <Close
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              props.handleNewCoffeeDrinkerOpen(false);
            }}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '1rem',
          }}
        >
          <Typography variant="h5">New Coffee Drinker</Typography>
          <Formik
            onSubmit={handleSubmit}
            initialValues={{
              coffeeDrinkerName: '',
              favoriteDrink: '',
              favoriteDrinkPrice: 0,
            }}
          >
            {({ values, handleChange, isSubmitting }) => (
              <Form
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '.5rem',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    paddingY: '.5rem',
                  }}
                >
                  <label>Name</label>
                  <OutlinedInput
                    onChange={handleChange}
                    name="coffeeDrinkerName"
                    value={values.coffeeDrinkerName}
                  />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    paddingY: '.5rem',
                  }}
                >
                  <label>Favorite Drink</label>
                  <OutlinedInput
                    onChange={handleChange}
                    name="favoriteDrink"
                    value={values.favoriteDrink}
                  />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    paddingY: '.5rem',
                  }}
                >
                  <label>Favorite Drink Price</label>
                  <OutlinedInput
                    onChange={handleChange}
                    name="favoriteDrinkPrice"
                    value={values.favoriteDrinkPrice}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  {isSubmitting ? (
                    <CircularProgress />
                  ) : (
                    <OutlinedInput
                      fullWidth
                      type="submit"
                      value="Save Coffee Drinker"
                      inputProps={{ sx: { cursor: 'pointer' } }}
                    />
                  )}
                </Box>
              </Form>
            )}
          </Formik>
        </Box>
      </Box>
    </Dialog>
  );
};

export default NewCoffeeDrinkerDialog;
