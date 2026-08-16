import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useTranslation } from 'react-i18next';
import styles from '../Header.module.css';
import SiteLogo from '../../icons/siteLogoOnSignIn';
import { useModal } from '../../hooks/useModal';
import { useAuth } from '../../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../firebase';

import {
  handleRegister as registerApi,
  handleSignIn as signInApi,
  handleGoogleAuth as googleAuthApi,
  sendEmailVerificationCode,
  verifyEmailCode
} from '../../api/authService';

export default function AuthModal({ openModal, closeModal }) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [authMode, setAuthMode] = useState('signin');
  const [authMethod, setAuthMethod] = useState('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+995');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [otpStep, setOtpStep] = useState('enter-phone');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [emailVerificationStep, setEmailVerificationStep] = useState('enter-email');
  const [emailVerificationCode, setEmailVerificationCode] = useState('');

  useEffect(() => {
    if (openModal && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
    }
  }, [openModal]);

  const handleClose = () => {
    setAuthMode('signin');
    setOtpStep('enter-phone');
    setEmail('');
    setPassword('');
    setOtpCode('');
    setError('');
    setMessage('');
    closeModal();
    setPhoneNumber('');
    setLoading(false);
    setConfirmationResult(null);
    setOtpCode?.('');
    setEmailVerificationStep('enter-email');
    setEmailVerificationCode('');
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      } catch (e) {
        console.error('Recaptcha clear error:', e);
      }
    }
  };

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async tokenResponse => {
      setLoading(true);
      const result = await googleAuthApi(tokenResponse.access_token);

      if (result.success) {
        localStorage.setItem('token', result.data.token);

        // 🛠️ შესწორება: ვამოწმებთ user-ის არსებობას
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
        }

        login(result.user);
        handleClose();
      } else {
        setError(result.error);
      }
      setLoading(false);
    },
    flow: 'implicit',
    onError: () => setError('Google Login Failed')
  });

  // 📱 1. SMS-ის გაგზავნა
  const handleSendSms = async () => {
    if (!phoneNumber) {
      setError(t('auth.errors.enterMobileNumber'));
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const fullPhone = `${countryCode}${phoneNumber}`;
      const appVerifier = window.recaptchaVerifier;

      const confirmation = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
      setConfirmationResult(confirmation);
      setOtpStep('enter-otp');
      setMessage('SMS კოდი გაიგზავნა!');
    } catch (err) {
      console.error('SMS Send Error:', err);
      setError('SMS-ის გაგზავნა ვერ მოხერხდა: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 📲 2. SMS კოდის დამოწმება
  const handleVerifyOtp = async () => {
    if (!otpCode) {
      setError('შეიყვანეთ SMS კოდი');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await confirmationResult.confirm(otpCode);
      const firebaseToken = await result.user.getIdToken();

      const res = await fetch('http://localhost:5001/api/auth/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseToken })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);

        // 🛠️ შესწორება: ვამოწმებთ user-ის არსებობას
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        login(data.user);
        setMessage('წარმატებით შეხვედით!');
        setTimeout(() => handleClose(), 1000);
      } else {
        setError(data.message || 'ავტორიზაცია ვერ მოხერხდა');
      }
    } catch (err) {
      console.error('OTP Verify Error:', err);
      setError('არასწორი კოდი!');
    } finally {
      setLoading(false);
    }
  };

  // ✉️ Email Sign In / Sign Up ლოგიკა
  const handleEmailAuth = async () => {
    if (!email || !password) {
      setError(t('auth.errors.enterEmailAndPassword'));
      return;
    }

    if (authMode === 'signup' && !agreeTerms) {
      setError(t('auth.errors.agreeTerms'));
      return;
    }

    setLoading(true);
    setError('');

    const apiCall = authMode === 'signin' ? signInApi : registerApi;
    const result = await apiCall({
      method: 'email',
      email,
      password,
      agreeTerms,
      agreeMarketing
    });

    if (result.success) {
      localStorage.setItem('token', result.data.token);

      // 🛠️ შესწორება: ვამოწმებთ user-ის არსებობას
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
      }

      login(result.user);
      setMessage(result.message);
      setTimeout(() => handleClose(), 1000);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const validateEmail = emailStr => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(emailStr);
  };

  // 📧 Send email verification code
  const handleSendEmailVerification = async () => {
    if (!validateEmail(email)) {
      setError(t('auth.errors.enterEmail'));
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await sendEmailVerificationCode(email);
      if (result.success) {
        setEmailVerificationStep('enter-code');
        setMessage('Verification code sent to your email!');
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Email verification error:', err);
      setError('Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  // 📧 Verify email code
  const handleVerifyEmailCode = async () => {
    if (!emailVerificationCode) {
      setError('Please enter verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await verifyEmailCode(email, emailVerificationCode);
      if (result.success) {
        // After verification, proceed with registration
        const registerResult = await registerApi({
          method: 'email',
          email,
          password,
          agreeTerms,
          agreeMarketing,
          verified: true
        });

        if (registerResult.success) {
          localStorage.setItem('token', registerResult.data.token);
          if (registerResult.user) {
            localStorage.setItem('user', JSON.stringify(registerResult.user));
          }
          login(registerResult.user);
          setMessage('Registration successful!');
          setTimeout(() => handleClose(), 1000);
        } else {
          setError(registerResult.error);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Email code verification error:', err);
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (authMethod === 'phone') {
        if (otpStep === 'enter-phone') {
          handleSendSms();
        } else {
          handleVerifyOtp();
        }
      } else {
        if (authMode === 'signup' && emailVerificationStep === 'enter-code') {
          handleVerifyEmailCode();
        } else if (authMode === 'signup' && emailVerificationStep === 'enter-email') {
          handleSendEmailVerification();
        } else {
          handleEmailAuth();
        }
      }
    }
  };

  useModal(openModal);

  if (!openModal) return null;

  return (
    <div className={styles.authModalOverlay} onClick={handleClose}>
      <div className={styles.authModalContent} onClick={e => e.stopPropagation()}>
        <div id="recaptcha-container"></div>

        <button className={styles.authModalClose} onClick={handleClose}>
          <FiX />
        </button>

        <div className={styles.authModalLogo}>
          <div className={styles.authModalLogoIcon}>
            <SiteLogo className={styles.authModalLogoIcon} />
          </div>
        </div>

        <h2 className={styles.authModalTitle}>{t('auth.title')}</h2>

        {/* Auth Method Switcher (Phone vs Email) */}
        <div className={styles.authToggle}>
          <button
            className={`${styles.authToggleButton} ${authMethod === 'phone' ? styles.authToggleActive : ''}`}
            onClick={() => {
              setAuthMethod('phone');
              setOtpStep('enter-phone');
              setError('');
            }}>
            {t('auth.byPhone')}
          </button>
          <button
            className={`${styles.authToggleButton} ${authMethod === 'email' ? styles.authToggleActive : ''}`}
            onClick={() => {
              setAuthMethod('email');
              setError('');
            }}>
            {t('auth.byEmail')}
          </button>
        </div>

        {/* 📱 1. PHONE AUTH (authMode-ის გარეშე!) */}
        {authMethod === 'phone' ? (
          <div className={styles.authForm}>
            {otpStep === 'enter-phone' ? (
              <div className={styles.phoneInputContainer}>
                <select
                  className={styles.countryCodeSelect}
                  value={countryCode}
                  onChange={e => setCountryCode(e.target.value)}>
                  <option value="+995">+995</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+49">+49</option>
                  <option value="+7">+7</option>
                </select>
                <input
                  type="tel"
                  className={styles.authInput}
                  placeholder={t('auth.mobileNumber')}
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            ) : (
              <input
                type="text"
                className={styles.authInput}
                placeholder="შეიყვანეთ 6-ნიშნა SMS კოდი"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            )}

            {error && <div className={styles.authErrorMessage}>{error}</div>}
            {message && <div className={styles.authSuccessMessage}>{message}</div>}

            <button
              className={styles.authPrimaryButton}
              onClick={otpStep === 'enter-phone' ? handleSendSms : handleVerifyOtp}
              disabled={loading}>
              {loading ? t('auth.signingIn') : otpStep === 'enter-phone' ? t('auth.getCode') : 'დადასტურება'}
            </button>
          </div>
        ) : (
          /* ✉️ 2. EMAIL AUTH (Sign In / Sign Up) */
          <div className={styles.authForm}>
            {authMode === 'signup' && emailVerificationStep === 'enter-email' ? (
              <>
                <input
                  type="email"
                  className={styles.authInput}
                  placeholder={t('auth.emailAddress')}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <input
                  type="password"
                  className={styles.authInput}
                  placeholder={t('auth.password')}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                <div className={styles.authCheckboxes}>
                  <label className={styles.authCheckboxLabel}>
                    <input
                      type="checkbox"
                      className={styles.authCheckbox}
                      checked={agreeTerms}
                      onChange={e => setAgreeTerms(e.target.checked)}
                      onKeyDown={handleKeyDown}
                    />
                    <span className={styles.authCheckboxText}>{t('auth.agreeTerms')}</span>
                  </label>
                  <label className={styles.authCheckboxLabel}>
                    <input
                      type="checkbox"
                      className={styles.authCheckbox}
                      checked={agreeMarketing}
                      onChange={e => setAgreeMarketing(e.target.checked)}
                      onKeyDown={handleKeyDown}
                    />
                    <span className={styles.authCheckboxText}>{t('auth.agreeMarketing')}</span>
                  </label>
                </div>

                {error && <div className={styles.authErrorMessage}>{error}</div>}
                {message && <div className={styles.authSuccessMessage}>{message}</div>}

                <button className={styles.authPrimaryButton} onClick={handleSendEmailVerification} disabled={loading}>
                  {loading ? t('auth.signingIn') : 'Send Verification Code'}
                </button>
                <button
                  className={styles.authSecondaryButton}
                  onClick={() => {
                    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                    setEmail('');
                    setPassword('');
                    setError('');
                    setEmailVerificationStep('enter-email');
                    setEmailVerificationCode('');
                  }}>
                  {authMode === 'signin' ? t('auth.signUpButton') : t('auth.signInButton')}
                </button>
              </>
            ) : authMode === 'signup' && emailVerificationStep === 'enter-code' ? (
              <>
                <input
                  type="text"
                  className={styles.authInput}
                  placeholder="Enter verification code"
                  value={emailVerificationCode}
                  onChange={e => setEmailVerificationCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                {error && <div className={styles.authErrorMessage}>{error}</div>}
                {message && <div className={styles.authSuccessMessage}>{message}</div>}

                <button className={styles.authPrimaryButton} onClick={handleVerifyEmailCode} disabled={loading}>
                  {loading ? t('auth.signingIn') : 'Verify Code'}
                </button>

                <button
                  className={styles.authSecondaryButton}
                  onClick={() => {
                    setEmailVerificationStep('enter-email');
                    setEmailVerificationCode('');
                  }}>
                  Back
                </button>
              </>
            ) : (
              <>
                <input
                  type="email"
                  className={styles.authInput}
                  placeholder={t('auth.emailAddress')}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <input
                  type="password"
                  className={styles.authInput}
                  placeholder={t('auth.password')}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                {error && <div className={styles.authErrorMessage}>{error}</div>}
                {message && <div className={styles.authSuccessMessage}>{message}</div>}

                <button className={styles.authPrimaryButton} onClick={handleEmailAuth} disabled={loading}>
                  {loading
                    ? t('auth.signingIn')
                    : authMode === 'signin'
                      ? t('auth.signInButton')
                      : t('auth.signUpButton')}
                </button>

                <button
                  className={styles.authSecondaryButton}
                  onClick={() => {
                    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                    setEmail('');
                    setPassword('');
                    setError('');
                    setEmailVerificationStep('enter-email');
                    setEmailVerificationCode('');
                  }}>
                  {authMode === 'signin' ? t('auth.signUpButton') : t('auth.signInButton')}
                </button>
              </>
            )}
          </div>
        )}

        <button className={styles.authGoogleButton} onClick={triggerGoogleLogin}>
          <FcGoogle className={styles.authGoogleIcon} />
          {t('auth.signInWithGoogle')}
        </button>

        <p
          style={{
            fontSize: '12px',
            color: '#9ca3af',
            marginTop: '8px',
            textAlign: 'center'
          }}>
          {t('auth.recaptcha.protected')}{' '}
          <a
            href="https://policies.google.com/privacy"
            style={{ textDecoration: 'underline', color: 'inherit' }}
            target="_blank"
            rel="noreferrer">
            {t('auth.recaptcha.privacyPolicy')}
          </a>{' '}
          {t('auth.recaptcha.and')}{' '}
          <a
            href="https://policies.google.com/terms"
            style={{ textDecoration: 'underline', color: 'inherit' }}
            target="_blank"
            rel="noreferrer">
            {t('auth.recaptcha.termsOfService')}
          </a>{' '}
          {t('auth.recaptcha.apply')}
        </p>
      </div>
    </div>
  );
}
