/**
 * Translation keys and text for all supported languages
 */

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

  // Campaign List
  campaignList: {
    title: string;
    newCampaign: string;
    noCampaigns: string;
    createFirst: string;
    lastPlayed: string;
    selectCampaign: string;
  };

  // Campaign Interface
  campaign: {
    endSessionConfirm: string;
    sessionSaved: string;
    startFallback: string;
  };

  // Campaign Creation
  campaignCreation: {
    title: string;
    campaignTitle: string;
    campaignTitlePlaceholder: string;
    system: string;
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
    easySuccess: string;
    mediumSuccess: string;
    hardSuccess: string;
    veryHardSuccess: string;
    criticalSuccess: string;
    storyProgression: string;
    levelUp: string;
    youAreNowLevel: string;
  };

  // HP and Resources
  combat: {
    takeDamage: string;
    recover: string;
    resourceSpent: string;
    resourceRestored: string;
  };

  // Settings
  settings: {
    title: string;
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

    campaignList: {
      title: 'Solo RPG',
      newCampaign: 'New Campaign',
      noCampaigns: 'No campaigns yet',
      createFirst: 'Create your first adventure!',
      lastPlayed: 'Last played',
      selectCampaign: 'Select a campaign to continue',
    },

    campaign: {
      endSessionConfirm: 'End this session? This will save your progress and extract important memories from your adventure.',
      sessionSaved: 'Session ended! Your progress has been saved.',
      startFallback: 'Welcome to your {{theme}} adventure in the {{system}} system!\n\nYour journey begins in a world filled with mystery and danger. The tone is {{tone}}, and countless stories await to be told.\n\nWhat would you like to do?',
    },

    campaignCreation: {
      title: 'Create New Campaign',
      campaignTitle: 'Campaign Title',
      campaignTitlePlaceholder: 'Enter campaign name...',
      system: 'RPG System',
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
      easySuccess: 'Easy success',
      mediumSuccess: 'Medium success',
      hardSuccess: 'Hard success',
      veryHardSuccess: 'Very hard success',
      criticalSuccess: 'Critical!',
      storyProgression: 'Story progression',
      levelUp: '🎉 LEVEL UP! You are now Level {level}!',
      youAreNowLevel: 'You are now Level {level}',
    },

    combat: {
      takeDamage: '💥 You take {amount} damage!',
      recover: '💚 You recover {amount} HP!',
      resourceSpent: '🔵 {resource} {amount} ({spent} spent)',
      resourceRestored: '🔵 {resource} +{amount} restored!',
    },

    settings: {
      title: 'Settings',
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

    campaignList: {
      title: 'RPG Solo',
      newCampaign: 'Nova Campanha',
      noCampaigns: 'Nenhuma campanha ainda',
      createFirst: 'Crie sua primeira aventura!',
      lastPlayed: 'Última jogada',
      selectCampaign: 'Selecione uma campanha para continuar',
    },

    campaign: {
      endSessionConfirm: 'Encerrar esta sessão? Isso salvará seu progresso e extrairá memórias importantes da sua aventura.',
      sessionSaved: 'Sessão encerrada! Seu progresso foi salvo.',
      startFallback: 'Bem-vindo à sua aventura {{theme}} no sistema {{system}}!\n\nSua jornada começa em um mundo cheio de mistério e perigo. O tom é {{tone}}, e incontáveis histórias aguardam para serem contadas.\n\nO que você gostaria de fazer?',
    },

    campaignCreation: {
      title: 'Criar Nova Campanha',
      campaignTitle: 'Título da Campanha',
      campaignTitlePlaceholder: 'Digite o nome da campanha...',
      system: 'Sistema de RPG',
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
      easySuccess: 'Sucesso fácil',
      mediumSuccess: 'Sucesso médio',
      hardSuccess: 'Sucesso difícil',
      veryHardSuccess: 'Sucesso muito difícil',
      criticalSuccess: 'Crítico!',
      storyProgression: 'Progressão da história',
      levelUp: '🎉 SUBIU DE NÍVEL! Você agora é Nível {level}!',
      youAreNowLevel: 'Você agora é Nível {level}',
    },

    combat: {
      takeDamage: '💥 Você sofreu {amount} de dano!',
      recover: '💚 Você recuperou {amount} de HP!',
      resourceSpent: '🔵 {resource} {amount} ({spent} gasto)',
      resourceRestored: '🔵 {resource} +{amount} restaurado!',
    },

    settings: {
      title: 'Configurações',
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

    campaignList: {
      title: 'RPG en Solitario',
      newCampaign: 'Nueva Campaña',
      noCampaigns: 'No hay campañas aún',
      createFirst: '¡Crea tu primera aventura!',
      lastPlayed: 'Última jugada',
      selectCampaign: 'Selecciona una campaña para continuar',
    },

    campaign: {
      endSessionConfirm: '¿Finalizar esta sesión? Esto guardará tu progreso y extraerá recuerdos importantes de tu aventura.',
      sessionSaved: '¡Sesión finalizada! Tu progreso ha sido guardado.',
      startFallback: '¡Bienvenido a tu aventura {{theme}} en el sistema {{system}}!\n\nTu viaje comienza en un mundo lleno de misterio y peligro. El tono es {{tone}}, e innumerables historias esperan ser contadas.\n\n¿Qué te gustaría hacer?',
    },

    campaignCreation: {
      title: 'Crear Nueva Campaña',
      campaignTitle: 'Título de la Campaña',
      campaignTitlePlaceholder: 'Ingresa el nombre de la campaña...',
      system: 'Sistema de RPG',
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
      easySuccess: 'Éxito fácil',
      mediumSuccess: 'Éxito medio',
      hardSuccess: 'Éxito difícil',
      veryHardSuccess: 'Éxito muy difícil',
      criticalSuccess: '¡Crítico!',
      storyProgression: 'Progreso de la historia',
      levelUp: '¡SUBISTE DE NIVEL! ¡Ahora eres Nivel {level}!',
      youAreNowLevel: 'Ahora eres Nivel {level}',
    },

    combat: {
      takeDamage: '💥 ¡Recibes {amount} de daño!',
      recover: '💚 ¡Recuperas {amount} de HP!',
      resourceSpent: '🔵 {resource} {amount} ({spent} gastado)',
      resourceRestored: '🔵 ¡{resource} +{amount} restaurado!',
    },

    settings: {
      title: 'Configuración',
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
