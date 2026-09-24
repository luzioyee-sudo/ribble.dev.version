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

export const UNIVERSITY_LIFE_AND_STUDIES_DATA: TopicItemRow[] = [
  {
    english: 'University',
    german: 'Universität',
    french: 'Université',
    italian: 'Università',
    spanish: 'Universidad',
    arabic: 'جامعة',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ˌjuːnɪˈvɜːrsəti/',
      german: '/univɛʁziˈtɛːt/',
      french: '/y.ni.vɛʁ.si.te/',
      italian: '/uni.ver.siˈta/',
      spanish: '/uniβeɾsiˈðað/',
      arabic: '/d͡ʒaːmi.ʕa/'
    }
  },
  {
    english: 'Degree',
    german: 'Abschluss',
    french: 'Diplôme',
    italian: 'Laurea',
    spanish: 'Título',
    arabic: 'درجة علمية',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/dɪˈɡriː/',
      german: '/ˈapˌʃlʊs/',
      french: '/di.plom/',
      italian: '/ˈlaw.re.a/',
      spanish: '/ˈtitulo/',
      arabic: '/da.ra.d͡ʒa ʕil.miː.ja/'
    }
  },
  {
    english: 'Lecture',
    german: 'Vorlesung',
    french: 'Cours magistral',
    italian: 'Lezione',
    spanish: 'Clase magistral',
    arabic: 'محاضرة',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ˈlɛktʃər/',
      german: '/ˈfoːɐ̯ˌleːzʊŋ/',
      french: '/kuʁ ma.ʒis.tʁal/',
      italian: '/letˈtsjoːne/',
      spanish: '/ˈklase maxisˈtɾal/',
      arabic: '/mu.ħaː.da.ra/'
    }
  },
  {
    english: 'Exam',
    german: 'Prüfung',
    french: 'Examen',
    italian: 'Esame',
    spanish: 'Examen',
    arabic: 'امتحان',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ɪɡˈzæm/',
      german: '/ˈpʁyːfʊŋ/',
      french: '/ɛɡ.za.mɛ̃/',
      italian: '/eˈzaːme/',
      spanish: '/eɡˈsamen/',
      arabic: '/im.tiˈħaːn/'
    }
  },
  {
    english: 'Major',
    german: 'Hauptfach',
    french: 'Spécialité',
    italian: 'Corso di laurea',
    spanish: 'Especialidad',
    arabic: 'تخصص',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ˈmeɪdʒər/',
      german: '/ˈhaʊ̯ptˌfax/',
      french: '/spe.sja.li.te/',
      italian: '/ˈkor.so di ˈlaw.re.a/',
      spanish: '/espesjaliˈðað/',
      arabic: '/ta.xasˤ.sˤusˤ/'
    }
  },
  {
    english: 'Student',
    german: 'Student',
    french: 'Étudiant',
    italian: 'Studente',
    spanish: 'Estudiante',
    arabic: 'طالب',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ˈstjuːdənt/',
      german: '/ʃtuˈdɛnt/',
      french: '/e.ty.djɑ̃/',
      italian: '/stuˈdɛnte/',
      spanish: '/estuˈdjante/',
      arabic: '/tˤaːlib/'
    }
  },
  {
    english: 'Professor',
    german: 'Professor',
    french: 'Professeur',
    italian: 'Professore',
    spanish: 'Profesor',
    arabic: 'أستاذ',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/prəˈfɛsər/',
      german: '/pʁoˈfɛsoːɐ̯/',
      french: '/pʁɔ.fɛ.sœʁ/',
      italian: '/profesˈsoːre/',
      spanish: '/pɾofeˈsoɾ/',
      arabic: '/ʔusˈtaːð/'
    }
  },
  {
    english: 'Schedule',
    german: 'Stundenplan',
    french: 'Emploi du temps',
    italian: 'Orario',
    spanish: 'Horario',
    arabic: 'جدول دراسي',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ˈskɛdʒuːl/',
      german: '/ˈʃtʊndn̩ˌplaːn/',
      french: '/ɑ̃.plwa dy tɑ̃/',
      italian: '/oˈraːrjo/',
      spanish: '/oˈɾaɾjo/',
      arabic: '/d͡ʒad.wal di.raː.siː/'
    }
  },
  {
    english: 'Grade',
    german: 'Note',
    french: 'Note',
    italian: 'Voto',
    spanish: 'Nota',
    arabic: 'درجة',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ɡreɪd/',
      german: '/ˈnoːtə/',
      french: '/nɔt/',
      italian: '/ˈvɔːto/',
      spanish: '/ˈnota/',
      arabic: '/da.ra.d͡ʒa/'
    }
  },
  {
    english: 'Assignment',
    german: 'Hausaufgabe',
    french: 'Devoir',
    italian: 'Compito',
    spanish: 'Tarea',
    arabic: 'واجب دراسي',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/əˈsaɪnmənt/',
      german: '/ˈhaʊ̯sˌʔaʊ̯fɡaːbə/',
      french: '/də.vwaʁ/',
      italian: '/ˈkom.pito/',
      spanish: '/taˈɾea/',
      arabic: '/waː.d͡ʒib di.raː.siː/'
    }
  },
  {
    english: 'Library',
    german: 'Bibliothek',
    french: 'Bibliothèque',
    italian: 'Biblioteca',
    spanish: 'Biblioteca',
    arabic: 'مكتبة',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ˈlaɪbrəri/',
      german: '/biblioˈteːk/',
      french: '/bi.bli.jɔ.tɛk/',
      italian: '/bibljoˈtɛːka/',
      spanish: '/biβljoˈteka/',
      arabic: '/mak.ta.ba/'
    }
  },
  {
    english: 'Research',
    german: 'Forschung',
    french: 'Recherche',
    italian: 'Ricerca',
    spanish: 'Investigación',
    arabic: 'بحث',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/rɪˈsɜːrtʃ/',
      german: '/ˈfɔʁʃʊŋ/',
      french: '/ʁə.ʃɛʁʃ/',
      italian: '/riˈtʃɛrka/',
      spanish: '/imbestiɣaˈsjon/',
      arabic: '/baħθ/'
    }
  },
  {
    english: 'Semester',
    german: 'Semester',
    french: 'Semestre',
    italian: 'Semestre',
    spanish: 'Semestre',
    arabic: 'فصل دراسي',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/səˈmɛstər/',
      german: '/zeˈmɛstɐ/',
      french: '/sə.mɛstʁ/',
      italian: '/seˈmɛstre/',
      spanish: '/seˈmestɾe/',
      arabic: '/fasˤl di.raː.siː/'
    }
  },
  {
    english: 'Tuition fees',
    german: 'Studiengebühren',
    french: 'Frais de scolarité',
    italian: 'Tasse universitarie',
    spanish: 'Tasas',
    arabic: 'رسوم دراسية',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/tjuːˈɪʃn fiːz/',
      german: '/ˈʃtuːdi̯ənɡəˌbyːʁən/',
      french: '/fʁɛ də skɔ.la.ʁi.te/',
      italian: '/ˈtas.se uni.ver.siˈta.rje/',
      spanish: '/ˈtasas/',
      arabic: '/ru.suːm di.raː.siː.ja/'
    }
  },
  {
    english: 'Campus',
    german: 'Campus',
    french: 'Campus',
    italian: 'Campus',
    spanish: 'Campus',
    arabic: 'حرم جامعي',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ˈkæmpəs/',
      german: '/ˈkampʊs/',
      french: '/kɑ̃.pys/',
      italian: '/ˈkam.pus/',
      spanish: '/ˈkampus/',
      arabic: '/ħa.ram d͡ʒaːmi.ʕiː/'
    }
  },
  {
    english: 'Scholarship',
    german: 'Stipendium',
    french: 'Bourse',
    italian: 'Borsa di studio',
    spanish: 'Beca',
    arabic: 'منحة دراسية',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ˈskɒlərʃɪp/',
      german: '/ʃtiˈpɛndi̯ʊm/',
      french: '/buʁs/',
      italian: '/ˈbor.sa di ˈstuːdjo/',
      spanish: '/ˈbeka/',
      arabic: '/min.ħa di.raː.siː.ja/'
    }
  },
  {
    english: 'To study',
    german: 'Studieren',
    french: 'Étudier',
    italian: 'Studiare',
    spanish: 'Estudiar',
    arabic: 'يدرس',
    type: 'word',
    cefr: 'B1',
    pos: 'verb',
    phonetic: {
      english: '/tuː ˈstʌdi/',
      german: '/ʃtuˈdiːʁən/',
      french: '/e.ty.dje/',
      italian: '/stuˈdjaːre/',
      spanish: '/estuˈdjaɾ/',
      arabic: '/jad.ru.su/'
    }
  },
  {
    english: 'To pass',
    german: 'Bestehen',
    french: 'Réussir',
    italian: 'Superare',
    spanish: 'Aprobar',
    arabic: 'يجتاز',
    type: 'word',
    cefr: 'B1',
    pos: 'verb',
    phonetic: {
      english: '/tuː pɑːs/',
      german: '/bəˈʃteːən/',
      french: '/ʁe.y.siʁ/',
      italian: '/su.peˈraːre/',
      spanish: '/apɾoˈβaɾ/',
      arabic: '/jad͡ʒ.taː.zu/'
    }
  },
  {
    english: 'To fail',
    german: 'Durchfallen',
    french: 'Échouer',
    italian: 'Bocciare',
    spanish: 'Suspender',
    arabic: 'يرسب',
    type: 'word',
    cefr: 'B1',
    pos: 'verb',
    phonetic: {
      english: '/tuː feɪl/',
      german: '/ˈdʊʁçˌfalən/',
      french: '/e.ʃwe/',
      italian: '/botˈtʃaːre/',
      spanish: '/suspenˈdeɾ/',
      arabic: '/jar.su.bu/'
    }
  },
  {
    english: 'Graduate',
    german: 'Absolvent',
    french: 'Diplômé',
    italian: 'Laureato',
    spanish: 'Graduado',
    arabic: 'خريج',
    type: 'word',
    cefr: 'B1',
    pos: 'noun',
    phonetic: {
      english: '/ˈɡrædʒuət/',
      german: '/apzɔlˈvɛnt/',
      french: '/di.plom/',
      italian: '/law.reˈaːto/',
      spanish: '/ɡɾaˈðwaðo/',
      arabic: '/xi.riːd͡ʒ/'
    }
  }
];
