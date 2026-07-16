// Language detection and translation utilities

// Devanagari Unicode range: 0900–097F
const DEVANAGARI_REGEX = /[\u0900-\u097F]/;

// Common Marathi-specific characters/words
const MARATHI_MARKERS = [
  'आहे', 'नाही', 'माझ', 'तुमच', 'कृपया', 'गाय', 'म्हैस', 'दूध',
  'जनावर', 'पशु', 'ताप', 'आजार', 'खात', 'चालत', 'बसल',
  'होत', 'करा', 'सांगा', 'काय', 'कस', 'का', 'ला', 'ने', 'चे', 'ची',
];

// Common Hindi-specific words
const HINDI_MARKERS = [
  'है', 'नहीं', 'मेरी', 'मेरा', 'आपका', 'कृपया', 'गाय', 'भैंस', 'दूध',
  'जानवर', 'पशु', 'बुखार', 'बीमार', 'खाना', 'चलना', 'बैठना',
  'हो', 'करो', 'बताओ', 'क्या', 'कैसे', 'क्यों', 'को', 'से', 'का', 'की',
  'रहा', 'रही', 'रहे', 'कम', 'ज्यादा',
];

/**
 * Detect the language of input text
 * @param {string} text - Input text
 * @returns {'en'|'hi'|'mr'} Detected language code
 */
export function detectLanguage(text) {
  if (!text || text.trim().length === 0) return 'en';

  const hasDevanagari = DEVANAGARI_REGEX.test(text);

  if (!hasDevanagari) {
    // Check for transliterated Hindi/Marathi (romanized)
    const lowerText = text.toLowerCase();
    const hindiRomanPatterns = [
      'meri', 'gai', 'gaay', 'bhains', 'doodh', 'bukhar', 'bimaari',
      'nahi', 'kya', 'kaise', 'kyu', 'kam', 'zyada', 'rahi', 'raha',
      'hai', 'hain', 'kar', 'chal', 'khana', 'peena',
    ];
    const marathiRomanPatterns = [
      'mazi', 'mazhi', 'gay', 'mhais', 'dudh', 'taap', 'ajar',
      'nahi', 'kay', 'kasa', 'ka', 'aahe', 'ahe', 'karat', 'chaalat',
      'garam', 'thandi',
    ];

    let hindiScore = 0;
    let marathiScore = 0;

    for (const pattern of hindiRomanPatterns) {
      if (lowerText.includes(pattern)) hindiScore++;
    }
    for (const pattern of marathiRomanPatterns) {
      if (lowerText.includes(pattern)) marathiScore++;
    }

    if (marathiScore > hindiScore && marathiScore >= 2) return 'mr';
    if (hindiScore > marathiScore && hindiScore >= 2) return 'hi';
    if (hindiScore >= 1) return 'hi';

    return 'en';
  }

  // Has Devanagari - determine Hindi vs Marathi
  const words = text.split(/\s+/);
  let marathiScore = 0;
  let hindiScore = 0;

  for (const word of words) {
    if (MARATHI_MARKERS.some(m => word.includes(m))) marathiScore++;
    if (HINDI_MARKERS.some(m => word.includes(m))) hindiScore++;
  }

  // Marathi-specific endings and patterns
  if (text.includes('आहे') || text.includes('नाही') || text.includes('माझ')) {
    marathiScore += 3;
  }
  // Hindi-specific patterns
  if (text.includes('है') || text.includes('रही') || text.includes('रहा')) {
    hindiScore += 2;
  }

  return marathiScore > hindiScore ? 'mr' : 'hi';
}

