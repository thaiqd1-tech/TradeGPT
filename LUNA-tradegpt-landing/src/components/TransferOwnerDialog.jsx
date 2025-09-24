import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const TransferOwnerDialog = ({ open, onClose, members, currentOwnerId, workspaceId, onTransferSuccess }) => {
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMemberId || !workspaceId) return;

    setIsLoading(true);
    try {
      // TODO: Implement transfer ownership API call
      console.log('Transferring ownership to:', selectedMemberId);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      onTransferSuccess && onTransferSuccess(selectedMemberId);
      onClose();
      setSelectedMemberId('');
    } catch (error) {
      console.error('Error transferring ownership:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const availableMembers = members.filter(member =>
    member.user_id !== currentOwnerId && member.role !== 'owner'
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chuyển quyền sở hữu</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="member" className="text-right">
                Thành viên
              </Label>
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn thành viên..." />
                </SelectTrigger>
                <SelectContent>
                  {availableMembers.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.name || member.user_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" disabled={!selectedMemberId || isLoading}>
              {isLoading ? 'Đang chuyển...' : 'Chuyển quyền'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { TransferOwnerDialog };
