import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineSparkles, HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import './Auth.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
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
      await signup(name, email, password);
      toast.success('Account created! Welcome to TaskFlow AI');
      navigate('/');
    } catch (error) {
      const validationMessage = error.response?.data?.errors?.[0]?.message;
      const message = validationMessage
        || error.response?.data?.message
        || (error.request ? 'Cannot reach the server. Check that the backend is running.' : 'Signup failed. Please try again.');
      toast.error(message);
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
            <h2>Create Account</h2>
            <p>Start managing your tasks smarter</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-icon-wrapper">
                <HiOutlineUser className="input-icon" size={18} />
                <input
                  id="signup-name"
                  type="text"
                  className="form-input with-icon"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-icon-wrapper">
                <HiOutlineMail className="input-icon" size={18} />
                <input
                  id="signup-email"
                  type="email"
                  className="form-input with-icon"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon-wrapper">
                <HiOutlineLockClosed className="input-icon" size={18} />
                <input
                  id="signup-password"
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
                  id="signup-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input with-icon"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              id="signup-submit"
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={loading}
            >
              {loading ? <span className="spinner spinner-sm" /> : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
