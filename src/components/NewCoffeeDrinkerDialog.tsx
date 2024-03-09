import {
  Box,
  Dialog,
  Typography,
  OutlinedInput,
  CircularProgress,
  Button,
  Paper,
  PaperProps,
  DialogTitle,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import { CoffeeDrinker } from './Home';
import Draggable from 'react-draggable';

interface NewCoffeeDrinkerDialogProps {
  newCoffeeDrinkerOpen: boolean;
  handleNewCoffeeDrinkerOpen: (flag: boolean) => void;
  refetch: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<CoffeeDrinker[], Error>>;
}

function PaperComponent(props: PaperProps) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
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
    <Dialog
      open={props.newCoffeeDrinkerOpen}
      PaperComponent={PaperComponent}
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'flex-start',
        },
      }}
    >
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
          <DialogTitle
            style={{ cursor: 'move', padding: 0 }}
            id="draggable-dialog-title"
          >
            New Coffee Drinker
          </DialogTitle>
          <Formik
            onSubmit={handleSubmit}
            initialValues={{
              coffeeDrinkerName: '',
              favoriteDrink: '',
              favoriteDrinkPrice: 0,
            }}
            validate={async (values) => {
              const errors = {} as {
                coffeeDrinkerName: string;
                favoriteDrink: string;
                favoriteDrinkPrice: string;
              };

              if (!values.favoriteDrink.length) {
                errors.favoriteDrink = 'Required';
              }

              if (!values.coffeeDrinkerName.length) {
                errors.coffeeDrinkerName = 'Required';
              }

              if (
                isNaN(values.favoriteDrinkPrice) ||
                values.favoriteDrinkPrice.toString().endsWith('.')
              ) {
                errors.favoriteDrinkPrice = 'Invalid Drink Price!';
              } else if (!values.favoriteDrinkPrice) {
                errors.favoriteDrinkPrice = 'Required';
              }

              if (Object.keys(errors).length) {
                return errors;
              }

              return {};
            }}
          >
            {({ values, handleChange, isSubmitting, errors }) => (
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
                  {errors.coffeeDrinkerName ? (
                    <Typography sx={{ color: 'red' }}>
                      {errors.coffeeDrinkerName}
                    </Typography>
                  ) : null}
                </Box>
                {values.coffeeDrinkerName && !errors.coffeeDrinkerName ? (
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
                    {errors.favoriteDrink ? (
                      <Typography sx={{ color: 'red' }}>
                        {errors.favoriteDrink}
                      </Typography>
                    ) : null}
                  </Box>
                ) : null}
                {values.favoriteDrink && !errors.favoriteDrink ? (
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
                    {errors.favoriteDrinkPrice ? (
                      <Typography sx={{ color: 'red' }}>
                        {errors.favoriteDrinkPrice}
                      </Typography>
                    ) : null}
                  </Box>
                ) : null}

                {values.favoriteDrinkPrice && !errors.favoriteDrinkPrice ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    {isSubmitting ? (
                      <CircularProgress />
                    ) : (
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit"
                      >
                        Save Coffee Drinker
                      </Button>
                    )}
                  </Box>
                ) : null}
              </Form>
            )}
          </Formik>
        </Box>
      </Box>
    </Dialog>
  );
};

export default NewCoffeeDrinkerDialog;
