import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Save, 
  TestTube, 
  Shield, 
  Server,
  Key,
  User,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader,
  Settings,
  RefreshCw,
  X,
  Zap,
  Globe
} from 'lucide-react';
import { useSMTPSettings } from '../../hooks/useSMTPSettings';

const SMTPSettings: React.FC = () => {
  const { settings, loading, error, updateSettings, testConnection, fetchSettings, resetError } = useSMTPSettings();
  const [formData, setFormData] = useState({
    host: '',
    port: 587,
    username: '',
    password: '',
    from_email: '',
    from_name: '',
    encryption: 'tls' as 'none' | 'tls' | 'ssl',
    enabled: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData({
        host: settings.host,
        port: settings.port,
        username: settings.username,
        password: settings.password,
        from_email: settings.from_email,
        from_name: settings.from_name,
        encryption: settings.encryption,
        enabled: settings.enabled
      });
    }
  }, [settings]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (testResult) {
      const timer = setTimeout(() => setTestResult(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [testResult]);

  const handleSave = async () => {
    try {
      setSaving(true);
      resetError();
      
      // Validate required fields if enabling SMTP
      if (formData.enabled) {
        if (!formData.host.trim()) {
          throw new Error('SMTP host is required when enabling SMTP');
        }
        if (!formData.username.trim()) {
          throw new Error('Username is required when enabling SMTP');
        }
        if (!formData.password.trim()) {
          throw new Error('Password is required when enabling SMTP');
        }
        if (!formData.from_email.trim()) {
          throw new Error('From email is required when enabling SMTP');
        }
        if (!formData.from_email.includes('@')) {
          throw new Error('Please enter a valid from email address');
        }
      }

      console.log('Saving SMTP settings:', formData);
      
      await updateSettings(formData);
      setSuccessMessage('SMTP settings saved successfully! Email notifications are now active.');
    } catch (err) {
      console.error('Error saving SMTP settings:', err);
      // Error is handled by the hook and displayed via the error state
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      resetError();
      
      if (!formData.enabled) {
        setTestResult({
          success: false,
          message: 'SMTP is disabled. Enable it first to test the connection.'
        });
        return;
      }

      // Validate required fields
      if (!formData.host.trim() || !formData.username.trim() || !formData.password.trim() || !formData.from_email.trim()) {
        setTestResult({
          success: false,
          message: 'Please fill in all required fields before testing.'
        });
        return;
      }

      const result = await testConnection(formData);
      setTestResult(result);
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Test failed'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleRefresh = async () => {
    resetError();
    await fetchSettings();
  };

  const commonProviders = [
    {
      name: 'Gmail',
      host: 'smtp.gmail.com',
      port: 587,
      encryption: 'tls' as const,
      note: 'Use App Password instead of regular password'
    },
    {
      name: 'Outlook/Hotmail',
      host: 'smtp-mail.outlook.com',
      port: 587,
      encryption: 'tls' as const,
      note: 'Use your regular email credentials'
    },
    {
      name: 'Yahoo',
      host: 'smtp.mail.yahoo.com',
      port: 587,
      encryption: 'tls' as const,
      note: 'Enable "Less secure app access" or use App Password'
    },
    {
      name: 'SendGrid',
      host: 'smtp.sendgrid.net',
      port: 587,
      encryption: 'tls' as const,
      note: 'Use "apikey" as username and your API key as password'
    }
  ];

  const loadProvider = (provider: typeof commonProviders[0]) => {
    setFormData(prev => ({
      ...prev,
      host: provider.host,
      port: provider.port,
      encryption: provider.encryption
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Mail className="h-8 w-8 text-primary-500" />
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading SMTP settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          <p className="text-green-700 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Test Result */}
      {testResult && (
        <div className={`border rounded-2xl p-4 flex items-center space-x-3 ${
          testResult.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          {testResult.success ? (
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          )}
          <p className={`font-medium ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
            {testResult.message}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-700 font-medium">{error}</p>
            <p className="text-red-600 text-sm mt-1">
              If this error persists, please check your database connection or contact support.
            </p>
          </div>
          <button
            onClick={resetError}
            className="text-red-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-card rounded-2xl shadow-soft p-8 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SMTP Settings</h1>
              <p className="text-gray-600">Configure email server for automated notifications</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Status Indicator */}
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${
              formData.enabled 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-gray-50 text-gray-600 border border-gray-200'
            }`}>
              {formData.enabled ? (
                <Zap className="h-4 w-4 text-green-600" />
              ) : (
                <Globe className="h-4 w-4 text-gray-500" />
              )}
              <span className="font-medium">
                {formData.enabled ? 'Email Active' : 'Email Inactive'}
              </span>
            </div>

            <button
              onClick={handleRefresh}
              className="bg-gray-100 text-gray-600 px-4 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center space-x-2 font-medium"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleTest}
              disabled={testing || !formData.enabled}
              className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-all duration-200 flex items-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4" />
                  <span>Test Connection</span>
                </>
              )}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-primary text-white px-6 py-3 rounded-xl hover:shadow-green transition-all duration-200 flex items-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Setup */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Settings className="h-5 w-5 text-primary-600" />
              <span>Quick Setup</span>
            </h3>
            
            <div className="space-y-3">
              {commonProviders.map((provider, index) => (
                <button
                  key={index}
                  onClick={() => loadProvider(provider)}
                  className="w-full text-left p-4 bg-gray-50 hover:bg-primary-50 rounded-xl transition-colors group"
                >
                  <div className="font-medium text-gray-900 group-hover:text-primary-700">
                    {provider.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {provider.host}:{provider.port}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {provider.note}
                  </div>
                </button>
              ))}
            </div>

            {/* Status */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${formData.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium text-gray-900">
                  SMTP {formData.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {formData.enabled 
                  ? 'Email notifications are active and will be sent automatically' 
                  : 'Email notifications are disabled - no emails will be sent'
                }
              </p>
            </div>
          </div>
        </div>

        {/* SMTP Configuration */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <Server className="h-5 w-5 text-primary-600" />
              <span>SMTP Configuration</span>
            </h3>

            <div className="space-y-6">
              {/* Enable/Disable */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h4 className="font-medium text-gray-900">Enable SMTP Email Service</h4>
                  <p className="text-sm text-gray-600">Turn on automated email notifications for comments</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {/* Server Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host *</label>
                  <div className="flex items-center space-x-3">
                    <Server className="h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.host}
                      onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="smtp.gmail.com"
                      disabled={!formData.enabled}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Port *</label>
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData(prev => ({ ...prev, port: parseInt(e.target.value) || 587 }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="587"
                    disabled={!formData.enabled}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="your-email@gmail.com"
                      disabled={!formData.enabled}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <div className="flex items-center space-x-3">
                    <Key className="h-5 w-5 text-gray-400" />
                    <div className="flex-1 relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        placeholder="Your app password"
                        disabled={!formData.enabled}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={!formData.enabled}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Encryption</label>
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <select
                      value={formData.encryption}
                      onChange={(e) => setFormData(prev => ({ ...prev, encryption: e.target.value as any }))}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      disabled={!formData.enabled}
                    >
                      <option value="none">None</option>
                      <option value="tls">TLS (Recommended)</option>
                      <option value="ssl">SSL</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Email Settings */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Email Settings</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From Email *</label>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.from_email}
                        onChange={(e) => setFormData(prev => ({ ...prev, from_email: e.target.value }))}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        placeholder="noreply@kirods.com"
                        disabled={!formData.enabled}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                    <input
                      type="text"
                      value={formData.from_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, from_name: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Kirods Hosting"
                      disabled={!formData.enabled}
                    />
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-medium text-blue-900 mb-2">🔒 Security & Setup Recommendations</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Use App Passwords instead of regular passwords for Gmail</li>
                  <li>• Enable 2FA on your email account for better security</li>
                  <li>• Use TLS encryption for secure email transmission</li>
                  <li>• Test the connection before saving to ensure it works</li>
                  <li>• Keep your SMTP credentials secure and never share them</li>
                </ul>
              </div>

              {/* Real Email Notice */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h4 className="font-medium text-green-900 mb-2">📧 Real Email Delivery</h4>
                <p className="text-sm text-green-700">
                  Once configured and enabled, this system will send real emails to users when:
                </p>
                <ul className="text-sm text-green-700 mt-2 space-y-1">
                  <li>• Comments are submitted (confirmation to user)</li>
                  <li>• Comments are approved (notification to user)</li>
                  <li>• Admin replies to comments (notification to user)</li>
                  <li>• Comments are rejected or deleted (notification to user)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMTPSettings;