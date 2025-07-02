import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Save, 
  Send, 
  Eye, 
  Edit3,
  TestTube,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  Loader,
  Settings,
  FileText,
  Users,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Copy,
  Download,
  Zap,
  Server
} from 'lucide-react';
import { useEmailTemplates } from '../../hooks/useEmailTemplates';
import { useEmailService } from '../../hooks/useEmailService';
import { useSMTPSettings } from '../../hooks/useSMTPSettings';
import { EmailTemplate, EmailLog } from '../../types';

const EmailManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'templates' | 'logs'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    description: '',
    enabled: true
  });

  const { 
    templates, 
    logs, 
    loading, 
    error, 
    updateTemplate, 
    testTemplate, 
    fetchLogs,
    resetError 
  } = useEmailTemplates();

  const { sendActualEmail } = useEmailService();
  const { settings: smtpSettings } = useSMTPSettings();

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Clear error after 8 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => resetError(), 8000);
      return () => clearTimeout(timer);
    }
  }, [error, resetError]);

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      description: template.description || '',
      enabled: template.enabled
    });
    setIsEditing(true);
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setSaving(true);
      resetError();

      await updateTemplate(selectedTemplate.id, formData);
      setSuccessMessage('Email template updated successfully!');
      setIsEditing(false);
      setSelectedTemplate(null);
    } catch (err) {
      console.error('Error saving template:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestTemplate = async () => {
    if (!selectedTemplate || !testEmail.trim()) return;

    try {
      setIsTesting(true);
      resetError();

      // First create the email log entry
      const emailLog = await testTemplate(selectedTemplate.id, testEmail.trim());
      
      if (emailLog) {
        // Then actually send the email via SMTP
        const result = await sendActualEmail(
          testEmail.trim(),
          emailLog.subject,
          emailLog.body,
          'Test User'
        );

        if (result.success) {
          setSuccessMessage(`✅ Test email sent successfully to ${testEmail}!`);
        } else {
          setSuccessMessage(`⚠️ Test email prepared but sending failed: ${result.message}`);
        }
      }
      
      setTestEmail('');
    } catch (err) {
      console.error('Error sending test email:', err);
    } finally {
      setIsTesting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedTemplate(null);
    setFormData({
      name: '',
      subject: '',
      body: '',
      description: '',
      enabled: true
    });
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.recipient_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.recipient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return CheckCircle;
      case 'failed': return AlertCircle;
      case 'pending': return Clock;
      default: return Clock;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccessMessage('Copied to clipboard!');
  };

  const exportLogs = () => {
    const csvContent = [
      ['Date', 'Template', 'Recipient', 'Subject', 'Status'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.created_at).toLocaleDateString(),
        log.template_id,
        log.recipient_email,
        `"${log.subject}"`,
        log.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Mail className="h-8 w-8 text-primary-500" />
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading email management...</p>
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
          <button
            onClick={resetError}
            className="text-red-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* SMTP Status Warning */}
      {!smtpSettings?.enabled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-yellow-700 font-medium">SMTP is not enabled</p>
            <p className="text-yellow-600 text-sm">Email templates are ready, but emails won't be sent until SMTP is configured and enabled.</p>
          </div>
          <a
            href="#"
            onClick={() => window.location.hash = '#smtp'}
            className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
          >
            Configure SMTP →
          </a>
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
              <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
              <p className="text-gray-600">Manage email templates and monitor email delivery</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* SMTP Status Indicator */}
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
              smtpSettings?.enabled 
                ? 'bg-green-50 text-green-700' 
                : 'bg-gray-50 text-gray-600'
            }`}>
              <Server className="h-4 w-4" />
              <span>SMTP {smtpSettings?.enabled ? 'Enabled' : 'Disabled'}</span>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'templates'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Templates ({templates.length})
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'logs'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <Calendar className="h-4 w-4 inline mr-2" />
                Logs ({logs.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'templates' ? (
        /* Email Templates Tab */
        <div className="space-y-8">
          {isEditing ? (
            /* Template Editor */
            <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Edit Template: {selectedTemplate?.name}
                </h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleSaveTemplate}
                    disabled={isSaving}
                    className="bg-gradient-primary text-white px-6 py-3 rounded-xl hover:shadow-green transition-all duration-200 flex items-center space-x-2 font-medium disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      disabled={isSaving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Brief description of when this template is used"
                      disabled={isSaving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      disabled={isSaving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Body</label>
                    <textarea
                      rows={12}
                      value={formData.body}
                      onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none font-mono text-sm"
                      disabled={isSaving}
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="enabled"
                      checked={formData.enabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      disabled={isSaving}
                    />
                    <label htmlFor="enabled" className="text-sm font-medium text-gray-900">
                      Template Enabled
                    </label>
                  </div>
                </div>

                {/* Preview & Test */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Available Variables</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        '{{user_name}}',
                        '{{article_title}}',
                        '{{comment_content}}',
                        '{{admin_reply}}',
                        '{{admin_name}}',
                        '{{site_name}}',
                        '{{article_url}}'
                      ].map((variable) => (
                        <button
                          key={variable}
                          onClick={() => copyToClipboard(variable)}
                          className="text-left p-2 bg-white rounded border hover:bg-primary-50 hover:border-primary-200 transition-colors font-mono"
                        >
                          {variable}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`border rounded-xl p-6 ${
                    smtpSettings?.enabled 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <h4 className={`font-medium mb-4 ${
                      smtpSettings?.enabled ? 'text-blue-900' : 'text-yellow-900'
                    }`}>
                      {smtpSettings?.enabled ? 'Test Template' : 'Test Template (SMTP Disabled)'}
                    </h4>
                    <div className="space-y-4">
                      <input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="Enter test email address"
                        className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                          smtpSettings?.enabled ? 'border-blue-200' : 'border-yellow-200'
                        }`}
                        disabled={isTesting}
                      />
                      <button
                        onClick={handleTestTemplate}
                        disabled={!testEmail.trim() || isTesting}
                        className={`w-full text-white px-4 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium ${
                          smtpSettings?.enabled 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'bg-yellow-600 hover:bg-yellow-700'
                        }`}
                      >
                        {isTesting ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <TestTube className="h-4 w-4" />
                            <span>
                              {smtpSettings?.enabled ? 'Send Test Email' : 'Prepare Test Email'}
                            </span>
                          </>
                        )}
                      </button>
                      {!smtpSettings?.enabled && (
                        <p className="text-xs text-yellow-700">
                          Test will prepare the email but won't send it until SMTP is enabled.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Templates List */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 hover:shadow-medium transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          template.enabled 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {template.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subject</label>
                      <p className="text-sm text-gray-900 truncate">{template.subject}</p>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Body Preview</label>
                      <p className="text-sm text-gray-600 line-clamp-3">{template.body.substring(0, 100)}...</p>
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-6">
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="flex-1 bg-primary-50 text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-100 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Email Logs Tab */
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by email, name, or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm appearance-none min-w-32"
                  >
                    <option value="all">All Status</option>
                    <option value="sent">Sent</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                
                <button
                  onClick={fetchLogs}
                  className="bg-gray-100 text-gray-600 px-4 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
                
                <button
                  onClick={exportLogs}
                  className="bg-primary-50 text-primary-600 px-4 py-3 rounded-xl hover:bg-primary-100 transition-all duration-200 flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Email Logs */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Template
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLogs.map((log) => {
                    const StatusIcon = getStatusIcon(log.status);
                    
                    return (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{log.recipient_name}</div>
                            <div className="text-sm text-gray-500">{log.recipient_email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                            {log.template_id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{log.subject}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {log.status}
                          </span>
                          {log.error_message && (
                            <div className="text-xs text-red-600 mt-1 truncate max-w-xs" title={log.error_message}>
                              {log.error_message}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div>{new Date(log.created_at).toLocaleDateString()}</div>
                          <div>{new Date(log.created_at).toLocaleTimeString()}</div>
                          {log.sent_at && log.sent_at !== log.created_at && (
                            <div className="text-xs text-green-600">
                              Sent: {new Date(log.sent_at).toLocaleTimeString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => copyToClipboard(log.body)}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                            title="Copy email content"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredLogs.length === 0 && (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No email logs found</p>
                <p className="text-gray-400">Email logs will appear here when emails are sent</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailManagement;