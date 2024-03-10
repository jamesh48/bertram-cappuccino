import { Dialog, Box, Typography, Button } from '@mui/material';
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import { CoffeeDrinker } from './Home';

interface DeleteUserDialogProps {
  coffeeDrinkerName: string;
  open: boolean;
  handleDeleteUserDialogOpen: (flag: boolean) => void;
  refetch: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<CoffeeDrinker[], Error>>;
}

const DeleteUserDialog = (props: DeleteUserDialogProps) => {
  const handleUserDeletion = async (coffeeDrinkerName: string) => {
    await fetch(`/api/deleteUser?coffeeDrinkerName=${coffeeDrinkerName}`, {
      method: 'DELETE',
    });
    props.handleDeleteUserDialogOpen(false);
    props.refetch();
  };

  return (
    <Dialog
      open={props.open}
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'flex-start',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Typography variant="h6" sx={{ textDecoration: 'underline' }}>
            Delete User?
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
          <Typography variant="h6">
            Delete {props.coffeeDrinkerName}?
          </Typography>
        </Box>
        <Box sx={{ display: 'flex' }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => props.handleDeleteUserDialogOpen(false)}
            sx={{ marginX: '.5rem' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleUserDeletion(props.coffeeDrinkerName)}
            sx={{ marginX: '.5rem' }}
          >
            Ok
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default DeleteUserDialog;
