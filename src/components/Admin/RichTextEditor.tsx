import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  List, ListOrdered, Quote, Link, Image, Table, Code, Undo, Redo, Type, Palette, 
  Highlighter, Indent, Outdent, Subscript, Superscript, Copy, Scissors, Eye, EyeOff, 
  Maximize2, Minimize2, FileText, Download, Upload, Save, RotateCcw, Search, Replace, 
  Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Minus, Plus, Zap, 
  PaintBucket, Eraser, Hash, AtSign, Percent, DollarSign, Euro, KeyRound as Pound,
  Video, Music, File, Smile, Heart, Star, Sun, Moon, Cloud, Zap as Lightning,
  Coffee, Camera, Phone, Mail, Home, Car, Plane, Ship, Bike, Train,
  MapPin, Calendar, Clock, Settings, User, Users, Shield, Lock, Key,
  CheckCircle, XCircle, AlertCircle, Info, HelpCircle, Flag, Tag,
  Bookmark, Archive, Trash, Edit, Filter, Grid, Layout, Layers,
  Monitor, Smartphone, Tablet, Laptop, Headphones, Speaker, Mic,
  Globe, Wifi, Bluetooth, Battery, Signal, Volume2, VolumeX,
  Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume,
  ThumbsUp, ThumbsDown, MessageCircle, Share, Send, Bell,
  Folder, FolderOpen, FileImage, FileVideo, FileAudio, FilePlus,
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Compass,
  Briefcase, TrendingUp, BarChart, PieChart
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing your content...",
  className = ""
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [fontSize, setFontSize] = useState('14');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [tableRows, setTableRows] = useState('3');
  const [tableCols, setTableCols] = useState('3');
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [currentFormat, setCurrentFormat] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);

  // Extended font families including Google Fonts
  const fontFamilies = [
    'Arial', 'Arial Black', 'Helvetica', 'Times New Roman', 'Times', 'Georgia', 
    'Verdana', 'Courier New', 'Courier', 'Trebuchet MS', 'Impact', 'Comic Sans MS',
    'Palatino', 'Garamond', 'Bookman', 'Avant Garde', 'Tahoma', 'Geneva',
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro', 'Raleway',
    'Poppins', 'Nunito', 'Playfair Display', 'Merriweather', 'Oswald', 'Ubuntu'
  ];

  // Extended font sizes
  const fontSizes = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '42', '48', '60', '72', '96'];

  // Extended color palette
  const colors = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080',
    '#FFA500', '#FFC0CB', '#A52A2A', '#DDA0DD', '#98FB98', '#F0E68C',
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
    '#74B9FF', '#A29BFE', '#FD79A8', '#FDCB6E', '#6C5CE7', '#00B894'
  ];

  // Emoji categories
  const emojiCategories = {
    'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
    'Gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
    'Nature': ['🌱', '🌿', '🍀', '🌸', '🌺', '🌻', '🌷', '🌹', '🥀', '🌾', '🌵', '🌲', '🌳', '🌴', '🌊', '🌈', '☀️', '🌙', '⭐', '✨', '⚡', '🔥', '❄️'],
    'Objects': ['📱', '💻', '⌨️', '🖥️', '🖨️', '📷', '📹', '🎥', '📞', '☎️', '📠', '📺', '📻', '🎵', '🎶', '🎤', '🎧', '📢', '📣', '📯', '🔔', '🔕'],
    'Symbols': ['💯', '🔥', '💫', '⭐', '🌟', '✨', '⚡', '💥', '💢', '💨', '💦', '💤', '🕳️', '💣', '💡', '🔍', '🔎', '🔒', '🔓', '🔑', '🗝️', '🔨', '⚒️', '🛠️', '🗡️', '⚔️', '🔫', '🏹']
  };

  // Icon categories using Lucide icons
  const iconCategories = {
    'Basic': [User, Users, Home, Settings, Search, Heart, Star, Flag],
    'Communication': [Mail, Phone, MessageCircle, Send, Bell, Share, Mic, Speaker],
    'Media': [Image, Video, Music, Camera, Play, Pause, Volume2, Headphones],
    'Files': [File, Folder, FileImage, FileVideo, FileAudio, Download, Upload, Save],
    'Navigation': [ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, MapPin, Globe, Compass],
    'Technology': [Monitor, Smartphone, Laptop, Wifi, Bluetooth, Battery, Signal],
    'Business': [Calendar, Clock, Briefcase, TrendingUp, BarChart, PieChart, DollarSign],
    'Social': [ThumbsUp, ThumbsDown, Share, Bookmark, Tag, Archive, Edit]
  };

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
      if (undoStack.current.length === 0) {
        undoStack.current.push(value);
      }
    }
  }, [value]);

  // Update word and character count
  useEffect(() => {
    const text = value.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(text.length);
  }, [value]);

  // Save to undo stack
  const saveToUndoStack = useCallback(() => {
    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML;
      if (undoStack.current[undoStack.current.length - 1] !== currentContent) {
        undoStack.current.push(currentContent);
        if (undoStack.current.length > 50) {
          undoStack.current.shift();
        }
        redoStack.current = [];
      }
    }
  }, []);

  // Execute formatting command
  const execCommand = useCallback((command: string, value?: string) => {
    try {
      saveToUndoStack();
      
      if (editorRef.current) {
        editorRef.current.focus();
      }
      
      const success = document.execCommand(command, false, value);
      
      if (success && editorRef.current) {
        onChange(editorRef.current.innerHTML);
        updateFormatState();
      }
      
      return success;
    } catch (error) {
      console.error('Command execution failed:', error);
      return false;
    }
  }, [onChange, saveToUndoStack]);

  // Update format state
  const updateFormatState = useCallback(() => {
    try {
      setCurrentFormat({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikethrough: document.queryCommandState('strikeThrough')
      });
    } catch (error) {
      console.error('Failed to update format state:', error);
    }
  }, []);

  // Handle content change
  const handleContentChange = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onChange(newContent);
      updateFormatState();
    }
  }, [onChange, updateFormatState]);

  // Handle text selection
  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection) {
      setSelectedText(selection.toString());
      updateFormatState();
    }
  }, [updateFormatState]);

  // Custom undo/redo
  const handleUndo = useCallback(() => {
    if (undoStack.current.length > 1) {
      const current = undoStack.current.pop();
      if (current) {
        redoStack.current.push(current);
      }
      const previous = undoStack.current[undoStack.current.length - 1];
      if (previous && editorRef.current) {
        editorRef.current.innerHTML = previous;
        onChange(previous);
      }
    }
  }, [onChange]);

  const handleRedo = useCallback(() => {
    if (redoStack.current.length > 0) {
      const next = redoStack.current.pop();
      if (next && editorRef.current) {
        undoStack.current.push(next);
        editorRef.current.innerHTML = next;
        onChange(next);
      }
    }
  }, [onChange]);

  // Insert heading
  const insertHeading = (level: number) => {
    execCommand('formatBlock', `h${level}`);
  };

  // Insert horizontal rule
  const insertHorizontalRule = () => {
    execCommand('insertHorizontalRule');
  };

  // Insert special characters
  const insertSpecialChar = (char: string) => {
    execCommand('insertText', char);
  };

  // Insert emoji
  const insertEmoji = (emoji: string) => {
    execCommand('insertText', emoji);
    setShowEmojiPicker(false);
  };

  // Insert icon
  const insertIcon = (IconComponent: React.ComponentType<any>, name: string) => {
    const iconSvg = `<span class="inline-icon" title="${name}" style="display: inline-block; width: 1em; height: 1em; vertical-align: middle;">📍</span>`;
    execCommand('insertHTML', iconSvg);
    setShowIconPicker(false);
  };

  // Insert link
  const insertLink = () => {
    if (linkUrl.trim()) {
      const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
      
      if (selectedText) {
        execCommand('createLink', url);
      } else if (linkText.trim()) {
        execCommand('insertHTML', `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`);
      } else {
        execCommand('insertHTML', `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
      }
      
      setShowLinkDialog(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  // Insert image
  const insertImage = () => {
    if (imageUrl.trim()) {
      const alt = imageAlt.trim() || 'Image';
      const imgHTML = `
        <figure style="margin: 20px 0; text-align: center;">
          <img src="${imageUrl}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
          ${imageAlt ? `<figcaption style="margin-top: 8px; font-size: 14px; color: #666; font-style: italic;">${imageAlt}</figcaption>` : ''}
        </figure>
      `;
      execCommand('insertHTML', imgHTML);
      setShowImageDialog(false);
      setImageUrl('');
      setImageAlt('');
    }
  };

  // Insert video
  const insertVideo = () => {
    if (videoUrl.trim()) {
      let videoHTML = '';
      
      // Check if it's a YouTube URL
      const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      if (youtubeMatch) {
        const videoId = youtubeMatch[1];
        videoHTML = `
          <div style="margin: 20px 0; text-align: center;">
            <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
              <iframe src="https://www.youtube.com/embed/${videoId}" 
                      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" 
                      allowfullscreen>
              </iframe>
            </div>
            ${videoTitle ? `<p style="margin-top: 8px; font-size: 14px; color: #666; font-style: italic;">${videoTitle}</p>` : ''}
          </div>
        `;
      } else if (videoUrl.match(/\.(mp4|webm|ogg)$/i)) {
        // Direct video file
        videoHTML = `
          <div style="margin: 20px 0; text-align: center;">
            <video controls style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
              <source src="${videoUrl}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
            ${videoTitle ? `<p style="margin-top: 8px; font-size: 14px; color: #666; font-style: italic;">${videoTitle}</p>` : ''}
          </div>
        `;
      } else {
        // Generic video link
        videoHTML = `
          <div style="margin: 20px 0; padding: 20px; border: 2px dashed #ddd; border-radius: 8px; text-align: center;">
            <p style="margin: 0 0 10px 0; font-weight: bold;">📹 Video</p>
            <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">
              ${videoTitle || videoUrl}
            </a>
          </div>
        `;
      }
      
      execCommand('insertHTML', videoHTML);
      setShowVideoDialog(false);
      setVideoUrl('');
      setVideoTitle('');
    }
  };

  // Insert table
  const insertTable = () => {
    const rows = parseInt(tableRows) || 3;
    const cols = parseInt(tableCols) || 3;
    
    let tableHTML = `
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    `;
    
    // Header row
    tableHTML += '<thead style="background: linear-gradient(135deg, #22c55e, #16a34a);"><tr>';
    for (let j = 0; j < cols; j++) {
      tableHTML += `<th style="padding: 12px; border: 1px solid #ddd; color: white; font-weight: bold; text-align: left;">Header ${j + 1}</th>`;
    }
    tableHTML += '</tr></thead>';
    
    // Body rows
    tableHTML += '<tbody>';
    for (let i = 0; i < rows - 1; i++) {
      tableHTML += `<tr style="${i % 2 === 0 ? 'background: #f9fafb;' : 'background: white;'}">`;
      for (let j = 0; j < cols; j++) {
        tableHTML += `<td style="padding: 12px; border: 1px solid #ddd;">Cell ${i + 1}-${j + 1}</td>`;
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</tbody></table>';
    
    execCommand('insertHTML', tableHTML);
    setShowTableDialog(false);
  };

  // Handle file uploads
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const imgHTML = `
          <figure style="margin: 20px 0; text-align: center;">
            <img src="${result}" alt="${file.name}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
            <figcaption style="margin-top: 8px; font-size: 14px; color: #666; font-style: italic;">${file.name}</figcaption>
          </figure>
        `;
        execCommand('insertHTML', imgHTML);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const videoHTML = `
          <div style="margin: 20px 0; text-align: center;">
            <video controls style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
              <source src="${result}" type="${file.type}">
              Your browser does not support the video tag.
            </video>
            <p style="margin-top: 8px; font-size: 14px; color: #666; font-style: italic;">${file.name}</p>
          </div>
        `;
        execCommand('insertHTML', videoHTML);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const audioHTML = `
          <div style="margin: 20px 0; padding: 20px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
            <p style="margin: 0 0 10px 0; font-weight: bold; display: flex; align-items: center;">
              🎵 ${file.name}
            </p>
            <audio controls style="width: 100%;">
              <source src="${result}" type="${file.type}">
              Your browser does not support the audio tag.
            </audio>
          </div>
        `;
        execCommand('insertHTML', audioHTML);
      };
      reader.readAsDataURL(file);
    }
  };

  // Find and replace
  const findAndReplace = () => {
    if (findText.trim() && replaceText.trim()) {
      const content = editorRef.current?.innerHTML || '';
      const newContent = content.replace(new RegExp(findText, 'gi'), replaceText);
      if (editorRef.current) {
        editorRef.current.innerHTML = newContent;
        onChange(newContent);
      }
    }
  };

  // Export content
  const exportContent = () => {
    const blob = new Blob([value], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'article-content.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear formatting
  const clearFormatting = () => {
    execCommand('removeFormat');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            execCommand('bold');
            break;
          case 'i':
            e.preventDefault();
            execCommand('italic');
            break;
          case 'u':
            e.preventDefault();
            execCommand('underline');
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
          case 'f':
            e.preventDefault();
            setShowFindReplace(true);
            break;
        }
      }
    };

    if (editorRef.current) {
      editorRef.current.addEventListener('keydown', handleKeyDown);
      return () => {
        editorRef.current?.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [execCommand, handleUndo, handleRedo]);

  // Toolbar button component
  const ToolbarButton: React.FC<{
    icon: React.ComponentType<any>;
    title: string;
    onClick: () => void;
    isActive?: boolean;
    className?: string;
    disabled?: boolean;
  }> = ({ icon: Icon, title, onClick, isActive, className = "", disabled = false }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
        isActive ? 'bg-primary-100 text-primary-600 shadow-sm' : 'text-gray-600'
      } ${className}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'relative'} ${className}`}>
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        {/* Toolbar */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-3">
          {/* First Row - File Operations & History */}
          <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-gray-200">
            <div className="flex items-center space-x-1">
              <ToolbarButton icon={FileText} title="New Document" onClick={() => onChange('')} />
              <ToolbarButton icon={Upload} title="Import Image" onClick={() => fileInputRef.current?.click()} />
              <ToolbarButton icon={Download} title="Export HTML" onClick={exportContent} />
              <ToolbarButton icon={Save} title="Save (Ctrl+S)" onClick={() => {}} />
            </div>
            
            <div className="w-px h-6 bg-gray-300"></div>
            
            <div className="flex items-center space-x-1">
              <ToolbarButton 
                icon={Undo} 
                title="Undo (Ctrl+Z)" 
                onClick={handleUndo}
                disabled={undoStack.current.length <= 1}
              />
              <ToolbarButton 
                icon={Redo} 
                title="Redo (Ctrl+Shift+Z)" 
                onClick={handleRedo}
                disabled={redoStack.current.length === 0}
              />
            </div>
            
            <div className="w-px h-6 bg-gray-300"></div>
            
            <div className="flex items-center space-x-1">
              <ToolbarButton icon={Search} title="Find & Replace (Ctrl+F)" onClick={() => setShowFindReplace(true)} />
              <ToolbarButton icon={Eraser} title="Clear Formatting" onClick={clearFormatting} />
            </div>

            <div className="flex-1"></div>

            <div className="flex items-center space-x-1">
              <ToolbarButton 
                icon={showPreview ? EyeOff : Eye} 
                title={showPreview ? "Hide Preview" : "Show Preview"} 
                onClick={() => setShowPreview(!showPreview)} 
              />
              <ToolbarButton 
                icon={isFullscreen ? Minimize2 : Maximize2} 
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} 
                onClick={() => setIsFullscreen(!isFullscreen)} 
              />
            </div>
          </div>

          {/* Second Row - Font & Text Formatting */}
          <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-gray-200">
            {/* Font Family */}
            <select
              value={fontFamily}
              onChange={(e) => {
                setFontFamily(e.target.value);
                execCommand('fontName', e.target.value);
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 bg-white min-w-36"
            >
              {fontFamilies.map(font => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>

            {/* Font Size */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  const newSize = Math.max(8, parseInt(fontSize) - 2);
                  setFontSize(newSize.toString());
                  execCommand('fontSize', '1');
                  execCommand('fontSize', newSize.toString());
                }}
                className="p-1 hover:bg-gray-100 rounded"
                title="Decrease Font Size"
              >
                <Minus className="h-3 w-3" />
              </button>
              
              <select
                value={fontSize}
                onChange={(e) => {
                  setFontSize(e.target.value);
                  execCommand('fontSize', '1');
                  execCommand('fontSize', e.target.value);
                }}
                className="px-2 py-1 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-primary-500 bg-white w-16"
              >
                {fontSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              
              <button
                onClick={() => {
                  const newSize = Math.min(96, parseInt(fontSize) + 2);
                  setFontSize(newSize.toString());
                  execCommand('fontSize', '1');
                  execCommand('fontSize', newSize.toString());
                }}
                className="p-1 hover:bg-gray-100 rounded"
                title="Increase Font Size"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-300"></div>

            {/* Text Formatting */}
            <div className="flex items-center space-x-1">
              <ToolbarButton 
                icon={Bold} 
                title="Bold (Ctrl+B)" 
                onClick={() => execCommand('bold')}
                isActive={currentFormat.bold}
              />
              <ToolbarButton 
                icon={Italic} 
                title="Italic (Ctrl+I)" 
                onClick={() => execCommand('italic')}
                isActive={currentFormat.italic}
              />
              <ToolbarButton 
                icon={Underline} 
                title="Underline (Ctrl+U)" 
                onClick={() => execCommand('underline')}
                isActive={currentFormat.underline}
              />
              <ToolbarButton 
                icon={Strikethrough} 
                title="Strikethrough" 
                onClick={() => execCommand('strikeThrough')}
                isActive={currentFormat.strikethrough}
              />
              <ToolbarButton icon={Subscript} title="Subscript" onClick={() => execCommand('subscript')} />
              <ToolbarButton icon={Superscript} title="Superscript" onClick={() => execCommand('superscript')} />
            </div>

            <div className="w-px h-6 bg-gray-300"></div>

            {/* Colors */}
            <div className="flex items-center space-x-1">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-1"
                  title="Text Color"
                >
                  <Type className="h-4 w-4" style={{ color: textColor }} />
                  <div className="w-4 h-1 rounded" style={{ backgroundColor: textColor }}></div>
                </button>
                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-1 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    <div className="grid grid-cols-6 gap-1 mb-3">
                      {colors.map(color => (
                        <button
                          key={color}
                          onClick={() => {
                            setTextColor(color);
                            execCommand('foreColor', color);
                            setShowColorPicker(false);
                          }}
                          className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => {
                        setTextColor(e.target.value);
                        execCommand('foreColor', e.target.value);
                      }}
                      className="w-full h-8 border border-gray-200 rounded cursor-pointer"
                    />
                  </div>
                )}
              </div>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-1"
                  title="Background Color"
                >
                  <PaintBucket className="h-4 w-4" />
                  <div className="w-4 h-1 rounded" style={{ backgroundColor: backgroundColor }}></div>
                </button>
                {showBgColorPicker && (
                  <div className="absolute top-full left-0 mt-1 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    <div className="grid grid-cols-6 gap-1 mb-3">
                      {colors.map(color => (
                        <button
                          key={color}
                          onClick={() => {
                            setBackgroundColor(color);
                            execCommand('backColor', color);
                            setShowBgColorPicker(false);
                          }}
                          className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => {
                        setBackgroundColor(e.target.value);
                        execCommand('backColor', e.target.value);
                      }}
                      className="w-full h-8 border border-gray-200 rounded cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Third Row - Headings & Alignment */}
          <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-gray-200">
            {/* Headings */}
            <div className="flex items-center space-x-1">
              <ToolbarButton icon={Heading1} title="Heading 1" onClick={() => insertHeading(1)} />
              <ToolbarButton icon={Heading2} title="Heading 2" onClick={() => insertHeading(2)} />
              <ToolbarButton icon={Heading3} title="Heading 3" onClick={() => insertHeading(3)} />
              <ToolbarButton icon={Heading4} title="Heading 4" onClick={() => insertHeading(4)} />
            </div>

            <div className="w-px h-6 bg-gray-300"></div>

            {/* Alignment */}
            <div className="flex items-center space-x-1">
              <ToolbarButton icon={AlignLeft} title="Align Left" onClick={() => execCommand('justifyLeft')} />
              <ToolbarButton icon={AlignCenter} title="Align Center" onClick={() => execCommand('justifyCenter')} />
              <ToolbarButton icon={AlignRight} title="Align Right" onClick={() => execCommand('justifyRight')} />
              <ToolbarButton icon={AlignJustify} title="Justify" onClick={() => execCommand('justifyFull')} />
            </div>

            <div className="w-px h-6 bg-gray-300"></div>

            {/* Lists and Indentation */}
            <div className="flex items-center space-x-1">
              <ToolbarButton icon={List} title="Bullet List" onClick={() => execCommand('insertUnorderedList')} />
              <ToolbarButton icon={ListOrdered} title="Numbered List" onClick={() => execCommand('insertOrderedList')} />
              <ToolbarButton icon={Outdent} title="Decrease Indent" onClick={() => execCommand('outdent')} />
              <ToolbarButton icon={Indent} title="Increase Indent" onClick={() => execCommand('indent')} />
            </div>

            <div className="w-px h-6 bg-gray-300"></div>

            {/* Special Elements */}
            <div className="flex items-center space-x-1">
              <ToolbarButton icon={Quote} title="Blockquote" onClick={() => execCommand('formatBlock', 'blockquote')} />
              <ToolbarButton icon={Code} title="Code Block" onClick={() => execCommand('formatBlock', 'pre')} />
              <ToolbarButton icon={Minus} title="Horizontal Rule" onClick={insertHorizontalRule} />
            </div>
          </div>

          {/* Fourth Row - Media & Insert Elements */}
          <div className="flex items-center space-x-2">
            {/* Media Elements */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setShowImageDialog(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                title="Insert Image"
              >
                <Image className="h-4 w-4" />
              </button>
              
              <button
                type="button"
                onClick={() => setShowVideoDialog(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                title="Insert Video"
              >
                <Video className="h-4 w-4" />
              </button>
              
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                title="Insert Audio"
              >
                <Music className="h-4 w-4" />
              </button>
              
              <button
                type="button"
                onClick={() => setShowLinkDialog(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                title="Insert Link"
              >
                <Link className="h-4 w-4" />
              </button>
              
              <button
                type="button"
                onClick={() => setShowTableDialog(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                title="Insert Table"
              >
                <Table className="h-4 w-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-300"></div>

            {/* Emojis & Icons */}
            <div className="flex items-center space-x-1">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                  title="Insert Emoji"
                >
                  <Smile className="h-4 w-4" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute top-full left-0 mt-1 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-80 max-h-64 overflow-y-auto">
                    {Object.entries(emojiCategories).map(([category, emojis]) => (
                      <div key={category} className="mb-4">
                        <h4 className="text-xs font-medium text-gray-600 mb-2">{category}</h4>
                        <div className="grid grid-cols-8 gap-1">
                          {emojis.map((emoji, index) => (
                            <button
                              key={index}
                              onClick={() => insertEmoji(emoji)}
                              className="p-2 hover:bg-gray-100 rounded text-lg"
                              title={emoji}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                  title="Insert Icon"
                >
                  <Star className="h-4 w-4" />
                </button>
                {showIconPicker && (
                  <div className="absolute top-full left-0 mt-1 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-80 max-h-64 overflow-y-auto">
                    {Object.entries(iconCategories).map(([category, icons]) => (
                      <div key={category} className="mb-4">
                        <h4 className="text-xs font-medium text-gray-600 mb-2">{category}</h4>
                        <div className="grid grid-cols-8 gap-1">
                          {icons.map((IconComponent, index) => (
                            <button
                              key={index}
                              onClick={() => insertIcon(IconComponent, category)}
                              className="p-2 hover:bg-gray-100 rounded text-gray-600"
                              title={`${category} Icon`}
                            >
                              <IconComponent className="h-4 w-4" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="w-px h-6 bg-gray-300"></div>

            {/* Special Characters */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => insertSpecialChar('©')}
                className="px-2 py-1 text-xs hover:bg-gray-100 rounded"
                title="Copyright"
              >
                ©
              </button>
              <button
                onClick={() => insertSpecialChar('®')}
                className="px-2 py-1 text-xs hover:bg-gray-100 rounded"
                title="Registered"
              >
                ®
              </button>
              <button
                onClick={() => insertSpecialChar('™')}
                className="px-2 py-1 text-xs hover:bg-gray-100 rounded"
                title="Trademark"
              >
                ™
              </button>
              <ToolbarButton icon={DollarSign} title="Dollar Sign" onClick={() => insertSpecialChar('$')} />
              <ToolbarButton icon={Euro} title="Euro Sign" onClick={() => insertSpecialChar('€')} />
              <ToolbarButton icon={Pound} title="Pound Sign" onClick={() => insertSpecialChar('£')} />
              <ToolbarButton icon={Percent} title="Percent Sign" onClick={() => insertSpecialChar('%')} />
              <ToolbarButton icon={Hash} title="Hash Sign" onClick={() => insertSpecialChar('#')} />
              <ToolbarButton icon={AtSign} title="At Sign" onClick={() => insertSpecialChar('@')} />
            </div>
          </div>
        </div>

        {/* Find & Replace Bar */}
        {showFindReplace && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-3">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Find..."
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                placeholder="Replace with..."
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={findAndReplace}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
              >
                Replace All
              </button>
              <button
                onClick={() => setShowFindReplace(false)}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Editor Content */}
        <div className={`${isFullscreen ? 'h-screen' : 'h-96'} flex`}>
          {/* Editor */}
          <div className={`${showPreview ? 'w-1/2 border-r border-gray-200' : 'w-full'} flex flex-col`}>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning={true}
              onInput={handleContentChange}
              onMouseUp={handleSelection}
              onKeyUp={handleSelection}
              onFocus={updateFormatState}
              className="flex-1 p-4 focus:outline-none overflow-y-auto prose prose-sm max-w-none"
              style={{ 
                fontFamily: fontFamily, 
                fontSize: `${fontSize}px`,
                lineHeight: '1.6',
                minHeight: '100%',
                direction: 'ltr',
                textAlign: 'left',
                unicodeBidi: 'embed'
              }}
              data-placeholder={placeholder}
              spellCheck="true"
              autoCorrect="on"
              autoCapitalize="sentences"
            />
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="w-1/2 bg-gray-50">
              <div className="p-4 border-b border-gray-200 bg-gray-100">
                <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>
              </div>
              <div 
                className="p-4 overflow-y-auto h-full prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: value }}
              />
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="font-medium">Words: {wordCount}</span>
            <span>Characters: {charCount}</span>
            {selectedText && <span className="text-primary-600">Selected: {selectedText.length} chars</span>}
          </div>
          <div className="flex items-center space-x-4">
            <span>Font: {fontFamily}</span>
            <span>Size: {fontSize}px</span>
            <span className="text-green-600">● Ready</span>
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        onChange={handleAudioUpload}
        className="hidden"
      />

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL *</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link Text (optional)</label>
                <input
                  type="text"
                  placeholder="Click here"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to use selected text or URL</p>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={insertLink}
                disabled={!linkUrl.trim()}
                className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                Insert Link
              </button>
              <button
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkUrl('');
                  setLinkText('');
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Insert Image</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL *</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text / Caption</label>
                <input
                  type="text"
                  placeholder="Describe the image"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="text-center">
                <span className="text-gray-500 text-sm">or</span>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                📁 Upload Image File
              </button>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={insertImage}
                disabled={!imageUrl.trim()}
                className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                Insert Image
              </button>
              <button
                onClick={() => {
                  setShowImageDialog(false);
                  setImageUrl('');
                  setImageAlt('');
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Dialog */}
      {showVideoDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Insert Video</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video URL *</label>
                <input
                  type="url"
                  placeholder="YouTube URL or direct video link"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">Supports YouTube, Vimeo, and direct video files</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video Title (optional)</label>
                <input
                  type="text"
                  placeholder="Video description"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="text-center">
                <span className="text-gray-500 text-sm">or</span>
              </div>
              <button
                onClick={() => videoInputRef.current?.click()}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                🎬 Upload Video File
              </button>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={insertVideo}
                disabled={!videoUrl.trim()}
                className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                Insert Video
              </button>
              <button
                onClick={() => {
                  setShowVideoDialog(false);
                  setVideoUrl('');
                  setVideoTitle('');
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Dialog */}
      {showTableDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Insert Table</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rows</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={tableRows}
                    onChange={(e) => setTableRows(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Columns</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tableCols}
                    onChange={(e) => setTableCols(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">Table will include a styled header row</p>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={insertTable}
                className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors"
              >
                Insert Table
              </button>
              <button
                onClick={() => setShowTableDialog(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          font-style: italic;
          position: absolute;
        }
        
        [contenteditable] {
          outline: none;
          direction: ltr;
          text-align: left;
          unicode-bidi: embed;
        }
        
        [contenteditable]:focus {
          outline: none;
        }
        
        [contenteditable] * {
          direction: ltr;
          unicode-bidi: embed;
        }
        
        [contenteditable] blockquote {
          border-left: 4px solid #22c55e;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          background: #f0fdf4;
          padding: 1rem;
          border-radius: 0.5rem;
          direction: ltr;
        }
        
        [contenteditable] pre {
          background: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
          white-space: pre-wrap;
          direction: ltr;
        }
        
        [contenteditable] table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
          direction: ltr;
        }
        
        [contenteditable] table td,
        [contenteditable] table th {
          border: 1px solid #d1d5db;
          padding: 0.75rem;
          text-align: left;
          direction: ltr;
        }
        
        [contenteditable] table th {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          font-weight: 600;
        }
        
        [contenteditable] h1,
        [contenteditable] h2,
        [contenteditable] h3,
        [contenteditable] h4,
        [contenteditable] h5,
        [contenteditable] h6 {
          font-weight: bold;
          margin: 1.5rem 0 0.75rem 0;
          direction: ltr;
          text-align: left;
          color: #1f2937;
        }
        
        [contenteditable] h1 { font-size: 2.25rem; }
        [contenteditable] h2 { font-size: 1.875rem; }
        [contenteditable] h3 { font-size: 1.5rem; }
        [contenteditable] h4 { font-size: 1.25rem; }
        [contenteditable] h5 { font-size: 1.125rem; }
        [contenteditable] h6 { font-size: 1rem; }
        
        [contenteditable] hr {
          border: none;
          border-top: 3px solid #22c55e;
          margin: 2rem 0;
          border-radius: 2px;
        }
        
        [contenteditable] a {
          color: #2563eb;
          text-decoration: underline;
          transition: color 0.2s;
        }
        
        [contenteditable] a:hover {
          color: #1d4ed8;
        }
        
        [contenteditable] ul,
        [contenteditable] ol {
          margin: 1rem 0;
          padding-left: 2rem;
          direction: ltr;
        }
        
        [contenteditable] li {
          margin: 0.5rem 0;
          direction: ltr;
          text-align: left;
        }
        
        [contenteditable] p {
          margin: 0.75rem 0;
          direction: ltr;
          text-align: left;
          line-height: 1.6;
        }
        
        [contenteditable] div {
          direction: ltr;
          text-align: left;
        }
        
        [contenteditable] figure {
          margin: 1.5rem 0;
          text-align: center;
        }
        
        [contenteditable] figcaption {
          font-style: italic;
          color: #6b7280;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }
        
        [contenteditable] .inline-icon {
          display: inline-block;
          width: 1em;
          height: 1em;
          vertical-align: middle;
          margin: 0 0.125rem;
        }
        
        [contenteditable] video,
        [contenteditable] audio {
          max-width: 100%;
          height: auto;
        }
        
        [contenteditable] iframe {
          max-width: 100%;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;