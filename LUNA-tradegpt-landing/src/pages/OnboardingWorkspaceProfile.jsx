import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { createWorkspaceProfile, getWorkspaceProfile, updateWorkspaceProfile } from '../services/api';

const OnboardingWorkspaceProfile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const workspaceId = typeof window !== 'undefined' ? localStorage.getItem('selectedWorkspace') : null;
  const [form, setForm] = React.useState({
    brand_name: '',
    business_type: '',
    default_language_code: 'vi',
    default_location_code: 'VN',
    brand_description: '',
    brand_products_services: '',
    website_url: '',
    brand_logo_url: '',
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const load = async () => {
      if (!workspaceId) {
        setError('Không tìm thấy workspace');
        setLoading(false);
        return;
      }
      try {
        const res = await getWorkspaceProfile(workspaceId);
        const data = res?.data;
        if (data) {
          setForm({
            brand_name: data.brand_name || '',
            business_type: data.business_type || '',
            default_language_code: data.default_language_code || 'vi',
            default_location_code: data.default_location_code || 'VN',
            brand_description: data.brand_description || '',
            brand_products_services: data.brand_products_services || '',
            website_url: data.website_url || '',
            brand_logo_url: data.brand_logo_url || '',
          });
        }
      } catch (e) {
        // 404 -> không có profile là hợp lệ
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [workspaceId]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!workspaceId) return;
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, workspace_id: workspaceId };
      const res = await getWorkspaceProfile(workspaceId);
      if (res?.data) {
        await updateWorkspaceProfile(workspaceId, form);
      } else {
        await createWorkspaceProfile(payload);
      }
      // Làm tươi cache workspaces để Dashboard đọc được ngay
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      // Điều hướng qua post-auth để đảm bảo selectedWorkspace hợp lệ và route đúng
      navigate('/post-auth', { replace: true });
    } catch (e) {
      setError(e?.message || 'Không thể lưu thông tin workspace');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900 flex items-center justify-center">
        <div className="text-white">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-[#18181B] border border-gray-700/50 rounded-2xl p-8 text-white">
        <h1 className="text-2xl font-bold mb-6">Thông tin Workspace</h1>
        {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Tên thương hiệu</label>
            <input className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg px-3 py-2" value={form.brand_name} onChange={(e) => handleChange('brand_name', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Loại hình kinh doanh</label>
            <input className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg px-3 py-2" value={form.business_type} onChange={(e) => handleChange('business_type', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Ngôn ngữ</label>
            <input className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg px-3 py-2" value={form.default_language_code} onChange={(e) => handleChange('default_language_code', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Quốc gia/Khu vực</label>
            <input className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg px-3 py-2" value={form.default_location_code} onChange={(e) => handleChange('default_location_code', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Mô tả thương hiệu</label>
            <textarea className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg px-3 py-2 min-h-[100px]" value={form.brand_description} onChange={(e) => handleChange('brand_description', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Sản phẩm/Dịch vụ</label>
            <textarea className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg px-3 py-2 min-h-[80px]" value={form.brand_products_services} onChange={(e) => handleChange('brand_products_services', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Website</label>
            <input className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg px-3 py-2" value={form.website_url} onChange={(e) => handleChange('website_url', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Logo URL</label>
            <input className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg px-3 py-2" value={form.brand_logo_url} onChange={(e) => handleChange('brand_logo_url', e.target.value)} />
          </div>
        </div>

        <button type="submit" disabled={saving} className="mt-6 w-full bg-gradient-to-r from-[#25A6E9] to-[#3AF2B0] text-white font-semibold py-3 rounded-lg">
          {saving ? 'Đang lưu...' : 'Hoàn tất và vào Dashboard'}
        </button>
      </form>
    </div>
  );
};

export default OnboardingWorkspaceProfile;


