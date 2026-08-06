import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineSparkles, HiOutlineMail, HiOutlineArrowLeft } from 'react-icons/hi';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success('Reset instructions sent!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
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
          {sent ? (
            <div className="auth-success">
              <div className="success-icon"><HiOutlineMail size={48} /></div>
              <h2>Check Your Email</h2>
              <p>We've sent password reset instructions to <strong>{email}</strong></p>
              <Link to="/login" className="btn btn-primary btn-lg" style={{ marginTop: '1.5rem', width: '100%' }}>
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="auth-header">
                <h2>Reset Password</h2>
                <p>Enter your email and we'll send you instructions</p>
              </div>

              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div className="input-icon-wrapper">
                    <HiOutlineMail className="input-icon" size={18} />
                    <input
                      id="forgot-email"
                      type="email"
                      className="form-input with-icon"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button
                  id="forgot-submit"
                  type="submit"
                  className="btn btn-primary btn-lg auth-submit"
                  disabled={loading}
                >
                  {loading ? <span className="spinner spinner-sm" /> : 'Send Reset Link'}
                </button>
              </form>

              <div className="auth-footer">
                <Link to="/login" className="back-link">
                  <HiOutlineArrowLeft size={16} /> Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
