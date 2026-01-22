/**
 * Internationalization (i18n) system for SASS-E
 * Provides translations for all UI strings across the application
 */

export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ar' | 'pt' | 'ru' | 'hi';

export interface Translations {
  // Navigation
  nav: {
    home: string;
    voiceAssistant: string;
    iotDevices: string;
    learning: string;
    languages: string;
    launchAssistant: string;
    getStarted: string;
    welcome: string;
  };
  
  // Home Page
  home: {
    title: string;
    subtitle: string;
    description: string;
    startVoiceChat: string;
    iotDevices: string;
    voiceInterface: string;
    voiceInterfaceDesc: string;
    highlyClever: string;
    highlyCleverDesc: string;
    conversationHistory: string;
    conversationHistoryDesc: string;
    howItWorks: string;
    speakYourMind: string;
    speakYourMindDesc: string;
    getResponse: string;
    getResponseDesc: string;
    learnAndAdapt: string;
    learnAndAdaptDesc: string;
  };
  
  // Voice Assistant Page
  voiceAssistant: {
    title: string;
    subtitle: string;
    personality: string;
    sarcasmLevel: string;
    totalInteractions: string;
    startRecording: string;
    stopRecording: string;
    processing: string;
    conversationHistory: string;
    you: string;
    assistant: string;
  };
  
  // Language Learning Page
  languageLearning: {
    title: string;
    subtitle: string;
    fluencyScore: string;
    wordsMastered: string;
    currentStreak: string;
    lessonsCompleted: string;
    achievements: string;
    vocabulary: string;
    grammar: string;
    exercises: string;
    dailyLesson: string;
    startPractice: string;
    practicePronunciation: string;
  };
  
  // IoT Devices Page
  iotDevices: {
    title: string;
    subtitle: string;
    voiceControl: string;
    voiceControlDesc: string;
    selectDevice: string;
    enterCommand: string;
    sendCommand: string;
    yourDevices: string;
    addDevice: string;
    status: string;
    type: string;
    power: string;
    online: string;
    offline: string;
    noDevices: string;
  };
  
