const fs = require('fs');

const data = [
  ["name", "اسم", "nom", "Name", "nombre"],
  ["first name", "الاسم الأول", "prénom", "Vorname", "nombre de pila"],
  ["last name / surname", "اسم العائلة", "nom de famille", "Nachname", "apellido"],
  ["age", "العمر", "âge", "Alter", "edad"],
  ["nationality", "الجنسية", "nationalité", "Nationalität", "nacionalidad"],
  ["country", "الدولة", "pays", "Land", "país"],
  ["city", "المدينة", "ville", "Stadt", "ciudad"],
  ["hometown", "مسقط الرأس", "ville natale", "Heimatstadt", "ciudad natal"],
  ["address", "العنوان", "adresse", "Adresse", "dirección"],
  ["job / occupation", "الوظيفة / المهنة", "travail / emploi", "Beruf", "trabajo / ocupación"],
  ["profession", "المهنة", "profession", "Beruf", "profesión"],
  ["student", "طالب", "étudiant(e)", "Student(in)", "estudiante"],
  ["worker / employee", "عامل / موظف", "employé(e)", "Angestellte(r)", "empleado/a"],
  ["manager", "مدير", "directeur/directrice", "Manager(in)", "gerente"],
  ["teacher", "معلم", "professeur / enseignant(e)", "Lehrer(in)", "profesor/a"],
  ["engineer", "مهندس", "ingénieur(e)", "Ingenieur(in)", "ingeniero/a"],
  ["doctor", "طبيب", "médecin", "Arzt/Ärztin", "médico/a"],
  ["nurse", "ممرضة", "infirmier/infirmière", "Krankenpfleger/-schwester", "enfermero/a"],
  ["driver", "سائق", "chauffeur/chauffeuse", "Fahrer(in)", "conductor/a"],
  ["farmer", "مزارع", "agriculteur/agricultrice", "Bauer/Bäuerin", "agricultor/a"],
  ["married", "متزوج", "marié(e)", "verheiratet", "casado/a"],
  ["single", "أعزب", "célibataire", "ledig", "soltero/a"],
  ["divorced", "مطلق", "divorcé(e)", "geschieden", "divorciado/a"],
  ["hobby", "هواية", "passe-temps", "Hobby", "pasatiempo"],
  ["interest", "اهتمام", "intérêt", "Interesse", "interés"],
  ["language", "لغة", "langue", "Sprache", "idioma"],
  ["speak", "يتحدث", "parler", "sprechen", "hablar"],
  ["understand", "يفهم", "comprendre", "verstehen", "entender"],
  ["mother tongue", "اللغة الأم", "langue maternelle", "Muttersprache", "lengua materna"],
  ["phone number", "رقم الهاتف", "numéro de téléphone", "Telefonnummer", "número de teléfono"],
  ["email address", "البريد الإلكتروني", "adresse e-mail", "E-Mail-Adresse", "correo electrónico"],
  ["meet", "يقابل", "rencontrer", "treffen", "conocer / encontrarse"],
  ["introduce", "يقدم / يعرّف", "présenter", "vorstellen", "presentar"],
  ["colleague", "زميل عمل", "collègue", "Kollege/Kollegin", "colega"],
  ["neighbor", "جار", "voisin(e)", "Nachbar(in)", "vecino/a"],
  ["friend", "صديق", "ami(e)", "Freund(in)", "amigo/a"],
  ["adult", "بالغ", "adulte", "Erwachsene(r)", "adulto/a"],
  ["child / children", "طفل / أطفال", "enfant / enfants", "Kind/Kinder", "niño/a / niños"],
  ["teenager", "مراهق", "adolescent(e)", "Teenager/Jugendliche(r)", "adolescente"],
  ["young", "صغير السن", "jeune", "jung", "joven"],
  ["old", "كبير السن", "vieux/vieille", "alt", "viejo/a"],
  ["tall", "طويل", "grand(e)", "groß", "alto/a"],
  ["short", "قصير", "petit(e)", "klein", "bajo/a"],

  ["My name is Omar.", "اسمي عمر.", "Je m'appelle Omar.", "Ich heiße Omar.", "Me llamo Omar."],
  ["My first name is Ali.", "اسمي الأول علي.", "Mon prénom est Ali.", "Mein Vorname ist Ali.", "Mi nombre de pila es Ali."],
  ["My last name is Hassan.", "اسم عائلتي حسن.", "Mon nom de famille est Hassan.", "Mein Nachname ist Hassan.", "Mi apellido es Hassan."],
  ["My age is twenty-two.", "عمري اثنان وعشرون عامًا.", "J'ai vingt-deux ans.", "Ich bin zweiundzwanzig Jahre alt.", "Tengo veintidós años."],
  ["My nationality is Egyptian.", "جنسيتي مصرية.", "Ma nationalité est égyptienne.", "Meine Nationalität ist ägyptisch.", "Mi nacionalidad es egipcia."],
  ["I am from a beautiful country.", "أنا من بلد جميل.", "Je viens d'un beau pays.", "Ich komme aus einem schönen Land.", "Vengo de un país hermoso."],
  ["I was born in this city.", "وُلدت في هذه المدينة.", "Je suis né(e) dans cette ville.", "Ich wurde in dieser Stadt geboren.", "Nací en esta ciudad."],
  ["My hometown is Luxor.", "مسقط رأسي الأقصر.", "Ma ville natale est Louxor.", "Meine Heimatstadt ist Luxor.", "Mi ciudad natal es Luxor."],
  ["Can you give me your address?", "هل يمكنك إعطائي عنوانك؟", "Peux-tu me donner ton adresse ?", "Kannst du mir deine Adresse geben?", "¿Puedes darme tu dirección?"],
  ["What is your occupation?", "ما هي مهنتك؟", "Quelle est ta profession ?", "Was ist dein Beruf?", "¿Cuál es tu ocupación?"],
  ["Teaching is a respected profession.", "التدريس مهنة محترمة.", "L'enseignement est une profession respectée.", "Unterrichten ist ein angesehener Beruf.", "La enseñanza es una profesión respetada."],
  ["I am a university student.", "أنا طالب جامعي.", "Je suis étudiant(e) à l'université.", "Ich bin Student(in) an der Universität.", "Soy estudiante universitario/a."],
  ["He is an employee at a bank.", "هو موظف في بنك.", "Il est employé dans une banque.", "Er ist Angestellter bei einer Bank.", "Él es empleado de un banco."],
  ["She is the manager of the store.", "هي مديرة المتجر.", "Elle est la directrice du magasin.", "Sie ist die Managerin des Geschäfts.", "Ella es la gerente de la tienda."],
  ["My teacher is very kind.", "معلمي لطيف جدًا.", "Mon professeur est très gentil.", "Mein Lehrer ist sehr nett.", "Mi profesor es muy amable."],
  ["My brother is an engineer.", "أخي مهندس.", "Mon frère est ingénieur.", "Mein Bruder ist Ingenieur.", "Mi hermano es ingeniero."],
  ["She wants to be a doctor.", "تريد أن تصبح طبيبة.", "Elle veut devenir médecin.", "Sie möchte Ärztin werden.", "Ella quiere ser médica."],
  ["The nurse was very helpful.", "كانت الممرضة متعاونة جدًا.", "L'infirmière a été très serviable.", "Die Krankenschwester war sehr hilfsbereit.", "La enfermera fue muy servicial."],
  ["He works as a taxi driver.", "يعمل كسائق تاكسي.", "Il travaille comme chauffeur de taxi.", "Er arbeitet als Taxifahrer.", "Él trabaja como taxista."],
  ["My grandfather was a farmer.", "كان جدي مزارعًا.", "Mon grand-père était agriculteur.", "Mein Großvater war Bauer.", "Mi abuelo era agricultor."],
  ["My sister is married.", "أختي متزوجة.", "Ma sœur est mariée.", "Meine Schwester ist verheiratet.", "Mi hermana está casada."],
  ["I am still single.", "ما زلت أعزب.", "Je suis encore célibataire.", "Ich bin noch ledig.", "Todavía estoy soltero/a."],
  ["He got divorced last year.", "تطلق العام الماضي.", "Il a divorcé l'année dernière.", "Er hat sich letztes Jahr scheiden lassen.", "Se divorció el año pasado."],
  ["Football is my hobby.", "كرة القدم هي هوايتي.", "Le football est mon passe-temps.", "Fußball ist mein Hobby.", "El fútbol es mi pasatiempo."],
  ["My interests include music and travel.", "تشمل اهتماماتي الموسيقى والسفر.", "Mes centres d'intérêt incluent la musique et les voyages.", "Zu meinen Interessen gehören Musik und Reisen.", "Mis intereses incluyen la música y los viajes."],
  ["English is a global language.", "الإنجليزية لغة عالمية.", "L'anglais est une langue mondiale.", "Englisch ist eine Weltsprache.", "El inglés es un idioma global."],
  ["I speak Arabic and English.", "أتحدث العربية والإنجليزية.", "Je parle arabe et anglais.", "Ich spreche Arabisch und Englisch.", "Hablo árabe e inglés."],
  ["I understand a little French.", "أفهم القليل من الفرنسية.", "Je comprends un peu le français.", "Ich verstehe ein wenig Französisch.", "Entiendo un poco de francés."],
  ["Arabic is my mother tongue.", "العربية هي لغتي الأم.", "L'arabe est ma langue maternelle.", "Arabisch ist meine Muttersprache.", "El árabe es mi lengua materna."],
  ["Can I have your phone number?", "هل يمكنني الحصول على رقم هاتفك؟", "Puis-je avoir ton numéro de téléphone ?", "Kann ich deine Telefonnummer haben?", "¿Puedo tener tu número de teléfono?"],
  ["Please send me your email address.", "من فضلك أرسل لي بريدك الإلكتروني.", "Envoie-moi ton adresse e-mail, s'il te plaît.", "Bitte schick mir deine E-Mail-Adresse.", "Por favor, envíame tu correo electrónico."],
  ["I met him yesterday.", "قابلته أمس.", "Je l'ai rencontré hier.", "Ich habe ihn gestern getroffen.", "Lo conocí ayer."],
  ["Let me introduce myself.", "دعني أقدم نفسي.", "Laisse-moi me présenter.", "Lass mich mich vorstellen.", "Déjame presentarme."],
  ["He is my colleague at work.", "هو زميلي في العمل.", "C'est mon collègue de travail.", "Er ist mein Kollege bei der Arbeit.", "Él es mi colega de trabajo."],
  ["My neighbor is very friendly.", "جاري ودود جدًا.", "Mon voisin est très amical.", "Mein Nachbar ist sehr freundlich.", "Mi vecino es muy amable."],
  ["She is my best friend.", "هي صديقتي المفضلة.", "C'est ma meilleure amie.", "Sie ist meine beste Freundin.", "Ella es mi mejor amiga."],
  ["This film is for adults only.", "هذا الفيلم للبالغين فقط.", "Ce film est réservé aux adultes.", "Dieser Film ist nur für Erwachsene.", "Esta película es solo para adultos."],
  ["She has two children.", "لديها طفلان.", "Elle a deux enfants.", "Sie hat zwei Kinder.", "Ella tiene dos hijos."],
  ["My son is a teenager now.", "ابني مراهق الآن.", "Mon fils est adolescent maintenant.", "Mein Sohn ist jetzt ein Teenager.", "Mi hijo ya es adolescente."],
  ["He looks very young.", "يبدو صغيرًا جدًا.", "Il a l'air très jeune.", "Er sieht sehr jung aus.", "Se ve muy joven."],
  ["My grandfather is very old.", "جدي كبير في السن جدًا.", "Mon grand-père est très vieux.", "Mein Großvater ist sehr alt.", "Mi abuelo es muy viejo."],
  ["He is tall and thin.", "هو طويل ونحيف.", "Il est grand et mince.", "Er ist groß und schlank.", "Él es alto y delgado."],
  ["She is short and friendly.", "هي قصيرة وودودة.", "Elle est petite et amicale.", "Sie ist klein und freundlich.", "Ella es baja y amable."],

  ["My name is...", "اسمي هو...", "Je m'appelle...", "Ich heiße...", "Me llamo..."],
  ["I am ... years old", "عمري ... سنة", "J'ai ... ans", "Ich bin ... Jahre alt", "Tengo ... años"],
  ["I come from...", "أنا من...", "Je viens de...", "Ich komme aus...", "Vengo de..."],
  ["I live in...", "أعيش في...", "J'habite à...", "Ich wohne in...", "Vivo en..."],
  ["I work as a...", "أعمل كـ...", "Je travaille comme...", "Ich arbeite als...", "Trabajo como..."],
  ["Nice to meet you", "سعيد بلقائك", "Enchanté(e)", "Freut mich, dich kennenzulernen", "Mucho gusto"],
  ["What's your name?", "ما اسمك؟", "Comment tu t'appelles ?", "Wie heißt du?", "¿Cómo te llamas?"],
  ["Where are you from?", "من أين أنت؟", "D'où viens-tu ?", "Woher kommst du?", "¿De dónde eres?"],
  ["How old are you?", "كم عمرك؟", "Quel âge as-tu ?", "Wie alt bist du?", "¿Cuántos años tienes?"],
  ["What do you do?", "ماذا تعمل؟", "Qu'est-ce que tu fais dans la vie ?", "Was machst du beruflich?", "¿A qué te dedicas?"],
  ["I'm new here", "أنا جديد هنا", "Je suis nouveau/nouvelle ici", "Ich bin neu hier", "Soy nuevo/a aquí"],
  ["Let me introduce myself", "دعني أُقَدِّم نفسي", "Laisse-moi me présenter", "Lass mich mich vorstellen", "Déjame presentarme"],
  ["Can you spell that, please?", "هل يمكنك تهجئتها من فضلك؟", "Peux-tu épeler ça, s'il te plaît ?", "Kannst du das bitte buchstabieren?", "¿Puedes deletrearlo, por favor?"],
  ["I'm from Egypt originally", "أنا من مصر أصلاً", "Je suis originaire d'Égypte", "Ich komme ursprünglich aus Ägypten", "Soy originario/a de Egipto"],
  ["What do you do in your free time?", "ماذا تفعل في وقت فراغك؟", "Que fais-tu pendant ton temps libre ?", "Was machst du in deiner Freizeit?", "¿Qué haces en tu tiempo libre?"]
];

