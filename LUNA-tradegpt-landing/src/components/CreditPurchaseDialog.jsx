/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { useToast } from './ui/use-toast';
import { createPayPalOrder, capturePayPalOrder, getPlans } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { Coins, CreditCard, Check } from 'lucide-react';
import {Tabs, TabsContent, TabsList, TabsTrigger} from './ui/tabs';
import { Skeleton } from './ui/skeleton';
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';
// window.paypal will be provided by PayPal SDK when loaded

const creditPackages = [
  {
    id: 'basic',
    name: 'Gói Cơ Bản',
    amount: 1,
    credits: 100,
    popular: false,
    description: 'Phù hợp cho người mới bắt đầu'
  },
  {
    id: 'standard',
    name: 'Gói Tiêu Chuẩn',
    amount: 5,
    credits: 500,
    popular: true,
    description: 'Giá trị tốt nhất',
    bonus: '+50 credits miễn phí'
  },
  {
    id: 'premium',
    name: 'Gói Cao Cấp',
    amount: 10,
    credits: 1000,
    popular: false,
    description: 'Tiết kiệm lớn',
    bonus: '+150 credits miễn phí'
  },
  {
    id: 'enterprise',
    name: 'Gói Doanh Nghiệp',
    amount: 25,
    credits: 2500,
    popular: false,
    description: 'Cho doanh nghiệp lớn',
    bonus: '+500 credits miễn phí'
  }
];