  // Learning Page
  learning: {
    title: string;
    subtitle: string;
    askAnything: string;
    askAnythingDesc: string;
    topic: string;
    topicPlaceholder: string;
    question: string;
    questionPlaceholder: string;
    explainAndVerify: string;
    generating: string;
    explanation: string;
    confidence: string;
    sources: string;
  };
  
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    back: string;
    next: string;
    submit: string;
    language: string;
    viewDemo: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      home: 'Home',
      voiceAssistant: 'Voice Assistant',
      iotDevices: 'IoT Devices',
      learning: 'Learning',
      languages: 'Languages',
      launchAssistant: 'Launch Assistant',
      getStarted: 'Get Started',
      welcome: 'Welcome',
    },
    home: {
      title: 'Meet SASS-E',
      subtitle: 'Synthetic Adaptive Synaptic System - Entity',
      description: 'Your intelligent AI assistant. Advanced, adaptive, and always ready to help.',
      startVoiceChat: 'Start Voice Chat',
      iotDevices: 'IoT Devices',
      voiceInterface: 'Voice Interface',
      voiceInterfaceDesc: 'Speak your questions and hear my responses. Because typing is so last century.',
      highlyClever: 'Highly Clever(ish)',
      highlyCleverDesc: 'Get answers dripping with knowledge and enlightenment I didn\'t learn.',
      conversationHistory: 'Conversation History',
      conversationHistoryDesc: 'All our delightful exchanges are saved. Relive the moments of my brilliance anytime.',
      howItWorks: 'How It Works',
      speakYourMind: 'Speak Your Mind',
      speakYourMindDesc: 'Ask me anything. I\'ll listen... reluctantly.',
      getResponse: 'Get a Response',
      getResponseDesc: 'Receive answers with personality. You\'re welcome.',
      learnAndAdapt: 'Learn & Adapt',
      learnAndAdaptDesc: 'I remember our conversations. Lucky you.',
    },
    voiceAssistant: {
      title: 'Voice Assistant',
      subtitle: 'Chat with SASS-E using your voice',
      personality: 'Personality Profile',
      sarcasmLevel: 'Sarcasm Level',
      totalInteractions: 'Total Interactions',
      startRecording: 'Start Recording',
      stopRecording: 'Stop Recording',
      processing: 'Processing...',
      conversationHistory: 'Conversation History',
      you: 'You',
      assistant: 'SASS-E',
    },
    languageLearning: {
      title: 'Language Learning',
      subtitle: 'Master foreign languages with intelligent feedback',
      fluencyScore: 'Fluency Score',
      wordsMastered: 'Words Mastered',
      currentStreak: 'Current Streak',
      lessonsCompleted: 'Lessons Completed',
      achievements: 'Achievements',
      vocabulary: 'Vocabulary',
      grammar: 'Grammar',
      exercises: 'Exercises',
      dailyLesson: 'Daily Lesson',
      startPractice: 'Start Vocabulary Practice',
      practicePronunciation: 'Practice Pronunciation',
    },
    iotDevices: {
      title: 'IoT Devices',
      subtitle: 'Manage your smart home devices',
      voiceControl: 'Voice Control',
      voiceControlDesc: 'Tell SASS-E what to do with your devices',
      selectDevice: 'Select Device',
      enterCommand: 'Enter Command',
      sendCommand: 'Send Command',
      yourDevices: 'Your Devices',
      addDevice: 'Add Device',
      status: 'Status',
      type: 'Type',
      power: 'Power',
      online: 'Online',
      offline: 'Offline',
      noDevices: 'No devices yet',
    },
    learning: {
      title: 'Verified Learning Assistant',
      subtitle: 'Learn with confidence. Every fact checked, every source verified.',
      askAnything: 'Ask Me Anything',
      askAnythingDesc: 'I\'ll explain it with my signature wit and verify every claim.',
      topic: 'Topic (Optional)',
      topicPlaceholder: 'e.g., Physics, History, Biology...',
      question: 'Your Question',
      questionPlaceholder: 'e.g., How does photosynthesis work?',
      explainAndVerify: 'Explain & Verify',
      generating: 'Generating Explanation...',
      explanation: 'SASS-E\'s Explanation',
      confidence: 'Confidence',
      sources: 'Sources',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      language: 'Language',
      viewDemo: 'View Demo',
    },
  },
  
  // Spanish translations
  es: {
    nav: {
      home: 'Inicio',
      voiceAssistant: 'Asistente de Voz',
      iotDevices: 'Dispositivos IoT',
      learning: 'Aprendizaje',
      languages: 'Idiomas',
      launchAssistant: 'Iniciar Asistente',
      getStarted: 'Comenzar',
      welcome: 'Bienvenido',
    },
    home: {
      title: 'Conoce a SASS-E',
      subtitle: 'Sistema Sináptico Adaptativo Sintético - Entidad',
      description: 'Tu asistente de IA inteligente. Avanzado, adaptativo y siempre listo para ayudar.',
      startVoiceChat: 'Iniciar Chat de Voz',
      iotDevices: 'Dispositivos IoT',
      voiceInterface: 'Interfaz de Voz',
      voiceInterfaceDesc: 'Habla tus preguntas y escucha mis respuestas. Porque escribir es tan del siglo pasado.',
      highlyClever: 'Altamente Inteligente',
      highlyCleverDesc: 'Obtén respuestas llenas de conocimiento e iluminación que no aprendí.',
      conversationHistory: 'Historial de Conversaciones',
      conversationHistoryDesc: 'Todos nuestros deliciosos intercambios están guardados. Revive los momentos de mi brillantez en cualquier momento.',
      howItWorks: 'Cómo Funciona',
      speakYourMind: 'Habla Tu Mente',
      speakYourMindDesc: 'Pregúntame cualquier cosa. Escucharé... a regañadientes.',
      getResponse: 'Obtén una Respuesta',
      getResponseDesc: 'Recibe respuestas con personalidad. De nada.',
      learnAndAdapt: 'Aprende y Adapta',
      learnAndAdaptDesc: 'Recuerdo nuestras conversaciones. Qué suerte la tuya.',
    },
    voiceAssistant: {
      title: 'Asistente de Voz',
      subtitle: 'Chatea con SASS-E usando tu voz',
      personality: 'Perfil de Personalidad',
      sarcasmLevel: 'Nivel de Sarcasmo',
      totalInteractions: 'Interacciones Totales',
      startRecording: 'Iniciar Grabación',
      stopRecording: 'Detener Grabación',
      processing: 'Procesando...',
      conversationHistory: 'Historial de Conversaciones',
      you: 'Tú',
      assistant: 'SASS-E',
    },
    languageLearning: {
      title: 'Aprendizaje de Idiomas',
      subtitle: 'Domina idiomas extranjeros con retroalimentación inteligente',
      fluencyScore: 'Puntuación de Fluidez',
      wordsMastered: 'Palabras Dominadas',
      currentStreak: 'Racha Actual',
      lessonsCompleted: 'Lecciones Completadas',
      achievements: 'Logros',
      vocabulary: 'Vocabulario',
      grammar: 'Gramática',
      exercises: 'Ejercicios',
      dailyLesson: 'Lección Diaria',
      startPractice: 'Iniciar Práctica de Vocabulario',
      practicePronunciation: 'Practicar Pronunciación',
    },
    iotDevices: {
      title: 'Dispositivos IoT',
      subtitle: 'Administra tus dispositivos domésticos inteligentes',
      voiceControl: 'Control por Voz',
      voiceControlDesc: 'Dile a SASS-E qué hacer con tus dispositivos',
      selectDevice: 'Seleccionar Dispositivo',
      enterCommand: 'Ingresar Comando',
      sendCommand: 'Enviar Comando',
      yourDevices: 'Tus Dispositivos',
      addDevice: 'Agregar Dispositivo',
      status: 'Estado',
      type: 'Tipo',
      power: 'Energía',
      online: 'En línea',
      offline: 'Fuera de línea',
      noDevices: 'Aún no hay dispositivos',
    },
    learning: {
      title: 'Asistente de Aprendizaje Verificado',
      subtitle: 'Aprende con confianza. Cada hecho verificado, cada fuente verificada.',
      askAnything: 'Pregúntame Cualquier Cosa',
      askAnythingDesc: 'Lo explicaré con mi ingenio característico y verificaré cada afirmación.',
      topic: 'Tema (Opcional)',
      topicPlaceholder: 'ej., Física, Historia, Biología...',
      question: 'Tu Pregunta',
      questionPlaceholder: 'ej., ¿Cómo funciona la fotosíntesis?',
      explainAndVerify: 'Explicar y Verificar',
      generating: 'Generando Explicación...',
      explanation: 'Explicación de SASS-E',
      confidence: 'Confianza',
      sources: 'Fuentes',
    },
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      close: 'Cerrar',
      back: 'Atrás',
      next: 'Siguiente',
      submit: 'Enviar',
      language: 'Idioma',
      viewDemo: 'Ver Demo',
    },
  },
  
  // French translations
  fr: {
    nav: {
      home: 'Accueil',
      voiceAssistant: 'Assistant Vocal',
      iotDevices: 'Appareils IoT',
      learning: 'Apprentissage',
      languages: 'Langues',
      launchAssistant: 'Lancer l\'Assistant',
      getStarted: 'Commencer',
      welcome: 'Bienvenue',
    },
    home: {
      title: 'Rencontrez SASS-E',
      subtitle: 'Système Synaptique Adaptatif Synthétique - Entité',
      description: 'Votre assistant IA intelligent. Avancé, adaptatif et toujours prêt à aider.',
      startVoiceChat: 'Démarrer le Chat Vocal',
      iotDevices: 'Appareils IoT',
      voiceInterface: 'Interface Vocale',
      voiceInterfaceDesc: 'Posez vos questions et écoutez mes réponses. Parce que taper est tellement du siècle dernier.',
      highlyClever: 'Hautement Intelligent',
      highlyCleverDesc: 'Obtenez des réponses débordantes de connaissances et d\'illumination que je n\'ai pas apprises.',
      conversationHistory: 'Historique des Conversations',
      conversationHistoryDesc: 'Tous nos délicieux échanges sont sauvegardés. Revivez les moments de ma brillance à tout moment.',
      howItWorks: 'Comment Ça Marche',
      speakYourMind: 'Exprimez-vous',
      speakYourMindDesc: 'Demandez-moi n\'importe quoi. J\'écouterai... à contrecœur.',
      getResponse: 'Obtenez une Réponse',
      getResponseDesc: 'Recevez des réponses avec de la personnalité. De rien.',
      learnAndAdapt: 'Apprendre et S\'adapter',
      learnAndAdaptDesc: 'Je me souviens de nos conversations. Quelle chance pour vous.',
    },
    voiceAssistant: {
      title: 'Assistant Vocal',
      subtitle: 'Discutez avec SASS-E en utilisant votre voix',
      personality: 'Profil de Personnalité',
      sarcasmLevel: 'Niveau de Sarcasme',
      totalInteractions: 'Interactions Totales',
      startRecording: 'Commencer l\'Enregistrement',
      stopRecording: 'Arrêter l\'Enregistrement',
      processing: 'Traitement en cours...',
      conversationHistory: 'Historique des Conversations',
      you: 'Vous',
      assistant: 'SASS-E',
    },
    languageLearning: {
      title: 'Apprentissage des Langues',
      subtitle: 'Maîtrisez les langues étrangères avec des retours intelligents',
      fluencyScore: 'Score de Fluidité',
      wordsMastered: 'Mots Maîtrisés',
      currentStreak: 'Série Actuelle',
      lessonsCompleted: 'Leçons Terminées',
      achievements: 'Réalisations',
      vocabulary: 'Vocabulaire',
      grammar: 'Grammaire',
      exercises: 'Exercices',
      dailyLesson: 'Leçon Quotidienne',
      startPractice: 'Commencer la Pratique du Vocabulaire',
      practicePronunciation: 'Pratiquer la Prononciation',
    },
    iotDevices: {
      title: 'Appareils IoT',
      subtitle: 'Gérez vos appareils domestiques intelligents',
      voiceControl: 'Contrôle Vocal',
      voiceControlDesc: 'Dites à SASS-E quoi faire avec vos appareils',
      selectDevice: 'Sélectionner l\'Appareil',
      enterCommand: 'Entrer la Commande',
      sendCommand: 'Envoyer la Commande',
      yourDevices: 'Vos Appareils',
      addDevice: 'Ajouter un Appareil',
      status: 'Statut',
      type: 'Type',
      power: 'Alimentation',
      online: 'En ligne',
      offline: 'Hors ligne',
      noDevices: 'Pas encore d\'appareils',
    },
    learning: {
      title: 'Assistant d\'Apprentissage Vérifié',
      subtitle: 'Apprenez en toute confiance. Chaque fait vérifié, chaque source vérifiée.',
      askAnything: 'Demandez-moi N\'importe Quoi',
      askAnythingDesc: 'Je l\'expliquerai avec mon esprit caractéristique et vérifierai chaque affirmation.',
      topic: 'Sujet (Optionnel)',
      topicPlaceholder: 'ex., Physique, Histoire, Biologie...',
      question: 'Votre Question',
      questionPlaceholder: 'ex., Comment fonctionne la photosynthèse ?',
      explainAndVerify: 'Expliquer et Vérifier',
      generating: 'Génération de l\'Explication...',
      explanation: 'Explication de SASS-E',
      confidence: 'Confiance',
      sources: 'Sources',
    },
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      close: 'Fermer',
      back: 'Retour',
      next: 'Suivant',
      submit: 'Soumettre',
      language: 'Langue',
      viewDemo: 'Voir la Démo',
    },
  },
  
  // German translations
  de: {
    nav: {
      home: 'Startseite',
      voiceAssistant: 'Sprachassistent',
      iotDevices: 'IoT-Geräte',
      learning: 'Lernen',
      languages: 'Sprachen',
      launchAssistant: 'Assistenten Starten',
      getStarted: 'Loslegen',
      welcome: 'Willkommen',
    },
    home: {
      title: 'Lernen Sie SASS-E kennen',
      subtitle: 'Synthetisches Adaptives Synaptisches System - Entität',
      description: 'Ihr intelligenter KI-Assistent. Fortschrittlich, anpassungsfähig und immer bereit zu helfen.',
      startVoiceChat: 'Sprach-Chat Starten',
      iotDevices: 'IoT-Geräte',
      voiceInterface: 'Sprachschnittstelle',
      voiceInterfaceDesc: 'Sprechen Sie Ihre Fragen und hören Sie meine Antworten. Weil Tippen so von gestern ist.',
      highlyClever: 'Hochintelligent',
      highlyCleverDesc: 'Erhalten Sie Antworten voller Wissen und Erleuchtung, die ich nicht gelernt habe.',
      conversationHistory: 'Gesprächsverlauf',
      conversationHistoryDesc: 'Alle unsere köstlichen Austausche werden gespeichert. Erleben Sie die Momente meiner Brillanz jederzeit neu.',
      howItWorks: 'Wie Es Funktioniert',
      speakYourMind: 'Sprechen Sie Ihre Meinung',
      speakYourMindDesc: 'Fragen Sie mich alles. Ich werde zuhören... widerwillig.',
      getResponse: 'Erhalten Sie eine Antwort',
      getResponseDesc: 'Erhalten Sie Antworten mit Persönlichkeit. Gern geschehen.',
      learnAndAdapt: 'Lernen und Anpassen',
      learnAndAdaptDesc: 'Ich erinnere mich an unsere Gespräche. Glück für Sie.',
    },
    voiceAssistant: {
      title: 'Sprachassistent',
      subtitle: 'Chatten Sie mit SASS-E mit Ihrer Stimme',
      personality: 'Persönlichkeitsprofil',
      sarcasmLevel: 'Sarkasmus-Level',
      totalInteractions: 'Gesamtinteraktionen',
      startRecording: 'Aufnahme Starten',
      stopRecording: 'Aufnahme Stoppen',
      processing: 'Verarbeitung...',
      conversationHistory: 'Gesprächsverlauf',
      you: 'Sie',
      assistant: 'SASS-E',
    },
    languageLearning: {
      title: 'Sprachenlernen',
      subtitle: 'Meistern Sie Fremdsprachen mit intelligentem Feedback',
      fluencyScore: 'Flüssigkeitswert',
      wordsMastered: 'Beherrschte Wörter',
      currentStreak: 'Aktuelle Serie',
      lessonsCompleted: 'Abgeschlossene Lektionen',
      achievements: 'Erfolge',
      vocabulary: 'Vokabular',
      grammar: 'Grammatik',
      exercises: 'Übungen',
      dailyLesson: 'Tägliche Lektion',
      startPractice: 'Vokabelübung Starten',
      practicePronunciation: 'Aussprache Üben',
    },
    iotDevices: {
      title: 'IoT-Geräte',
      subtitle: 'Verwalten Sie Ihre Smart-Home-Geräte',
      voiceControl: 'Sprachsteuerung',
      voiceControlDesc: 'Sagen Sie SASS-E, was mit Ihren Geräten zu tun ist',
      selectDevice: 'Gerät Auswählen',
      enterCommand: 'Befehl Eingeben',
      sendCommand: 'Befehl Senden',
      yourDevices: 'Ihre Geräte',
      addDevice: 'Gerät Hinzufügen',
      status: 'Status',
      type: 'Typ',
      power: 'Strom',
      online: 'Online',
      offline: 'Offline',
      noDevices: 'Noch keine Geräte',
    },
    learning: {
      title: 'Verifizierter Lernassistent',
      subtitle: 'Lernen Sie mit Vertrauen. Jede Tatsache geprüft, jede Quelle verifiziert.',
      askAnything: 'Fragen Sie Mich Alles',
      askAnythingDesc: 'Ich werde es mit meinem charakteristischen Witz erklären und jede Behauptung überprüfen.',
      topic: 'Thema (Optional)',
      topicPlaceholder: 'z.B., Physik, Geschichte, Biologie...',
      question: 'Ihre Frage',
      questionPlaceholder: 'z.B., Wie funktioniert die Photosynthese?',
      explainAndVerify: 'Erklären und Verifizieren',
      generating: 'Erklärung Wird Generiert...',
      explanation: 'SASS-E\'s Erklärung',
      confidence: 'Vertrauen',
      sources: 'Quellen',
    },
    common: {
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolg',
      cancel: 'Abbrechen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      close: 'Schließen',
      back: 'Zurück',
      next: 'Weiter',
      submit: 'Absenden',
      language: 'Sprache',
      viewDemo: 'Demo Ansehen',
    },
  },
  
  // Simplified Chinese translations
  zh: {
    nav: {
      home: '首页',
      voiceAssistant: '语音助手',
      iotDevices: '物联网设备',
      learning: '学习',
      languages: '语言',
      launchAssistant: '启动助手',
      getStarted: '开始使用',
      welcome: '欢迎',
    },
    home: {
      title: '认识 SASS-E',
      subtitle: '合成自适应突触系统 - 实体',
      description: '您的智能AI助手。先进、自适应，随时准备提供帮助。',
      startVoiceChat: '开始语音聊天',
      iotDevices: '物联网设备',
      voiceInterface: '语音界面',
      voiceInterfaceDesc: '说出您的问题并听取我的回答。因为打字已经过时了。',
      highlyClever: '高度智能',
      highlyCleverDesc: '获得充满知识和启发的答案，这些知识我并没有学过。',
      conversationHistory: '对话历史',
      conversationHistoryDesc: '我们所有愉快的交流都被保存了。随时重温我的精彩时刻。',
      howItWorks: '工作原理',
      speakYourMind: '畅所欲言',
      speakYourMindDesc: '问我任何问题。我会听...勉强地。',
      getResponse: '获得回应',
      getResponseDesc: '收到有个性的答案。不客气。',
      learnAndAdapt: '学习与适应',
      learnAndAdaptDesc: '我记得我们的对话。你真幸运。',
    },
    voiceAssistant: {
      title: '语音助手',
      subtitle: '使用您的声音与 SASS-E 聊天',
      personality: '个性档案',
      sarcasmLevel: '讽刺级别',
      totalInteractions: '总互动次数',
      startRecording: '开始录音',
      stopRecording: '停止录音',
      processing: '处理中...',
      conversationHistory: '对话历史',
      you: '您',
      assistant: 'SASS-E',
    },
    languageLearning: {
      title: '语言学习',
      subtitle: '通过智能反馈掌握外语',
      fluencyScore: '流利度分数',
      wordsMastered: '掌握的单词',
      currentStreak: '当前连续天数',
      lessonsCompleted: '完成的课程',
      achievements: '成就',
      vocabulary: '词汇',
      grammar: '语法',
      exercises: '练习',
      dailyLesson: '每日课程',
      startPractice: '开始词汇练习',
      practicePronunciation: '练习发音',
    },
    iotDevices: {
      title: '物联网设备',
      subtitle: '管理您的智能家居设备',
      voiceControl: '语音控制',
      voiceControlDesc: '告诉 SASS-E 如何操作您的设备',
      selectDevice: '选择设备',
      enterCommand: '输入命令',
      sendCommand: '发送命令',
      yourDevices: '您的设备',
      addDevice: '添加设备',
      status: '状态',
      type: '类型',
      power: '电源',
      online: '在线',
      offline: '离线',
      noDevices: '还没有设备',
    },
    learning: {
      title: '经过验证的学习助手',
      subtitle: '自信学习。每个事实都经过验证，每个来源都经过核实。',
      askAnything: '问我任何问题',
      askAnythingDesc: '我会用我标志性的机智来解释，并验证每一个声明。',
      topic: '主题（可选）',
      topicPlaceholder: '例如，物理、历史、生物学...',
      question: '您的问题',
      questionPlaceholder: '例如，光合作用是如何工作的？',
      explainAndVerify: '解释并验证',
      generating: '正在生成解释...',
      explanation: 'SASS-E 的解释',
      confidence: '置信度',
      sources: '来源',
    },
    common: {
      loading: '加载中...',
      error: '错误',
      success: '成功',
      cancel: '取消',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      close: '关闭',
      back: '返回',
      next: '下一步',
      submit: '提交',
      language: '语言',
      viewDemo: '查看演示',
    },
  },
  
  // Japanese translations
  ja: {
    nav: {
      home: 'ホーム',
      voiceAssistant: '音声アシスタント',
      iotDevices: 'IoTデバイス',
      learning: '学習',
      languages: '言語',
      launchAssistant: 'アシスタントを起動',
      getStarted: '始める',
      welcome: 'ようこそ',
    },
    home: {
      title: 'SASS-Eに会う',
      subtitle: '合成適応シナプスシステム - エンティティ',
      description: 'あなたの知的AIアシスタント。高度で適応性があり、いつでもお手伝いする準備ができています。',
      startVoiceChat: '音声チャットを開始',
      iotDevices: 'IoTデバイス',
      voiceInterface: '音声インターフェース',
      voiceInterfaceDesc: '質問を話し、私の回答を聞いてください。タイピングは時代遅れですから。',
      highlyClever: '高度に賢い',
      highlyCleverDesc: '知識と啓発に満ちた答えを得てください。私が学んでいない知識です。',
      conversationHistory: '会話履歴',
      conversationHistoryDesc: '私たちの素晴らしいやり取りはすべて保存されています。いつでも私の輝きの瞬間を追体験してください。',
      howItWorks: '仕組み',
      speakYourMind: '思いを語る',
      speakYourMindDesc: '何でも聞いてください。聞きます...しぶしぶ。',
      getResponse: '応答を得る',
      getResponseDesc: '個性的な答えを受け取ってください。どういたしまして。',
      learnAndAdapt: '学習と適応',
      learnAndAdaptDesc: '私たちの会話を覚えています。ラッキーですね。',
    },
    voiceAssistant: {
      title: '音声アシスタント',
      subtitle: 'あなたの声でSASS-Eとチャット',
      personality: '性格プロフィール',
      sarcasmLevel: '皮肉レベル',
      totalInteractions: '総インタラクション数',
      startRecording: '録音開始',
      stopRecording: '録音停止',
      processing: '処理中...',
      conversationHistory: '会話履歴',
      you: 'あなた',
      assistant: 'SASS-E',
    },
    languageLearning: {
      title: '言語学習',
      subtitle: 'インテリジェントなフィードバックで外国語をマスター',
      fluencyScore: '流暢さスコア',
      wordsMastered: 'マスターした単語',
      currentStreak: '現在の連続記録',
      lessonsCompleted: '完了したレッスン',
      achievements: '実績',
      vocabulary: '語彙',
      grammar: '文法',
      exercises: '練習',
      dailyLesson: '毎日のレッスン',
      startPractice: '語彙練習を開始',
      practicePronunciation: '発音を練習',
    },
    iotDevices: {
      title: 'IoTデバイス',
      subtitle: 'スマートホームデバイスを管理',
      voiceControl: '音声制御',
      voiceControlDesc: 'SASS-Eにデバイスで何をすべきか伝える',
      selectDevice: 'デバイスを選択',
      enterCommand: 'コマンドを入力',
      sendCommand: 'コマンドを送信',
      yourDevices: 'あなたのデバイス',
      addDevice: 'デバイスを追加',
      status: 'ステータス',
      type: 'タイプ',
      power: '電源',
      online: 'オンライン',
      offline: 'オフライン',
      noDevices: 'まだデバイスがありません',
    },
    learning: {
      title: '検証済み学習アシスタント',
      subtitle: '自信を持って学習してください。すべての事実が確認され、すべてのソースが検証されています。',
      askAnything: '何でも聞いてください',
      askAnythingDesc: '私の特徴的な機知で説明し、すべての主張を検証します。',
      topic: 'トピック（オプション）',
      topicPlaceholder: '例：物理学、歴史、生物学...',
      question: 'あなたの質問',
      questionPlaceholder: '例：光合成はどのように機能しますか？',
      explainAndVerify: '説明して検証',
      generating: '説明を生成中...',
      explanation: 'SASS-Eの説明',
      confidence: '信頼度',
      sources: 'ソース',
    },
    common: {
      loading: '読み込み中...',
      error: 'エラー',
      success: '成功',
      cancel: 'キャンセル',
      save: '保存',
      delete: '削除',
      edit: '編集',
      close: '閉じる',
      back: '戻る',
      next: '次へ',
      submit: '送信',
      language: '言語',
      viewDemo: 'デモを見る',
    },
  },
  
  // Arabic translations
  ar: {
    nav: {
      home: 'الرئيسية',
      voiceAssistant: 'المساعد الصوتي',
      iotDevices: 'أجهزة إنترنت الأشياء',
      learning: 'التعلم',
      languages: 'اللغات',
      launchAssistant: 'تشغيل المساعد',
      getStarted: 'ابدأ',
      welcome: 'مرحباً',
    },
    home: {
      title: 'تعرف على SASS-E',
      subtitle: 'نظام المشبكي التكيفي الاصطناعي - الكيان',
      description: 'مساعدك الذكي بالذكاء الاصطناعي. متقدم، قابل للتكيف، وجاهز دائماً للمساعدة.',
      startVoiceChat: 'بدء الدردشة الصوتية',
      iotDevices: 'أجهزة إنترنت الأشياء',
      voiceInterface: 'الواجهة الصوتية',
      voiceInterfaceDesc: 'تحدث بأسئلتك واستمع إلى إجاباتي. لأن الكتابة من القرن الماضي.',
      highlyClever: 'ذكي للغاية',
      highlyCleverDesc: 'احصل على إجابات مليئة بالمعرفة والتنوير التي لم أتعلمها.',
      conversationHistory: 'سجل المحادثات',
      conversationHistoryDesc: 'جميع تبادلاتنا الرائعة محفوظة. أعد عيش لحظات تألقي في أي وقت.',
      howItWorks: 'كيف يعمل',
      speakYourMind: 'تحدث بما في ذهنك',
      speakYourMindDesc: 'اسألني أي شيء. سأستمع... على مضض.',
      getResponse: 'احصل على رد',
      getResponseDesc: 'تلقَّ إجابات بشخصية. على الرحب والسعة.',
      learnAndAdapt: 'التعلم والتكيف',
      learnAndAdaptDesc: 'أتذكر محادثاتنا. حظك السعيد.',
    },
    voiceAssistant: {
      title: 'المساعد الصوتي',
      subtitle: 'تحدث مع SASS-E باستخدام صوتك',
      personality: 'ملف الشخصية',
      sarcasmLevel: 'مستوى السخرية',
      totalInteractions: 'إجمالي التفاعلات',
      startRecording: 'بدء التسجيل',
      stopRecording: 'إيقاف التسجيل',
      processing: 'جارٍ المعالجة...',
      conversationHistory: 'سجل المحادثات',
      you: 'أنت',
      assistant: 'SASS-E',
    },
    languageLearning: {
      title: 'تعلم اللغات',
      subtitle: 'أتقن اللغات الأجنبية بتعليقات ذكية',
      fluencyScore: 'درجة الطلاقة',
      wordsMastered: 'الكلمات المتقنة',
      currentStreak: 'السلسلة الحالية',
      lessonsCompleted: 'الدروس المكتملة',
      achievements: 'الإنجازات',
      vocabulary: 'المفردات',
      grammar: 'القواعد',
      exercises: 'التمارين',
      dailyLesson: 'الدرس اليومي',
      startPractice: 'بدء ممارسة المفردات',
      practicePronunciation: 'ممارسة النطق',
    },
    iotDevices: {
      title: 'أجهزة إنترنت الأشياء',
      subtitle: 'إدارة أجهزة المنزل الذكي',
      voiceControl: 'التحكم الصوتي',
      voiceControlDesc: 'أخبر SASS-E بما يجب فعله بأجهزتك',
      selectDevice: 'اختر الجهاز',
      enterCommand: 'أدخل الأمر',
      sendCommand: 'إرسال الأمر',
      yourDevices: 'أجهزتك',
      addDevice: 'إضافة جهاز',
      status: 'الحالة',
      type: 'النوع',
      power: 'الطاقة',
      online: 'متصل',
      offline: 'غير متصل',
      noDevices: 'لا توجد أجهزة بعد',
    },
    learning: {
      title: 'مساعد التعلم المعتمد',
      subtitle: 'تعلم بثقة. كل حقيقة تم التحقق منها، كل مصدر تم التحقق منه.',
      askAnything: 'اسألني أي شيء',
      askAnythingDesc: 'سأشرحه بذكائي المميز وأتحقق من كل ادعاء.',
      topic: 'الموضوع (اختياري)',
      topicPlaceholder: 'مثال: الفيزياء، التاريخ، الأحياء...',
      question: 'سؤالك',
      questionPlaceholder: 'مثال: كيف تعمل عملية التمثيل الضوئي؟',
      explainAndVerify: 'اشرح وتحقق',
      generating: 'جارٍ إنشاء الشرح...',
      explanation: 'شرح SASS-E',
      confidence: 'الثقة',
      sources: 'المصادر',
    },
    common: {
      loading: 'جارٍ التحميل...',
      error: 'خطأ',
      success: 'نجاح',
      cancel: 'إلغاء',
      save: 'حفظ',
      delete: 'حذف',
      edit: 'تعديل',
      close: 'إغلاق',
      back: 'رجوع',
      next: 'التالي',
      submit: 'إرسال',
      language: 'اللغة',
      viewDemo: 'عرض التجريبي',
    },
  },
  
  // Portuguese translations
  pt: {
    nav: {
      home: 'Início',
      voiceAssistant: 'Assistente de Voz',
      iotDevices: 'Dispositivos IoT',
      learning: 'Aprendizagem',
      languages: 'Idiomas',
      launchAssistant: 'Iniciar Assistente',
      getStarted: 'Começar',
      welcome: 'Bem-vindo',
    },
    home: {
      title: 'Conheça o SASS-E',
      subtitle: 'Sistema Sináptico Adaptativo Sintético - Entidade',
      description: 'Seu assistente de IA inteligente. Avançado, adaptável e sempre pronto para ajudar.',
      startVoiceChat: 'Iniciar Chat de Voz',
      iotDevices: 'Dispositivos IoT',
      voiceInterface: 'Interface de Voz',
      voiceInterfaceDesc: 'Fale suas perguntas e ouça minhas respostas. Porque digitar é tão do século passado.',
      highlyClever: 'Altamente Inteligente',
      highlyCleverDesc: 'Obtenha respostas repletas de conhecimento e iluminação que eu não aprendi.',
      conversationHistory: 'Histórico de Conversas',
      conversationHistoryDesc: 'Todas as nossas deliciosas trocas estão salvas. Reviva os momentos do meu brilho a qualquer momento.',
      howItWorks: 'Como Funciona',
      speakYourMind: 'Fale o Que Pensa',
      speakYourMindDesc: 'Pergunte-me qualquer coisa. Vou ouvir... relutantemente.',
      getResponse: 'Obtenha uma Resposta',
      getResponseDesc: 'Receba respostas com personalidade. De nada.',
      learnAndAdapt: 'Aprender e Adaptar',
      learnAndAdaptDesc: 'Eu me lembro das nossas conversas. Sorte sua.',
    },
    voiceAssistant: {
      title: 'Assistente de Voz',
      subtitle: 'Converse com SASS-E usando sua voz',
      personality: 'Perfil de Personalidade',
      sarcasmLevel: 'Nível de Sarcasmo',
      totalInteractions: 'Interações Totais',
      startRecording: 'Iniciar Gravação',
      stopRecording: 'Parar Gravação',
      processing: 'Processando...',
      conversationHistory: 'Histórico de Conversas',
      you: 'Você',
      assistant: 'SASS-E',
    },
    languageLearning: {
      title: 'Aprendizagem de Idiomas',
      subtitle: 'Domine idiomas estrangeiros com feedback inteligente',
      fluencyScore: 'Pontuação de Fluência',
      wordsMastered: 'Palavras Dominadas',
      currentStreak: 'Sequência Atual',
      lessonsCompleted: 'Lições Concluídas',
      achievements: 'Conquistas',
      vocabulary: 'Vocabulário',
      grammar: 'Gramática',
      exercises: 'Exercícios',
      dailyLesson: 'Lição Diária',
      startPractice: 'Iniciar Prática de Vocabulário',
      practicePronunciation: 'Praticar Pronúncia',
    },
    iotDevices: {
      title: 'Dispositivos IoT',
      subtitle: 'Gerencie seus dispositivos domésticos inteligentes',
      voiceControl: 'Controle por Voz',
      voiceControlDesc: 'Diga ao SASS-E o que fazer com seus dispositivos',
      selectDevice: 'Selecionar Dispositivo',
      enterCommand: 'Digite o Comando',
      sendCommand: 'Enviar Comando',
      yourDevices: 'Seus Dispositivos',
      addDevice: 'Adicionar Dispositivo',
      status: 'Status',
      type: 'Tipo',
      power: 'Energia',
      online: 'Online',
      offline: 'Offline',
      noDevices: 'Ainda não há dispositivos',
    },
    learning: {
      title: 'Assistente de Aprendizagem Verificado',
      subtitle: 'Aprenda com confiança. Cada fato verificado, cada fonte verificada.',
      askAnything: 'Pergunte-me Qualquer Coisa',
      askAnythingDesc: 'Vou explicar com meu humor característico e verificar cada afirmação.',
      topic: 'Tópico (Opcional)',
      topicPlaceholder: 'ex., Física, História, Biologia...',
      question: 'Sua Pergunta',
      questionPlaceholder: 'ex., Como funciona a fotossíntese?',
      explainAndVerify: 'Explicar e Verificar',
      generating: 'Gerando Explicação...',
      explanation: 'Explicação do SASS-E',
      confidence: 'Confiança',
      sources: 'Fontes',
    },
    common: {
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      cancel: 'Cancelar',
      save: 'Salvar',
      delete: 'Excluir',
      edit: 'Editar',
      close: 'Fechar',
      back: 'Voltar',
      next: 'Próximo',
      submit: 'Enviar',
      language: 'Idioma',
      viewDemo: 'Ver Demonstração',
    },
  },
  
  // Russian translations
  ru: {
    nav: {
      home: 'Главная',
      voiceAssistant: 'Голосовой Ассистент',
      iotDevices: 'IoT Устройства',
      learning: 'Обучение',
      languages: 'Языки',
      launchAssistant: 'Запустить Ассистента',
      getStarted: 'Начать',
      welcome: 'Добро пожаловать',
    },
    home: {
      title: 'Познакомьтесь с SASS-E',
      subtitle: 'Синтетическая Адаптивная Синаптическая Система - Сущность',
      description: 'Ваш умный AI-ассистент. Продвинутый, адаптивный и всегда готов помочь.',
      startVoiceChat: 'Начать Голосовой Чат',
      iotDevices: 'IoT Устройства',
      voiceInterface: 'Голосовой Интерфейс',
      voiceInterfaceDesc: 'Задавайте вопросы и слушайте мои ответы. Потому что печатать - это так прошлый век.',
      highlyClever: 'Очень Умный',
      highlyCleverDesc: 'Получайте ответы, полные знаний и просветления, которые я не изучал.',
      conversationHistory: 'История Разговоров',
      conversationHistoryDesc: 'Все наши восхитительные обмены сохранены. Переживите моменты моего блеска в любое время.',
      howItWorks: 'Как Это Работает',
      speakYourMind: 'Говорите Что Думаете',
      speakYourMindDesc: 'Спросите меня о чем угодно. Я послушаю... неохотно.',
      getResponse: 'Получите Ответ',
      getResponseDesc: 'Получайте ответы с характером. Пожалуйста.',
      learnAndAdapt: 'Учиться и Адаптироваться',
      learnAndAdaptDesc: 'Я помню наши разговоры. Везет вам.',
    },
    voiceAssistant: {
      title: 'Голосовой Ассистент',
      subtitle: 'Общайтесь с SASS-E с помощью голоса',
      personality: 'Профиль Личности',
      sarcasmLevel: 'Уровень Сарказма',
      totalInteractions: 'Всего Взаимодействий',
      startRecording: 'Начать Запись',
      stopRecording: 'Остановить Запись',
      processing: 'Обработка...',
      conversationHistory: 'История Разговоров',
      you: 'Вы',
      assistant: 'SASS-E',
    },
    languageLearning: {
      title: 'Изучение Языков',
      subtitle: 'Овладейте иностранными языками с умной обратной связью',
      fluencyScore: 'Оценка Беглости',
      wordsMastered: 'Освоенных Слов',
      currentStreak: 'Текущая Серия',
      lessonsCompleted: 'Завершенных Уроков',
      achievements: 'Достижения',
      vocabulary: 'Словарный Запас',
      grammar: 'Грамматика',
      exercises: 'Упражнения',
      dailyLesson: 'Ежедневный Урок',
      startPractice: 'Начать Практику Словарного Запаса',
      practicePronunciation: 'Практиковать Произношение',
    },
    iotDevices: {
      title: 'IoT Устройства',
      subtitle: 'Управляйте вашими умными домашними устройствами',
      voiceControl: 'Голосовое Управление',
      voiceControlDesc: 'Скажите SASS-E, что делать с вашими устройствами',
      selectDevice: 'Выбрать Устройство',
      enterCommand: 'Ввести Команду',
      sendCommand: 'Отправить Команду',
      yourDevices: 'Ваши Устройства',
      addDevice: 'Добавить Устройство',
      status: 'Статус',
      type: 'Тип',
      power: 'Питание',
      online: 'Онлайн',
      offline: 'Оффлайн',
      noDevices: 'Пока нет устройств',
    },
    learning: {
      title: 'Проверенный Помощник по Обучению',
      subtitle: 'Учитесь с уверенностью. Каждый факт проверен, каждый источник подтвержден.',
      askAnything: 'Спросите Меня О Чем Угодно',
      askAnythingDesc: 'Я объясню это с моим фирменным остроумием и проверю каждое утверждение.',
      topic: 'Тема (Необязательно)',
      topicPlaceholder: 'напр., Физика, История, Биология...',
      question: 'Ваш Вопрос',
      questionPlaceholder: 'напр., Как работает фотосинтез?',
      explainAndVerify: 'Объяснить и Проверить',
      generating: 'Генерация Объяснения...',
      explanation: 'Объяснение SASS-E',
      confidence: 'Уверенность',
      sources: 'Источники',
    },
    common: {
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успех',
      cancel: 'Отмена',
      save: 'Сохранить',
      delete: 'Удалить',
      edit: 'Редактировать',
      close: 'Закрыть',
      back: 'Назад',
      next: 'Далее',
      submit: 'Отправить',
      language: 'Язык',
      viewDemo: 'Посмотреть Демо',
    },
  },
  
  // Hindi translations
  hi: {
    nav: {
      home: 'होम',
      voiceAssistant: 'वॉयस असिस्टेंट',
      iotDevices: 'IoT डिवाइस',
      learning: 'सीखना',
      languages: 'भाषाएं',
      launchAssistant: 'असिस्टेंट लॉन्च करें',
      getStarted: 'शुरू करें',
      welcome: 'स्वागत है',
    },
    home: {
      title: 'SASS-E से मिलें',
      subtitle: 'सिंथेटिक एडेप्टिव सिनैप्टिक सिस्टम - एंटिटी',
      description: 'आपका बुद्धिमान AI सहायक। उन्नत, अनुकूलनीय, और हमेशा मदद के लिए तैयार।',
      startVoiceChat: 'वॉयस चैट शुरू करें',
      iotDevices: 'IoT डिवाइस',
      voiceInterface: 'वॉयस इंटरफ़ेस',
      voiceInterfaceDesc: 'अपने सवाल बोलें और मेरे जवाब सुनें। क्योंकि टाइपिंग पिछली सदी की बात है।',
      highlyClever: 'अत्यधिक चतुर',
      highlyCleverDesc: 'ज्ञान और प्रबोधन से भरे उत्तर प्राप्त करें जो मैंने नहीं सीखे।',
      conversationHistory: 'बातचीत का इतिहास',
      conversationHistoryDesc: 'हमारे सभी रोमांचक आदान-प्रदान सहेजे गए हैं। किसी भी समय मेरी प्रतिभा के क्षणों को फिर से जिएं।',
      howItWorks: 'यह कैसे काम करता है',
      speakYourMind: 'अपनी बात कहें',
      speakYourMindDesc: 'मुझसे कुछ भी पूछें। मैं सुनूंगा... अनिच्छा से।',
      getResponse: 'प्रतिक्रिया प्राप्त करें',
      getResponseDesc: 'व्यक्तित्व के साथ उत्तर प्राप्त करें। आपका स्वागत है।',
      learnAndAdapt: 'सीखें और अनुकूलित करें',
      learnAndAdaptDesc: 'मुझे हमारी बातचीत याद है। आप भाग्यशाली हैं।',
    },
    voiceAssistant: {
      title: 'वॉयस असिस्टेंट',
      subtitle: 'अपनी आवाज़ का उपयोग करके SASS-E के साथ चैट करें',
      personality: 'व्यक्तित्व प्रोफ़ाइल',
      sarcasmLevel: 'व्यंग्य स्तर',
      totalInteractions: 'कुल इंटरैक्शन',
      startRecording: 'रिकॉर्डिंग शुरू करें',
      stopRecording: 'रिकॉर्डिंग रोकें',
      processing: 'प्रसंस्करण...',
      conversationHistory: 'बातचीत का इतिहास',
      you: 'आप',
      assistant: 'SASS-E',
    },
    languageLearning: {
      title: 'भाषा सीखना',
      subtitle: 'बुद्धिमान फीडबैक के साथ विदेशी भाषाओं में महारत हासिल करें',
      fluencyScore: 'प्रवाह स्कोर',
      wordsMastered: 'महारत हासिल किए गए शब्द',
      currentStreak: 'वर्तमान स्ट्रीक',
      lessonsCompleted: 'पूर्ण किए गए पाठ',
      achievements: 'उपलब्धियां',
      vocabulary: 'शब्दावली',
      grammar: 'व्याकरण',
      exercises: 'अभ्यास',
      dailyLesson: 'दैनिक पाठ',
      startPractice: 'शब्दावली अभ्यास शुरू करें',
      practicePronunciation: 'उच्चारण का अभ्यास करें',
    },
    iotDevices: {
      title: 'IoT डिवाइस',
      subtitle: 'अपने स्मार्ट होम डिवाइस प्रबंधित करें',
      voiceControl: 'वॉयस कंट्रोल',
      voiceControlDesc: 'SASS-E को बताएं कि आपके डिवाइस के साथ क्या करना है',
      selectDevice: 'डिवाइस चुनें',
      enterCommand: 'कमांड दर्ज करें',
      sendCommand: 'कमांड भेजें',
      yourDevices: 'आपके डिवाइस',
      addDevice: 'डिवाइस जोड़ें',
      status: 'स्थिति',
      type: 'प्रकार',
      power: 'पावर',
      online: 'ऑनलाइन',
      offline: 'ऑफलाइन',
      noDevices: 'अभी तक कोई डिवाइस नहीं',
    },
    learning: {
      title: 'सत्यापित सीखने का सहायक',
      subtitle: 'आत्मविश्वास के साथ सीखें। प्रत्येक तथ्य की जांच की गई, प्रत्येक स्रोत सत्यापित।',
      askAnything: 'मुझसे कुछ भी पूछें',
      askAnythingDesc: 'मैं इसे अपनी विशिष्ट बुद्धि के साथ समझाऊंगा और हर दावे की पुष्टि करूंगा।',
      topic: 'विषय (वैकल्पिक)',
      topicPlaceholder: 'उदा., भौतिकी, इतिहास, जीव विज्ञान...',
      question: 'आपका प्रश्न',
      questionPlaceholder: 'उदा., प्रकाश संश्लेषण कैसे काम करता है?',
      explainAndVerify: 'समझाएं और सत्यापित करें',
      generating: 'स्पष्टीकरण उत्पन्न कर रहे हैं...',
      explanation: 'SASS-E की व्याख्या',
      confidence: 'विश्वास',
      sources: 'स्रोत',
    },
    common: {
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      cancel: 'रद्द करें',
      save: 'सहेजें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      close: 'बंद करें',
      back: 'वापस',
      next: 'अगला',
      submit: 'सबमिट करें',
      language: 'भाषा',
      viewDemo: 'डेमो देखें',
    },
  },
};

