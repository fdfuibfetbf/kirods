import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Pause, 
  User,
  Clock,
  Search,
  Filter,
  Maximize2,
  Minimize2,
  MoreVertical,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Users,
  Check,
  Zap
} from 'lucide-react';
import { useSocketChat } from '../../hooks/useSocketChat';
import { useNotifications } from '../../hooks/useNotifications';
import { ChatSession } from '../../types';

const SocketChatManagement: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [adminId] = useState(() => `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { 
    connected,
    messages,
    sessions,
    onlineUsers,
    typingUsers,
    loading,
    error,
    sendMessage,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    updateSessionStatus,
    fetchSessions,
    fetchMessages
  } = useSocketChat({ 
    sessionId: selectedChat?.id,
    userId: adminId,
    userName: 'Admin',
    userEmail: 'admin@kirods.com',
    isAdmin: true
  });

  const { 
    isSupported: notificationSupported,
    requestPermission,
    playNotificationSound,
    playMessageSound
  } = useNotifications();

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

  // Load sessions on mount
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChat?.id) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat?.id, fetchMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark user messages as read when admin selects a chat
  useEffect(() => {
    if (selectedChat?.id && messages.length > 0) {
      const unreadUserMessages = messages.filter(msg => 
        msg.sender === 'user' && !msg.is_read
      );
      
      if (unreadUserMessages.length > 0) {
        const timer = setTimeout(() => {
          markMessagesAsRead(unreadUserMessages.map(msg => msg.id));
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [selectedChat?.id, messages, markMessagesAsRead]);

  // Play sound for new messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === 'user' && soundEnabled) {
      playMessageSound({ volume: 0.6 });
    }
  }, [messages, soundEnabled, playMessageSound]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedChat || isSending || !connected) return;

    const messageText = replyMessage.trim();
    setReplyMessage('');
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
    } catch (error) {
      console.error('Error sending message:', error);
      setReplyMessage(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (sessionId: string, status: 'active' | 'pending' | 'closed') => {
    await updateSessionStatus(sessionId, status);
    if (selectedChat && selectedChat.id === sessionId) {
      setSelectedChat(prev => prev ? { ...prev, status } : null);
    }
  };

  const handleTyping = (value: string) => {
    setReplyMessage(value);
    
    if (!selectedChat || !connected) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (value.trim()) {
      startTyping(selectedChat.id);
      
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(selectedChat.id);
      }, 2000);
    } else {
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

  // Get typing users for selected chat (excluding admin)
  const chatTypingUsers = selectedChat ? typingUsers.filter(user => 
    user.userId !== adminId && !user.isAdmin
  ) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <MessageCircle className="h-8 w-8 text-primary-500" />
          </div>
          <p className="text-gray-600 text-lg font-medium">Connecting to Socket.IO server...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Socket.IO Chat Management</h1>
              <p className="text-gray-600">Real-time WebSocket messaging - No refresh required!</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm bg-gray-50 px-3 py-2 rounded-lg">
              {connected ? (
                <>
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-600 font-medium">Socket.IO</span>
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
        <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2 text-blue-700">
              <Zap className="h-4 w-4" />
              <span className="font-medium">Socket.IO WebSocket</span>
            </div>
            <div className={`flex items-center space-x-2 ${soundEnabled ? 'text-green-600' : 'text-gray-500'}`}>
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span>Sound {soundEnabled ? 'On' : 'Off'}</span>
            </div>
            <div className={`flex items-center space-x-2 ${notificationsEnabled ? 'text-blue-600' : 'text-gray-500'}`}>
              {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              <span>Notifications {notificationsEnabled ? 'On' : 'Off'}</span>
            </div>
          </div>
          <div className="text-xs text-blue-600 font-medium">
            {connected ? '🟢 Real-time active • No refresh needed' : '🔴 Connecting...'}
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
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Live Conversations ({filteredSessions.length})</h3>
                <div className="flex items-center space-x-2">
                  {connected ? (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  ) : (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                  <span className="text-xs text-gray-600">
                    {connected ? 'Socket.IO' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {filteredSessions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No conversations found</p>
                  <p className="text-xs mt-2">Socket.IO ready for real-time chat</p>
                </div>
              ) : (
                filteredSessions.map((chat) => {
                  const statusConfig = getStatusConfig(chat.status);
                  
                  return (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 ${
                        selectedChat?.id === chat.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
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
                        {typingUsers.some(user => !user.isAdmin) && selectedChat?.id === chat.id && (
                          <div className="flex items-center space-x-1 text-blue-600">
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100">
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
                          <span>{selectedChat.user_email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Started {formatTime(selectedChat.created_at)}</span>
                        </div>
                        {connected && (
                          <div className="flex items-center space-x-1 text-blue-600">
                            <Zap className="h-3 w-3" />
                            <span>Socket.IO</span>
                          </div>
                        )}
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
                  {messages.map((message) => (
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
                          }`}
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
                                {message.is_read ? (
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
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-xs text-gray-600">
                              {chatTypingUsers[0].userName} is typing...
                            </span>
                          </div>
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
                        {!connected && (
                          <span className="text-red-600">Socket.IO disconnected</span>
                        )}
                        <div className="flex items-center space-x-1 text-blue-600">
                          <Zap className="h-3 w-3" />
                          <span>Real-time WebSocket</span>
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
                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-10 w-10 text-blue-500" />
                </div>
                <p className="text-lg font-medium mb-2">Select a conversation</p>
                <p className="text-sm">Choose a chat from the list to start real-time messaging</p>
                <div className="mt-4 text-xs text-blue-600 font-medium">
                  Socket.IO: {connected ? '🟢 Connected' : '🔴 Disconnected'} • No refresh needed
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocketChatManagement;