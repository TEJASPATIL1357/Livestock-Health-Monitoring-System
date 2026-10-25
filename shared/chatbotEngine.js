import { generateAdvice, getStatusLabel } from './adviceSystem';

const DEVANAGARI = /[\u0900-\u097F]/;

export function detectLanguage(text) {
  if (!text?.trim()) return 'en';
  if (!DEVANAGARI.test(text)) {
    const lower = text.toLowerCase();
    const hiWords = ['meri', 'gai', 'bukhar', 'nahi', 'kam', 'hai', 'rahi', 'chal', 'garam', 'doodh', 'dudh'];
    const mrWords = ['mazi', 'mazhi', 'gay', 'dudh', 'taap', 'ahe', 'nahi', 'karat', 'bhuk', 'chara'];
    let hi = 0, mr = 0;
    hiWords.forEach(w => { if (lower.includes(w)) hi++; });
    mrWords.forEach(w => { if (lower.includes(w)) mr++; });
    if (mr > hi && mr >= 1) return 'mr';
    if (hi >= 1) return 'hi';
    return 'en';
  }
  if (text.includes('आहे') || text.includes('माझ') || text.includes('गायीला')) return 'mr';
  return 'hi';
}

const RESPONSES = {
  fever: {
    en: "Your animal may have a fever. Please give it fresh water, keep it in a cool place, and call a doctor.",
    hi: "आपके पशु को बुखार हो सकता है। कृपया उसे ताज़ा पानी दें, ठंडी जगह पर रखें और डॉक्टर को बुलाएं।",
    mr: "तुमच्या जनावराला ताप असू शकतो. कृपया त्याला ताजे पाणी द्या, थंड जागी ठेवा आणि डॉक्टरांना बोलवा.",
  },
  low_activity: {
    en: "Your animal is moving less. It might be weak or sick. Check if it is eating properly.",
    hi: "आपका पशु कम चल रहा है। वह कमजोर या बीमार हो सकता है। जांचें कि वह ठीक से खा रहा है या नहीं।",
    mr: "तुमचे जनावर कमी हालचाल करत आहे. ते अशक्त किंवा आजारी असू शकते. ते नीट खात आहे का ते तपासा.",
  },
  not_eating: {
    en: "If the animal is not eating, it needs rest and a check-up. Try giving fresh grass and clean water.",
    hi: "यदि पशु नहीं खा रहा है, तो उसे आराम और जांच की आवश्यकता है। ताजी घास और साफ पानी देने का प्रयास करें।",
    mr: "जर जनावर खात नसेल, तर त्याला विश्रांती आणि तपासणीची गरज आहे. ताजे गवत आणि स्वच्छ पाणी देण्याचा प्रयत्न करा.",
  },
  milk_drop: {
    en: "A drop in milk usually means stress or fever. Check the temperature and ensure clean surroundings.",
    hi: "दूध कम होने का मतलब आमतौर पर तनाव या बुखार होता है। तापमान की जांच करें और सफाई सुनिश्चित करें।",
    mr: "दूध कमी होणे म्हणजे सहसा ताण किंवा ताप असतो. तापमान तपासा आणि स्वच्छता ठेवा.",
  },
  greeting: {
    en: "Hello! 🐄 How can I help with your animals today?",
    hi: "नमस्ते! 🐄 आज मैं आपके पशुओं की क्या मदद कर सकता हूँ?",
    mr: "नमस्कार! 🐄 आज मी तुमच्या जनावरांसाठी काय मदत करू शकतो?",
  },
  general: {
    en: "Please tell me more. Is the animal eating? Does it have a fever?",
    hi: "कृपया मुझे और बताएं। क्या पशु खा रहा है? क्या उसे बुखार है?",
    mr: "कृपया मला अधिक सांगा. जनावर खात आहे का? त्याला ताप आहे का?",
  },
};

function detectIntent(text) {
  const t = text.toLowerCase();
  if (['fever', 'temperature', 'hot', 'garam', 'bukhar', 'taap', 'ताप', 'बुखार', 'गरम'].some(k => t.includes(k))) return 'fever';
  if (['not moving', 'inactive', 'lazy', 'slow', 'walk', 'chal', 'चालत', 'चल', 'कम', 'कमी'].some(k => t.includes(k))) return 'low_activity';
  if (['not eating', 'eat', 'food', 'feed', 'kha', 'खात', 'खाना', 'चारा'].some(k => t.includes(k))) return 'not_eating';
  if (['milk', 'less', 'yield', 'doodh', 'dudh', 'दूध'].some(k => t.includes(k))) return 'milk_drop';
  if (['hello', 'hi', 'hey', 'namaste', 'namaskar', 'नमस्कार', 'नमस्ते'].some(k => t.includes(k))) return 'greeting';
  return 'general';
}

export function processMessage(text, defaultLang = 'en') {
  const activeLang = ['en', 'hi', 'mr'].includes(defaultLang) ? defaultLang : 'en';
  if (!text?.trim()) {
    return { response: RESPONSES.greeting[activeLang], lang: activeLang, intent: 'greeting' };
  }
  let lang = detectLanguage(text);
  // If the detected language is English but the user selected a different default,
  // let's check if we should respect the globally selected language.
  if (lang === 'en' && activeLang !== 'en') {
    lang = activeLang;
  }
  const intent = detectIntent(text);
  return { 
    response: RESPONSES[intent]?.[lang] || RESPONSES.general[lang], 
    lang, 
    intent 
  };
}
