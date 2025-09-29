import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { createWorkspace } from '../services/api';

const OnboardingCreateWorkspace = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = React.useState({
    name: '',
    businessType: '',
    language: 'vi',
    location: 'VN',
    description: '',
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await createWorkspace(form);
      const wsId = res?.data?.id;
      if (wsId) {
        localStorage.setItem('selectedWorkspace', wsId);
        window.dispatchEvent(new Event('workspaceChanged'));
        // Làm tươi cache danh sách workspace để các màn sau đọc được ngay
        queryClient.invalidateQueries({ queryKey: ['workspaces'] });
        // Điều hướng tiếp tục onboarding
        navigate('/onboarding/company-website', { replace: true });
      } else {
        setError('Tạo workspace thất bại.');
      }
    } catch (e) {
      setError(e?.message || 'Không thể tạo workspace');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-[#18181B] border border-gray-700/50 rounded-2xl p-8 text-white">
        <h1 className="text-2xl font-bold mb-6">Tạo Workspace</h1>
        {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Tên Workspace</label>
            <input className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg px-3 py-2"
                   required value={form.name}
                   onChange={(e) => handleChange('name', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Loại hình kinh doanh</label>
            <input className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg px-3 py-2"
                   value={form.businessType}
                   onChange={(e) => handleChange('businessType', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Ngôn ngữ</label>
              <input className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg px-3 py-2"
                     value={form.language}
                     onChange={(e) => handleChange('language', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Quốc gia/Khu vực</label>
              <input className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg px-3 py-2"
                     value={form.location}
                     onChange={(e) => handleChange('location', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Mô tả</label>
            <textarea className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg px-3 py-2 min-h-[100px]"
                      value={form.description}
                      onChange={(e) => handleChange('description', e.target.value)} />
          </div>
        </div>
        <button type="submit" disabled={submitting}
                className="mt-6 w-full bg-gradient-to-r from-[#25A6E9] to-[#3AF2B0] text-black font-semibold py-3 rounded-lg">
          {submitting ? 'Đang tạo...' : 'Tạo workspace'}
        </button>
      </form>
    </div>
  );
};

export default OnboardingCreateWorkspace;


