export interface TopicItemRow {
  english: string;
  arabic: string;
  french: string;
  german: string;
  italian: string;
  spanish: string;
  chinese?: string;
  japanese?: string;
  type: 'word' | 'chunk' | 'sentence';
  cefr: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  pos?: string;
  phonetic?: {
    english?: string;
    french?: string;
    german?: string;
    italian?: string;
    spanish?: string;
    arabic?: string;
    chinese?: string;
    japanese?: string;
  };
}

export const CAREER_GOALS_AND_BUSINESS_DATA: TopicItemRow[] = [
  {
    english: 'Career',
    german: 'Karriere',
    french: 'Carrière',
    italian: 'Carriera',
    spanish: 'Carrera',
    arabic: 'مسيرة مهنية',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/kəˈrɪər/',
      german: '/kaˈʁi̯eːʁə/',
      french: '/ka.ʁjɛʁ/',
      italian: '/karˈrjɛːra/',
      spanish: '/kaˈreɾa/',
      arabic: '/ma.siː.ra mi.ha.niː.ja/'
    }
  },
  {
    english: 'Entrepreneur',
    german: 'Unternehmer',
    french: 'Entrepreneur',
    italian: 'Imprenditore',
    spanish: 'Emprendedor',
    arabic: 'رائد أعمال',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ˌɒntrəprəˈnɜːr/',
      german: '/ˌʊntɐˈneːmɐ/',
      french: '/ɑ̃.tʁə.pʁə.nœʁ/',
      italian: '/impren.diˈtoːre/',
      spanish: '/empɾendeˈðoɾ/',
      arabic: '/raː.ʔid ʔaʕ.maːl/'
    }
  },
  {
    english: 'Business',
    german: 'Unternehmen',
    french: 'Entreprise',
    italian: 'Azienda',
    spanish: 'Empresa',
    arabic: 'عمل تجاري',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ˈbɪznəs/',
      german: '/ˌʊntɐˈneːmən/',
      french: '/ɑ̃.tʁə.pʁiz/',
      italian: '/adˈdzjɛn.da/',
      spanish: '/emˈpɾesa/',
      arabic: '/ʕa.mal ti.d͡ʒaː.riː/'
    }
  },
  {
    english: 'Goal',
    german: 'Ziel',
    french: 'Objectif',
    italian: 'Obiettivo',
    spanish: 'Objetivo',
    arabic: 'هدف',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ɡoʊl/',
      german: '/tsiːl/',
      french: '/ɔb.ʒɛk.tif/',
      italian: '/objɛtˈtiːvo/',
      spanish: '/oxβeˈtiβo/',
      arabic: '/ha.daf/'
    }
  },
  {
    english: 'Strategy',
    german: 'Strategie',
    french: 'Stratégie',
    italian: 'Strategia',
    spanish: 'Estrategia',
    arabic: 'استراتيجية',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ˈstrætədʒi/',
      german: '/ʃtʁateˈɡiː/',
      french: '/stʁa.te.ʒi/',
      italian: '/strateˈdʒiːa/',
      spanish: '/estɾaˈtexja/',
      arabic: '/ʔis.traː.tiː.d͡ʒiː.ja/'
    }
  },
  {
    english: 'Project',
    german: 'Projekt',
    french: 'Projet',
    italian: 'Progetto',
    spanish: 'Proyecto',
    arabic: 'مشروع',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ˈprɒdʒɛkt/',
      german: '/pʁoˈjɛkt/',
      french: '/pʁɔ.ʒɛ/',
      italian: '/proˈdʒɛtto/',
      spanish: '/pɾoˈʝekto/',
      arabic: '/maʃˈruːʕ/'
    }
  },
  {
    english: 'Client',
    german: 'Kunde',
    french: 'Client',
    italian: 'Cliente',
    spanish: 'Cliente',
    arabic: 'عميل',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ˈklaɪənt/',
      german: '/ˈkʊndə/',
      french: '/kli.jɑ̃/',
      italian: '/kliˈɛnte/',
      spanish: '/kljenˈte/',
      arabic: '/ʕa.miːl/'
    }
  },
  {
    english: 'Investment',
    german: 'Investition',
    french: 'Investissement',
    italian: 'Investimento',
    spanish: 'Inversión',
    arabic: 'استثمار',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ɪnˈvɛstmənt/',
      german: '/ɪnvɛstiˈtsi̯oːn/',
      french: '/ɛ̃.vɛs.tis.mɑ̃/',
      italian: '/investiˈmento/',
      spanish: '/imbeɾˈsjon/',
      arabic: '/ʔis.tiθˈmaːr/'
    }
  },
  {
    english: 'Revenue',
    german: 'Umsatz',
    french: 'Revenu',
    italian: 'Fatturato',
    spanish: 'Ingresos',
    arabic: 'إيرادات',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ˈrɛvənjuː/',
      german: '/ˈʊmˌzats/',
      french: '/ʁəv.ny/',
      italian: '/fattuˈraːto/',
      spanish: '/iŋˈɡɾesos/',
      arabic: '/ʔiː.raː.daːt/'
    }
  },
  {
    english: 'Profit',
    german: 'Gewinn',
    french: 'Bénéfice',
    italian: 'Profitto',
    spanish: 'Ganancia',
    arabic: 'ربح',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ˈprɒfɪt/',
      german: '/ɡəˈvɪn/',
      french: '/be.ne.fis/',
      italian: '/proˈfit.to/',
      spanish: '/ɡaˈnansja/',
      arabic: '/ribħ/'
    }
  },
  {
    english: 'Market',
    german: 'Markt',
    french: 'Marché',
    italian: 'Mercato',
    spanish: 'Mercado',
    arabic: 'سوق',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ˈmɑːrkɪt/',
      german: '/maʁkt/',
      french: '/maʁ.ʃe/',
      italian: '/merˈkaːto/',
      spanish: '/meɾˈkaðo/',
      arabic: '/suːq/'
    }
  },
  {
    english: 'Management',
    german: 'Management',
    french: 'Gestion',
    italian: 'Gestione',
    spanish: 'Gestión',
    arabic: 'إدارة',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ˈmænɪdʒmənt/',
      german: '/ˈmɛnədʒmənt/',
      french: '/ʒɛs.tjɔ̃/',
      italian: '/dʒeˈstjoːne/',
      spanish: '/xesˈtjon/',
      arabic: '/ʔi.daː.ra/'
    }
  },
  {
    english: 'Startup',
    german: 'Startup',
    french: 'Startup',
    italian: 'Startup',
    spanish: 'Startup',
    arabic: 'شركة ناشئة',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ˈstɑːrtʌp/',
      german: '/ˈstaːɐ̯tˌʔap/',
      french: '/staʁ.tœp/',
      italian: '/ˈstar.tap/',
      spanish: '/staɾˈtap/',
      arabic: '/ʃa.ri.ka naː.ʃi.ʔa/'
    }
  },
  {
    english: 'To launch',
    german: 'Starten',
    french: 'Lancer',
    italian: 'Lanciare',
    spanish: 'Lanzar',
    arabic: 'يطلق',
    type: 'word',
    cefr: 'B1',
    pos: 'verb',
    phonetic: {
      english: '/tuː lɔːntʃ/',
      german: '/ˈʃtaʁtn̩/',
      french: '/lɑ̃.se/',
      italian: '/lanˈtʃaːre/',
      spanish: '/lanˈsaɾ/',
      arabic: '/jutˤ.li.qu/'
    }
  },
  {
    english: 'To succeed',
    german: 'Erfolgreich sein',
    french: 'Réussir',
    italian: 'Avere successo',
    spanish: 'Tener éxito',
    arabic: 'ينجح',
    type: 'word',
    cefr: 'B1',
    pos: 'verb',
    phonetic: {
      english: '/tuː səkˈsiːd/',
      german: '/ɛɐ̯ˈfɔlkˌʁaɪç zaɪn/',
      french: '/ʁe.y.siʁ/',
      italian: '/aˈveːre sutˈtʃɛs.so/',
      spanish: '/teˈneɾ ˈeksito/',
      arabic: '/jan.d͡ʒa.ħu/'
    }
  },
  {
    english: 'Success',
    german: 'Erfolg',
    french: 'Succès',
    italian: 'Successo',
    spanish: 'Éxito',
    arabic: 'نجاح',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/səkˈsɛs/',
      german: '/ɛɐ̯ˈfɔlk/',
      french: '/syk.sɛ/',
      italian: '/sutˈtʃɛsso/',
      spanish: '/ˈeksito/',
      arabic: '/na.d͡ʒaːħ/'
    }
  },
  {
    english: 'Innovation',
    german: 'Innovation',
    french: 'Innovation',
    italian: 'Innovazione',
    spanish: 'Innovación',
    arabic: 'ابتكار',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ˌɪnəˈveɪʃn/',
      german: '/ɪnovaˈtsi̯oːn/',
      french: '/i.nɔ.va.sjɔ̃/',
      italian: '/in.no.vatˈtsjoːne/',
      spanish: '/inobaˈsjon/',
      arabic: '/ʔib.tiˈkaːr/'
    }
  },
  {
    english: 'Negotiation',
    german: 'Verhandlung',
    french: 'Négociation',
    italian: 'Trattativa',
    spanish: 'Negociación',
    arabic: 'مفاوضات',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/nɪˌɡoʊʃiˈeɪʃn/',
      german: '/fɛɐ̯ˈhantlʊŋ/',
      french: '/ne.ɡɔ.sja.sjɔ̃/',
      italian: '/trattaˈtiːva/',
      spanish: '/neɣosjaˈsjon/',
      arabic: '/mu.faː.wa.dˤaːt/'
    }
  },
  {
    english: 'Experience',
    german: 'Erfahrung',
    french: 'Expérience',
    italian: 'Esperienza',
    spanish: 'Experiencia',
    arabic: 'خبرة',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ɪkˈspɪəriəns/',
      german: '/ɛɐ̯ˈfaːʁʊŋ/',
      french: '/ɛk.spe.ʁjɑ̃s/',
      italian: '/espeˈrjɛntsa/',
      spanish: '/ekspeˈɾjensja/',
      arabic: '/xib.ra/'
    }
  },
  {
    english: 'Contract',
    german: 'Vertrag',
    french: 'Contrat',
    italian: 'Contratto',
    spanish: 'Contrato',
    arabic: 'عقد',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ˈkɒntrækt/',
      german: '/fɛɐ̯ˈtʁaːk/',
      french: '/kɔ̃.tʁa/',
      italian: '/konˈtratto/',
      spanish: '/konˈtɾato/',
      arabic: '/ʕaqd/'
    }
  }
];
