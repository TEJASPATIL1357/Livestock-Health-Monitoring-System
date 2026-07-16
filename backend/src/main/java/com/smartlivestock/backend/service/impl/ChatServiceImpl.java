package com.smartlivestock.backend.service.impl;

import com.smartlivestock.backend.dto.ChatRequestDto;
import com.smartlivestock.backend.entity.ChatHistory;
import com.smartlivestock.backend.entity.Farmer;
import com.smartlivestock.backend.repository.ChatHistoryRepository;
import com.smartlivestock.backend.repository.FarmerRepository;
import com.smartlivestock.backend.service.ChatService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class ChatServiceImpl implements ChatService {

    private final ChatHistoryRepository chatRepository;
    private final FarmerRepository farmerRepository;

    // Multilingual Response Dictionaries
    private static final Map<String, Map<String, String>> RESPONSES = new HashMap<>();

    static {
        // 1. FEVER ALARMS CLINICAL RECOMMENDATION
        Map<String, String> fever = new HashMap<>();
        fever.put("en", "Fever detected. Keep the animal hydrated, place it in a cool, shaded place, and contact a veterinarian immediately.");
        fever.put("hi", "पशु को बुखार हो सकता है। कृपया तुरंत पशुचिकित्सक से सलाह लें। पशु को पानी पिलाएं और ठंडी, छायादार जगह पर रखें।");
        fever.put("mr", "जनावराला ताप असू शकतो. कृपया लगेच पशुवैद्यकीय सल्ला घ्या. जनावराला पाणी द्या आणि थंड, सावलीच्या जागी ठेवा.");
        RESPONSES.put("fever", fever);

        // 2. LETHARGY / LOW ACTIVITY CLINICAL RECOMMENDATION
        Map<String, String> activity = new HashMap<>();
        activity.put("en", "Low activity detected. This could be a sign of weakness, physical stress, or infection. Monitor closely and contact a vet.");
        activity.put("hi", "पशु कम सक्रिय है। यह कमजोरी या बीमारी का संकेत हो सकता है। ध्यान से देखें और पशुचिकित्सक से संपर्क करें।");
        activity.put("mr", "जनावर कमी हालचाल करत आहे. हे अशक्तपणा किंवा आजाराचे लक्षण असू शकते. पशुवैद्यकाशी संपर्क साधा.");
        RESPONSES.put("low_activity", activity);

        // 3. LOSS OF APPETITE CLINICAL RECOMMENDATION
        Map<String, String> eating = new HashMap<>();
        eating.put("en", "Loss of appetite detected. Offer fresh feed and clean water. Check for mouth/hoof blisters (FMD). Consult a vet if it persists.");
        eating.put("hi", "पशु ठीक से खाना नहीं खा रहा। ताजा चारा और साफ पानी दें। खुरपका-मुँहपका (FMD) के लक्षण जांचें। चिकित्सक से मिलें।");
        eating.put("mr", "जनावर चारा खात नाही. ताजे चारा आणि स्वच्छ पाणी द्या. लाळ्या-खुरकुत (FMD) रोगाचे लक्षण तपासा. डॉक्टरांकडे जा.");
        RESPONSES.put("not_eating", eating);

        // 4. LOW MILK YIELD CLINICAL RECOMMENDATION
        Map<String, String> milk = new HashMap<>();
        milk.put("en", "Milk yield dropped. Check for physical signs of swelling or heat in the udder (Mastitis). Maintain proper milking hygiene.");
        milk.put("hi", "दूध उत्पादन में कमी आई है। थनों में सूजन (थनैला रोग/Mastitis) के लक्षण जांचें। थनों की स्वच्छता का विशेष ध्यान रखें।");
        milk.put("mr", "दूध उत्पादनात घट झाली आहे. कासेला सूज (दगडी/Mastitis) आल्याचे तपासा. कासेची स्वच्छतेची विशेष काळजी घ्या.");
        RESPONSES.put("low_milk", milk);

        // 5. GREETING DIALOGUES
        Map<String, String> greeting = new HashMap<>();
        greeting.put("en", "Hello! 🐄 I'm your smart livestock health assistant. Tell me about your animal's symptoms!");
        greeting.put("hi", "नमस्ते! 🐄 मैं आपका पशु स्वास्थ्य सहायक हूँ। अपने पशु के लक्षणों के बारे में पूछें!");
        greeting.put("mr", "नमस्कार! 🐄 मी तुमचा पशु आरोग्य सहाय्यक आहे. तुमच्या जनावराच्या लक्षणांबद्दल विचारा!");
        RESPONSES.put("greeting", greeting);

        // 6. GENERAL RESPONSE
        Map<String, String> general = new HashMap<>();
        general.put("en", "Please describe your animal's symptoms (e.g. fever, not eating, low milk yield) so I can help.");
        general.put("hi", "कृपया पशु के लक्षणों (जैसे बुखार, खाना न खाना, कम दूध) का विवरण दें ताकि मैं मदद कर सकूं।");
        general.put("mr", "कृपया जनावराच्या लक्षणांचे (जसे ताप, न खाणे, कमी दूध) वर्णन करा जेणेकरून मी मदत करू शकेन.");
        RESPONSES.put("general", general);
    }

    public ChatServiceImpl(
            ChatHistoryRepository chatRepository,
            FarmerRepository farmerRepository) {
        this.chatRepository = chatRepository;
        this.farmerRepository = farmerRepository;
    }

    @Override
    @Transactional
    public String processMessage(ChatRequestDto requestDto) {
        String msg = requestDto.getMessage();
        if (msg == null || msg.trim().isEmpty()) {
            return RESPONSES.get("greeting").get("en");
        }

        // 1. DYNAMIC LANGUAGE DETECTION
        String lang = detectLanguage(msg);
        
        // Override with request lang if explicitly set
        if (requestDto.getLanguage() != null && !requestDto.getLanguage().isEmpty()) {
            lang = requestDto.getLanguage().toLowerCase();
        }

        // 2. PATHOLOGICAL SYMPTOM / INTENT EXTRACTION
        String intent = detectIntent(msg);

        // 3. RETRIEVE LOCALIZED VETERINARY RECOMMENDATION
        String advice = RESPONSES.get(intent).get(lang);
        if (advice == null) {
            advice = RESPONSES.get("general").get(lang);
        }

        // 4. PERSIST CONVERSATION LOG IN POSTGRESQL
        ChatHistory history = new ChatHistory();
        history.setUserMessage(msg);
        history.setBotResponse(advice);
        history.setDetectedIntent(intent);
        history.setLanguage(lang);
        history.setTimestamp(LocalDateTime.now());
        history.setSessionId("SESSION-" + (System.currentTimeMillis() % 100000));

        if (requestDto.getFarmerId() != null) {
            Farmer farmer = farmerRepository.findById(requestDto.getFarmerId()).orElse(null);
            history.setFarmer(farmer);
        }

        chatRepository.save(history);

        /*
         * FUTURE OPENAI / LLM PLUGGABLE HOOK:
         * -------------------------------------------------------------
         * try {
         *     // Perform REST call to OpenAI or local Python LLM endpoint
         *     String aiAdvice = callOpenAiAPI(msg, lang);
         *     history.setBotResponse(aiAdvice);
         *     chatRepository.save(history);
         *     return aiAdvice;
         * } catch(Exception e) {
         *     // Fall back to rule-based clinical recommendation below
         * }
         */

        return advice;
    }

    /**
     * Determines input language using character ranges and localized dictionary rules.
     */
    private String detectLanguage(String text) {
        boolean hasDevanagari = text.matches(".*[\\u0900-\\u097F]+.*");
        if (hasDevanagari) {
            // Check for distinct Marathi markers; fallback to Hindi
            if (text.contains("आहे") || text.contains("माझी") || text.contains("माझ") ||
                text.contains("खात") || text.contains("ताप") || text.contains("नाही")) {
                return "mr";
            }
            return "hi"; // Hindi default Devnagari
        }

        // Romanized text analysis
        String lower = text.toLowerCase();
        String[] mrKeywords = {"mazi", "mazhi", "gay", "taap", "ahe", "karat", "dudh"};
        String[] hiKeywords = {"meri", "gai", "bukhar", "rahi", "garam", "doodh"};

        int mrScore = 0;
        int hiScore = 0;

        for (String w : mrKeywords) {
            if (lower.contains(w)) mrScore++;
        }
        for (String w : hiKeywords) {
            if (lower.contains(w)) hiScore++;
        }

        if (mrScore > hiScore && mrScore >= 1) return "mr";
        if (hiScore >= 1) return "hi";

        return "en"; // English default
    }

    /**
     * Extracts physical symptoms (Intents) from user query.
     */
    private String detectIntent(String text) {
        String t = text.toLowerCase();
        
        // Fever keywords
        if (containsAny(t, "fever", "temperature", "hot", "garam", "bukhar", "taap", "ताप", "बुखार", "गरम")) {
            return "fever";
        }
        // Inactivity/Lethargy keywords
        if (containsAny(t, "not moving", "inactive", "lazy", "slow", "chal", "halchal", "कम", "हालचाल", "चालत", "चालत नाही")) {
            return "low_activity";
        }
        // Appetite loss keywords
        if (containsAny(t, "not eating", "eat", "food", "feed", "chara", "kha", "खात", "खाना", "चारा", "भूक")) {
            return "not_eating";
        }
        // Low milk yield keywords
        if (containsAny(t, "milk", "doodh", "dudh", "दूध", "कमी")) {
            return "low_milk";
        }
        // Greeting keywords
        if (containsAny(t, "hello", "hi", "hey", "namaste", "namaskar", "help", "नमस्ते", "नमस्कार")) {
            return "greeting";
        }

        return "general";
    }

    private boolean containsAny(String input, String... keywords) {
        for (String keyword : keywords) {
            if (input.contains(keyword)) {
                return true;
            }
        }
        return false;
    }
}
