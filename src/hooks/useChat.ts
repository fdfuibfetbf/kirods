import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { ChatSession, ChatMessage } from '../types';

interface TypingUser {
  userId: string;
  userName: string;
  timestamp: number;
}

interface OnlineUser {
  userId: string;
  userName: string;
  lastSeen: number;
}

interface UseChatProps {
  sessionId?: string;
  isAdmin?: boolean;
}

export const useChat = ({ sessionId, isAdmin = false }: UseChatProps = {}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  
  const channelRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);
  const currentUserRef = useRef<string>('');
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);
  const lastMessageIdRef = useRef<string>('');

  // Generate unique user ID
  const getUserId = useCallback(() => {
    if (!currentUserRef.current) {
      currentUserRef.current = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return currentUserRef.current;
  }, []);

  const fetchSessions = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (mountedRef.current) {
        setSessions(data || []);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const fetchMessages = useCallback(async (sessionId: string): Promise<ChatMessage[]> => {
    if (!mountedRef.current) return [];
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      const fetchedMessages = data || [];
      
      if (mountedRef.current) {
        setMessages(fetchedMessages);
        // Update last message ID for deduplication
        if (fetchedMessages.length > 0) {
          lastMessageIdRef.current = fetchedMessages[fetchedMessages.length - 1].id;
        }
      }
      return fetchedMessages;
    } catch (err) {
      console.error('Error fetching messages:', err);
      return [];
    }
  }, []);

  const createSession = useCallback(async (userName: string, userEmail: string): Promise<ChatSession | null> => {
    try {
      // Check if user has an existing active session within 30 days
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
        // Reactivate existing session
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
        if (mountedRef.current) {
          await fetchSessions();
        }
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
      if (mountedRef.current) {
        await fetchSessions();
      }
      return data;
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
      return null;
    }
  }, [fetchSessions]);

  const findExistingSession = useCallback(async (userEmail: string): Promise<ChatSession | null> => {
    try {
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

  const sendMessage = useCallback(async (sessionId: string, message: string, sender: 'user' | 'admin'): Promise<ChatMessage | null> => {
    try {
      // Create optimistic message for immediate UI update
      const optimisticMessage: ChatMessage = {
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        session_id: sessionId,
        message,
        sender,
        is_read: false,
        created_at: new Date().toISOString()
      };

      // Immediately add to local state for instant feedback
      if (mountedRef.current) {
        setMessages(prev => [...prev, optimisticMessage]);
        lastMessageIdRef.current = optimisticMessage.id;
      }

      // Send to database
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([{ session_id: sessionId, message, sender }])
        .select()
        .single();

      if (error) throw error;

      // Update session's updated_at timestamp
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      // Replace optimistic message with real one
      if (mountedRef.current) {
        setMessages(prev => prev.map(msg => 
          msg.id === optimisticMessage.id ? data : msg
        ));
        lastMessageIdRef.current = data.id;
      }

      return data;
    } catch (err) {
      // Remove optimistic message on error
      if (mountedRef.current) {
        setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp_')));
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
      return null;
    }
  }, []);

  const markMessagesAsRead = useCallback(async (messageIds: string[]): Promise<void> => {
    try {
      if (messageIds.length === 0) return;

      // Optimistically update local state
      if (mountedRef.current) {
        setMessages(prev => prev.map(msg => 
          messageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
        ));
      }

      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .in('id', messageIds);

      if (error) throw error;
    } catch (err) {
      console.error('Error marking messages as read:', err);
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    }
  }, []);

  const markSessionMessagesAsRead = useCallback(async (sessionId: string, sender: 'user' | 'admin'): Promise<void> => {
    try {
      // Optimistically update local state
      if (mountedRef.current) {
        setMessages(prev => prev.map(msg => 
          msg.session_id === sessionId && msg.sender === sender && !msg.is_read 
            ? { ...msg, is_read: true } 
            : msg
        ));
      }

      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('session_id', sessionId)
        .eq('sender', sender)
        .eq('is_read', false);

      if (error) throw error;
    } catch (err) {
      console.error('Error marking session messages as read:', err);
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    }
  }, []);

  const updateSessionStatus = useCallback(async (sessionId: string, status: 'active' | 'pending' | 'closed') => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;
      if (mountedRef.current) {
        await fetchSessions();
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    }
  }, [fetchSessions]);

  const incrementViews = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.rpc('increment_article_views', { article_id: id });
      if (error) throw error;
    } catch (err) {
      console.error('Error incrementing views:', err);
    }
  }, []);

  // Typing indicators
  const startTyping = useCallback((sessionId: string, userName: string) => {
    if (!presenceChannelRef.current || !mountedRef.current) return;
    
    const userId = getUserId();
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing status via presence
    presenceChannelRef.current.track({
      userId,
      userName,
      isTyping: true,
      sessionId,
      timestamp: Date.now()
    });

    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(sessionId);
    }, 3000);
  }, [getUserId]);

  const stopTyping = useCallback((sessionId: string) => {
    if (!presenceChannelRef.current || !mountedRef.current) return;
    
    const userId = getUserId();
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Update presence to stop typing
    presenceChannelRef.current.track({
      userId,
      sessionId,
      isTyping: false,
      timestamp: Date.now()
    });
  }, [getUserId]);

  const joinPresence = useCallback((sessionId: string, userName: string) => {
    if (!presenceChannelRef.current || !mountedRef.current) return;
    
    const userId = getUserId();
    
    presenceChannelRef.current.track({
      userId,
      userName,
      sessionId,
      isTyping: false,
      timestamp: Date.now()
    });
  }, [getUserId]);

  const leavePresence = useCallback(() => {
    if (presenceChannelRef.current) {
      presenceChannelRef.current.untrack();
    }
  }, []);

  // Set up real-time subscriptions with improved deduplication
  useEffect(() => {
    mountedRef.current = true;

    const initializeData = async () => {
      if (!mountedRef.current) return;
      
      setLoading(true);
      try {
        if (sessionId) {
          await fetchMessages(sessionId);
        }
        if (isAdmin) {
          await fetchSessions();
        }
        if (mountedRef.current) {
          setConnected(true);
        }
      } catch (error) {
        console.error('Error initializing data:', error);
        if (mountedRef.current) {
          setConnected(false);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    initializeData();

    // Create unique channel names to avoid conflicts
    const sessionChannelName = `chat_sessions_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const messageChannelName = `chat_messages_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const presenceChannelName = `chat_presence_${sessionId || 'global'}_${Date.now()}`;

    // Subscribe to chat sessions changes
    const sessionsChannel = supabase
      .channel(sessionChannelName)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chat_sessions' },
        (payload) => {
          if (!mountedRef.current) return;
          
          console.log('Session change:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newSession = payload.new as ChatSession;
            setSessions(prev => {
              if (prev.find(s => s.id === newSession.id)) return prev;
              return [newSession, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedSession = payload.new as ChatSession;
            setSessions(prev => prev.map(session => 
              session.id === updatedSession.id ? updatedSession : session
            ));
          } else if (payload.eventType === 'DELETE') {
            const deletedSession = payload.old as ChatSession;
            setSessions(prev => prev.filter(session => session.id !== deletedSession.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Sessions subscription status:', status);
        if (status === 'SUBSCRIBED' && mountedRef.current) {
          setConnected(true);
        }
      });

    // Subscribe to chat messages changes with improved deduplication
    const messagesChannel = supabase
      .channel(messageChannelName)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages' },
        (payload) => {
          if (!mountedRef.current) return;
          
          console.log('Message change:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as ChatMessage;
            
            // Only process if it's for the current session or if we're admin viewing all
            if (!sessionId || newMessage.session_id === sessionId || isAdmin) {
              setMessages(prev => {
                // Advanced deduplication: check by ID and avoid duplicates from optimistic updates
                const existingMessage = prev.find(msg => 
                  msg.id === newMessage.id || 
                  (msg.id.startsWith('temp_') && 
                   msg.message === newMessage.message && 
                   msg.sender === newMessage.sender &&
                   Math.abs(new Date(msg.created_at).getTime() - new Date(newMessage.created_at).getTime()) < 5000)
                );
                
                if (existingMessage) {
                  // Replace temp message with real one, or skip if already exists
                  if (existingMessage.id.startsWith('temp_')) {
                    return prev.map(msg => msg.id === existingMessage.id ? newMessage : msg);
                  }
                  return prev;
                }
                
                // Only add if it's for the current session or if we're admin
                if (sessionId && newMessage.session_id !== sessionId) {
                  return prev;
                }
                
                // Avoid adding if this message ID is older than our last known message
                if (lastMessageIdRef.current && newMessage.id <= lastMessageIdRef.current && !newMessage.id.startsWith('temp_')) {
                  return prev;
                }
                
                lastMessageIdRef.current = newMessage.id;
                return [...prev, newMessage];
              });
            }

            // Trigger custom event for notifications
            window.dispatchEvent(new CustomEvent('chat_message_update', { 
              detail: payload 
            }));
          } else if (payload.eventType === 'UPDATE') {
            const updatedMessage = payload.new as ChatMessage;
            
            // Update message in state (for read receipts)
            setMessages(prev => prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            ));
          }
        }
      )
      .subscribe((status) => {
        console.log('Messages subscription status:', status);
      });

    // Set up presence channel for typing indicators and online users
    const presenceChannel = supabase.channel(presenceChannelName, {
      config: {
        presence: {
          key: getUserId(),
        },
      },
    });

    presenceChannelRef.current = presenceChannel;

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        if (!mountedRef.current) return;
        
        const state = presenceChannel.presenceState();
        const users: OnlineUser[] = [];
        const typing: TypingUser[] = [];
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.userId !== getUserId()) {
              users.push({
                userId: presence.userId,
                userName: presence.userName || 'Unknown',
                lastSeen: presence.timestamp || Date.now()
              });
              
              if (presence.isTyping && presence.sessionId === sessionId) {
                typing.push({
                  userId: presence.userId,
                  userName: presence.userName || 'Unknown',
                  timestamp: presence.timestamp || Date.now()
                });
              }
            }
          });
        });
        
        setOnlineUsers(users);
        setTypingUsers(typing);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (!mountedRef.current) return;
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        if (!mountedRef.current) return;
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        console.log('Presence subscription status:', status);
        if (status === 'SUBSCRIBED' && mountedRef.current) {
          setConnected(true);
        } else if (status === 'CHANNEL_ERROR' && mountedRef.current) {
          setConnected(false);
        }
      });

    return () => {
      mountedRef.current = false;
      setConnected(false);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(presenceChannel);
      
      channelRef.current = null;
      presenceChannelRef.current = null;
    };
  }, [sessionId, isAdmin, fetchMessages, fetchSessions, getUserId]);

  // Clean up old typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      if (!mountedRef.current) return;
      
      const now = Date.now();
      setTypingUsers(prev => prev.filter(user => now - user.timestamp < 5000));
      setOnlineUsers(prev => prev.filter(user => now - user.lastSeen < 30000)); // 30 seconds timeout
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    sessions,
    messages,
    loading,
    error,
    connected,
    typingUsers,
    onlineUsers,
    fetchSessions,
    fetchMessages,
    createSession,
    findExistingSession,
    sendMessage,
    markMessagesAsRead,
    markSessionMessagesAsRead,
    updateSessionStatus,
    incrementViews,
    startTyping,
    stopTyping,
    joinPresence,
    leavePresence
  };
};