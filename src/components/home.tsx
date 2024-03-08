'use client';
import {
  Box,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  OutlinedInput,
} from '@mui/material';
import { useState } from 'react';
import NewCoffeeDrinkerDialog from './NewCoffeeDrinkerDialog';

interface HomeProps {
  data: { coffeeDrinkerName: string }[];
}
export default function Home(props: HomeProps) {
  const [newCoffeeDrinkerOpen, setNewCoffeeDrinkerOpen] = useState(false);
  const [checkboxes, setCheckboxes] = useState(
    props.data.map((coffeeDrinker) => ({
      checked: false,
      name: coffeeDrinker.coffeeDrinkerName,
    }))
  );

  const handleNewCoffeeDrinkerOpen = (flag: boolean) => {
    setNewCoffeeDrinkerOpen(flag);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCheckboxes((prev) => {
      const index = prev.findIndex((x) => x.name === event.target.name);
      const checked = !prev[index].checked;
      prev.splice(index, 1, { name: event.target.name, checked });
      return [...prev];
    });
  };

  const handleSubmit = async () => {
    const response = await fetch('/api/calculateTodaysBuyer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coffeeDrinkers: checkboxes.reduce<string[]>((total, item) => {
          if (item.checked) {
            total.push(item.name);
          }
          return total;
        }, [] as string[]),
      }),
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <FormControl component="fieldset" variant="standard">
        <FormLabel component="legend">Coffee Drinkers</FormLabel>
        <FormGroup>
          {checkboxes.map((checkbox, index) => {
            return (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    checked={checkbox.checked}
                    onChange={handleChange}
                    name={checkbox.name}
                  />
                }
                label={checkbox.name}
              />
            );
          })}
        </FormGroup>
      </FormControl>
      <OutlinedInput
        onClick={() => {
          handleNewCoffeeDrinkerOpen(true);
        }}
        type="button"
        value="New Coffee Drinker"
        inputProps={{ sx: { cursor: 'pointer' } }}
      />

      <NewCoffeeDrinkerDialog
        newCoffeeDrinkerOpen={newCoffeeDrinkerOpen}
        handleNewCoffeeDrinkerOpen={handleNewCoffeeDrinkerOpen}
      />

      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit
      </Button>
    </Box>
  );
}
