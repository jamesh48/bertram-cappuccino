import { Dialog, Box, Typography, Button } from '@mui/material';

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
    <Dialog
      open={props.todaysResult.open}
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'flex-start',
        },
      }}
    >
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
            paddingY: '.75rem',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant="h4">{props.todaysResult.todaysBuyer}</Typography>
          <Typography variant="h5">
            Total Expense: ${props.todaysResult.todaysTotalExpense}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={props.handleTodaysResultDialogOpen}
        >
          Ok
        </Button>
      </Box>
    </Dialog>
  );
};

export default TodaysResultDialog;
