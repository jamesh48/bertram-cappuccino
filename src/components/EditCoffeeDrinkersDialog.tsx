import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import { CoffeeDrinker } from './Home';
import NewCoffeeDrinkerDialog from './NewCoffeeDrinkerDialog';

interface EditUserDialogProps {
  coffeeDrinker: CoffeeDrinker;
  open: boolean;
  handleEditUserDialogOpen: (flag: boolean) => void;
  refetch: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<CoffeeDrinker[], Error>>;
}

const EditUserDialog = (props: EditUserDialogProps) => {
  return (
    <NewCoffeeDrinkerDialog
      refetch={props.refetch}
      newCoffeeDrinkerOpen={props.open}
      handleNewCoffeeDrinkerOpen={props.handleEditUserDialogOpen}
      editMode={true}
      editingDefaultValues={props.coffeeDrinker}
    />
  );
};

export default EditUserDialog;