// Translation dictionaries for common livestock/farming terms
const translationDict = {
  en_to_hi: {
    'fever': 'बुखार',
    'temperature': 'तापमान',
    'high temperature': 'तेज बुखार',
    'cow': 'गाय',
    'buffalo': 'भैंस',
    'animal': 'पशु',
    'milk': 'दूध',
    'not eating': 'खाना नहीं खा रही',
    'not moving': 'चल नहीं रही',
    'low activity': 'कम सक्रियता',
    'veterinarian': 'पशुचिकित्सक',
    'consult': 'सलाह लें',
    'healthy': 'स्वस्थ',
    'sick': 'बीमार',
    'weak': 'कमजोर',
    'please': 'कृपया',
    'your animal': 'आपका पशु',
    'may have': 'हो सकता है',
    'disease': 'बीमारी',
    'sign': 'संकेत',
    'weakness': 'कमजोरी',
    'immediately': 'तुरंत',
    'water': 'पानी',
    'feed': 'चारा',
    'medicine': 'दवाई',
  },
  en_to_mr: {
    'fever': 'ताप',
    'temperature': 'तापमान',
    'high temperature': 'जास्त ताप',
    'cow': 'गाय',
    'buffalo': 'म्हैस',
    'animal': 'जनावर',
    'milk': 'दूध',
    'not eating': 'खात नाही',
    'not moving': 'चालत नाही',
    'low activity': 'कमी हालचाल',
    'veterinarian': 'पशुवैद्यक',
    'consult': 'सल्ला घ्या',
    'healthy': 'निरोगी',
    'sick': 'आजारी',
    'weak': 'अशक्त',
    'please': 'कृपया',
    'your animal': 'तुमचे जनावर',
    'may have': 'असू शकतो',
    'disease': 'आजार',
    'sign': 'लक्षण',
    'weakness': 'अशक्तपणा',
    'immediately': 'लगेच',
    'water': 'पाणी',
    'feed': 'चारा',
    'medicine': 'औषध',
  },
  hi_to_en: {
    'बुखार': 'fever',
    'तापमान': 'temperature',
    'गाय': 'cow',
    'भैंस': 'buffalo',
    'पशु': 'animal',
    'दूध': 'milk',
    'खाना': 'eating',
    'नहीं': 'not',
    'कम': 'low',
    'ज्यादा': 'high',
    'बीमार': 'sick',
    'कमजोर': 'weak',
    'चल': 'moving',
    'रही': '',
    'रहा': '',
    'गरम': 'hot',
    'ठंडी': 'cold',
  },
  mr_to_en: {
    'ताप': 'fever',
    'तापमान': 'temperature',
    'गाय': 'cow',
    'म्हैस': 'buffalo',
    'जनावर': 'animal',
    'दूध': 'milk',
    'खात': 'eating',
    'नाही': 'not',
    'कमी': 'low',
    'जास्त': 'high',
    'आजारी': 'sick',
    'अशक्त': 'weak',
    'चालत': 'moving',
    'गरम': 'hot',
    'थंड': 'cold',
    'आहे': 'is',
    'माझी': 'my',
    'माझा': 'my',
  },
  // Romanized Hindi to English
  roman_hi_to_en: {
    'meri': 'my',
    'gai': 'cow',
    'gaay': 'cow',
    'bhains': 'buffalo',
    'doodh': 'milk',
    'bukhar': 'fever',
    'bimaari': 'disease',
    'nahi': 'not',
    'kam': 'less',
    'zyada': 'more',
    'garam': 'hot',
    'chal': 'walk',
    'rahi': '',
    'raha': '',
    'hai': 'is',
    'kha': 'eat',
    'khana': 'eating',
  },
};

/**
 * Basic translation to English for processing
 * @param {string} text - Input text
 * @param {string} sourceLang - Source language code
 * @returns {string} Roughly translated English text
 */
export function translateToEnglish(text, sourceLang) {
  if (sourceLang === 'en') return text.toLowerCase();

  const words = text.split(/\s+/);
  let dict;

  if (sourceLang === 'hi') {
    dict = DEVANAGARI_REGEX.test(text) ? translationDict.hi_to_en : translationDict.roman_hi_to_en;
  } else {
    dict = DEVANAGARI_REGEX.test(text) ? translationDict.mr_to_en : translationDict.roman_hi_to_en;
  }

  const translated = words.map(word => {
    const clean = word.replace(/[।,?.!]/g, '');
    return dict[clean] || clean;
  }).filter(w => w.length > 0);

  return translated.join(' ').toLowerCase();
}

/**
 * Translate an English response to the target language
 * @param {string} key - Response key
 * @param {string} targetLang - Target language code
 * @returns {string} Translated response
 */
