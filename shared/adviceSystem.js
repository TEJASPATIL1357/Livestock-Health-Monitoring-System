/**
 * Advice system to convert raw technical data into farmer-friendly human advice.
 */

export const generateAdvice = (data, lang = 'en') => {
  const { temperature, activity, milkYield } = data;
  
  const advice = {
    en: [],
    hi: [],
    mr: []
  };

  // Temperature Logic
  if (temperature >= 40.5) {
    advice.en.push({ status: 'Critical', text: 'Very High Fever! Call a doctor immediately and keep in shade.', color: 'red' });
    advice.hi.push({ status: 'गंभीर', text: 'बहुत तेज़ बुखार! तुरंत डॉक्टर को बुलाएं और छाया में रखें।', color: 'red' });
    advice.mr.push({ status: 'गंभीर', text: 'खूप ताप आहे! लगेच डॉक्टरांना बोलवा आणि सावलीत ठेवा.', color: 'red' });
  } else if (temperature >= 39.5) {
    advice.en.push({ status: 'Warning', text: 'High Temperature. Give fresh water and monitor closely.', color: 'yellow' });
    advice.hi.push({ status: 'चेतावनी', text: 'तेज़ बुखार। ताज़ा पानी दें और ध्यान से देखें।', color: 'yellow' });
    advice.mr.push({ status: 'सूचना', text: 'ताप जास्त आहे. ताजे पाणी द्या आणि लक्ष ठेवा.', color: 'yellow' });
  } else {
    advice.en.push({ status: 'Normal', text: 'Temperature is normal.', color: 'green' });
    advice.hi.push({ status: 'सामान्य', text: 'तापमान सामान्य है।', color: 'green' });
    advice.mr.push({ status: 'सामान्य', text: 'तापमान सामान्य आहे.', color: 'green' });
  }

  // Activity Logic
  if (activity < 30) {
    advice.en.push({ status: 'Critical', text: 'Low Activity. Animal looks weak, please check if it is eating.', color: 'red' });
    advice.hi.push({ status: 'गंभीर', text: 'कम गतिविधि। पशु कमजोर दिख रहा है, कृपया देखें कि वह खा रहा है या नहीं।', color: 'red' });
    advice.mr.push({ status: 'गंभीर', text: 'हालचाल कमी आहे. जनावर अशक्त दिसत आहे, चारा खात आहे का ते तपासा.', color: 'red' });
  } else if (activity < 50) {
    advice.en.push({ status: 'Warning', text: 'Less Active than usual.', color: 'yellow' });
    advice.hi.push({ status: 'चेतावनी', text: 'सामान्य से कम सक्रिय।', color: 'yellow' });
    advice.mr.push({ status: 'सूचना', text: 'नेहमीपेक्षा हालचाल कमी आहे.', color: 'yellow' });
  }

  // Milk Yield Logic
  if (milkYield < (data.avgMilkYield * 0.7)) {
    advice.en.push({ status: 'Warning', text: 'Milk production dropped. Check for stress or illness.', color: 'yellow' });
    advice.hi.push({ status: 'चेतावनी', text: 'दूध उत्पादन कम हो गया है। तनाव या बीमारी की जांच करें।', color: 'yellow' });
    advice.mr.push({ status: 'सूचना', text: 'दूध कमी झाले आहे. काही त्रास किंवा आजार आहे का ते पहा.', color: 'yellow' });
  }

  return advice[lang] || advice.en;
};

export const getStatusLabel = (temp, act, lang = 'en') => {
  const labels = {
    temp: {
      high: { en: 'High Temperature', hi: 'तेज़ बुखार', mr: 'ताप जास्त' },
      normal: { en: 'Normal', hi: 'सामान्य', mr: 'सामान्य' }
    },
    activity: {
      low: { en: 'Low Activity', hi: 'कम सक्रिय', mr: 'कमी हालचाल' },
      active: { en: 'Active', hi: 'सक्रिय', mr: 'सक्रिय' }
    }
  };

  return {
    temperature: temp >= 39.5 ? labels.temp.high[lang] : labels.temp.normal[lang],
    activity: act < 40 ? labels.activity.low[lang] : labels.activity.active[lang]
  };
};
