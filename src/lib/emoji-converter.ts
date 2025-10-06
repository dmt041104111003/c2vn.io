export const EMOJI_SHORTCUTS: Record<string, string> = {
  ':)': '😊',
  ':-)': '😊',
  ':D': '😃',
  ':-D': '😃',
  ':(': '😢',
  ':-(': '😢',
  ':P': '😛',
  ':-P': '😛',
  ':p': '😛',
  ':-p': '😛',
  ';)': '😉',
  ';-)': '😉',
  ':o': '😮',
  ':-o': '😮',
  ':O': '😮',
  ':-O': '😮',
  ':|': '😐',
  ':-|': '😐',
  ':x': '😶',
  ':-x': '😶',
  ':X': '😶',
  ':-X': '😶',
  ':$': '😳',
  ':-$': '😳',
  ':*': '😘',
  ':-*': '😘',
  ':/': '😕',
  ':-/': '😕',
  ':\\': '😕',
  ':-\\': '😕',
  
  'XD': '😆',
  'xD': '😆',
  'xDD': '😂',
  'XDD': '😂',
  'T_T': '😭',
  'T.T': '😭',
  'T-T': '😭',
  '^_^': '😊',
  '^_~': '😏',
  '^_*': '😘',
  '>_<': '😣',
  '>.<': '😣',
  'O_O': '😲',
  'o_o': '😲',
  'O_o': '😲',
  'o_O': '😲',
  '-_-': '😑',
  '-.-': '😑',
  'u_u': '😑',
  'U_U': '😑',
  'v_v': '😑',
  'V_V': '😑',
  
  '=))': '😂',
  '=)))': '😂',
  '=))))': '😂',
  'hihi': '😄',
  'haha': '😄',
  'hehe': '😄',
  'hoho': '😄',
  
  '<3': '❤️',
  '</3': '💔',
  'B)': '😎',
  'B-)': '😎',
  '8)': '😎',
  '8-)': '😎',
  '>:(': '😠',
  '>:-(': '😠',
  '>:)': '😈',
  '>:-)': '😈',
  'D:': '😱',
  'D-:': '😱',
  'D=': '😱',
  'D-=': '😱',
  
  'orz': '🙇',
  'ORZ': '🙇',
  'Orz': '🙇',
  'm(_ _)m': '🙇',
  'OTL': '🙇',
  'otl': '🙇',
  
  '~<3': '💕',
  '~</3': '💔',
  '>3': '💕',
  '>3<': '💕',
  
  '\\o/': '🙌',
  '\\O/': '🙌',
  'o/': '👋',
  'O/': '👋',
  '\\o': '👋',
  '\\O': '👋',
  
  '¯\\_(ツ)_/¯': '🤷',
  
  '(╯°□°）╯︵ ┻━┻': '😤',
};

export function convertTextToEmoji(text: string): string {
  let convertedText = text;
  
  const sortedShortcuts = Object.keys(EMOJI_SHORTCUTS).sort((a, b) => b.length - a.length);
  
  for (const shortcut of sortedShortcuts) {
    const regex = new RegExp(`\\b${escapeRegExp(shortcut)}\\b`, 'gi');
    convertedText = convertedText.replace(regex, EMOJI_SHORTCUTS[shortcut]);
  }
  
  return convertedText;
}

export function handleEmojiConversion(text: string, cursorPosition: number): { 
  convertedText: string; 
  newCursorPosition: number;
  shouldConvert: boolean;
} {
  let convertedText = text;
  let newCursorPosition = cursorPosition;
  let shouldConvert = false;
  
  if (text[cursorPosition - 1] === ' ') {
    const textBeforeSpace = text.substring(0, cursorPosition - 1);
    const sortedShortcuts = Object.keys(EMOJI_SHORTCUTS).sort((a, b) => b.length - a.length);
    
    for (const shortcut of sortedShortcuts) {
      if (textBeforeSpace.endsWith(shortcut)) {
        const beforeShortcut = textBeforeSpace.substring(0, textBeforeSpace.length - shortcut.length);
        convertedText = beforeShortcut + EMOJI_SHORTCUTS[shortcut] + ' ';
        newCursorPosition = convertedText.length;
        shouldConvert = true;
        break;
      }
    }
  }
  
  return { convertedText, newCursorPosition, shouldConvert };
}

