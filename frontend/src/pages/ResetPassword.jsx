import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowLeft,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineLockClosed,
  HiOutlineSparkles,
} from 'react-icons/hi';
import './Auth.css';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Reset token is missing');
      return;
    }

    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password)) {
      toast.error('Password needs 8+ chars with upper, lower, number, and symbol');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      toast.success('Password reset successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-orb orb-1" />
        <div className="auth-bg-orb orb-2" />
        <div className="auth-bg-orb orb-3" />
      </div>

      <div className="auth-container animate-scale-in">
        <div className="auth-logo">
          <div className="logo-icon">
            <HiOutlineSparkles size={28} />
          </div>
          <h1 className="gradient-text">TaskFlow AI</h1>
        </div>

        <div className="auth-card glass">
          <div className="auth-header">
            <h2>Set New Password</h2>
            <p>Create a stronger password for your account</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-icon-wrapper">
                <HiOutlineLockClosed className="input-icon" size={18} />
                <input
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input with-icon"
                  placeholder="8+ chars, upper, number, symbol"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-icon-wrapper">
                <HiOutlineLockClosed className="input-icon" size={18} />
                <input
                  id="reset-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input with-icon"
                  placeholder="Repeat your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              id="reset-submit"
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={loading}
            >
              {loading ? <span className="spinner spinner-sm" /> : 'Reset Password'}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/login" className="back-link">
              <HiOutlineArrowLeft size={16} /> Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
