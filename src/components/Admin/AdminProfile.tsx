import React, { useState, useEffect } from 'react';
import { 
  User, 
  Save, 
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Key,
  Eye,
  EyeOff,
  Edit3,
  Check,
  X,
  Loader,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAdminProfile } from '../../hooks/useAdminProfile';

const AdminProfile: React.FC = () => {
  const { profile, loading, error, updateProfile, changePassword, uploadAvatar, resetError } = useAdminProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [tempProfileData, setTempProfileData] = useState({
    user_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    avatar_url: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Update temp data when profile loads
  useEffect(() => {
    if (profile) {
      setTempProfileData({
        user_id: profile.user_id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => resetError(), 8000);
      return () => clearTimeout(timer);
    }
  }, [error, resetError]);

  const handleEditToggle = () => {
    if (isEditing && profile) {
      // Reset to original values when canceling
      setTempProfileData({
        user_id: profile.user_id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || ''
      });
    }
    setIsEditing(!isEditing);
    resetError();
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      resetError();

      // Validate required fields
      if (!tempProfileData.first_name.trim()) {
        throw new Error('First name is required');
      }
      if (!tempProfileData.last_name.trim()) {
        throw new Error('Last name is required');
      }
      if (!tempProfileData.email.trim()) {
        throw new Error('Email is required');
      }
      if (!tempProfileData.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Prepare updates (exclude user_id as it shouldn't be changed)
      const updates = {
        first_name: tempProfileData.first_name.trim(),
        last_name: tempProfileData.last_name.trim(),
        email: tempProfileData.email.trim(),
        phone: tempProfileData.phone.trim() || null,
        location: tempProfileData.location.trim() || null,
        bio: tempProfileData.bio.trim() || null,
        avatar_url: tempProfileData.avatar_url || null
      };

      console.log('Saving profile updates:', updates);
      
      await updateProfile(updates);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      // Error is handled by the hook and displayed via the error state
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      setChangingPassword(true);
      resetError();

      // Validate passwords
      if (!passwordData.currentPassword) {
        throw new Error('Current password is required');
      }
      if (!passwordData.newPassword) {
        throw new Error('New password is required');
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('New passwords do not match');
      }
      if (passwordData.newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      // Reset form and close
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
      setSuccessMessage('Password changed successfully!');
    } catch (err) {
      console.error('Error changing password:', err);
      // Error is handled by the hook and displayed via the error state
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      resetError();
      
      const avatarUrl = await uploadAvatar(file);
      setTempProfileData(prev => ({ ...prev, avatar_url: avatarUrl }));
      
      // If not in editing mode, save immediately
      if (!isEditing) {
        try {
          await updateProfile({ avatar_url: avatarUrl });
          setSuccessMessage('Avatar updated successfully!');
        } catch (err) {
          console.error('Error updating avatar:', err);
        }
      }
    } catch (err) {
      console.error('Error handling avatar:', err);
      // Error is handled by the hook and displayed via the error state
    } finally {
      setUploadingAvatar(false);
      // Reset the input
      event.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <User className="h-8 w-8 text-primary-500" />
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
        <div className="text-gray-400 mb-4">
          <User className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Not Found</h3>
        <p className="text-gray-600">Admin profile could not be loaded.</p>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
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

      {/* Header */}
      <div className="bg-gradient-card rounded-2xl shadow-soft p-8 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
              <p className="text-gray-600">Manage your account settings and personal information</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveProfile}
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
                      <Check className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleEditToggle}
                  disabled={saving}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center space-x-2 font-medium disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleEditToggle}
                className="bg-gradient-primary text-white px-6 py-3 rounded-xl hover:shadow-green transition-all duration-200 flex items-center space-x-2 font-medium"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-8 text-center">
            {/* Avatar */}
            <div className="relative mb-6">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gradient-primary flex items-center justify-center">
                {(isEditing ? tempProfileData.avatar_url : profile.avatar_url) ? (
                  <img 
                    src={isEditing ? tempProfileData.avatar_url : profile.avatar_url!} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-white" />
                )}
              </div>
              
              <label className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-2 bg-primary-500 text-white p-2 rounded-full cursor-pointer hover:bg-primary-600 transition-colors">
                {uploadingAvatar ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>
            </div>

            {/* Basic Info */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {(isEditing ? tempProfileData : profile).first_name} {(isEditing ? tempProfileData : profile).last_name}
            </h2>
            <p className="text-primary-600 font-medium mb-4">{profile.role}</p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-primary-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-primary-600">
                  {Math.floor((new Date().getTime() - new Date(profile.join_date).getTime()) / (1000 * 60 * 60 * 24 * 365))}+
                </div>
                <div className="text-sm text-gray-600">Years Active</div>
              </div>
              <div className="bg-primary-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-primary-600">500+</div>
                <div className="text-sm text-gray-600">Articles Managed</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-50 hover:bg-primary-50 rounded-xl transition-colors text-left"
              >
                <Key className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700 font-medium">Change Password</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <User className="h-5 w-5 text-primary-600" />
              <span>Personal Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                <div className="px-4 py-3 bg-gray-100 rounded-xl text-gray-600 font-mono text-sm">
                  {profile.user_id}
                </div>
                <p className="text-xs text-gray-500 mt-1">User ID cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="email"
                      value={tempProfileData.email}
                      onChange={(e) => setTempProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  ) : (
                    <div className="flex-1 px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{profile.email}</div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempProfileData.first_name}
                    onChange={(e) => setTempProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{profile.first_name}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempProfileData.last_name}
                    onChange={(e) => setTempProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{profile.last_name}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="tel"
                      value={tempProfileData.phone}
                      onChange={(e) => setTempProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="+1 (555) 123-4567"
                    />
                  ) : (
                    <div className="flex-1 px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{profile.phone || 'Not provided'}</div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempProfileData.location}
                      onChange={(e) => setTempProfileData(prev => ({ ...prev, location: e.target.value }))}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="New York, USA"
                    />
                  ) : (
                    <div className="flex-1 px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{profile.location || 'Not provided'}</div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={tempProfileData.bio}
                    onChange={(e) => setTempProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{profile.bio || 'No bio provided'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary-600" />
              <span>Account Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <div className="flex-1 px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{profile.role}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div className="flex-1 px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                    {new Date(profile.join_date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div className="flex-1 px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                    {new Date(profile.updated_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          {showPasswordChange && (
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <Key className="h-5 w-5 text-primary-600" />
                <span>Change Password</span>
              </h3>

              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Password Requirements</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• At least 8 characters long</li>
                    <li>• Contains uppercase and lowercase letters</li>
                    <li>• Contains at least one number</li>
                    <li>• Demo current password: <code className="bg-blue-100 px-1 rounded">admin123</code></li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password *</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password *</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handlePasswordChange}
                    disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || changingPassword}
                    className="bg-gradient-primary text-white px-6 py-3 rounded-xl hover:shadow-green transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {changingPassword ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      resetError();
                    }}
                    disabled={changingPassword}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;