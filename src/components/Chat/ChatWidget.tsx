import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Minimize2, MessageCircle, User, Wifi, WifiOff, CheckCircle, Check } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { ChatSession } from '../../types';

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ isOpen, onClose }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const [showUserForm, setShowUserForm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);
  
  const { 
    messages, 
    connected,
    typingUsers,
    onlineUsers,
    sendMessage, 
    createSession, 
    findExistingSession,
    fetchMessages,
    markSessionMessagesAsRead,
    startTyping,
    stopTyping,
    joinPresence,
    leavePresence
  } = useChat({ 
    sessionId: currentSession?.id 
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Check for existing session on component mount
  useEffect(() => {
    const savedUserInfo = localStorage.getItem('chat_user_info');
    if (savedUserInfo) {
      const userInfo = JSON.parse(savedUserInfo);
      setUserInfo(userInfo);
      checkExistingSession(userInfo.email);
    }
  }, []);

  // Load messages when session changes
  useEffect(() => {
    if (currentSession?.id && mountedRef.current) {
      fetchMessages(currentSession.id);
      joinPresence(currentSession.id, userInfo.name);
    }
  }, [currentSession?.id, fetchMessages, joinPresence, userInfo.name]);

  // Mark admin messages as read when chat is open and messages are visible
  useEffect(() => {
    if (currentSession?.id && messages.length > 0 && isOpen && !isMinimized && mountedRef.current) {
      const unreadAdminMessages = messages.filter(msg => 
        msg.sender === 'admin' && !msg.is_read
      );
      
      if (unreadAdminMessages.length > 0) {
        // Mark admin messages as read after a short delay to ensure they're visible
        const timer = setTimeout(() => {
          if (mountedRef.current) {
            markSessionMessagesAsRead(currentSession.id, 'admin');
          }
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [currentSession?.id, messages, isOpen, isMinimized, markSessionMessagesAsRead]);

  // Cleanup presence on unmount
  useEffect(() => {
    return () => {
      leavePresence();
    };
  }, [leavePresence]);

  const checkExistingSession = async (email: string) => {
    if (!mountedRef.current) return;
    
    setIsLoading(true);
    try {
      const existingSession = await findExistingSession(email);
      if (existingSession && mountedRef.current) {
        setCurrentSession(existingSession);
        setShowUserForm(false);
      }
    } catch (error) {
      console.error('Error checking existing session:', error);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleStartChat = async () => {
    if (!userInfo.name || !userInfo.email || !mountedRef.current) return;
    
    setIsLoading(true);
    try {
      // Save user info to localStorage for persistence
      localStorage.setItem('chat_user_info', JSON.stringify(userInfo));
      
      const session = await createSession(userInfo.name, userInfo.email);
      if (session && mountedRef.current) {
        setCurrentSession(session);
        setShowUserForm(false);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentSession || isLoading || !mountedRef.current) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);
    setIsTyping(false);

    // Stop typing indicator
    if (currentSession) {
      stopTyping(currentSession.id);
    }

    try {
      await sendMessage(currentSession.id, messageText, 'user');
      // Message will appear automatically via optimistic update + Supabase Realtime
    } catch (error) {
      console.error('Error sending message:', error);
      if (mountedRef.current) {
        setNewMessage(messageText); // Restore message on error
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (!currentSession || !mountedRef.current) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (value.trim() && !isTyping) {
      setIsTyping(true);
      startTyping(currentSession.id, userInfo.name);
    }

    // Stop typing after 2 seconds of no typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && mountedRef.current) {
        setIsTyping(false);
        stopTyping(currentSession.id);
      }
    }, 2000);
  };

  const handleClearChat = () => {
    leavePresence();
    localStorage.removeItem('chat_user_info');
    setCurrentSession(null);
    setUserInfo({ name: '', email: '' });
    setShowUserForm(true);
  };

  const quickActions = [
    "WordPress installation help",
    "cPanel login issues", 
    "Email setup guide",
    "SSL certificate problems",
    "Website speed optimization"
  ];

  // Get typing users excluding current user
  const otherTypingUsers = typingUsers.filter(user => user.userName !== userInfo.name);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-scale-in">
      <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-80 h-[500px]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div>
              <span className="font-medium">Kirods Support</span>
              <div className="flex items-center space-x-1 text-xs text-white/80">
                {connected ? (
                  <>
                    <Wifi className="h-3 w-3 text-green-400" />
                    <span>Connected • Real-time</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 text-red-400" />
                    <span>Connecting...</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {showUserForm ? (
              /* User Info Form */
              <div className="p-6 space-y-4 h-[436px] flex flex-col justify-center">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Expert Help</h3>
                  <p className="text-sm text-gray-600">Connect with our hosting specialists for real-time assistance</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={userInfo.name}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    onClick={handleStartChat}
                    disabled={!userInfo.name || !userInfo.email || isLoading}
                    className="w-full px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <span>Start Live Chat</span>
                    )}
                  </button>
                </div>
                
                <div className="text-center text-xs text-gray-500 mt-4">
                  <p>🔒 Real-time messaging • Read receipts • Saved for 30 days</p>
                </div>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 p-4 h-80 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white">
                  <div className="space-y-4">
                    {/* Session Info */}
                    <div className="text-center">
                      <div className="inline-flex items-center space-x-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                        {connected ? (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Live chat active • {onlineUsers.length + 1} online</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                            <span>Reconnecting...</span>
                          </>
                        )}
                      </div>
                      <button
                        onClick={handleClearChat}
                        className="block mx-auto mt-2 text-xs text-gray-500 hover:text-red-600 transition-colors"
                      >
                        Start new conversation
                      </button>
                    </div>

                    {/* Display messages */}
                    {messages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">Start a conversation with our support team</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="flex items-start space-x-2 max-w-xs">
                            {message.sender === 'admin' && (
                              <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <User className="h-3 w-3 text-white" />
                              </div>
                            )}
                            <div
                              className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${
                                message.sender === 'user'
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-white text-gray-800 border border-gray-200'
                              } ${message.id.startsWith('temp_') ? 'opacity-75' : ''}`}
                            >
                              <p className="leading-relaxed">{message.message}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className={`text-xs ${
                                  message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                                }`}>
                                  {new Date(message.created_at).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                                {/* Read Receipt for User Messages */}
                                {message.sender === 'user' && (
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
                            {message.sender === 'user' && (
                              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <User className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    
                    {/* Typing Indicators */}
                    {otherTypingUsers.length > 0 && (
                      <div className="flex justify-start">
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-3 w-3 text-white" />
                          </div>
                          <div className="bg-white text-gray-800 border border-gray-200 px-4 py-3 rounded-2xl text-sm shadow-sm">
                            <div className="flex items-center space-x-2">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                              <span className="text-xs text-gray-600">
                                {otherTypingUsers[0].userName} is typing...
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Quick Actions */}
                {messages.length <= 1 && (
                  <div className="px-4 py-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Quick help topics:</p>
                    <div className="flex flex-wrap gap-1">
                      {quickActions.slice(0, 3).map((action, index) => (
                        <button
                          key={index}
                          onClick={() => setNewMessage(action)}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-gray-100 bg-white rounded-b-2xl">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => handleTyping(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all duration-200"
                      disabled={isLoading || !connected}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isLoading || !connected}
                      className="px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {isTyping && (
                    <div className="mt-2 text-xs text-gray-500">
                      You are typing...
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                    <span>Supabase Realtime</span>
                    {connected ? (
                      <span className="text-green-600">● Connected</span>
                    ) : (
                      <span className="text-red-600">● Disconnected</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;