export function getLocalizedResponse(key, targetLang) {
  const responses = {
    fever: {
      en: "Your animal may have a fever. Please consult a veterinarian immediately. Keep the animal hydrated and in a cool place.",
      hi: "आपके पशु को बुखार हो सकता है। कृपया तुरंत पशुचिकित्सक से सलाह लें। पशु को पानी पिलाएं और ठंडी जगह पर रखें।",
      mr: "तुमच्या जनावराला ताप असू शकतो. कृपया लगेच पशुवैद्यकीय सल्ला घ्या. जनावराला पाणी द्या आणि थंड जागी ठेवा.",
    },
    low_activity: {
      en: "Your animal is showing low activity. This could be a sign of weakness or illness. Monitor closely and consult a veterinarian if it continues.",
      hi: "आपका पशु कम सक्रिय है। यह कमजोरी या बीमारी का संकेत हो सकता है। ध्यान से देखें और अगर यह जारी रहे तो पशुचिकित्सक से संपर्क करें।",
      mr: "तुमचे जनावर कमी हालचाल करत आहे. हे अशक्तपणा किंवा आजाराचे लक्षण असू शकते. लक्ष ठेवा आणि सुरू राहिल्यास पशुवैद्यकाशी संपर्क साधा.",
    },
    not_eating: {
      en: "Your animal is not eating properly. This could indicate digestive issues or illness. Try offering fresh feed and clean water. Consult a vet if it persists.",
      hi: "आपका पशु ठीक से खाना नहीं खा रहा। यह पाचन समस्या या बीमारी का संकेत हो सकता है। ताजा चारा और साफ पानी दें। अगर यह जारी रहे तो पशुचिकित्सक से मिलें।",
      mr: "तुमचे जनावर नीट खात नाही. हे पचनाची समस्या किंवा आजाराचे लक्षण असू शकते. ताजे चारा आणि स्वच्छ पाणी द्या. सुरू राहिल्यास पशुवैद्यकाकडे जा.",
    },
    low_milk: {
      en: "Milk yield has decreased. This may be due to stress, poor nutrition, or health issues. Ensure proper feed and check for any signs of illness.",
      hi: "दूध का उत्पादन कम हो गया है। यह तनाव, खराब पोषण, या स्वास्थ्य समस्याओं के कारण हो सकता है। सही चारा दें और बीमारी के लक्षण देखें।",
      mr: "दूध उत्पादन कमी झाले आहे. हे ताण, कमी पोषण, किंवा आरोग्य समस्यांमुळे असू शकते. योग्य चारा द्या आणि आजाराची लक्षणे तपासा.",
    },
    general_health: {
      en: "For general health queries, please provide more details about the symptoms. You can describe the animal's behavior, appetite, and any visible signs.",
      hi: "सामान्य स्वास्थ्य प्रश्नों के लिए, कृपया लक्षणों के बारे में अधिक जानकारी दें। आप पशु के व्यवहार, भूख और किसी भी दिखाई देने वाले लक्षण का वर्णन करें।",
      mr: "सामान्य आरोग्य प्रश्नांसाठी, कृपया लक्षणांबद्दल अधिक माहिती द्या. जनावराचे वर्तन, भूक आणि कोणत्याही दृश्य लक्षणांचे वर्णन करा.",
    },
    greeting: {
      en: "Hello! 🐄 I'm your livestock health assistant. How can I help you today? You can ask about your animal's health, temperature, activity, or milk yield.",
      hi: "नमस्ते! 🐄 मैं आपका पशु स्वास्थ्य सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ? आप अपने पशु के स्वास्थ्य, तापमान, गतिविधि या दूध उत्पादन के बारे में पूछ सकते हैं।",
      mr: "नमस्कार! 🐄 मी तुमचा पशु आरोग्य सहाय्यक आहे. आज मी तुम्हाला कशी मदत करू शकतो? तुम्ही तुमच्या जनावराचे आरोग्य, तापमान, हालचाल किंवा दूध उत्पादनाबद्दल विचारू शकता.",
    },
    emergency: {
      en: "⚠️ EMERGENCY: Based on the symptoms, this seems serious. Please contact your nearest veterinarian immediately! Keep the animal comfortable and hydrated.",
      hi: "⚠️ आपातकाल: लक्षणों के आधार पर, यह गंभीर लगता है। कृपया तुरंत अपने नजदीकी पशुचिकित्सक से संपर्क करें! पशु को आरामदायक रखें और पानी दें।",
      mr: "⚠️ आणीबाणी: लक्षणांवरून, हे गंभीर वाटते. कृपया लगेच तुमच्या जवळच्या पशुवैद्यकाशी संपर्क साधा! जनावराला आरामदायक ठेवा आणि पाणी द्या.",
    },
    vaccination: {
      en: "Regular vaccination is important for livestock health. Please consult your veterinarian for a proper vaccination schedule.",
      hi: "नियमित टीकाकरण पशु स्वास्थ्य के लिए महत्वपूर्ण है। उचित टीकाकरण अनुसूची के लिए अपने पशुचिकित्सक से सलाह लें।",
      mr: "नियमित लसीकरण पशु आरोग्यासाठी महत्त्वाचे आहे. योग्य लसीकरण वेळापत्रकासाठी तुमच्या पशुवैद्यकाचा सल्ला घ्या.",
    },
  };

  return responses[key]?.[targetLang] || responses[key]?.['en'] || responses.general_health[targetLang];
}
