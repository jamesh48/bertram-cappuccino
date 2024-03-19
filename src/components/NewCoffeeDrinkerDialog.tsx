import {
  Box,
  Dialog,
  Typography,
  CircularProgress,
  Button,
  Paper,
  PaperProps,
  DialogTitle,
  TextField,
} from '@mui/material';
import debounce from 'lodash/debounce';
import { Close } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import moment from 'moment';
import { CoffeeDrinker } from './Home';
import Draggable from 'react-draggable';
import { useCallback, useEffect, useRef, useState } from 'react';

interface NewCoffeeDrinkerDialogProps {
  newCoffeeDrinkerOpen: boolean;
  handleNewCoffeeDrinkerOpen: (flag: boolean) => void;
  refetch: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<CoffeeDrinker[], Error>>;
  editMode?: true;
  editingDefaultValues?: CoffeeDrinker;
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
  const [validatingCoffeeDrinkerName, setValidatingCoffeeDrinkerName] =
    useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedValidateCoffeeDrinker = useCallback(
    debounce(async (coffeeDrinkerName: string) => {
      setValidatingCoffeeDrinkerName('Validating...'); // Show loading indicator
      const response = await fetch(
        `/api/checkUser?coffeeDrinkerName=${coffeeDrinkerName}`
      );
      const result = await response.json();

      setValidatingCoffeeDrinkerName(result.message);
    }, 500),
    []
  );

  const handleSubmit = async (values: {}) => {
    if (props.editMode) {
      await fetch(
        `/api/editCoffeeDrinker?coffeeDrinkerName=${props.editingDefaultValues?.coffeeDrinkerName}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        }
      );
    } else {
      await fetch('/api/newCoffeeDrinker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
    }
    // Invalidate Cache
    await props.refetch();

    // Close Dialog
    props.handleNewCoffeeDrinkerOpen(false);
  };

  const coffeeUserNameRef = useRef(null);

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
            {props.editMode
              ? 'Editing ' + props.editingDefaultValues?.coffeeDrinkerName
              : 'New Coffee Drinker'}
          </DialogTitle>
          <Formik
            onSubmit={handleSubmit}
            initialValues={{
              coffeeDrinkerName:
                props.editingDefaultValues?.coffeeDrinkerName || '',
              favoriteDrink: props.editingDefaultValues?.favoriteDrink || '',
              favoriteDrinkPrice:
                props.editingDefaultValues?.favoriteDrinkPrice || 0,
              onVacationUntil: (() => {
                const today = moment();
                const vacationUntil = moment(
                  props.editingDefaultValues?.lastBought
                );
                if (vacationUntil.isAfter(today)) {
                  return props.editingDefaultValues?.lastBought;
                }
                return '';
              })(),
            }}
            validate={async (values) => {
              const errors = {} as {
                coffeeDrinkerName: string;
                favoriteDrink: string;
                favoriteDrinkPrice: string;
                onVacationUntil: string;
              };

              if (!values.coffeeDrinkerName.length) {
                setValidatingCoffeeDrinkerName('Required');
              }
              // Don't validate when the coffeeDrinkerName is not being typed on
              else if (coffeeUserNameRef.current === document.activeElement) {
                debouncedValidateCoffeeDrinker(values.coffeeDrinkerName);
              }

              if (!values.favoriteDrink.length) {
                errors.favoriteDrink = 'Required';
              }

              if (
                isNaN(values.favoriteDrinkPrice) ||
                values.favoriteDrinkPrice.toString().endsWith('.')
              ) {
                errors.favoriteDrinkPrice = 'Invalid Drink Price!';
              } else if (!values.favoriteDrinkPrice) {
                errors.favoriteDrinkPrice = 'Required';
              }
              const today = moment();

              const vacationUntil = moment(values.onVacationUntil);
              if (values.onVacationUntil && !vacationUntil.isValid()) {
                errors.onVacationUntil = 'Invalid Date';
              } else if (vacationUntil.isBefore(today, 'day')) {
                errors.onVacationUntil = 'Invalid Date';
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
                  <TextField
                    onChange={handleChange}
                    name="coffeeDrinkerName"
                    value={values.coffeeDrinkerName}
                    disabled={props.editMode}
                    label="Coffee Drinker Name"
                    inputRef={coffeeUserNameRef}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                  <Typography
                    sx={{
                      color: 'red',
                    }}
                  >
                    {validatingCoffeeDrinkerName !== 'Valid!'
                      ? validatingCoffeeDrinkerName
                      : null}
                  </Typography>
                </Box>
                {values.coffeeDrinkerName &&
                validatingCoffeeDrinkerName === 'Valid!' ? (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      paddingY: '.5rem',
                    }}
                  >
                    <TextField
                      onChange={handleChange}
                      name="favoriteDrink"
                      value={values.favoriteDrink}
                      label="Favorite Drink"
                      InputLabelProps={{
                        shrink: true,
                      }}
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
                    <TextField
                      onChange={handleChange}
                      name="favoriteDrinkPrice"
                      value={values.favoriteDrinkPrice}
                      label="Favorite Drink Price"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                    {errors.favoriteDrinkPrice ? (
                      <Typography sx={{ color: 'red' }}>
                        {errors.favoriteDrinkPrice}
                      </Typography>
                    ) : null}
                  </Box>
                ) : null}
                {props.editMode ? (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      paddingY: '.5rem',
                    }}
                  >
                    <TextField
                      id="date"
                      onChange={handleChange}
                      name="onVacationUntil"
                      value={values.onVacationUntil}
                      label="On Vacation Until"
                      type="date"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                    {errors.onVacationUntil ? (
                      <Typography sx={{ color: 'red' }}>
                        {errors.onVacationUntil}
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
