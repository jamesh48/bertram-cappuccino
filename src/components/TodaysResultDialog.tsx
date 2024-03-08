import { Dialog, Box, OutlinedInput, Typography } from '@mui/material';

interface TodaysResultDialogProps {
  todaysResult: {
    open: boolean;
    todaysBuyer: string;
    todaysTotalExpense: number;
  };
  handleTodaysResultDialogOpen: () => void;
}

const TodaysResultDialog = (props: TodaysResultDialogProps) => {
  return (
    <Dialog open={props.todaysResult.open}>
      <Box sx={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Typography variant="h5" sx={{ textDecoration: 'underline' }}>
            Todays Buyer is...
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            paddingY: '1rem',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant="h4">{props.todaysResult.todaysBuyer}</Typography>
          <Typography variant="h5">
            Total Expense: ${props.todaysResult.todaysTotalExpense}
          </Typography>
        </Box>
        <OutlinedInput
          type="button"
          value="Ok"
          inputProps={{ sx: { cursor: 'pointer' } }}
          onClick={props.handleTodaysResultDialogOpen}
        />
      </Box>
    </Dialog>
  );
};

export default TodaysResultDialog;
