import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const hasFetchedRef = useRef(false);
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      navigate('/login');
      return;
    }

    if (!code) {
      console.error('Missing authorization code');
      navigate('/login');
      return;
    }

    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const requestSession = async (auth_code: string) => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ auth_code }),
          credentials: 'include',
        });

        if (!response.ok) {
          console.error('Backend login failed', response);
          navigate('/login');
          return;
        }

        const data = await response.json();
        await login(data);

        navigate('/');
      } catch (error) {
        console.error('Authentication error:', error);
        navigate('/login');
      }
    };

    requestSession(code);
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Google 로그인 처리 중...</h2>
        <p className="text-gray-600">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}
