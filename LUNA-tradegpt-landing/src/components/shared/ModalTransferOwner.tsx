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
import { Input } from '../ui/input';
import { useState } from "react";

interface ModalTransferOwnerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (newOwnerId: string) => void;
  onCancel: () => void;
}

export const ModalTransferOwner = ({ open, onOpenChange, onConfirm, onCancel }: ModalTransferOwnerProps) => {
  const [newOwnerId, setNewOwnerId] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Owner</DialogTitle>
          <DialogDescription>
            Enter the new owner ID to transfer this artifact to:
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="New owner ID"
          value={newOwnerId}
          onChange={e => setNewOwnerId(e.target.value)}
          className="mb-4"
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive" disabled={!newOwnerId} onClick={() => onConfirm(newOwnerId)}>
              Transfer
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};