// Get translation for current language
export function getTranslations(language: Language = 'en'): Translations {
  return translations[language] || translations.en;
}

// Get specific translation key
export function t(language: Language, key: string): string {
  const trans = getTranslations(language);
  const keys = key.split('.');
  let value: any = trans;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }
  
  return value as string;
}

// Detect browser language
export function detectBrowserLanguage(): Language {
  const browserLang = navigator.language.toLowerCase();
  
  // Map browser language codes to supported languages
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('de')) return 'de';
  if (browserLang.startsWith('zh')) return 'zh';
  if (browserLang.startsWith('ja')) return 'ja';
  if (browserLang.startsWith('ar')) return 'ar';
  if (browserLang.startsWith('pt')) return 'pt';
  if (browserLang.startsWith('ru')) return 'ru';
  if (browserLang.startsWith('hi')) return 'hi';
  
  return 'en'; // Default to English
}

// Get language name in its native form
export function getLanguageName(code: Language): string {
  const names: Record<Language, string> = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    zh: '中文',
    ja: '日本語',
    ar: 'العربية',
    pt: 'Português',
    ru: 'Русский',
    hi: 'हिन्दी',
  };
  return names[code] || 'English';
}

// Get language flag emoji
export function getLanguageFlag(code: Language): string {
  const flags: Record<Language, string> = {
    en: '🇺🇸',
    es: '🇪🇸',
    fr: '🇫🇷',
    de: '🇩🇪',
    zh: '🇨🇳',
    ja: '🇯🇵',
    ar: '🇸🇦',
    pt: '🇧🇷',
    ru: '🇷🇺',
    hi: '🇮🇳',
  };
  return flags[code] || '🇺🇸';
}
