import { useState, useEffect, useRef } from 'react';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
}

interface SoundOptions {
  volume?: number;
  loop?: boolean;
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState(false);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);
  const messageSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize sounds with simple data URLs
  useEffect(() => {
    // Create notification sound (higher pitch for new chats)
    notificationSoundRef.current = new Audio();
    notificationSoundRef.current.volume = 0.7;
    
    // Create message sound (softer for regular messages)
    messageSoundRef.current = new Audio();
    messageSoundRef.current.volume = 0.5;

    // Generate simple beep sounds using data URLs
    createNotificationSound();
    createMessageSound();
  }, []);

  // Create notification sound using a simple sine wave
  const createNotificationSound = () => {
    if (!notificationSoundRef.current) return;

    // Create a simple notification beep (800Hz for 0.5 seconds)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Create a simple data URL for notification sound
    const notificationDataUrl = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT";
    notificationSoundRef.current.src = notificationDataUrl;
  };

  // Create message sound using a simple sine wave
  const createMessageSound = () => {
    if (!messageSoundRef.current) return;

    // Create a simple message pop (400Hz for 0.3 seconds)
    const messageDataUrl = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT";
    messageSoundRef.current.src = messageDataUrl;
  };

  // Request notification permission
  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setIsEnabled(result === 'granted');
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Show notification
  const showNotification = (options: NotificationOptions): Notification | null => {
    if (!isEnabled || permission !== 'granted') {
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/vite.svg',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        badge: '/vite.svg'
      });

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  };

  // Play notification sound with fallback
  const playNotificationSound = (options: SoundOptions = {}) => {
    try {
      // Try to play the audio element first
      if (notificationSoundRef.current) {
        notificationSoundRef.current.volume = options.volume || 0.7;
        notificationSoundRef.current.loop = options.loop || false;
        notificationSoundRef.current.currentTime = 0;
        
        const playPromise = notificationSoundRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn('Could not play notification sound via audio element:', error);
            // Fallback to Web Audio API
            playBeepSound(800, 0.5, 0.7);
          });
        }
      } else {
        // Fallback to Web Audio API
        playBeepSound(800, 0.5, 0.7);
      }
    } catch (error) {
      console.warn('Error playing notification sound:', error);
      // Last resort fallback
      playBeepSound(800, 0.5, 0.7);
    }
  };

  // Play message sound with fallback
  const playMessageSound = (options: SoundOptions = {}) => {
    try {
      // Try to play the audio element first
      if (messageSoundRef.current) {
        messageSoundRef.current.volume = options.volume || 0.5;
        messageSoundRef.current.loop = options.loop || false;
        messageSoundRef.current.currentTime = 0;
        
        const playPromise = messageSoundRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn('Could not play message sound via audio element:', error);
            // Fallback to Web Audio API
            playBeepSound(400, 0.3, 0.5);
          });
        }
      } else {
        // Fallback to Web Audio API
        playBeepSound(400, 0.3, 0.5);
      }
    } catch (error) {
      console.warn('Error playing message sound:', error);
      // Last resort fallback
      playBeepSound(400, 0.3, 0.5);
    }
  };

  // Fallback beep sound using Web Audio API
  const playBeepSound = (frequency: number, duration: number, volume: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if it's suspended (required by some browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
      
      // Clean up
      setTimeout(() => {
        try {
          oscillator.disconnect();
          gainNode.disconnect();
        } catch (e) {
          // Ignore cleanup errors
        }
      }, duration * 1000 + 100);
      
    } catch (error) {
      console.warn('Web Audio API fallback failed:', error);
    }
  };

  // Show chat notification with sound
  const showChatNotification = (userName: string, userEmail: string) => {
    playNotificationSound();
    return showNotification({
      title: '🔔 New Chat Session',
      body: `${userName} (${userEmail}) started a new conversation`,
      tag: 'new-chat',
      requireInteraction: true
    });
  };

  // Show message notification with sound
  const showMessageNotification = (userName: string, message: string, isFromUser: boolean = true) => {
    if (isFromUser) {
      playMessageSound();
      return showNotification({
        title: `💬 ${userName}`,
        body: message.length > 50 ? `${message.substring(0, 50)}...` : message,
        tag: 'new-message'
      });
    }
    return null;
  };

  // Check if notifications are supported
  const isSupported = 'Notification' in window;

  return {
    permission,
    isEnabled,
    isSupported,
    requestPermission,
    showNotification,
    showChatNotification,
    showMessageNotification,
    playNotificationSound,
    playMessageSound
  };
};