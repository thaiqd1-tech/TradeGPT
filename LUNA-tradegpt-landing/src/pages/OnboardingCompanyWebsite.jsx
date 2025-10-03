import React from 'react';
import { useNavigate } from 'react-router-dom';
import { scrapWorkspaceProfile } from '../services/api';

const OnboardingCompanyWebsite = () => {
  const navigate = useNavigate();
  const [website, setWebsite] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const workspaceId = typeof window !== 'undefined' ? localStorage.getItem('selectedWorkspace') : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!workspaceId) {
      setError('Không tìm thấy workspace.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await scrapWorkspaceProfile({ workspace_id: workspaceId, website_url: website });
      navigate('/onboarding/workspace-profile', { replace: true });
    } catch (e) {
      setError(e?.message || 'Không thể lấy thông tin doanh nghiệp từ website');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-[#18181B] border border-gray-700/50 rounded-2xl p-8 text-white">
        <h1 className="text-2xl font-bold mb-6">Nhập website công ty</h1>
        {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}
        <div>
          <label className="block text-sm mb-1">Website URL</label>
          <input className="w-full bg-[#27272A] border border-gray-600/50 rounded-lg px-3 py-2"
                 type="url"
                 required
                 placeholder="https://your-company.com"
                 value={website}
                 onChange={(e) => setWebsite(e.target.value)} />
        </div>
        <button type="submit" disabled={loading}
                className="mt-6 w-full bg-gradient-to-r from-[#25A6E9] to-[#3AF2B0] text-white font-semibold py-3 rounded-lg">
          {loading ? 'Đang xử lý...' : 'Tiếp tục'}
        </button>
        <button type="button"
                onClick={() => navigate('/onboarding/workspace-profile', { replace: true })}
                className="mt-3 w-full bg-transparent border border-gray-600/60 text-white font-semibold py-3 rounded-lg hover:bg-white/10">
          Bỏ qua
        </button>
      </form>
    </div>
  );
};

export default OnboardingCompanyWebsite;