export function convertTextToEmojiOnSubmit(text: string): string {
  let convertedText = text;
  
  const sortedShortcuts = Object.keys(EMOJI_SHORTCUTS).sort((a, b) => b.length - a.length);
  
  for (const shortcut of sortedShortcuts) {
    const regex = new RegExp(`\\b${escapeRegExp(shortcut)}(?=\\s|$)`, 'gi');
    convertedText = convertedText.replace(regex, EMOJI_SHORTCUTS[shortcut]);
  }
  
  return convertedText;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function hasEmojiShortcuts(text: string): boolean {
  const shortcuts = Object.keys(EMOJI_SHORTCUTS);
  return shortcuts.some(shortcut => 
    text.toLowerCase().includes(shortcut.toLowerCase())
  );
}

export function getEmojiPreview(text: string): string {
  return convertTextToEmoji(text);
}

export const EMOJI_CATEGORIES = {
  'Faces': {
    ':)': '😊',
    ':-)': '😊',
    ':D': '😃',
    ':-D': '😃',
    ':(': '😢',
    ':-(': '😢',
    ':P': '😛',
    ':-P': '😛',
    ':p': '😛',
    ':-p': '😛',
    ';)': '😉',
    ';-)': '😉',
    ':o': '😮',
    ':-o': '😮',
    ':O': '😮',
    ':-O': '😮',
    ':|': '😐',
    ':-|': '😐',
    ':x': '😶',
    ':-x': '😶',
    ':X': '😶',
    ':-X': '😶',
    ':$': '😳',
    ':-$': '😳',
    ':*': '😘',
    ':-*': '😘',
    ':/': '😕',
    ':-/': '😕',
    ':\\': '😕',
    ':-\\': '😕',
    'XD': '😆',
    'xD': '😆',
    'xDD': '😂',
    'XDD': '😂',
    'T_T': '😭',
    'T.T': '😭',
    'T-T': '😭',
    '^_^': '😊',
    '^_~': '😏',
    '^_*': '😘',
    '>_<': '😣',
    '>.<': '😣',
    'O_O': '😲',
    'o_o': '😲',
    'O_o': '😲',
    'o_O': '😲',
    '-_-': '😑',
    '-.-': '😑',
    'u_u': '😑',
    'U_U': '😑',
    'v_v': '😑',
    'V_V': '😑',
    '=))': '😂',
    '=)))': '😂',
    '=))))': '😂',
    'hihi': '😄',
    'haha': '😄',
    'hehe': '😄',
    'hoho': '😄',
    'B)': '😎',
    'B-)': '😎',
    '8)': '😎',
    '8-)': '😎',
    '>:(': '😠',
    '>:-(': '😠',
    '>:)': '😈',
    '>:-)': '😈',
    'D:': '😱',
    'D-:': '😱',
    'D=': '😱',
    'D-=': '😱',
    'vui': '😊',
    'buồn': '😢',
    'giận': '😠',
    'ngạc nhiên': '😮',
    'sợ': '😱',
    'cười': '😂',
    'khóc': '😭',
    'ngủ': '😴',
    'mệt': '😴',
    'đói': '🤤',
    'khát': '🤤',
    'đau': '🤒',
    'ốm': '🤒',
    'khỏe': '😊',
    'tốt': '😊',
    'xấu': '😠',
    'đẹp': '😍',
    'xinh': '😍',
    'dễ thương': '🥰',
    'ngầu': '😎',
    'tuyệt': '😎'
  },
  'Hearts & Love': {
    '<3': '❤️',
    '</3': '💔',
    '~<3': '💕',
    '~</3': '💔',
    '>3': '💕',
    '>3<': '💕',
    'love': '❤️',
    'luv': '❤️',
    'yêu': '❤️',
    'ghét': '💔'
  },
  'Actions': {
    'orz': '🙇',
    'ORZ': '🙇',
    'Orz': '🙇',
    'm(_ _)m': '🙇',
    'OTL': '🙇',
    'otl': '🙇',
    '\\o/': '🙌',
    '\\O/': '🙌',
    'o/': '👋',
    'O/': '👋',
    '\\o': '👋',
    '\\O': '👋',
    '¯\\_(ツ)_/¯': '🤷',
    '(╯°□°）╯︵ ┻━┻': '😤',
    'facepalm': '🤦',
    'face palm': '🤦',
    'clap': '👏',
    'claps': '👏'
  },
  'Symbols': {
    'fire': '🔥',
    'lit': '🔥',
    'party': '🎉',
    'celebration': '🎉',
    'thinking': '🤔',
    'hmm': '🤔',
    'hmmm': '🤔',
    'shocked': '😱',
    'omg': '😱',
    'wtf': '😱',
    'cool': '😎',
    'awesome': '😎',
    'lol': '😂',
    'lmao': '😂',
    'rofl': '😂',
    'laugh': '😂',
    'cry': '😭',
    'crying': '😭',
    'sad': '😢',
    'happy': '😊',
    'smile': '😊',
    'joy': '😊',
    'angry': '😠',
    'mad': '😠',
    'rage': '😠',
    'confused': '😕',
    'wut': '😕',
    'what': '😕',
    'sleepy': '😴',
    'tired': '😴',
    'sleep': '😴',
    'wink': '😉',
    'winking': '😉',
    'kiss': '😘',
    'kissing': '😘',
    'xoxo': '😘',
    'surprised': '😮',
    'wow': '😮',
    'amazing': '😮',
    'meh': '😐',
    'neutral': '😐',
    'whatever': '😐',
    'embarrassed': '😳',
    'blush': '😳',
    'shy': '😳',
    'sick': '🤒',
    'ill': '🤒',
    'unwell': '🤒',
    'money': '💰',
    'cash': '💰',
    'rich': '💰',
    'star': '⭐',
    'stars': '⭐',
    'favorite': '⭐',
    'check': '✅',
    'yes': '✅',
    'correct': '✅',
    'cross': '❌',
    'no': '❌',
    'wrong': '❌',
    'question': '❓',
    'exclamation': '❗'
  }
};