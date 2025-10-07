"use client";

import { useState, useRef, useEffect } from "react";

import { CommentInputProps } from '~/constants/comment';
import MentionAutocomplete from '~/components/ui/mention-autocomplete';
import { 
  MentionUser, 
  hasMentionTrigger, 
  extractMentionQuery, 
  insertMention, 
  calculateMentionPosition,
  formatMentionsForStorage
} from '~/lib/mention-utils';
import { convertTextToEmoji, EMOJI_CATEGORIES, handleEmojiConversion, convertTextToEmojiOnSubmit } from '~/lib/emoji-converter';

export default function CommentInput({ onSubmit, user }: CommentInputProps) {
  const [commentText, setCommentText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPosition, setMentionPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionsInInput, setMentionsInInput] = useState<Array<{ id: string; name: string; displayName: string }>>([]);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState<string>('Faces');
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isUserBanned = user && user.isBanned && user.bannedUntil && new Date(user.bannedUntil) > new Date();


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      const convertedText = convertTextToEmojiOnSubmit(commentText);
      const storageText = formatMentionsForStorage(convertedText, mentionsInInput);
      onSubmit(storageText, user);
      setCommentText("");
      setMentionsInInput([]);
      setShowMentionDropdown(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    const { convertedText, newCursorPosition, shouldConvert } = handleEmojiConversion(value, cursorPos);
    
    if (shouldConvert) {
      setCommentText(convertedText);
      setCursorPosition(newCursorPosition);
      
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
    } else {
      setCommentText(value);
      setCursorPosition(cursorPos);
    }
    
    if (hasMentionTrigger(convertedText, newCursorPosition)) {
      const query = extractMentionQuery(convertedText, newCursorPosition);
      
      if (query !== null) {
        setMentionQuery(query);
        
        if (inputRef.current) {
          const position = calculateMentionPosition(inputRef.current, newCursorPosition, convertedText);
          setMentionPosition(position);
        }
        
        setShowMentionDropdown(true);
      }
    } else {
      setShowMentionDropdown(false);
    }
  };

  const handleMentionSelect = (selectedUser: MentionUser) => {
    const { newText, newCursorPosition, insertedMention } = insertMention(commentText, cursorPosition, mentionQuery, selectedUser);
    
    setCommentText(newText);
    setMentionsInInput(prev => [...prev, insertedMention]);
    setShowMentionDropdown(false);
    setMentionQuery("");
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };

  const handleMentionClose = () => {
    setShowMentionDropdown(false);
    setMentionQuery("");
  };

  const handleEmojiClick = (emoji: string) => {
    setCommentText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800/30 rounded-2xl p-3 border border-gray-200 dark:border-gray-700/50">
      {isUserBanned ? (
        <>
          <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">You are banned from commenting</span>
            </div>
          </div>
          <div className="text-center text-gray-600 dark:text-gray-400">
            <span>Ban duration: <b>{user.bannedUntil ? new Date(user.bannedUntil).toLocaleString() : 'Unknown'}</b></span>
          </div>
        </>
      ) : (
        <div className="flex items-start gap-3">
          <div className="relative">
            <img
              src={user?.image || "/images/common/loading.png"}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <button 
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded-full flex items-center justify-center"
              title="Change commenting identity"
              aria-label="Change commenting identity"
            >
              <svg className="w-2 h-2 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

                     <div className="flex-1 relative">
             <form onSubmit={handleSubmit} className="relative">
               <div className="relative">
                 <input
                   ref={inputRef}
                   type="text"
                   value={commentText}
                   onChange={handleInputChange}
                   placeholder="Write a comment... Use @ to mention users"
                   className="w-full rounded-xl bg-gray-200/50 dark:bg-gray-700/50 border border-gray-300/50 dark:border-gray-600/50 pl-4 pr-10 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500/50 text-sm"
                 />
                 <button
                   ref={emojiButtonRef}
                   type="button"
                   onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                   className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors p-1"
                   title="Add emoji"
                   tabIndex={-1}
                 >
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
                   </svg>
                 </button>
                 <button 
                   type="submit"
                   disabled={!commentText.trim()}
                   className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed transition-colors p-1"
                   aria-label="Send comment"
                 >
                   <svg className="h-4 w-4 rotate-90" fill="currentColor" viewBox="0 0 20 20">
                     <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                   </svg>
                 </button>
               </div>
               
               {commentText && convertTextToEmoji(commentText) !== commentText && (
                 <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                   <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Preview:</div>
                   <div className="text-sm text-gray-700 dark:text-gray-300">
                     {convertTextToEmoji(commentText)}
                   </div>
                 </div>
               )}
             </form>
            
             {showEmojiPicker && (
               <div
                 ref={emojiPickerRef}
                 className="absolute z-50 right-10 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg w-80"
               >
                 {/* Category Tabs */}
                 <div className="flex border-b border-gray-200 dark:border-gray-700">
                   {Object.keys(EMOJI_CATEGORIES).map((category) => (
                     <button
                       key={category}
                       onClick={() => setActiveEmojiCategory(category)}
                       className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                         activeEmojiCategory === category
                           ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                           : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                       }`}
                     >
                       {category}
                     </button>
                   ))}
                 </div>
                 
                 {/* Emoji Grid */}
                 <div className="p-3 max-h-60 overflow-y-auto scrollbar-hide">
                   <div className="grid grid-cols-8 gap-1">
                     {Object.entries(EMOJI_CATEGORIES[activeEmojiCategory as keyof typeof EMOJI_CATEGORIES]).map(([shortcut, emoji], index) => (
                       <button
                         key={index}
                         onClick={() => handleEmojiClick(emoji)}
                         className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-lg"
                         title={`${emoji} (${shortcut})`}
                       >
                         {emoji}
                       </button>
                     ))}
                   </div>
                 </div>
               </div>
             )}
             
             <MentionAutocomplete
               isVisible={showMentionDropdown}
               query={mentionQuery}
               onSelect={handleMentionSelect}
               onClose={handleMentionClose}
               position={mentionPosition}
               inputWidth={inputRef.current?.offsetWidth}
             />
           </div>
         </div>
       )}
     </div>
   );
} 