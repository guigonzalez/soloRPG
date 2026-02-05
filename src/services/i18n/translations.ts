/**
 * Translation keys and text for all supported languages
 */

import { PRESET_CAMPAIGNS_EN, PRESET_CAMPAIGNS_PT, PRESET_CAMPAIGNS_ES } from './preset-campaigns-i18n';

export type Language = 'en' | 'pt' | 'es';

export interface Translations {
  // Common
  common: {
    back: string;
    settings: string;
    confirm: string;
    cancel: string;
    close: string;
    save: string;
    delete: string;
    edit: string;
    loading: string;
    error: string;
    aiOfflineNotice: string;
    aiErrorNotice: string;
  };

  campaignCard: {
    deleteConfirm: string;
    theme: string;
    tone: string;
  };

  // Campaign List
  campaignList: {
    title: string;
    newCampaign: string;
    noCampaigns: string;
    createFirst: string;
    lastPlayed: string;
    selectCampaign: string;
    quickStart: string;
  };

  presetCampaigns: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    all: string;
    play: string;
    noResults: string;
    tags: Record<string, string>;
    campaigns: Record<string, { title: string; theme: string; tone: string }>;
  };

  // Campaign Interface
  campaign: {
    endSessionConfirm: string;
    sessionSaved: string;
    startFallback: string;
  };

  gameOver: {
    title: string;
    message: string;
    returnToCampaigns: string;
  };

  // Campaign Creation
  campaignCreation: {
    title: string;
    campaignTitle: string;
    campaignTitlePlaceholder: string;
    system: string;
    narrativeTheme: string;
    narrativeThemeNotice: string;
    selectNarrativeTheme: string;
    theme: string;
    themePlaceholder: string;
    tone: string;
    startCampaign: string;
    creating: string;
  };

  // Campaign Tones
  tones: {
    dramatic: string;
    lighthearted: string;
    dark: string;
    comedic: string;
    mysterious: string;
    epic: string;
  };

  // Character Creation
  characterCreation: {
    title: string;
    characterName: string;
    characterNamePlaceholder: string;
    attributes: string;
    randomize: string;
    range: string;
    createCharacter: string;
    cancel: string;
    nameRequired: string;
    backgroundOptional: string;
    backstory: string;
    backstoryPlaceholder: string;
    personality: string;
    personalityPlaceholder: string;
    goals: string;
    goalsPlaceholder: string;
    fears: string;
    fearsPlaceholder: string;
    basicTab: string;
    attributesTab: string;
    inventoryTab: string;
    inventoryHint: string;
    backgroundTab: string;
    generateWithAI: string;
    generating: string;
    apiKeyRequired: string;
    invalidApiKey: string;
    generationFailed: string;
  };

  // Character Panel
  characterPanel: {
    level: string;
    experience: string;
    hitPoints: string;
    attributes: string;
    maxLevel: string;
  };

  // Level Up Modal
  levelUp: {
    title: string;
    congratulations: string;
    youAreNowLevel: string;
    allocatePoints: string;
    allocatePoint: string;
    pointsRemaining: string;
    confirmLevelUp: string;
  };

  // Sidebar
  sidebar: {
    gameInfo: string;
    endSession: string;
    character: string;
    recap: string;
    entities: string;
  };

  // Recap Panel
  recapPanel: {
    title: string;
    noRecap: string;
    update: string;
    updating: string;
    clickUpdate: string;
  };

  // Entities Panel
  entitiesPanel: {
    title: string;
    noEntities: string;
    empty: string;
    updateHint: string;
    character: string;
    npc: string;
    place: string;
    item: string;
    faction: string;
    other: string;
  };

  // Chat
  chat: {
    messagePlaceholder: string;
    aiThinking: string;
    suggestedActions: string;
    rolled: string;
    rollResult: string;
    dc: string;
    adventureBegins: string;
    firstActionPrompt: string;
    narratorTyping: string;
    narratorThinking: string;
    resendMessage: string;
    continueNarration: string;
  };

  // XP System
  xp: {
    gained: string;
    lost: string;
    easySuccess: string;
    mediumSuccess: string;
    hardSuccess: string;
    veryHardSuccess: string;
    criticalSuccess: string;
    storyProgression: string;
    levelUp: string;
    levelDown: string;
    youAreNowLevel: string;
  };

  // HP
  combat: {
    takeDamage: string;
    recover: string;
    armorReduced: string;
    damageRoll: string;
  };

  // Inventory
    inventory: {
      title: string;
      itemAcquired: string;
      useItem: string;
      noItems: string;
      weapon: string;
      armor: string;
      equip: string;
      unequip: string;
      equipped: string;
    };

  // Misfortune (Amarra - anti-cheat binding)
  misfortune: {
    claimedRollNotice: string;
    effectiveResult: string;
    label: string;
    tooltip: string;
  };

  // Settings
  recap: {
    memoryUpdated: string;
    extractedRecap: string;
    extractedEntities: string;
    extractedFacts: string;
    yes: string;
    no: string;
  };

  apiKeySetup: {
    welcome: string;
    intro: string;
    introPrivacy: string;
    aiProvider: string;
    anthropicKey: string;
    googleKey: string;
    noKeyTitle: string;
    claudeStep1: string;
    claudeStep2: string;
    claudeStep3: string;
    claudeStep4: string;
    geminiStep1: string;
    geminiStep2: string;
    geminiStep3: string;
    geminiStep4: string;
    claudeNote: string;
    geminiNote: string;
    saveAndStart: string;
    saving: string;
    changeLater: string;
    enterKey: string;
    invalidClaudeFormat: string;
    invalidGeminiFormat: string;
  };

  settings: {
    title: string;
    apiKeyConfigTitle: string;
    providerLabel: string;
    status: string;
    configured: string;
    notConfigured: string;
    hideKey: string;
    showKey: string;
    saveNewKey: string;
    removeKey: string;
    removeKeyConfirm: string;
    apiKeySaved: string;
    generalSettings: string;
    languageHint: string;
    language: string;
    aiProvider: string;
    apiKey: string;
    apiKeyPlaceholder: string;
    theme: string;
    themeGreen: string;
    themeAmber: string;
    themeClassic: string;
    saveSettings: string;
    clearData: string;
    clearDataConfirm: string;
    exportCampaign: string;
    importCampaign: string;
    exportSuccess: string;
    importSuccess: string;
    importFailed: string;
    selectFile: string;
  };

  // Errors
  errors: {
    unknown: string;
    noActiveCampaign: string;
    campaignNotFound: string;
    failedToCreateCharacter: string;
    failedToLevelUp: string;
    failedToUpdateRecap: string;
    failedToSaveSession: string;
    apiKeyRequired: string;
    invalidDiceNotation: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      back: 'Back',
      settings: 'Settings',
      confirm: 'Confirm',
      cancel: 'Cancel',
      close: 'Close',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      error: 'Error',
      aiOfflineNotice: '⚠️ AI service temporarily unavailable. Using offline mode.',
      aiErrorNotice: '⚠️ AI service error. You can continue playing with the fallback narration.',
    },

    campaignCard: {
      deleteConfirm: 'Delete campaign "{title}"? This cannot be undone.',
      theme: 'Theme',
      tone: 'Tone',
    },

    campaignList: {
      title: 'Solo RPG',
      newCampaign: 'New Campaign',
      noCampaigns: 'No campaigns yet',
      createFirst: 'Create your first adventure!',
      lastPlayed: 'Last played',
      selectCampaign: 'Select a campaign to continue',
      quickStart: 'Quick Start (50 presets)',
    },

    presetCampaigns: {
      title: 'Quick Start',
      subtitle: '50 pre-made campaigns. Click Play to create and start immediately.',
      searchPlaceholder: 'Search campaigns...',
      all: 'All',
      play: 'Play',
      noResults: 'No campaigns match your search.',
      tags: { fantasy: '⚔️ Fantasy', horror: '👁️ Horror', cyberpunk: '🌃 Cyberpunk', vampire: '🧛 Vampire', survival: '🔥 Survival', scifi: '🚀 Sci-Fi', urban: '🏙️ Urban', western: '🤠 Western' },
      campaigns: PRESET_CAMPAIGNS_EN,
    },

    campaign: {
      endSessionConfirm: 'End this session? This will save your progress and extract important memories from your adventure.',
      sessionSaved: 'Session ended! Your progress has been saved.',
      startFallback: 'Welcome to your {theme} adventure in the {system} system!\n\nYour journey begins in a world filled with mystery and danger. The tone is {tone}, and countless stories await to be told.\n\nWhat would you like to do?',
    },

    gameOver: {
      title: 'Game Over',
      message: 'Your character has fallen. Hit points reached zero.',
      returnToCampaigns: 'Return to campaigns',
    },

    campaignCreation: {
      title: 'Create New Campaign',
      campaignTitle: 'Campaign Title',
      campaignTitlePlaceholder: 'Enter campaign name...',
      system: 'RPG System',
      narrativeTheme: 'Narrative Theme',
      narrativeThemeNotice: 'This is narrative inspiration only. SoloRPG uses its own universal mechanics (d20 + modifier). The system choice only affects attribute names and story flavor - not game rules.',
      selectNarrativeTheme: 'Select a narrative theme...',
      theme: 'Theme & Setting',
      themePlaceholder: 'Describe the world and story...',
      tone: 'Tone',
      startCampaign: 'Start Campaign',
      creating: 'Creating...',
    },

    tones: {
      dramatic: 'Dramatic',
      lighthearted: 'Lighthearted',
      dark: 'Dark & Gritty',
      comedic: 'Comedic',
      mysterious: 'Mysterious',
      epic: 'Epic',
    },

    characterCreation: {
      title: 'Create Your Character',
      characterName: 'Character Name',
      characterNamePlaceholder: 'Enter name...',
      attributes: 'Attributes',
      randomize: 'Randomize',
      range: 'Range',
      createCharacter: 'Create Character',
      cancel: 'Cancel',
      nameRequired: 'Please enter a character name',
      backgroundOptional: 'Character Background (Optional)',
      backstory: 'Backstory',
      backstoryPlaceholder: 'Who is your character? Where do they come from?',
      personality: 'Personality',
      personalityPlaceholder: 'E.g., brave, curious, reckless',
      goals: 'Goals',
      goalsPlaceholder: 'What does your character want to achieve?',
      fears: 'Fears',
      fearsPlaceholder: 'What does your character fear?',
      basicTab: 'Basic',
      attributesTab: 'Attributes',
      inventoryTab: 'Inventory',
      inventoryHint: 'Select starting items. You can add more during the adventure when the narrator drops them.',
      backgroundTab: 'Background',
      generateWithAI: 'Generate with AI',
      generating: 'Generating...',
      apiKeyRequired: 'Please configure your Claude API key in Settings first.',
      invalidApiKey: 'Invalid API key. Please check your Claude API key in Settings.',
      generationFailed: 'Failed to generate character background. Please try again.',
    },

    characterPanel: {
      level: 'Level',
      experience: 'Experience',
      hitPoints: 'Hit Points',
      attributes: 'Attributes',
      maxLevel: 'MAX',
    },

    levelUp: {
      title: 'LEVEL UP!',
      congratulations: '🎉 Congratulations!',
      youAreNowLevel: 'You are now Level',
      allocatePoints: 'Allocate {count} attribute points',
      allocatePoint: 'Allocate {count} attribute point',
      pointsRemaining: 'Points remaining',
      confirmLevelUp: 'Confirm Level Up',
    },

    sidebar: {
      gameInfo: 'Game Info',
      endSession: 'End Session',
      character: 'Character',
      recap: 'Recap',
      entities: 'Entities',
    },

    recapPanel: {
      title: 'Story So Far',
      noRecap: 'No recap yet. The adventure begins...',
      update: 'Update',
      updating: 'Updating...',
      clickUpdate: 'Click "Update" to generate a story recap from your adventure...',
    },

    entitiesPanel: {
      title: 'Known Entities',
      noEntities: 'No entities discovered yet',
      empty: 'Characters, places, and items you encounter will appear here...',
      updateHint: 'Click "Update" in the Recap tab to extract entities from your adventure!',
      character: 'Character',
      npc: 'NPC',
      place: 'Place',
      item: 'Item',
      faction: 'Faction',
      other: 'Other',
    },

    chat: {
      messagePlaceholder: 'Type your action or dice roll...',
      aiThinking: 'AI is thinking...',
      suggestedActions: 'Suggested Actions',
      rolled: 'Rolled',
      rollResult: 'Rolled {notation}: {result}',
      dc: 'DC',
      adventureBegins: 'Your adventure begins...',
      firstActionPrompt: 'Describe your first action below',
      narratorTyping: 'NARRATOR · typing...',
      narratorThinking: 'Narrator is thinking',
      resendMessage: 'Resend',
      continueNarration: 'Continue',
    },

    xp: {
      gained: '+{amount} XP',
      lost: '-{amount} XP',
      easySuccess: 'Easy success',
      mediumSuccess: 'Medium success',
      hardSuccess: 'Hard success',
      veryHardSuccess: 'Very hard success',
      criticalSuccess: 'Critical!',
      storyProgression: 'Story progression',
      levelUp: '🎉 LEVEL UP! You are now Level {level}!',
      levelDown: '📉 Level down! Now Level {level}',
      youAreNowLevel: 'You are now Level {level}',
    },

    combat: {
      takeDamage: '💥 You take {amount} damage!',
      recover: '💚 You recover {amount} HP!',
      armorReduced: 'armor -{reduced} (was {original})',
      damageRoll: 'Damage roll {notation}: {result}',
    },

    inventory: {
      title: 'Inventory',
      itemAcquired: 'Acquired: {name} x{quantity}',
      useItem: 'Use',
      noItems: 'No items',
      weapon: 'Weapon',
      armor: 'Armor',
      equip: 'Equip',
      unequip: 'Unequip',
      equipped: 'Equipped',
    },

    misfortune: {
      claimedRollNotice: '⚠️ Claimed roll detected. Misfortune +1 ({stacks} total). Future rolls penalized.',
      effectiveResult: 'effective {value}',
      label: 'Misfortune',
      tooltip: 'Penalty from claiming roll results. Decays with honest rolls.',
    },

    recap: {
      memoryUpdated: 'Memory updated! Extracted:',
      extractedRecap: 'Recap',
      extractedEntities: 'Entities',
      extractedFacts: 'Facts',
      yes: 'Yes',
      no: 'No',
    },

    apiKeySetup: {
      welcome: 'Welcome to SoloRPG!',
      intro: 'To start your adventure, you need to configure your AI provider API key.',
      introPrivacy: 'Your API key is stored locally in your browser and never sent anywhere except directly to the provider\'s API.',
      aiProvider: 'AI Provider',
      anthropicKey: 'Anthropic API Key',
      googleKey: 'Google AI API Key',
      noKeyTitle: 'Don\'t have an API key?',
      claudeStep1: 'Go to',
      claudeStep2: 'Sign up or log in',
      claudeStep3: 'Navigate to "API Keys" section',
      claudeStep4: 'Create a new key and copy it here',
      geminiStep1: 'Go to',
      geminiStep2: 'Sign in with your Google account',
      geminiStep3: 'Click "Create API Key"',
      geminiStep4: 'Copy the key and paste it here',
      claudeNote: 'Note: You\'ll need to add credit to your Anthropic account to use the API.',
      geminiNote: 'Note: Gemini has a generous free tier available.',
      saveAndStart: 'Save and Start Playing',
      saving: 'Saving...',
      changeLater: 'You can change your API key later in the settings',
      enterKey: 'Please enter your API key',
      invalidClaudeFormat: 'Invalid API key format. It should start with "sk-ant-"',
      invalidGeminiFormat: 'Invalid Gemini API key format',
    },

    settings: {
      title: 'Settings',
      apiKeyConfigTitle: 'API Key Configuration',
      providerLabel: 'Provider',
      status: 'Status',
      configured: '✓ Configured',
      notConfigured: '✗ Not configured',
      hideKey: 'Hide current key',
      showKey: 'Show current key',
      saveNewKey: 'Save New Key',
      removeKey: 'Remove Key',
      removeKeyConfirm: 'Are you sure you want to remove your API key? You will need to enter it again to use AI features.',
      apiKeySaved: '✓ API key saved! Reloading...',
      generalSettings: 'General Settings',
      languageHint: 'AI narration and content will be generated in this language',
      language: 'Language',
      aiProvider: 'AI Provider',
      apiKey: 'API Key',
      apiKeyPlaceholder: 'Enter your API key...',
      theme: 'Theme',
      themeGreen: '8-bit Green',
      themeAmber: '8-bit Amber',
      themeClassic: 'Classic',
      saveSettings: 'Save Settings',
      clearData: 'Clear All Data',
      clearDataConfirm: 'Are you sure? This will delete all campaigns and characters!',
      exportCampaign: 'Export Campaign',
      importCampaign: 'Import Campaign',
      exportSuccess: 'Campaign exported successfully!',
      importSuccess: 'Campaign imported successfully!',
      importFailed: 'Failed to import campaign',
      selectFile: 'Select File',
    },

    errors: {
      unknown: 'Unknown error',
      noActiveCampaign: 'No active campaign',
      campaignNotFound: 'Campaign not found',
      failedToCreateCharacter: 'Failed to create character',
      failedToLevelUp: 'Failed to confirm level-up',
      failedToUpdateRecap: 'Failed to update recap',
      failedToSaveSession: 'Failed to save session',
      apiKeyRequired: 'API key is required',
      invalidDiceNotation: 'Invalid dice notation',
    },
  },

  pt: {
    common: {
      back: 'Voltar',
      settings: 'Configurações',
      confirm: 'Confirmar',
      cancel: 'Cancelar',
      close: 'Fechar',
      save: 'Salvar',
      delete: 'Excluir',
      edit: 'Editar',
      loading: 'Carregando...',
      error: 'Erro',
      aiOfflineNotice: '⚠️ Serviço de IA temporariamente indisponível. Usando modo offline.',
      aiErrorNotice: '⚠️ Erro no serviço de IA. Você pode continuar jogando com a narração alternativa.',
    },

    campaignCard: {
      deleteConfirm: 'Excluir campanha "{title}"? Esta ação não pode ser desfeita.',
      theme: 'Tema',
      tone: 'Tom',
    },

    campaignList: {
      title: 'RPG Solo',
      newCampaign: 'Nova Campanha',
      noCampaigns: 'Nenhuma campanha ainda',
      createFirst: 'Crie sua primeira aventura!',
      lastPlayed: 'Última jogada',
      selectCampaign: 'Selecione uma campanha para continuar',
      quickStart: 'Clique e Jogue (50 campanhas)',
    },

    presetCampaigns: {
      title: 'Clique e Jogue',
      subtitle: '50 campanhas prontas. Clique em Jogar para criar e começar na hora.',
      searchPlaceholder: 'Buscar campanhas...',
      all: 'Todas',
      play: 'Jogar',
      noResults: 'Nenhuma campanha encontrada.',
      tags: { fantasy: '⚔️ Fantasia', horror: '👁️ Horror', cyberpunk: '🌃 Cyberpunk', vampire: '🧛 Vampiro', survival: '🔥 Sobrevivência', scifi: '🚀 Ficção Científica', urban: '🏙️ Urbano', western: '🤠 Velho Oeste' },
      campaigns: PRESET_CAMPAIGNS_PT,
    },

    campaign: {
      endSessionConfirm: 'Encerrar esta sessão? Isso salvará seu progresso e extrairá memórias importantes da sua aventura.',
      sessionSaved: 'Sessão encerrada! Seu progresso foi salvo.',
      startFallback: 'Bem-vindo à sua aventura {theme} no sistema {system}!\n\nSua jornada começa em um mundo cheio de mistério e perigo. O tom é {tone}, e incontáveis histórias aguardam para serem contadas.\n\nO que você gostaria de fazer?',
    },

    gameOver: {
      title: 'Game Over',
      message: 'Seu personagem caiu. Os pontos de vida chegaram a zero.',
      returnToCampaigns: 'Voltar às campanhas',
    },

    campaignCreation: {
      title: 'Criar Nova Campanha',
      campaignTitle: 'Título da Campanha',
      campaignTitlePlaceholder: 'Digite o nome da campanha...',
      system: 'Sistema de RPG',
      narrativeTheme: 'Tema Narrativo',
      narrativeThemeNotice: 'Isto é apenas inspiração narrativa. SoloRPG usa suas próprias mecânicas universais (d20 + modificador). A escolha do sistema afeta apenas nomes de atributos e sabor narrativo - não as regras do jogo.',
      selectNarrativeTheme: 'Selecione um tema narrativo...',
      theme: 'Tema e Cenário',
      themePlaceholder: 'Descreva o mundo e a história...',
      tone: 'Tom',
      startCampaign: 'Iniciar Campanha',
      creating: 'Criando...',
    },

    tones: {
      dramatic: 'Dramático',
      lighthearted: 'Leve',
      dark: 'Sombrio',
      comedic: 'Cômico',
      mysterious: 'Misterioso',
      epic: 'Épico',
    },

    characterCreation: {
      title: 'Crie Seu Personagem',
      characterName: 'Nome do Personagem',
      characterNamePlaceholder: 'Digite o nome...',
      attributes: 'Atributos',
      randomize: 'Aleatorizar',
      range: 'Intervalo',
      createCharacter: 'Criar Personagem',
      cancel: 'Cancelar',
      nameRequired: 'Por favor, digite um nome para o personagem',
      backgroundOptional: 'História do Personagem (Opcional)',
      backstory: 'História',
      backstoryPlaceholder: 'Quem é seu personagem? De onde ele vem?',
      personality: 'Personalidade',
      personalityPlaceholder: 'Ex.: corajoso, curioso, imprudente',
      goals: 'Objetivos',
      goalsPlaceholder: 'O que seu personagem quer alcançar?',
      fears: 'Medos',
      fearsPlaceholder: 'Do que seu personagem tem medo?',
      basicTab: 'Básico',
      attributesTab: 'Atributos',
      inventoryTab: 'Inventário',
      inventoryHint: 'Selecione os itens iniciais. Você pode obter mais durante a aventura quando o narrador os conceder.',
      backgroundTab: 'História',
      generateWithAI: 'Gerar com IA',
      generating: 'Gerando...',
      apiKeyRequired: 'Por favor, configure sua chave de API do Claude nas Configurações primeiro.',
      invalidApiKey: 'Chave de API inválida. Verifique sua chave de API do Claude nas Configurações.',
      generationFailed: 'Falha ao gerar histórico do personagem. Tente novamente.',
    },

    characterPanel: {
      level: 'Nível',
      experience: 'Experiência',
      hitPoints: 'Pontos de Vida',
      attributes: 'Atributos',
      maxLevel: 'MÁX',
    },

    levelUp: {
      title: 'SUBIU DE NÍVEL!',
      congratulations: '🎉 Parabéns!',
      youAreNowLevel: 'Você agora é Nível',
      allocatePoints: 'Distribua {count} pontos de atributo',
      allocatePoint: 'Distribua {count} ponto de atributo',
      pointsRemaining: 'Pontos restantes',
      confirmLevelUp: 'Confirmar Subida de Nível',
    },

    sidebar: {
      gameInfo: 'Info do Jogo',
      endSession: 'Encerrar Sessão',
      character: 'Personagem',
      recap: 'Resumo',
      entities: 'Entidades',
    },

    recapPanel: {
      title: 'História Até Agora',
      noRecap: 'Nenhum resumo ainda. A aventura começa...',
      update: 'Atualizar',
      updating: 'Atualizando...',
      clickUpdate: 'Clique em "Atualizar" para gerar um resumo da história da sua aventura...',
    },

    entitiesPanel: {
      title: 'Entidades Conhecidas',
      noEntities: 'Nenhuma entidade descoberta ainda',
      empty: 'Personagens, locais e itens que você encontrar aparecerão aqui...',
      updateHint: 'Clique em "Atualizar" na aba Resumo para extrair entidades da sua aventura!',
      character: 'Personagem',
      npc: 'NPC',
      place: 'Local',
      item: 'Item',
      faction: 'Facção',
      other: 'Outro',
    },

    chat: {
      messagePlaceholder: 'Digite sua ação ou rolagem de dados...',
      aiThinking: 'IA está pensando...',
      suggestedActions: 'Ações Sugeridas',
      rolled: 'Rolou',
      rollResult: 'Rolou {notation}: {result}',
      dc: 'CD',
      adventureBegins: 'Sua aventura começa...',
      firstActionPrompt: 'Descreva sua primeira ação abaixo',
      narratorTyping: 'NARRADOR · digitando...',
      narratorThinking: 'Narrador está pensando',
      resendMessage: 'Reenviar',
      continueNarration: 'Continuar',
    },

    xp: {
      gained: '+{amount} XP',
      lost: '-{amount} XP',
      easySuccess: 'Sucesso fácil',
      mediumSuccess: 'Sucesso médio',
      hardSuccess: 'Sucesso difícil',
      veryHardSuccess: 'Sucesso muito difícil',
      criticalSuccess: 'Crítico!',
      storyProgression: 'Progressão da história',
      levelUp: '🎉 SUBIU DE NÍVEL! Você agora é Nível {level}!',
      levelDown: '📉 Desceu de nível! Agora Nível {level}',
      youAreNowLevel: 'Você agora é Nível {level}',
    },

    combat: {
      takeDamage: '💥 Você sofreu {amount} de dano!',
      recover: '💚 Você recuperou {amount} de HP!',
      armorReduced: 'armadura -{reduced} (era {original})',
      damageRoll: 'Rolagem de dano {notation}: {result}',
    },

    inventory: {
      title: 'Inventário',
      itemAcquired: 'Adquirido: {name} x{quantity}',
      useItem: 'Usar',
      noItems: 'Nenhum item',
      weapon: 'Arma',
      armor: 'Armadura',
      equip: 'Equipar',
      unequip: 'Desequipar',
      equipped: 'Equipado',
    },

    misfortune: {
      claimedRollNotice: '⚠️ Rolagem alegada detectada. Azar +1 ({stacks} total). Próximas rolagens penalizadas.',
      effectiveResult: 'efetivo {value}',
      label: 'Azar',
      tooltip: 'Penalidade por alegar resultados. Decai com rolagens honestas.',
    },

    recap: {
      memoryUpdated: 'Memória atualizada! Extraído:',
      extractedRecap: 'Resumo',
      extractedEntities: 'Entidades',
      extractedFacts: 'Fatos',
      yes: 'Sim',
      no: 'Não',
    },

    apiKeySetup: {
      welcome: 'Bem-vindo ao SoloRPG!',
      intro: 'Para começar sua aventura, você precisa configurar sua chave de API do provedor de IA.',
      introPrivacy: 'Sua chave de API é armazenada localmente no navegador e nunca é enviada a nenhum lugar, exceto diretamente à API do provedor.',
      aiProvider: 'Provedor de IA',
      anthropicKey: 'Chave de API da Anthropic',
      googleKey: 'Chave de API do Google AI',
      noKeyTitle: 'Não tem uma chave de API?',
      claudeStep1: 'Acesse',
      claudeStep2: 'Cadastre-se ou faça login',
      claudeStep3: 'Vá em "API Keys"',
      claudeStep4: 'Crie uma nova chave e copie aqui',
      geminiStep1: 'Acesse',
      geminiStep2: 'Entre com sua conta Google',
      geminiStep3: 'Clique em "Create API Key"',
      geminiStep4: 'Copie a chave e cole aqui',
      claudeNote: 'Nota: Você precisará adicionar créditos à sua conta Anthropic para usar a API.',
      geminiNote: 'Nota: O Gemini tem um nível gratuito generoso.',
      saveAndStart: 'Salvar e Começar a Jogar',
      saving: 'Salvando...',
      changeLater: 'Você pode alterar sua chave de API depois nas configurações',
      enterKey: 'Por favor, digite sua chave de API',
      invalidClaudeFormat: 'Formato de chave inválido. Deve começar com "sk-ant-"',
      invalidGeminiFormat: 'Formato de chave do Gemini inválido',
    },

    settings: {
      title: 'Configurações',
      apiKeyConfigTitle: 'Configuração da Chave de API',
      providerLabel: 'Provedor',
      status: 'Status',
      configured: '✓ Configurado',
      notConfigured: '✗ Não configurado',
      hideKey: 'Ocultar chave atual',
      showKey: 'Mostrar chave atual',
      saveNewKey: 'Salvar Nova Chave',
      removeKey: 'Remover Chave',
      removeKeyConfirm: 'Tem certeza que deseja remover sua chave de API? Você precisará digitá-la novamente para usar os recursos de IA.',
      apiKeySaved: '✓ Chave de API salva! Recarregando...',
      generalSettings: 'Configurações Gerais',
      languageHint: 'A narração da IA será gerada neste idioma',
      language: 'Idioma',
      aiProvider: 'Provedor de IA',
      apiKey: 'Chave da API',
      apiKeyPlaceholder: 'Digite sua chave de API...',
      theme: 'Tema',
      themeGreen: '8-bit Verde',
      themeAmber: '8-bit Âmbar',
      themeClassic: 'Clássico',
      saveSettings: 'Salvar Configurações',
      clearData: 'Limpar Todos os Dados',
      clearDataConfirm: 'Tem certeza? Isso excluirá todas as campanhas e personagens!',
      exportCampaign: 'Exportar Campanha',
      importCampaign: 'Importar Campanha',
      exportSuccess: 'Campanha exportada com sucesso!',
      importSuccess: 'Campanha importada com sucesso!',
      importFailed: 'Falha ao importar campanha',
      selectFile: 'Selecionar Arquivo',
    },

    errors: {
      unknown: 'Erro desconhecido',
      noActiveCampaign: 'Nenhuma campanha ativa',
      campaignNotFound: 'Campanha não encontrada',
      failedToCreateCharacter: 'Falha ao criar personagem',
      failedToLevelUp: 'Falha ao confirmar subida de nível',
      failedToUpdateRecap: 'Falha ao atualizar resumo',
      failedToSaveSession: 'Falha ao salvar sessão',
      apiKeyRequired: 'Chave de API é obrigatória',
      invalidDiceNotation: 'Notação de dados inválida',
    },
  },

  es: {
    common: {
      back: 'Volver',
      settings: 'Configuración',
      confirm: 'Confirmar',
      cancel: 'Cancelar',
      close: 'Cerrar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      loading: 'Cargando...',
      error: 'Error',
      aiOfflineNotice: '⚠️ Servicio de IA temporalmente no disponible. Usando modo sin conexión.',
      aiErrorNotice: '⚠️ Error en el servicio de IA. Puedes continuar jugando con la narración alternativa.',
    },

    campaignCard: {
      deleteConfirm: '¿Eliminar campaña "{title}"? Esta acción no se puede deshacer.',
      theme: 'Tema',
      tone: 'Tono',
    },

    campaignList: {
      title: 'RPG en Solitario',
      newCampaign: 'Nueva Campaña',
      noCampaigns: 'No hay campañas aún',
      createFirst: '¡Crea tu primera aventura!',
      lastPlayed: 'Última jugada',
      selectCampaign: 'Selecciona una campaña para continuar',
      quickStart: 'Jugar Rápido (50 plantillas)',
    },

    presetCampaigns: {
      title: 'Jugar Rápido',
      subtitle: '50 campañas predefinidas. Haz clic en Jugar para crear y empezar al instante.',
      searchPlaceholder: 'Buscar campañas...',
      all: 'Todas',
      play: 'Jugar',
      noResults: 'No hay campañas que coincidan.',
      tags: { fantasy: '⚔️ Fantasía', horror: '👁️ Horror', cyberpunk: '🌃 Cyberpunk', vampire: '🧛 Vampiro', survival: '🔥 Supervivencia', scifi: '🚀 Ciencia Ficción', urban: '🏙️ Urbano', western: '🤠 Viejo Oeste' },
      campaigns: PRESET_CAMPAIGNS_ES,
    },

    campaign: {
      endSessionConfirm: '¿Finalizar esta sesión? Esto guardará tu progreso y extraerá recuerdos importantes de tu aventura.',
      sessionSaved: '¡Sesión finalizada! Tu progreso ha sido guardado.',
      startFallback: '¡Bienvenido a tu aventura {theme} en el sistema {system}!\n\nTu viaje comienza en un mundo lleno de misterio y peligro. El tono es {tone}, e innumerables historias esperan ser contadas.\n\n¿Qué te gustaría hacer?',
    },

    gameOver: {
      title: 'Game Over',
      message: 'Tu personaje ha caído. Los puntos de vida llegaron a cero.',
      returnToCampaigns: 'Volver a campañas',
    },

    campaignCreation: {
      title: 'Crear Nueva Campaña',
      campaignTitle: 'Título de la Campaña',
      campaignTitlePlaceholder: 'Ingresa el nombre de la campaña...',
      system: 'Sistema de RPG',
      narrativeTheme: 'Tema Narrativo',
      narrativeThemeNotice: 'Esto es solo inspiración narrativa. SoloRPG usa sus propias mecánicas universales (d20 + modificador). La elección del sistema solo afecta nombres de atributos y sabor narrativo - no las reglas del juego.',
      selectNarrativeTheme: 'Selecciona un tema narrativo...',
      theme: 'Tema y Escenario',
      themePlaceholder: 'Describe el mundo y la historia...',
      tone: 'Tono',
      startCampaign: 'Iniciar Campaña',
      creating: 'Creando...',
    },

    tones: {
      dramatic: 'Dramático',
      lighthearted: 'Ligero',
      dark: 'Oscuro',
      comedic: 'Cómico',
      mysterious: 'Misterioso',
      epic: 'Épico',
    },

    characterCreation: {
      title: 'Crea Tu Personaje',
      characterName: 'Nombre del Personaje',
      characterNamePlaceholder: 'Ingresa el nombre...',
      attributes: 'Atributos',
      randomize: 'Aleatorizar',
      range: 'Rango',
      createCharacter: 'Crear Personaje',
      cancel: 'Cancelar',
      nameRequired: 'Por favor, ingresa un nombre para el personaje',
      backgroundOptional: 'Historia del Personaje (Opcional)',
      backstory: 'Historia',
      backstoryPlaceholder: '¿Quién es tu personaje? ¿De dónde viene?',
      personality: 'Personalidad',
      personalityPlaceholder: 'Ej.: valiente, curioso, imprudente',
      goals: 'Objetivos',
      goalsPlaceholder: '¿Qué quiere lograr tu personaje?',
      fears: 'Miedos',
      fearsPlaceholder: '¿A qué le teme tu personaje?',
      basicTab: 'Básico',
      attributesTab: 'Atributos',
      inventoryTab: 'Inventario',
      inventoryHint: 'Selecciona los objetos iniciales. Puedes obtener más durante la aventura cuando el narrador los conceda.',
      backgroundTab: 'Historia',
      generateWithAI: 'Generar con IA',
      generating: 'Generando...',
      apiKeyRequired: 'Por favor, configure su clave de API de Claude en Configuración primero.',
      invalidApiKey: 'Clave de API inválida. Verifique su clave de API de Claude en Configuración.',
      generationFailed: 'Error al generar el historial del personaje. Inténtelo de nuevo.',
    },

    characterPanel: {
      level: 'Nivel',
      experience: 'Experiencia',
      hitPoints: 'Puntos de Vida',
      attributes: 'Atributos',
      maxLevel: 'MÁX',
    },

    levelUp: {
      title: '¡SUBISTE DE NIVEL!',
      congratulations: '🎉 ¡Felicitaciones!',
      youAreNowLevel: 'Ahora eres Nivel',
      allocatePoints: 'Distribuye {count} puntos de atributo',
      allocatePoint: 'Distribuye {count} punto de atributo',
      pointsRemaining: 'Puntos restantes',
      confirmLevelUp: 'Confirmar Subida de Nivel',
    },

    sidebar: {
      gameInfo: 'Info del Juego',
      endSession: 'Finalizar Sesión',
      character: 'Personaje',
      recap: 'Resumen',
      entities: 'Entidades',
    },

    recapPanel: {
      title: 'Historia Hasta Ahora',
      noRecap: 'No hay resumen aún. La aventura comienza...',
      update: 'Actualizar',
      updating: 'Actualizando...',
      clickUpdate: 'Haz clic en "Actualizar" para generar un resumen de la historia de tu aventura...',
    },

    entitiesPanel: {
      title: 'Entidades Conocidas',
      noEntities: 'No se han descubierto entidades aún',
      empty: 'Los personajes, lugares y objetos que encuentres aparecerán aquí...',
      updateHint: '¡Haz clic en "Actualizar" en la pestaña Resumen para extraer entidades de tu aventura!',
      character: 'Personaje',
      npc: 'PNJ',
      place: 'Lugar',
      item: 'Objeto',
      faction: 'Facción',
      other: 'Otro',
    },

    chat: {
      messagePlaceholder: 'Escribe tu acción o tirada de dados...',
      aiThinking: 'IA está pensando...',
      suggestedActions: 'Acciones Sugeridas',
      rolled: 'Tiró',
      rollResult: 'Tirada {notation}: {result}',
      dc: 'CD',
      adventureBegins: 'Tu aventura comienza...',
      firstActionPrompt: 'Describe tu primera acción abajo',
      narratorTyping: 'NARRADOR · escribiendo...',
      narratorThinking: 'Narrador está pensando',
      resendMessage: 'Reenviar',
      continueNarration: 'Continuar',
    },

    xp: {
      gained: '+{amount} XP',
      lost: '-{amount} XP',
      easySuccess: 'Éxito fácil',
      mediumSuccess: 'Éxito medio',
      hardSuccess: 'Éxito difícil',
      veryHardSuccess: 'Éxito muy difícil',
      criticalSuccess: '¡Crítico!',
      storyProgression: 'Progreso de la historia',
      levelUp: '¡SUBISTE DE NIVEL! ¡Ahora eres Nivel {level}!',
      levelDown: '📉 ¡Bajaste de nivel! Ahora Nivel {level}',
      youAreNowLevel: 'Ahora eres Nivel {level}',
    },

    combat: {
      takeDamage: '💥 ¡Recibes {amount} de daño!',
      recover: '💚 ¡Recuperas {amount} de HP!',
      armorReduced: 'armadura -{reduced} (era {original})',
      damageRoll: 'Tirada de daño {notation}: {result}',
    },

    inventory: {
      title: 'Inventario',
      itemAcquired: 'Adquirido: {name} x{quantity}',
      useItem: 'Usar',
      noItems: 'Sin objetos',
      weapon: 'Arma',
      armor: 'Armadura',
      equip: 'Equipar',
      unequip: 'Desequipar',
      equipped: 'Equipado',
    },

    misfortune: {
      claimedRollNotice: '⚠️ Tirada alegada detectada. Mala suerte +1 ({stacks} total). Próximas tiradas penalizadas.',
      effectiveResult: 'efectivo {value}',
      label: 'Mala suerte',
      tooltip: 'Penalización por alegar resultados. Decae con tiradas honestas.',
    },

    recap: {
      memoryUpdated: '¡Memoria actualizada! Extraído:',
      extractedRecap: 'Resumen',
      extractedEntities: 'Entidades',
      extractedFacts: 'Hechos',
      yes: 'Sí',
      no: 'No',
    },

    apiKeySetup: {
      welcome: '¡Bienvenido a SoloRPG!',
      intro: 'Para comenzar tu aventura, necesitas configurar tu clave de API del proveedor de IA.',
      introPrivacy: 'Tu clave de API se almacena localmente en tu navegador y nunca se envía a ningún lugar excepto directamente a la API del proveedor.',
      aiProvider: 'Proveedor de IA',
      anthropicKey: 'Clave de API de Anthropic',
      googleKey: 'Clave de API de Google AI',
      noKeyTitle: '¿No tienes una clave de API?',
      claudeStep1: 'Ve a',
      claudeStep2: 'Regístrate o inicia sesión',
      claudeStep3: 'Ve a "API Keys"',
      claudeStep4: 'Crea una nueva clave y cópiala aquí',
      geminiStep1: 'Ve a',
      geminiStep2: 'Inicia sesión con tu cuenta de Google',
      geminiStep3: 'Haz clic en "Create API Key"',
      geminiStep4: 'Copia la clave y pégala aquí',
      claudeNote: 'Nota: Necesitarás añadir crédito a tu cuenta Anthropic para usar la API.',
      geminiNote: 'Nota: Gemini tiene un nivel gratuito generoso.',
      saveAndStart: 'Guardar y Empezar a Jugar',
      saving: 'Guardando...',
      changeLater: 'Puedes cambiar tu clave de API más tarde en la configuración',
      enterKey: 'Por favor, ingresa tu clave de API',
      invalidClaudeFormat: 'Formato de clave inválido. Debe comenzar con "sk-ant-"',
      invalidGeminiFormat: 'Formato de clave de Gemini inválido',
    },

    settings: {
      title: 'Configuración',
      apiKeyConfigTitle: 'Configuración de Clave de API',
      providerLabel: 'Proveedor',
      status: 'Estado',
      configured: '✓ Configurado',
      notConfigured: '✗ No configurado',
      hideKey: 'Ocultar clave actual',
      showKey: 'Mostrar clave actual',
      saveNewKey: 'Guardar Nueva Clave',
      removeKey: 'Eliminar Clave',
      removeKeyConfirm: '¿Estás seguro de que quieres eliminar tu clave de API? Tendrás que ingresarla de nuevo para usar las funciones de IA.',
      apiKeySaved: '✓ ¡Clave de API guardada! Recargando...',
      generalSettings: 'Configuración General',
      languageHint: 'La narración de la IA se generará en este idioma',
      language: 'Idioma',
      aiProvider: 'Proveedor de IA',
      apiKey: 'Clave de API',
      apiKeyPlaceholder: 'Ingresa tu clave de API...',
      theme: 'Tema',
      themeGreen: '8-bit Verde',
      themeAmber: '8-bit Ámbar',
      themeClassic: 'Clásico',
      saveSettings: 'Guardar Configuración',
      clearData: 'Borrar Todos los Datos',
      clearDataConfirm: '¿Estás seguro? ¡Esto eliminará todas las campañas y personajes!',
      exportCampaign: 'Exportar Campaña',
      importCampaign: 'Importar Campaña',
      exportSuccess: '¡Campaña exportada con éxito!',
      importSuccess: '¡Campaña importada con éxito!',
      importFailed: 'Error al importar campaña',
      selectFile: 'Seleccionar Archivo',
    },

    errors: {
      unknown: 'Error desconocido',
      noActiveCampaign: 'No hay campaña activa',
      campaignNotFound: 'Campaña no encontrada',
      failedToCreateCharacter: 'Error al crear personaje',
      failedToLevelUp: 'Error al confirmar subida de nivel',
      failedToUpdateRecap: 'Error al actualizar resumen',
      failedToSaveSession: 'Error al guardar sesión',
      apiKeyRequired: 'Se requiere clave de API',
      invalidDiceNotation: 'Notación de dados inválida',
    },
  },
};
