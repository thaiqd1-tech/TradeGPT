import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { ShieldCheck } from 'lucide-react';

const DEVELOPMENT_NOTICE_KEY = 'development_notice_dismissed';

const DevelopmentNoticeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const noticeDismissed = localStorage.getItem(DEVELOPMENT_NOTICE_KEY);
    if (noticeDismissed !== 'true') {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(DEVELOPMENT_NOTICE_KEY, 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-slate-800 dark:text-slate-100">Thông báo quan trọng</DialogTitle>
          <DialogDescription className="text-center text-slate-600 dark:text-slate-400 pt-2">
            Chào mừng bạn đến với nền tảng của chúng tôi!
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 px-2 space-y-4 text-slate-700 dark:text-slate-300">
          <p>
            Chúng tôi đang trong giai đoạn <strong className="text-blue-600 dark:text-blue-400">phát triển và hoàn thiện</strong>. Trong quá trình này, một số tính năng có thể chưa ổn định hoặc phát sinh lỗi ngoài ý muốn.
          </p>
          <p>
            Sự đóng góp và phản hồi của bạn là vô cùng quý giá. Nếu bạn gặp bất kỳ vấn đề nào, xin vui lòng thông báo cho đội ngũ phát triển.
          </p>
          <p className="font-semibold text-center">Cảm ơn sự thấu hiểu và hợp tác của bạn!</p>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center w-full">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
                <Checkbox id="dont-show-again" checked={dontShowAgain} onCheckedChange={(checked) => setDontShowAgain(checked as boolean)} />
                <label
                    htmlFor="dont-show-again"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600 dark:text-slate-400"
                >
                    Không hiển thị lại
                </label>
            </div>
            <Button onClick={handleClose} className="w-full sm:w-auto !bg-blue-600 hover:!bg-blue-700 !text-white border-0">
                Tôi đã hiểu
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DevelopmentNoticeModal;
