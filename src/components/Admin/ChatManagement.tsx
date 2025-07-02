import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Pause, 
  User,
  Clock,
  Eye,
  Search,
  Filter,
  Maximize2,
  Minimize2,
  Phone,
  Mail,
  Globe,
  MoreVertical,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Users,
  Check
} from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useNotifications } from '../../hooks/useNotifications';
import { ChatSession, ChatMessage } from '../../types';

const ChatManagement: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isExpanded, setIsExpanded] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);
  
  const { 
    messages: sessionMessages, 
    sessions, 
    loading, 
    connected,
    typingUsers,
    onlineUsers,
    sendMessage, 
    updateSessionStatus,
    fetchMessages,
    fetchSessions,
    markSessionMessagesAsRead,
    startTyping,
    stopTyping,
    joinPresence
  } = useChat({ 
    sessionId: selectedChat?.id, 
    isAdmin: true 
  });

  const { 
    isSupported: notificationSupported,
    requestPermission,
    showChatNotification,
    showMessageNotification,
    playNotificationSound,
    playMessageSound
  } = useNotifications();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Initialize notifications
  useEffect(() => {
    const initNotifications = async () => {
      if (notificationSupported) {
        const granted = await requestPermission();
        setNotificationsEnabled(granted);
      }
    };
    initNotifications();
  }, [notificationSupported, requestPermission]);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChat?.id && mountedRef.current) {
      fetchMessages(selectedChat.id);
      joinPresence(selectedChat.id, 'Admin');
    }
  }, [selectedChat?.id, fetchMessages, joinPresence]);

  // Mark user messages as read when admin selects a chat
  useEffect(() => {
    if (selectedChat?.id && sessionMessages.length > 0 && mountedRef.current) {
      const unreadUserMessages = sessionMessages.filter(msg => 
        msg.sender === 'user' && !msg.is_read
      );
      
      if (unreadUserMessages.length > 0) {
        // Mark user messages as read after a short delay to ensure they're visible
        const timer = setTimeout(() => {
          if (mountedRef.current) {
            markSessionMessagesAsRead(selectedChat.id, 'user');
          }
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [selectedChat?.id, sessionMessages, markSessionMessagesAsRead]);

  // Load sessions on mount
  useEffect(() => {
    if (mountedRef.current) {
      fetchSessions();
    }
  }, [fetchSessions]);

  useEffect(() => {
    scrollToBottom();
  }, [sessionMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedChat || isSending || !mountedRef.current) return;

    const messageText = replyMessage.trim();
    setReplyMessage('');
    setAdminTyping(false);
    setIsSending(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing indicator
    stopTyping(selectedChat.id);

    if (soundEnabled) {
      playMessageSound({ volume: 0.4 });
    }

    try {
      await sendMessage(selectedChat.id, messageText, 'admin');
      // Message will appear automatically via optimistic update + Supabase Realtime
    } catch (error) {
      console.error('Error sending message:', error);
      if (mountedRef.current) {
        setReplyMessage(messageText);
      }
    } finally {
      if (mountedRef.current) {
        setIsSending(false);
      }
    }
  };

  const handleStatusChange = async (sessionId: string, status: 'active' | 'pending' | 'closed') => {
    await updateSessionStatus(sessionId, status);
    if (selectedChat && selectedChat.id === sessionId && mountedRef.current) {
      setSelectedChat(prev => prev ? { ...prev, status } : null);
    }
  };

  const handleTyping = (value: string) => {
    setReplyMessage(value);
    
    if (!selectedChat || !mountedRef.current) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (value.trim()) {
      if (!adminTyping) {
        setAdminTyping(true);
        startTyping(selectedChat.id, 'Admin');
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setAdminTyping(false);
          stopTyping(selectedChat.id);
        }
      }, 2000);
    } else {
      setAdminTyping(false);
      stopTyping(selectedChat.id);
    }
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled && notificationSupported) {
      const granted = await requestPermission();
      setNotificationsEnabled(granted);
    } else {
      setNotificationsEnabled(!notificationsEnabled);
    }
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      setTimeout(() => {
        playMessageSound({ volume: 0.3 });
      }, 100);
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.user_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active': 
        return { 
          color: 'bg-green-100 text-green-700', 
          icon: CheckCircle,
          dot: 'bg-green-500'
        };
      case 'pending': 
        return { 
          color: 'bg-yellow-100 text-yellow-700', 
          icon: AlertCircle,
          dot: 'bg-yellow-500'
        };
      case 'closed': 
        return { 
          color: 'bg-gray-100 text-gray-700', 
          icon: Pause,
          dot: 'bg-gray-500'
        };
      default: 
        return { 
          color: 'bg-gray-100 text-gray-700', 
          icon: Pause,
          dot: 'bg-gray-500'
        };
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  // Real-time stats
  const activeChatsCount = sessions.filter(s => s.status === 'active').length;
  const totalOnlineUsers = onlineUsers.length + 1; // +1 for admin

  // Get typing users for selected chat
  const chatTypingUsers = selectedChat ? typingUsers.filter(user => user.userName !== 'Admin') : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <MessageCircle className="h-8 w-8 text-primary-500" />
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading chat sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-card rounded-2xl shadow-soft p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Live Chat Management</h1>
              <p className="text-gray-600">Real-time customer conversations with instant updates</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm bg-gray-50 px-3 py-2 rounded-lg">
              {connected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-600" />
                  <span className="text-red-600 font-medium">Disconnected</span>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{activeChatsCount} Active</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
              <Users className="h-4 w-4" />
              <span>{totalOnlineUsers} Online</span>
            </div>
            
            {/* Notification Controls */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg transition-colors ${
                soundEnabled 
                  ? 'bg-green-50 text-green-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
              }`}
              title={soundEnabled ? 'Sound enabled' : 'Sound disabled'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            
            <button
              onClick={toggleNotifications}
              className={`p-2 rounded-lg transition-colors ${
                notificationsEnabled 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
              title={notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled'}
            >
              {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </button>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title={isExpanded ? 'Minimize' : 'Expand'}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm appearance-none min-w-32"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Connection Status */}
        <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center space-x-4 text-sm">
            <div className={`flex items-center space-x-2 ${soundEnabled ? 'text-green-600' : 'text-gray-500'}`}>
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span>Sound {soundEnabled ? 'On' : 'Off'}</span>
            </div>
            <div className={`flex items-center space-x-2 ${notificationsEnabled ? 'text-blue-600' : 'text-gray-500'}`}>
              {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              <span>Notifications {notificationsEnabled ? 'On' : 'Off'}</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-600">
              <CheckCircle className="h-4 w-4" />
              <span>Read Receipts Active</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Supabase Realtime {connected ? 'active' : 'inactive'} • No refresh needed
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className={`grid gap-6 transition-all duration-300 ${
        isExpanded ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-3'
      }`}>
        {/* Chat List */}
        <div className={`${isExpanded ? 'hidden' : 'xl:col-span-1'}`}>
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-primary-100">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Conversations ({filteredSessions.length})</h3>
                <div className="flex items-center space-x-2">
                  {connected ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  ) : (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                  <span className="text-xs text-gray-600">
                    {connected ? 'Live' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {filteredSessions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No conversations found</p>
                </div>
              ) : (
                filteredSessions.map((chat) => {
                  const statusConfig = getStatusConfig(chat.status);
                  
                  return (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 ${
                        selectedChat?.id === chat.id ? 'bg-primary-50 border-r-4 border-primary-500' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-medium">
                            {chat.user_name.charAt(0)}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${statusConfig.dot} rounded-full border-2 border-white`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-gray-900 truncate">{chat.user_name}</p>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}>
                              {chat.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{chat.user_email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(chat.updated_at)}</span>
                        </div>
                        {/* Show typing indicator for this chat */}
                        {typingUsers.some(user => user.userName !== 'Admin') && selectedChat?.id === chat.id && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce"></div>
                              <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-xs">typing...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Chat Detail */}
        <div className={`${isExpanded ? 'col-span-1' : 'xl:col-span-2'}`}>
          {selectedChat ? (
            <div className={`bg-white rounded-2xl shadow-soft border border-gray-100 flex flex-col overflow-hidden ${
              isExpanded ? 'h-[80vh]' : 'h-[600px]'
            }`}>
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-primary-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-primary rounded-full flex items-center justify-center text-white font-medium text-lg">
                        {selectedChat.user_name.charAt(0)}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusConfig(selectedChat.status).dot} rounded-full border-2 border-white`}></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedChat.user_name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{selectedChat.user_email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Started {formatTime(selectedChat.created_at)}</span>
                        </div>
                        {connected && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <Wifi className="h-3 w-3" />
                            <span>Live</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1 text-purple-600">
                          <CheckCircle className="h-3 w-3" />
                          <span>Read Receipts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <select
                      value={selectedChat.status}
                      onChange={(e) => handleStatusChange(selectedChat.id, e.target.value as any)}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="closed">Closed</option>
                    </select>
                    
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-gray-50/30 to-white">
                <div className="space-y-4">
                  {sessionMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex items-start space-x-3 max-w-xs lg:max-w-md">
                        {message.sender === 'user' && (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        )}
                        
                        <div
                          className={`px-4 py-3 rounded-2xl shadow-sm ${
                            message.sender === 'admin'
                              ? 'bg-gradient-primary text-white'
                              : 'bg-white text-gray-800 border border-gray-200'
                          } ${message.id.startsWith('temp_') ? 'opacity-75' : ''}`}
                        >
                          <p className="text-sm leading-relaxed">{message.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className={`text-xs ${
                              message.sender === 'admin' ? 'text-white/70' : 'text-gray-500'
                            }`}>
                              {new Date(message.created_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                            {/* Read Receipt for Admin Messages */}
                            {message.sender === 'admin' && (
                              <div className="flex items-center space-x-1">
                                {message.id.startsWith('temp_') ? (
                                  <>
                                    <div className="w-3 h-3 border border-white/50 rounded-full animate-spin"></div>
                                    <span className="text-xs text-white/50">Sending...</span>
                                  </>
                                ) : message.is_read ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 text-white/70" />
                                    <span className="text-xs text-white/70">Read</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-3 w-3 text-white/50" />
                                    <span className="text-xs text-white/50">Sent</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {message.sender === 'admin' && (
                          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* User Typing Indicator */}
                  {chatTypingUsers.length > 0 && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-white text-gray-800 border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-xs text-gray-600">
                              {chatTypingUsers[0].userName} is typing...
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Admin Typing Indicator */}
                  {adminTyping && replyMessage.trim() && (
                    <div className="flex justify-end">
                      <div className="flex items-start space-x-3">
                        <div className="bg-primary-100 text-primary-700 px-4 py-3 rounded-2xl shadow-sm">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-xs">You are typing...</span>
                          </div>
                        </div>
                        <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-gray-100 bg-white">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => handleTyping(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                      placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows={3}
                      disabled={isSending || !connected}
                    />
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>{replyMessage.length}/1000 characters</span>
                      <div className="flex items-center space-x-2">
                        {adminTyping && replyMessage.trim() && (
                          <span className="text-primary-600">You are typing...</span>
                        )}
                        {!connected && (
                          <span className="text-red-600">Disconnected</span>
                        )}
                        <div className="flex items-center space-x-1 text-purple-600">
                          <CheckCircle className="h-3 w-3" />
                          <span>Read receipts active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSendReply}
                    disabled={!replyMessage.trim() || isSending || !connected}
                    className="px-6 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-green transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 self-start"
                  >
                    {isSending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span>{isSending ? 'Sending...' : 'Send'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`bg-white rounded-2xl shadow-soft border border-gray-100 flex items-center justify-center ${
              isExpanded ? 'h-[80vh]' : 'h-[600px]'
            }`}>
              <div className="text-center text-gray-500">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-lg font-medium mb-2">Select a conversation</p>
                <p className="text-sm">Choose a chat from the list to start managing the conversation</p>
                <div className="mt-4 text-xs text-gray-400">
                  Supabase Realtime: {connected ? 'Active' : 'Inactive'} • No refresh needed
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatManagement;