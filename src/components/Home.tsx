'use client';
import { useEffect, useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  CircularProgress,
  Typography,
  Collapse,
  InputLabel,
} from '@mui/material';
import { Close, Coffee } from '@mui/icons-material';
import NewCoffeeDrinkerDialog from './NewCoffeeDrinkerDialog';
import TodaysResultDialog from './TodaysResultDialog';
import { useQuery } from '@tanstack/react-query';
import DeleteUserDialog from './DeleteUserDialog';

const getCoffeeDrinkers = async () => {
  const r = await fetch('/api/fetchCoffeeDrinkers', {
    cache: 'no-store',
  });
  return r.json();
};

export interface CoffeeDrinker {
  coffeeDrinkerName: string;
  favoriteDrink: string;
  favoriteDrinkPrice: number;
}

interface CheckedCoffeeDrinker extends CoffeeDrinker {
  checked: boolean;
}

export default function Home() {
  const [deleteMode, setDeleteMode] = useState(false);
  const [optionsPanelOpen, setOptionsPanelOpen] = useState(false);
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [coffeeDrinkerToDelete, setCoffeeDrinkerToDelete] = useState('');
  const [newCoffeeDrinkerOpen, setNewCoffeeDrinkerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todaysResult, setTodaysResult] = useState<{
    todaysBuyer: string;
    todaysTotalExpense: number;
    open: boolean;
  }>({ open: false, todaysTotalExpense: 0, todaysBuyer: '' });
  const { data, refetch, isRefetching, isFetching } = useQuery<CoffeeDrinker[]>(
    {
      queryKey: ['coffeeDrinkers'],
      queryFn: getCoffeeDrinkers,
    }
  );

  useEffect(() => {
    if (!optionsPanelOpen) {
      setDeleteMode(false);
    }
  }, [optionsPanelOpen]);

  useEffect(() => {
    if (data && data.length) {
      setCheckboxes(
        data?.map((coffeeDrinker) => ({
          checked: false,
          coffeeDrinkerName: coffeeDrinker.coffeeDrinkerName,
          favoriteDrink: coffeeDrinker.favoriteDrink,
          favoriteDrinkPrice: coffeeDrinker.favoriteDrinkPrice,
        }))
      );
    }
  }, [data]);

  const [checkboxes, setCheckboxes] = useState<CheckedCoffeeDrinker[]>([]);

  const handleNewCoffeeDrinkerOpen = (flag: boolean) => {
    setNewCoffeeDrinkerOpen(flag);
  };

  const handleDeleteUserDialogOpen = (flag: boolean) => {
    setDeleteUserOpen(flag);
  };

  const handleTodaysResultDialogOpen = () => {
    setTodaysResult({
      todaysTotalExpense: 0,
      open: false,
      todaysBuyer: '',
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCheckboxes((prev) => {
      const index = prev.findIndex(
        (coffeeDrinker) => coffeeDrinker.coffeeDrinkerName === event.target.name
      );
      const checked = !prev[index].checked;
      const favoriteDrink = prev[index].favoriteDrink;
      const favoriteDrinkPrice = prev[index].favoriteDrinkPrice;
      prev.splice(index, 1, {
        coffeeDrinkerName: event.target.name,
        checked,
        favoriteDrink,
        favoriteDrinkPrice,
      });
      return [...prev];
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const response = await fetch('/api/calculateTodaysBuyer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coffeeDrinkers: checkboxes.reduce<string[]>((total, item) => {
          if (item.checked) {
            total.push(item.coffeeDrinkerName);
          }
          return total;
        }, []),
      }),
    });
    setIsSubmitting(false);
    const data = await response.json();
    setTodaysResult({
      todaysBuyer: data.result.todaysBuyer,
      todaysTotalExpense: data.result.todaysTotalExpense,
      open: true,
    });
  };

  const confirmUserDeletion = (coffeeDrinkerName: string) => {
    setCoffeeDrinkerToDelete(coffeeDrinkerName);
    setDeleteUserOpen(true);
  };

  const handleOptionsPanelOpen = () => {
    setOptionsPanelOpen((prev) => !prev);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid black',
        padding: '1rem',
        width: '22.5rem',
        borderRadius: '1.5%',
      }}
    >
      <FormControl component="fieldset" variant="standard">
        <FormLabel
          component="legend"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            bgcolor: 'lightgrey',
            width: '100%',
          }}
        >
          {(() => {
            const date = new Date();
            return `${
              date.getMonth() + 1
            }-${date.getDate()}-${date.getFullYear()}`;
          })()}
        </FormLabel>
        <FormGroup
          sx={{
            maxHeight: '25rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
          }}
        >
          {isFetching || isRefetching ? (
            <Box
              sx={{
                height: 'auto',
                borderBottom: '1px solid black',
                display: 'flex',
                width: '100%',
                paddingY: '.5rem',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6">Getting Coffee Drinkers...</Typography>
            </Box>
          ) : (
            checkboxes.map((checkbox, index) => {
              return (
                <Box
                  key={index}
                  sx={{
                    height: 'auto',
                    borderBottom: '1px solid black',
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    alignItems: 'center',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checkbox.checked}
                        onChange={handleChange}
                        name={checkbox.coffeeDrinkerName}
                      />
                    }
                    label={`${checkbox.coffeeDrinkerName} | ${checkbox.favoriteDrink} | $${checkbox.favoriteDrinkPrice}`}
                  />
                  {deleteMode ? (
                    <Box
                      sx={{
                        display: 'flex',
                        flex: 1,
                        justifyContent: 'flex-end',
                      }}
                    >
                      <Close
                        sx={{
                          color: 'red',
                          opacity: 0.5,
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          confirmUserDeletion(checkbox.coffeeDrinkerName);
                        }}
                      />
                    </Box>
                  ) : null}
                </Box>
              );
            })
          )}
        </FormGroup>
      </FormControl>

      <Box
        sx={{
          display: 'flex',
          cursor: 'pointer',
          justifyContent: 'center',
          marginY: '1rem',
          border: '1px solid black',
          borderRadius: '.25rem',
          '&:hover': {
            borderColor: 'purple',
          },
        }}
        onClick={handleOptionsPanelOpen}
      >
        <Coffee color="secondary" />
        <InputLabel
          sx={{
            cursor: 'pointer',
            marginX: '.25rem',
            color: 'black',
            '&:hover': {
              color: 'purple',
            },
          }}
        >
          Options
        </InputLabel>
        <Coffee color="secondary" />
      </Box>
      <Collapse in={optionsPanelOpen}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Button
            onClick={() => {
              handleNewCoffeeDrinkerOpen(true);
            }}
            variant="outlined"
            color="secondary"
            disabled={isFetching || isRefetching}
            sx={{ marginY: '.5rem' }}
          >
            New Coffee Drinker
          </Button>

          <Button
            onClick={() => {
              setDeleteMode((prev) => !prev);
            }}
            variant="outlined"
            color="error"
            disabled={isFetching || isRefetching}
            sx={{ marginY: '.5rem' }}
          >
            {deleteMode ? 'Finished Deleting' : 'Delete Coffee Drinkers?'}
          </Button>
        </Box>
      </Collapse>

      <NewCoffeeDrinkerDialog
        newCoffeeDrinkerOpen={newCoffeeDrinkerOpen}
        handleNewCoffeeDrinkerOpen={handleNewCoffeeDrinkerOpen}
        refetch={refetch}
      />
      <TodaysResultDialog
        handleTodaysResultDialogOpen={handleTodaysResultDialogOpen}
        todaysResult={todaysResult}
      />
      <DeleteUserDialog
        open={deleteUserOpen}
        coffeeDrinkerName={coffeeDrinkerToDelete}
        handleDeleteUserDialogOpen={handleDeleteUserDialogOpen}
        refetch={refetch}
      />
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        {isSubmitting ? (
          <CircularProgress />
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={checkboxes.every((checkbox) => !checkbox.checked)}
          >
            Submit
          </Button>
        )}
      </Box>
    </Box>
  );
}