const langs = ["English", "Arabic", "French", "German", "Spanish"];
let entries = [];

data.forEach((row, i) => {
  const isPhrase = row[0].includes(" ") || row[0].includes("...");
  const type = isPhrase ? (row[0].includes("...") ? "chunk" : "expression") : "word";

  langs.forEach((lang, langIdx) => {
    let word = row[langIdx];
    let definition = "";
    
    // Using English as definition if it's not English
    if (langIdx !== 0) {
      definition = row[0];
    } else {
      definition = word; // Or Arabic for English? No, let's keep it simple.
    }

    entries.push({
      word: word,
      language: lang,
      cefr: "A1",
      topics: ["Introducing Yourself"],
      type: type,
      status: "active",
      senses: [
        {
          senseId: `${lang}_${i}_s1`,
          definition: definition,
          partOfSpeech: type,
          examples: []
        }
      ]
    });
  });
});

const storagePath = './storage/master_lexicon_db.json';
let db = {};
if (fs.existsSync(storagePath)) {
  db = JSON.parse(fs.readFileSync(storagePath, 'utf8'));
}

entries.forEach(e => {
  const id = `lex_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  db[id] = { ...e, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
});

fs.writeFileSync(storagePath, JSON.stringify(db, null, 2));
console.log(`Successfully added ${entries.length} entries to DB`);
