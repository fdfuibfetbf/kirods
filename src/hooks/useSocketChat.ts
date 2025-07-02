import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { supabase } from '../lib/supabase';
import { ChatSession, ChatMessage } from '../types';

interface SocketChatUser {
  userId: string;
  userName: string;
  userEmail?: string;
  sessionId: string;
  isAdmin: boolean;
  lastSeen: number;
}

interface UseSocketChatProps {
  sessionId?: string;
  isAdmin?: boolean;
  userId?: string;
  userName?: string;
  userEmail?: string;
}

export const useSocketChat = ({ 
  sessionId, 
  isAdmin = false, 
  userId, 
  userName, 
  userEmail 
}: UseSocketChatProps = {}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<SocketChatUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<SocketChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize socket connection
  useEffect(() => {
    // Use HTTPS for socket connection to match frontend protocol
    const serverUrl = import.meta.env.VITE_SOCKET_SERVER_URL || 'https://localhost:3001';
    
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      secure: true, // Enable secure connection
      rejectUnauthorized: false // Allow self-signed certificates in development
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      setConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server:', reason);
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      setConnected(false);
      setError('Failed to connect to chat server. Please check if the server is running.');
    });

    // Message event handlers
    newSocket.on('receive-message', (message: ChatMessage & { userName: string }) => {
      console.log('Received message:', message);
      setMessages(prev => {
        // Avoid duplicates
        if (prev.find(msg => msg.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
    });

    // Typing event handlers
    newSocket.on('user-typing', (data: { userId: string; userName: string; timestamp: number }) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(user => user.userId !== data.userId);
        return [...filtered, { ...data, sessionId: sessionId || '', isAdmin: false, lastSeen: data.timestamp }];
      });
    });

    newSocket.on('user-stopped-typing', (data: { userId: string; userName: string }) => {
      setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
    });

    // User presence handlers
    newSocket.on('user-joined', (data: { userId: string; userName: string; isAdmin: boolean; timestamp: number }) => {
      console.log('User joined:', data);
      setOnlineUsers(prev => {
        const filtered = prev.filter(user => user.userId !== data.userId);
        return [...filtered, { ...data, sessionId: sessionId || '', userEmail: '', lastSeen: data.timestamp }];
      });
    });

    newSocket.on('user-left', (data: { userId: string; userName: string; timestamp: number }) => {
      console.log('User left:', data);
      setOnlineUsers(prev => prev.filter(user => user.userId !== data.userId));
      setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
    });

    newSocket.on('session-users', (users: SocketChatUser[]) => {
      setOnlineUsers(users);
    });

    // Read receipts
    newSocket.on('messages-read', (data: { messageIds: string[]; readBy: string; readByName: string; timestamp: number }) => {
      setMessages(prev => prev.map(msg => 
        data.messageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
      ));
    });

    // Session status updates
    newSocket.on('session-status-updated', (data: { sessionId: string; status: string; updatedBy: string; timestamp: number }) => {
      setSessions(prev => prev.map(session => 
        session.id === data.sessionId ? { ...session, status: data.status as any } : session
      ));
    });

    // Error handling
    newSocket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error);
      setError(error.message);
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [sessionId]);

  // Join session when socket connects and session info is available
  useEffect(() => {
    if (socket && connected && sessionId && userId && userName) {
      socket.emit('join-session', {
        sessionId,
        userId,
        userName,
        userEmail,
        isAdmin
      });
    }
  }, [socket, connected, sessionId, userId, userName, userEmail, isAdmin]);

  // Fetch initial data
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        setError('Supabase is not configured. Please set up your Supabase credentials.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (sessionId: string): Promise<ChatMessage[]> => {
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        console.warn('Supabase is not configured. Cannot fetch messages.');
        return [];
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      const messages = data || [];
      setMessages(messages);
      return messages;
    } catch (err) {
      console.error('Error fetching messages:', err);
      return [];
    }
  }, []);

  // Send message via Socket.IO
  const sendMessage = useCallback(async (sessionId: string, message: string, sender: 'user' | 'admin'): Promise<void> => {
    if (!socket || !connected) {
      throw new Error('Not connected to chat server');
    }

    socket.emit('send-message', {
      sessionId,
      message,
      sender
    });
  }, [socket, connected]);

  // Typing indicators
  const startTyping = useCallback((sessionId: string) => {
    if (!socket || !connected) return;

    socket.emit('start-typing', { sessionId });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(sessionId);
    }, 3000);
  }, [socket, connected]);

  const stopTyping = useCallback((sessionId: string) => {
    if (!socket || !connected) return;

    socket.emit('stop-typing', { sessionId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, []);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (messageIds: string[]): Promise<void> => {
    if (!socket || !connected || !sessionId) return;

    socket.emit('mark-messages-read', {
      sessionId,
      messageIds
    });
  }, [socket, connected, sessionId]);

  // Update session status (admin only)
  const updateSessionStatus = useCallback(async (sessionId: string, status: 'active' | 'pending' | 'closed') => {
    if (!socket || !connected || !isAdmin) return;

    socket.emit('update-session-status', {
      sessionId,
      status
    });
  }, [socket, connected, isAdmin]);

  // Create session (still use Supabase for persistence)
  const createSession = useCallback(async (userName: string, userEmail: string): Promise<ChatSession | null> => {
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        setError('Supabase is not configured. Please set up your Supabase credentials to use chat functionality.');
        return null;
      }

      // Check for existing session
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: existingSession, error: checkError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_email', userEmail)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingSession && !checkError) {
        const { data: updatedSession, error: updateError } = await supabase
          .from('chat_sessions')
          .update({ 
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSession.id)
          .select()
          .single();

        if (updateError) throw updateError;
        return updatedSession;
      }

      // Create new session
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([{ 
          user_name: userName, 
          user_email: userEmail,
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  }, []);

  // Find existing session
  const findExistingSession = useCallback(async (userEmail: string): Promise<ChatSession | null> => {
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
        console.warn('Supabase is not configured. Cannot find existing sessions.');
        return null;
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_email', userEmail)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (err) {
      console.error('Error finding existing session:', err);
      return null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    socket,
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
    createSession,
    findExistingSession,
    fetchSessions,
    fetchMessages
  };
};