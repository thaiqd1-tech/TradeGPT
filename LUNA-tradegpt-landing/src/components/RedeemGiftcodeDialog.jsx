import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { redeemGiftcode } from '../services/api';
import { toast } from '../hooks/use-toast';

const RedeemGiftcodeDialog = ({ open, onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!open) {
      setCode('');
      setError(null);
      setSuccess(null);
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!code.trim()) {
      setError('Vui lòng nhập mã giftcode');
      toast.error('Vui lòng nhập mã giftcode');
      return;
    }
    setLoading(true);
    try {
      const res = await redeemGiftcode(code.trim().toUpperCase());
      
      if (res.success === false) {
        setError(res.message || 'Giftcode không hợp lệ hoặc đã hết lượt sử dụng');
        toast.error(res.message || 'Giftcode không hợp lệ hoặc đã hết lượt sử dụng');
      } else {
        setSuccess(`Nhận thành công ${res.credit || 0} credit!`);
        toast.success(res.message || `Nhận thành công ${res.credit || 0} credit!`);
        setCode('');
        // Gọi onSuccess với total credit từ server thay vì chỉ credit được cộng
        if (onSuccess && res.new_credit_balance !== undefined) {
          onSuccess(res.new_credit_balance); 
        } else if (onSuccess && res.credit) {
          onSuccess(res.credit);
        }
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Giftcode không hợp lệ hoặc đã được sử dụng';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-6 text-foreground">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold text-center bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
            Nhập giftcode để nhận credit miễn phí
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Nhập mã giftcode"
              className="w-full h-12 text-center text-lg border-2 border-purple-300 focus:border-purple-500 rounded-lg text-foreground"
              disabled={loading || !!success}
            />
            {error && <div className="text-red-400 text-sm text-center">{error}</div>}
            {success && <div className="text-green-400 text-sm font-semibold text-center">{success}</div>}
          </div>
          
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose} 
              disabled={loading}
              className="flex-1 h-12 text-base text-foreground border-border hover:bg-accent"
            >
              Bỏ qua
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !!success}
              className="flex-1 h-12 text-base bg-black hover:bg-gray-800 text-white"
            >
              {loading ? 'Đang xử lý...' : 'Nhận credit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RedeemGiftcodeDialog;
