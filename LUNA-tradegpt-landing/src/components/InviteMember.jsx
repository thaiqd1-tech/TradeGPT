import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const InviteMember = ({ workspaceId, userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !workspaceId) return;

    setIsLoading(true);
    try {
      // TODO: Implement invite member API call
      console.log('Inviting member:', { email, role, workspaceId });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsOpen(false);
      setEmail('');
      setRole('member');
    } catch (error) {
      console.error('Error inviting member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const availableRoles = [
    { value: 'member', label: 'Member' },
    { value: 'admin', label: 'Admin' },
  ];

  // Owner không thể tự mời chính mình hoặc mời owner khác
  if (userRole === 'owner') {
    availableRoles.push({ value: 'owner', label: 'Owner' });
  }

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)} className="w-full">
        Mời thành viên
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mời thành viên</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="col-span-3"
                  placeholder="Nhập email..."
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Vai trò
                </Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((roleOption) => (
                      <SelectItem key={roleOption.value} value={roleOption.value}>
                        {roleOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                Hủy
              </Button>
              <Button type="submit" disabled={!email.trim() || isLoading}>
                {isLoading ? 'Đang mời...' : 'Gửi lời mời'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { InviteMember };
