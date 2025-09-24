import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../ui/dialog';
import { Button } from '../ui/button';

interface ModalConfirmDeleteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    description: string;
}

export const ModalConfirmDelete = ({ open, onOpenChange, onConfirm, onCancel, title, description }: ModalConfirmDeleteProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                {description}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="destructive" onClick={onConfirm}>Delete</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    )
};