// SubscriptionPlansTab: fetches and displays available plans
const SubscriptionPlansTab = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const paypalRef = useRef(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await getPlans();
      setPlans(res.plans || []);
      setError(null);
    } catch (err) {
      setError(err?.message || 'Không thể tải gói');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Load PayPal SDK and render button when selectedPlan changes
  useEffect(() => {
    if (!selectedPlan || !selectedPlan.paypal_plan_id) return;
    if (!paypalRef.current) return;
    paypalRef.current.innerHTML = '';
    // Load PayPal SDK if not loaded
    if (!window.paypal) {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
      script.onload = () => renderPayPalButton();
      document.body.appendChild(script);
      return;
    }
    renderPayPalButton();
    // eslint-disable-next-line
  }, [selectedPlan]);

  const renderPayPalButton = () => {
    if (!paypalRef.current || !selectedPlan) return;
    window.paypal.Buttons({
      createSubscription: function (data, actions) {
        setIsProcessing(true);
        return actions.subscription.create({
          plan_id: selectedPlan.paypal_plan_id
        });
      },
      onApprove: async function (data, actions) {
        setIsProcessing(false);
        try {
          // Notify backend about subscription success (implement this API if needed)
          // await notifySubscriptionSuccess(data.subscriptionID, selectedPlan.id);
          toast({ title: "Thành công", description: "Đăng ký gói thành công!", variant: "default" });
          setSelectedPlan(null);
        } catch (err) {
          toast({ title: "Lỗi", description: "Có lỗi khi xác nhận subscription với hệ thống!", variant: "destructive" });
          setSelectedPlan(null);
        }
      },
      onError: function (err) {
        setIsProcessing(false);
        toast({ title: "Lỗi PayPal", description: "Có lỗi PayPal!", variant: "destructive" });
      },
      onCancel: function () {
        setIsProcessing(false);
      }
    }).render(paypalRef.current);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-lg">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1 w-full">
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-4 rounded" />
              </div>
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div className="py-8 min-h-[200px] flex flex-col items-center justify-center gap-3">
        <div className="text-red-500">{error}</div>
        <button 
          className="px-3 py-2 text-sm font-medium rounded-md transition-all hover:bg-gray-100"
          style={{
            backgroundColor: 'transparent',
            color: '#111827',
            border: '1px solid #D1D5DB'
          }}
          onClick={fetchPlans}
        >
          Thử lại
        </button>
      </div>
    );
  }
  if (!plans.length) {
    return <div className="py-8 flex items-center justify-center min-h-[200px] text-muted-foreground">Không có gói nào khả dụng.</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {plans.map((plan) => (
        <Card key={plan.id} className={`rounded-lg transition-all hover:shadow-md ${selectedPlan?.id === plan.id ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/40'}`}>
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="font-semibold text-sm flex items-center gap-1">
                  {plan.name}
                  {plan.features?.trial && (
                    <Badge variant="default" className="text-[9px] bg-yellow-400 text-yellow-900 px-1">Trial</Badge>
                  )}
                </h3>
                {plan.billing_interval && (
                  <Badge variant="default" className="text-[9px] mt-0.5 bg-green-500 px-1">
                    {plan.billing_interval}
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-1 mb-2">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold">${plan.price}</span>
                <span className="text-xs text-muted-foreground">USD</span>
                {plan.features?.trial && (
                  <span className="ml-1 text-[9px] text-yellow-600">{plan.features.trial}</span>
                )}
              </div>
              {/* Features list */}
              <ul className="text-[10px] text-muted-foreground space-y-0.5">
                {plan.features?.agents && (
                  <li>👥 <b>{plan.features.agents}</b> agents</li>
                )}
                {plan.features?.tokens && (
                  <li>🔢 <b>{plan.features.tokens}</b> tokens</li>
                )}
                {plan.features?.jobs_per_month && (
                  <li>📦 <b>{plan.features.jobs_per_month}</b> jobs/tháng</li>
                )}
                {plan.features?.support && (
                  <li>💬 Hỗ trợ: <b>{plan.features.support}</b></li>
                )}
              </ul>
            </div>
            <button 
              className="mt-2 w-full text-xs h-8 font-medium rounded-md transition-all hover:transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none"
              style={{
                backgroundColor: '#3B82F6',
                color: '#FFFFFF',
                border: 'none'
              }}
              onClick={() => setSelectedPlan(plan)} 
              disabled={isProcessing || selectedPlan?.id === plan.id}
            >
              {plan.features?.trial ? 'Dùng thử miễn phí' : 'Đăng kí'}
            </button>
            {/* Hiển thị PayPal button nếu chọn gói này */}
            {selectedPlan?.id === plan.id && (
              <div className="mt-2 flex flex-col items-center">
                <div ref={paypalRef} className="w-full" />
                {isProcessing && <div className="mt-1 text-xs text-muted-foreground">Đang xử lý...</div>}
                <button 
                  className="mt-1 text-xs h-6 rounded transition-all disabled:opacity-50 disabled:pointer-events-none hover:bg-gray-100"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#6B7280',
                    border: 'none'
                  }}
                  onClick={() => setSelectedPlan(null)} 
                  disabled={isProcessing}
                >
                  Huỷ
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const CreditPurchaseDialog = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user, updateUser } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayPal, setShowPayPal] = useState(false);
  const paypalRef = useRef(null);

  // Load PayPal SDK script khi cần
  useEffect(() => {
    if (showPayPal && !window.paypal) {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
      script.async = true;
      script.onload = () => {
        renderPayPalButton();
      };
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    } else if (showPayPal && window.paypal) {
      renderPayPalButton();
    }
    // eslint-disable-next-line
  }, [showPayPal, selectedPackage]);

  // Hàm render PayPal button
  const renderPayPalButton = () => {
    if (!paypalRef.current || !selectedPackage) return;
    const pkg = creditPackages.find(p => p.id === selectedPackage);
    if (!pkg) return;
    // Xóa nút cũ nếu có
    paypalRef.current.innerHTML = '';
    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal',
      },
      createOrder: async (data, actions) => {
        setIsProcessing(true);
        try {
          const res = await createPayPalOrder({ amount: pkg.amount.toString(), currency: 'USD' });
          setIsProcessing(false);
          return res.order_id;
        } catch (err) {
          setIsProcessing(false);
          toast({ title: 'Lỗi', description: 'Không thể tạo đơn hàng PayPal', variant: 'destructive' });
          throw err;
        }
      },
      onApprove: async (data, actions) => {
        setIsProcessing(true);
        try {
          const res = await capturePayPalOrder({ order_id: data.orderID });
          setIsProcessing(false);
          if (res.success === true || res.status === 'success') {
            const newCredit = res.new_credit_balance ?? res.new_credit;
            toast({ title: 'Thanh toán thành công', description: `Credit mới: ${newCredit}` });
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (currentUser.id) {
              updateUser({ ...currentUser, credit: newCredit });
            }
            if (onSuccess) onSuccess(newCredit);
            onClose();
          } else {
            toast({ title: 'Thanh toán thất bại', description: res.message || 'Thanh toán thất bại', variant: 'destructive' });
          }
        } catch (err) {
          setIsProcessing(false);
          toast({ title: 'Lỗi', description: 'Không thể xác nhận thanh toán', variant: 'destructive' });
        }
      },
      onError: (err) => {
        setIsProcessing(false);
        toast({ title: 'Lỗi PayPal', description: 'Có lỗi xảy ra với PayPal', variant: 'destructive' });
      },
      onCancel: () => {
        setIsProcessing(false);
        toast({ title: 'Đã hủy thanh toán', description: 'Bạn đã hủy giao dịch', variant: 'default' });
      }
    }).render(paypalRef.current);
  };

  const handleSelectPackage = (id) => {
    setSelectedPackage(id);
    setShowPayPal(true);
  };

  const handleClose = () => {
    setSelectedPackage(null);
    setShowPayPal(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full sm:max-w-[800px] p-3 max-h-[85vh]">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent font-bold">Nạp & Đăng kí gói</DialogTitle>
          <DialogDescription className="text-sm">
            Chọn phương thức thanh toán phù hợp cho tài khoản SuperbAI của bạn.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="credits" className="w-full">
          <TabsList className="mb-3 w-full grid grid-cols-2 gap-1 h-10">
            <TabsTrigger value="subscription" className="flex-1 text-sm data-[state=active]:bg-primary data-[state=active]:text-white">Đăng kí gói</TabsTrigger>
            <TabsTrigger value="credits" className="flex-1 text-sm data-[state=active]:bg-primary data-[state=active]:text-white">Mua credit</TabsTrigger>
          </TabsList>

          <TabsContent value="subscription">
            <SubscriptionPlansTab />
          </TabsContent>

          <TabsContent value="credits" className="space-y-0">
            <div className="space-y-3">
              {/* Hiển thị credit hiện tại */}
              <div className="bg-muted/50 rounded-lg p-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Credit hiện tại:</span>
                  <Badge variant="secondary" className="text-sm font-semibold px-2 py-1">
                    {user?.credit || 0} credits
                  </Badge>
                </div>
              </div>

              {/* Danh sách gói credit */}
              <div className="grid grid-cols-2 gap-2">
                {creditPackages.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPackage === pkg.id
                        ? 'ring-2 ring-primary border-primary'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleSelectPackage(pkg.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h3 className="font-semibold text-sm">{pkg.name}</h3>
                          {pkg.popular && (
                            <Badge variant="default" className="text-[10px] mt-0.5 px-1">
                              Phổ biến
                            </Badge>
                          )}
                        </div>
                        {selectedPackage === pkg.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold">${pkg.amount}</span>
                          <span className="text-xs text-muted-foreground">USD</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Coins className="h-3 w-3 text-yellow-500" />
                          <span className="font-semibold text-sm">{pkg.credits} credits</span>
                        </div>
                        
                        {pkg.bonus && (
                          <Badge variant="outline" className="text-[9px] text-green-600 border-green-600 px-1">
                            {pkg.bonus}
                          </Badge>
                        )}
                        
                        <p className="text-xs text-muted-foreground">{pkg.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Nút PayPal Smart Buttons */}
              {showPayPal && (
                <div className="mt-3 flex flex-col items-center">
                  <div ref={paypalRef} className="w-full" />
                  {isProcessing && <div className="mt-1 text-sm text-muted-foreground">Đang xử lý...</div>}
                </div>
              )}

              {/* Thông tin bổ sung */}
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2">
                <div className="flex items-start gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="space-y-0.5">
                    <h4 className="font-medium text-xs bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Thanh toán an toàn</h4>
                    <p className="text-[10px] text-muted-foreground">
                      Thanh toán được xử lý bởi PayPal. Thông tin thanh toán của bạn được bảo mật hoàn toàn.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-2">
          <button 
            className="px-4 py-2 text-sm text-white font-medium rounded-md transition-all hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #D1D5DB'
            }}
            onClick={handleClose} 
            disabled={isProcessing}
          >
            Hủy
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
