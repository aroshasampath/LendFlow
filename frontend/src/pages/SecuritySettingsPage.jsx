import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { 
  ShieldCheck, 
  KeyRound, 
  QrCode, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Copy,
  Smartphone,
  Eye,
  LogOut
} from 'lucide-react';

export const SecuritySettingsPage = () => {
  const { user, updateUser, logout } = useAuth();

  // Password Change State
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // MFA Modal State
  const [mfaModalOpen, setMfaModalOpen] = useState(false);
  const [mfaStep, setMfaStep] = useState('initial'); // 'initial', 'qr', 'backup'
  const [mfaSetupData, setMfaSetupData] = useState(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);

  // Disable MFA State
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [disableError, setDisableError] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);

  // 1. Password Change Handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassLoading(true);
    setPassError('');
    setPassSuccess('');

    try {
      const res = await api.post('/auth/change-password', passData);
      setPassSuccess(res.message);
      setPassData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setPassError(err.message || 'Unable to update password. Please check your credentials.');
    } finally {
      setPassLoading(false);
    }
  };

  // 2. Start MFA Setup
  const handleStartMfaSetup = async () => {
    setMfaLoading(true);
    setMfaError('');
    try {
      const res = await api.post('/auth/mfa/setup');
      setMfaSetupData(res.data);
      setMfaStep('qr');
      setMfaModalOpen(true);
    } catch (err) {
      setMfaError(err.message || 'Unable to generate two-factor QR code.');
    } finally {
      setMfaLoading(false);
    }
  };

  // 3. Confirm & Enable MFA
  const handleConfirmMfa = async (e) => {
    e.preventDefault();
    setMfaLoading(true);
    setMfaError('');
    try {
      const res = await api.post('/auth/mfa/enable', { totpCode: verifyCode });
      setBackupCodes(res.data.backupCodes || []);
      setMfaStep('backup');
      updateUser({ mfaEnabled: true });
    } catch (err) {
      setMfaError(err.message || 'The verification code you entered is invalid. Please try again.');
    } finally {
      setMfaLoading(false);
    }
  };

  // 4. Disable MFA
  const handleDisableMfa = async (e) => {
    e.preventDefault();
    setDisableLoading(true);
    setDisableError('');
    try {
      await api.post('/auth/mfa/disable', {
        password: disablePassword,
        totpCode: disableCode,
      });
      updateUser({ mfaEnabled: false });
      setDisableModalOpen(false);
      setDisablePassword('');
      setDisableCode('');
    } catch (err) {
      setDisableError(err.message || 'Unable to disable two-factor authentication.');
    } finally {
      setDisableLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primaryLight text-brand-primary text-xs font-semibold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          Stage 4: Security & Credentials
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Security Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your account protection, two-factor authentication (TOTP), and password credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Two-Factor Authentication & Account Overview */}
        <div className="lg:col-span-1 space-y-6">
          {/* Account Identity Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white font-bold text-lg flex items-center justify-center">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-slate-900 truncate">{user?.fullName}</p>
                <p className="text-xs text-slate-500 font-mono truncate">@{user?.username}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-medium text-slate-800 truncate ml-2">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Email Status:</span>
                <Badge status={user?.isEmailVerified ? 'completed' : 'pending'}>
                  {user?.isEmailVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Role:</span>
                <span className="font-semibold uppercase text-slate-700">{user?.role}</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              fullWidthOnMobile
              className="w-full text-xs text-brand-danger border-brand-danger hover:bg-red-50 mt-2"
              onClick={logout}
              icon={LogOut}
            >
              Log Out of Session
            </Button>
          </div>

          {/* Two-Factor Authentication Status Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-brand-primary" />
                <h3 className="font-bold text-slate-900 text-sm">Two-Factor Authentication</h3>
              </div>
              <Badge status={user?.mfaEnabled ? 'active' : 'default'}>
                {user?.mfaEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Enhance account security by requiring a 6-digit TOTP verification code from Google Authenticator or Authy during sign-in.
            </p>

            {user?.mfaEnabled ? (
              <Button
                variant="danger"
                size="sm"
                fullWidthOnMobile
                onClick={() => setDisableModalOpen(true)}
                className="w-full text-xs"
              >
                Disable Two-Factor Auth
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                fullWidthOnMobile
                loading={mfaLoading}
                onClick={handleStartMfaSetup}
                className="w-full text-xs"
              >
                Enable Two-Factor Auth
              </Button>
            )}
          </div>
        </div>

        {/* Right Column: Password Change Form */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-brand-primary" />
              Change Password
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Ensure your new password contains at least 8 characters, numbers, and symbols.
            </p>
          </div>

          {passError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-brand-danger text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{passError}</span>
            </div>
          )}

          {passSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{passSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              placeholder="••••••••••••"
              value={passData.currentPassword}
              onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
              required
              icon={Lock}
            />

            <Input
              label="New Password"
              name="newPassword"
              type="password"
              placeholder="••••••••••••"
              value={passData.newPassword}
              onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
              required
              icon={Lock}
              helperText="Min 8 characters with uppercase, lowercase, digits, and special characters."
            />

            <Input
              label="Confirm New Password"
              name="confirmNewPassword"
              type="password"
              placeholder="••••••••••••"
              value={passData.confirmNewPassword}
              onChange={(e) => setPassData({ ...passData, confirmNewPassword: e.target.value })}
              required
              icon={Lock}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidthOnMobile
              loading={passLoading}
            >
              Update Password
            </Button>
          </form>
        </div>
      </div>

      {/* MFA Setup Modal */}
      <Modal
        isOpen={mfaModalOpen}
        onClose={() => setMfaModalOpen(false)}
        title="Setup Two-Factor Authentication"
      >
        {mfaStep === 'qr' && (
          <div className="space-y-4 text-center">
            <p className="text-xs text-slate-600">
              1. Open Google Authenticator or Authy on your mobile phone.<br />
              2. Scan the QR code below or enter the key manually.
            </p>

            {mfaSetupData?.qrCode && (
              <div className="p-3 bg-white border border-slate-200 rounded-2xl inline-block mx-auto shadow-xs">
                <img
                  src={mfaSetupData.qrCode}
                  alt="MFA QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>
            )}

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-700 select-all">
              Key: {mfaSetupData?.secretKey}
            </div>

            {mfaError && (
              <p className="text-xs text-brand-danger font-semibold">{mfaError}</p>
            )}

            <form onSubmit={handleConfirmMfa} className="space-y-3 pt-2 text-left">
              <Input
                label="Enter 6-Digit Code"
                name="verifyCode"
                placeholder="123456"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                required
              />

              <Button
                type="submit"
                variant="primary"
                fullWidthOnMobile
                loading={mfaLoading}
                className="w-full"
              >
                Verify & Enable MFA
              </Button>
            </form>
          </div>
        )}

        {mfaStep === 'backup' && (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Two-Factor Authentication Active</h4>
            <p className="text-xs text-slate-500">
              Save these emergency backup recovery codes in a safe place. You can use them if you lose access to your authenticator device.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 space-y-1 text-center font-bold">
              {backupCodes.map((code, index) => (
                <div key={index}>{code}</div>
              ))}
            </div>

            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => {
                setMfaModalOpen(false);
                setMfaStep('initial');
              }}
            >
              Done & Close
            </Button>
          </div>
        )}
      </Modal>

      {/* Disable MFA Modal */}
      <Modal
        isOpen={disableModalOpen}
        onClose={() => setDisableModalOpen(false)}
        title="Disable Two-Factor Authentication"
      >
        <form onSubmit={handleDisableMfa} className="space-y-4">
          <p className="text-xs text-slate-600">
            For security, please confirm your current account password and a code from your authenticator app to disable MFA.
          </p>

          {disableError && (
            <p className="text-xs text-brand-danger font-semibold">{disableError}</p>
          )}

          <Input
            label="Account Password"
            name="disablePassword"
            type="password"
            placeholder="••••••••••••"
            value={disablePassword}
            onChange={(e) => setDisablePassword(e.target.value)}
            required
          />

          <Input
            label="6-Digit Authenticator Code"
            name="disableCode"
            placeholder="123456"
            maxLength={6}
            value={disableCode}
            onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
            required
          />

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" size="sm" onClick={() => setDisableModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" type="submit" loading={disableLoading}>
              Confirm & Disable
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
