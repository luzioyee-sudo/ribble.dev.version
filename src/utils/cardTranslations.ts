import { LexicalEntry } from '../types/lexicon';
import { VocabularyItem } from '../types';

export interface CardTranslationMap {
  english?: string;
  french?: string;
  spanish?: string;
  german?: string;
  italian?: string;
  arabic?: string;
}

// Dictionary map for master lexicon and common words across supported languages
export const MASTER_TRANSLATION_MAP: Record<string, CardTranslationMap> = {
  // Master Lexicon English Words
  'house': { english: 'house', french: 'maison', spanish: 'casa', german: 'Haus', italian: 'casa', arabic: 'منزل' },
  'resilient': { english: 'resilient', french: 'résilient(e)', spanish: 'resiliente', german: 'widerstandsfähig', italian: 'resiliente', arabic: 'مرن / صامد' },
  'ubiquitous': { english: 'ubiquitous', french: 'omniprésent(e)', spanish: 'omnipresente', german: 'allgegenwärtig', italian: 'onnipresente', arabic: 'واسع الانتشار' },
  'ephemeral': { english: 'ephemeral', french: 'éphémère', spanish: 'efímero/a', german: 'flüchtig', italian: 'effimero', arabic: 'سريع الزوال' },
  'quintessential': { english: 'quintessential', french: 'quintessentiel(le)', spanish: 'quintaesencial', german: 'wesentlich / typisch', italian: 'per antonomasia', arabic: 'النموذجي' },

  // University Life & Studies entries
  'university': { english: 'University', german: 'Universität', french: 'Université', italian: 'Università', spanish: 'Universidad', arabic: 'جامعة' },
  'universität': { english: 'University', german: 'Universität', french: 'Université', italian: 'Università', spanish: 'Universidad', arabic: 'جامعة' },
  'université': { english: 'University', german: 'Universität', french: 'Université', italian: 'Università', spanish: 'Universidad', arabic: 'جامعة' },
  'università': { english: 'University', german: 'Universität', french: 'Université', italian: 'Università', spanish: 'Universidad', arabic: 'جامعة' },
  'universidad': { english: 'University', german: 'Universität', french: 'Université', italian: 'Università', spanish: 'Universidad', arabic: 'جامعة' },
  'جامعة': { english: 'University', german: 'Universität', french: 'Université', italian: 'Università', spanish: 'Universidad', arabic: 'جامعة' },

  'degree': { english: 'Degree', german: 'Abschluss', french: 'Diplôme', italian: 'Laurea', spanish: 'Título', arabic: 'درجة علمية' },
  'abschluss': { english: 'Degree', german: 'Abschluss', french: 'Diplôme', italian: 'Laurea', spanish: 'Título', arabic: 'درجة علمية' },
  'diplôme': { english: 'Degree', german: 'Abschluss', french: 'Diplôme', italian: 'Laurea', spanish: 'Título', arabic: 'درجة علمية' },
  'laurea': { english: 'Degree', german: 'Abschluss', french: 'Diplôme', italian: 'Laurea', spanish: 'Título', arabic: 'درجة علمية' },
  'título': { english: 'Degree', german: 'Abschluss', french: 'Diplôme', italian: 'Laurea', spanish: 'Título', arabic: 'درجة علمية' },
  'titulo': { english: 'Degree', german: 'Abschluss', french: 'Diplôme', italian: 'Laurea', spanish: 'Título', arabic: 'درجة علمية' },
  'درجة علمية': { english: 'Degree', german: 'Abschluss', french: 'Diplôme', italian: 'Laurea', spanish: 'Título', arabic: 'درجة علمية' },

  'lecture': { english: 'Lecture', german: 'Vorlesung', french: 'Cours magistral', italian: 'Lezione', spanish: 'Clase magistral', arabic: 'محاضرة' },
  'vorlesung': { english: 'Lecture', german: 'Vorlesung', french: 'Cours magistral', italian: 'Lezione', spanish: 'Clase magistral', arabic: 'محاضرة' },
  'cours magistral': { english: 'Lecture', german: 'Vorlesung', french: 'Cours magistral', italian: 'Lezione', spanish: 'Clase magistral', arabic: 'محاضرة' },
  'lezione': { english: 'Lecture', german: 'Vorlesung', french: 'Cours magistral', italian: 'Lezione', spanish: 'Clase magistral', arabic: 'محاضرة' },
  'clase magistral': { english: 'Lecture', german: 'Vorlesung', french: 'Cours magistral', italian: 'Lezione', spanish: 'Clase magistral', arabic: 'محاضرة' },
  'محاضرة': { english: 'Lecture', german: 'Vorlesung', french: 'Cours magistral', italian: 'Lezione', spanish: 'Clase magistral', arabic: 'محاضرة' },

  'exam': { english: 'Exam', german: 'Prüfung', french: 'Examen', italian: 'Esame', spanish: 'Examen', arabic: 'امتحان' },
  'prüfung': { english: 'Exam', german: 'Prüfung', french: 'Examen', italian: 'Esame', spanish: 'Examen', arabic: 'امتحان' },
  'examen': { english: 'Exam', german: 'Prüfung', french: 'Examen', italian: 'Esame', spanish: 'Examen', arabic: 'امتحان' },
  'esame': { english: 'Exam', german: 'Prüfung', french: 'Examen', italian: 'Esame', spanish: 'Examen', arabic: 'امتحان' },
  'امتحان': { english: 'Exam', german: 'Prüfung', french: 'Examen', italian: 'Esame', spanish: 'Examen', arabic: 'امتحان' },

  'major': { english: 'Major', german: 'Hauptfach', french: 'Spécialité', italian: 'Corso di laurea', spanish: 'Especialidad', arabic: 'تخصص' },
  'hauptfach': { english: 'Major', german: 'Hauptfach', french: 'Spécialité', italian: 'Corso di laurea', spanish: 'Especialidad', arabic: 'تخصص' },
  'spécialité': { english: 'Major', german: 'Hauptfach', french: 'Spécialité', italian: 'Corso di laurea', spanish: 'Especialidad', arabic: 'تخصص' },
  'specialite': { english: 'Major', german: 'Hauptfach', french: 'Spécialité', italian: 'Corso di laurea', spanish: 'Especialidad', arabic: 'تخصص' },
  'corso di laurea': { english: 'Major', german: 'Hauptfach', french: 'Spécialité', italian: 'Corso di laurea', spanish: 'Especialidad', arabic: 'تخصص' },
  'especialidad': { english: 'Major', german: 'Hauptfach', french: 'Spécialité', italian: 'Corso di laurea', spanish: 'Especialidad', arabic: 'تخصص' },
  'تخصص': { english: 'Major', german: 'Hauptfach', french: 'Spécialité', italian: 'Corso di laurea', spanish: 'Especialidad', arabic: 'تخصص' },

  'student': { english: 'Student', german: 'Student', french: 'Étudiant', italian: 'Studente', spanish: 'Estudiante', arabic: 'طالب' },
  'étudiant': { english: 'Student', german: 'Student', french: 'Étudiant', italian: 'Studente', spanish: 'Estudiante', arabic: 'طالب' },
  'etudiant': { english: 'Student', german: 'Student', french: 'Étudiant', italian: 'Studente', spanish: 'Estudiante', arabic: 'طالب' },
  'studente': { english: 'Student', german: 'Student', french: 'Étudiant', italian: 'Studente', spanish: 'Estudiante', arabic: 'طالب' },
  'estudiante': { english: 'Student', german: 'Student', french: 'Étudiant', italian: 'Studente', spanish: 'Estudiante', arabic: 'طالب' },
  'طالب': { english: 'Student', german: 'Student', french: 'Étudiant', italian: 'Studente', spanish: 'Estudiante', arabic: 'طالب' },

  'professor': { english: 'Professor', german: 'Professor', french: 'Professeur', italian: 'Professore', spanish: 'Profesor', arabic: 'أستاذ' },
  'professeur': { english: 'Professor', german: 'Professor', french: 'Professeur', italian: 'Professore', spanish: 'Profesor', arabic: 'أستاذ' },
  'professore': { english: 'Professor', german: 'Professor', french: 'Professeur', italian: 'Professore', spanish: 'Profesor', arabic: 'أستاذ' },
  'profesor': { english: 'Professor', german: 'Professor', french: 'Professeur', italian: 'Professore', spanish: 'Profesor', arabic: 'أستاذ' },
  'أستاذ': { english: 'Professor', german: 'Professor', french: 'Professeur', italian: 'Professore', spanish: 'Profesor', arabic: 'أستاذ' },

  'schedule': { english: 'Schedule', german: 'Stundenplan', french: 'Emploi du temps', italian: 'Orario', spanish: 'Horario', arabic: 'جدول دراسي' },
  'stundenplan': { english: 'Schedule', german: 'Stundenplan', french: 'Emploi du temps', italian: 'Orario', spanish: 'Horario', arabic: 'جدول دراسي' },
  'emploi du temps': { english: 'Schedule', german: 'Stundenplan', french: 'Emploi du temps', italian: 'Orario', spanish: 'Horario', arabic: 'جدول دراسي' },
  'orario': { english: 'Schedule', german: 'Stundenplan', french: 'Emploi du temps', italian: 'Orario', spanish: 'Horario', arabic: 'جدول دراسي' },
  'horario': { english: 'Schedule', german: 'Stundenplan', french: 'Emploi du temps', italian: 'Orario', spanish: 'Horario', arabic: 'جدول دراسي' },
  'جدول دراسي': { english: 'Schedule', german: 'Stundenplan', french: 'Emploi du temps', italian: 'Orario', spanish: 'Horario', arabic: 'جدول دراسي' },

  'grade': { english: 'Grade', german: 'Note', french: 'Note', italian: 'Voto', spanish: 'Nota', arabic: 'درجة' },
  'note': { english: 'Grade', german: 'Note', french: 'Note', italian: 'Voto', spanish: 'Nota', arabic: 'درجة' },
  'voto': { english: 'Grade', german: 'Note', french: 'Note', italian: 'Voto', spanish: 'Nota', arabic: 'درجة' },
  'nota': { english: 'Grade', german: 'Note', french: 'Note', italian: 'Voto', spanish: 'Nota', arabic: 'درجة' },
  'درجة': { english: 'Grade', german: 'Note', french: 'Note', italian: 'Voto', spanish: 'Nota', arabic: 'درجة' },

  'assignment': { english: 'Assignment', german: 'Hausaufgabe', french: 'Devoir', italian: 'Compito', spanish: 'Tarea', arabic: 'واجب دراسي' },
  'hausaufgabe': { english: 'Assignment', german: 'Hausaufgabe', french: 'Devoir', italian: 'Compito', spanish: 'Tarea', arabic: 'واجب دراسي' },
  'devoir': { english: 'Assignment', german: 'Hausaufgabe', french: 'Devoir', italian: 'Compito', spanish: 'Tarea', arabic: 'واجب دراسي' },
  'compito': { english: 'Assignment', german: 'Hausaufgabe', french: 'Devoir', italian: 'Compito', spanish: 'Tarea', arabic: 'واجب دراسي' },
  'tarea': { english: 'Assignment', german: 'Hausaufgabe', french: 'Devoir', italian: 'Compito', spanish: 'Tarea', arabic: 'واجب دراسي' },
  'واجب دراسي': { english: 'Assignment', german: 'Hausaufgabe', french: 'Devoir', italian: 'Compito', spanish: 'Tarea', arabic: 'واجب دراسي' },

  'library': { english: 'Library', german: 'Bibliothek', french: 'Bibliothèque', italian: 'Biblioteca', spanish: 'Biblioteca', arabic: 'مكتبة' },
  'bibliothek': { english: 'Library', german: 'Bibliothek', french: 'Bibliothèque', italian: 'Biblioteca', spanish: 'Biblioteca', arabic: 'مكتبة' },
  'bibliothèque': { english: 'Library', german: 'Bibliothek', french: 'Bibliothèque', italian: 'Biblioteca', spanish: 'Biblioteca', arabic: 'مكتبة' },
  'bibliotheque': { english: 'Library', german: 'Bibliothek', french: 'Bibliothèque', italian: 'Biblioteca', spanish: 'Biblioteca', arabic: 'مكتبة' },
  'biblioteca': { english: 'Library', german: 'Bibliothek', french: 'Bibliothèque', italian: 'Biblioteca', spanish: 'Biblioteca', arabic: 'مكتبة' },
  'مكتبة': { english: 'Library', german: 'Bibliothek', french: 'Bibliothèque', italian: 'Biblioteca', spanish: 'Biblioteca', arabic: 'مكتبة' },

  'research': { english: 'Research', german: 'Forschung', french: 'Recherche', italian: 'Ricerca', spanish: 'Investigación', arabic: 'بحث' },
  'forschung': { english: 'Research', german: 'Forschung', french: 'Recherche', italian: 'Ricerca', spanish: 'Investigación', arabic: 'بحث' },
  'recherche': { english: 'Research', german: 'Forschung', french: 'Recherche', italian: 'Ricerca', spanish: 'Investigación', arabic: 'بحث' },
  'ricerca': { english: 'Research', german: 'Forschung', french: 'Recherche', italian: 'Ricerca', spanish: 'Investigación', arabic: 'بحث' },
  'investigación': { english: 'Research', german: 'Forschung', french: 'Recherche', italian: 'Ricerca', spanish: 'Investigación', arabic: 'بحث' },
  'investigacion': { english: 'Research', german: 'Forschung', french: 'Recherche', italian: 'Ricerca', spanish: 'Investigación', arabic: 'بحث' },
  'بحث': { english: 'Research', german: 'Forschung', french: 'Recherche', italian: 'Ricerca', spanish: 'Investigación', arabic: 'بحث' },

  'semester': { english: 'Semester', german: 'Semester', french: 'Semestre', italian: 'Semestre', spanish: 'Semestre', arabic: 'فصل دراسي' },
  'semestre': { english: 'Semester', german: 'Semester', french: 'Semestre', italian: 'Semestre', spanish: 'Semestre', arabic: 'فصل دراسي' },
  'فصل دراسي': { english: 'Semester', german: 'Semester', french: 'Semestre', italian: 'Semestre', spanish: 'Semestre', arabic: 'فصل دراسي' },

  'tuition fees': { english: 'Tuition fees', german: 'Studiengebühren', french: 'Frais de scolarité', italian: 'Tasse universitarie', spanish: 'Tasas', arabic: 'رسوم دراسية' },
  'studiengebühren': { english: 'Tuition fees', german: 'Studiengebühren', french: 'Frais de scolarité', italian: 'Tasse universitarie', spanish: 'Tasas', arabic: 'رسوم دراسية' },
  'frais de scolarité': { english: 'Tuition fees', german: 'Studiengebühren', french: 'Frais de scolarité', italian: 'Tasse universitarie', spanish: 'Tasas', arabic: 'رسوم دراسية' },
  'tasse universitarie': { english: 'Tuition fees', german: 'Studiengebühren', french: 'Frais de scolarité', italian: 'Tasse universitarie', spanish: 'Tasas', arabic: 'رسوم دراسية' },
  'tasas': { english: 'Tuition fees', german: 'Studiengebühren', french: 'Frais de scolarité', italian: 'Tasse universitarie', spanish: 'Tasas', arabic: 'رسوم دراسية' },
  'رسوم دراسية': { english: 'Tuition fees', german: 'Studiengebühren', french: 'Frais de scolarité', italian: 'Tasse universitarie', spanish: 'Tasas', arabic: 'رسوم دراسية' },

  'campus': { english: 'Campus', german: 'Campus', french: 'Campus', italian: 'Campus', spanish: 'Campus', arabic: 'حرم جامعي' },
  'حرم جامعي': { english: 'Campus', german: 'Campus', french: 'Campus', italian: 'Campus', spanish: 'Campus', arabic: 'حرم جامعي' },

  'scholarship': { english: 'Scholarship', german: 'Stipendium', french: 'Bourse', italian: 'Borsa di studio', spanish: 'Beca', arabic: 'منحة دراسية' },
  'stipendium': { english: 'Scholarship', german: 'Stipendium', french: 'Bourse', italian: 'Borsa di studio', spanish: 'Beca', arabic: 'منحة دراسية' },
  'bourse': { english: 'Scholarship', german: 'Stipendium', french: 'Bourse', italian: 'Borsa di studio', spanish: 'Beca', arabic: 'منحة دراسية' },
  'borsa di studio': { english: 'Scholarship', german: 'Stipendium', french: 'Bourse', italian: 'Borsa di studio', spanish: 'Beca', arabic: 'منحة دراسية' },
  'beca': { english: 'Scholarship', german: 'Stipendium', french: 'Bourse', italian: 'Borsa di studio', spanish: 'Beca', arabic: 'منحة دراسية' },
  'منحة دراسية': { english: 'Scholarship', german: 'Stipendium', french: 'Bourse', italian: 'Borsa di studio', spanish: 'Beca', arabic: 'منحة دراسية' },

  'to study': { english: 'To study', german: 'Studieren', french: 'Étudier', italian: 'Studiare', spanish: 'Estudiar', arabic: 'يدرس' },
  'studieren': { english: 'To study', german: 'Studieren', french: 'Étudier', italian: 'Studiare', spanish: 'Estudiar', arabic: 'يدرس' },
  'étudier': { english: 'To study', german: 'Studieren', french: 'Étudier', italian: 'Studiare', spanish: 'Estudiar', arabic: 'يدرس' },
  'etudier': { english: 'To study', german: 'Studieren', french: 'Étudier', italian: 'Studiare', spanish: 'Estudiar', arabic: 'يدرس' },
  'studiare': { english: 'To study', german: 'Studieren', french: 'Étudier', italian: 'Studiare', spanish: 'Estudiar', arabic: 'يدرس' },
  'estudiar': { english: 'To study', german: 'Studieren', french: 'Étudier', italian: 'Studiare', spanish: 'Estudiar', arabic: 'يدرس' },
  'يدرس': { english: 'To study', german: 'Studieren', french: 'Étudier', italian: 'Studiare', spanish: 'Estudiar', arabic: 'يدرس' },

  'to pass': { english: 'To pass', german: 'Bestehen', french: 'Réussir', italian: 'Superare', spanish: 'Aprobar', arabic: 'يجتاز' },
  'bestehen': { english: 'To pass', german: 'Bestehen', french: 'Réussir', italian: 'Superare', spanish: 'Aprobar', arabic: 'يجتاز' },
  'réussir': { english: 'To pass', german: 'Bestehen', french: 'Réussir', italian: 'Superare', spanish: 'Aprobar', arabic: 'يجتاز' },
  'reussir': { english: 'To pass', german: 'Bestehen', french: 'Réussir', italian: 'Superare', spanish: 'Aprobar', arabic: 'يجتاز' },
  'superare': { english: 'To pass', german: 'Bestehen', french: 'Réussir', italian: 'Superare', spanish: 'Aprobar', arabic: 'يجتاز' },
  'aprobar': { english: 'To pass', german: 'Bestehen', french: 'Réussir', italian: 'Superare', spanish: 'Aprobar', arabic: 'يجتاز' },
  'يجتاز': { english: 'To pass', german: 'Bestehen', french: 'Réussir', italian: 'Superare', spanish: 'Aprobar', arabic: 'يجتاز' },

  'to fail': { english: 'To fail', german: 'Durchfallen', french: 'Échouer', italian: 'Bocciare', spanish: 'Suspender', arabic: 'يرسب' },
  'durchfallen': { english: 'To fail', german: 'Durchfallen', french: 'Échouer', italian: 'Bocciare', spanish: 'Suspender', arabic: 'يرسب' },
  'échouer': { english: 'To fail', german: 'Durchfallen', french: 'Échouer', italian: 'Bocciare', spanish: 'Suspender', arabic: 'يرسب' },
  'echouer': { english: 'To fail', german: 'Durchfallen', french: 'Échouer', italian: 'Bocciare', spanish: 'Suspender', arabic: 'يرسب' },
  'bocciare': { english: 'To fail', german: 'Durchfallen', french: 'Échouer', italian: 'Bocciare', spanish: 'Suspender', arabic: 'يرسب' },
  'suspender': { english: 'To fail', german: 'Durchfallen', french: 'Échouer', italian: 'Bocciare', spanish: 'Suspender', arabic: 'يرسب' },
  'يرسب': { english: 'To fail', german: 'Durchfallen', french: 'Échouer', italian: 'Bocciare', spanish: 'Suspender', arabic: 'يرسب' },

  'graduate': { english: 'Graduate', german: 'Absolvent', french: 'Diplômé', italian: 'Laureato', spanish: 'Graduado', arabic: 'خريج' },
  'absolvent': { english: 'Graduate', german: 'Absolvent', french: 'Diplômé', italian: 'Laureato', spanish: 'Graduado', arabic: 'خريج' },
  'laureato': { english: 'Graduate', german: 'Absolvent', french: 'Diplômé', italian: 'Laureato', spanish: 'Graduado', arabic: 'خريج' },
  'graduado': { english: 'Graduate', german: 'Absolvent', french: 'Diplômé', italian: 'Laureato', spanish: 'Graduado', arabic: 'خريج' },
  'خريج': { english: 'Graduate', german: 'Absolvent', french: 'Diplômé', italian: 'Laureato', spanish: 'Graduado', arabic: 'خريج' },

  // Career Goals & Business entries
  'career': { english: 'Career', german: 'Karriere', french: 'Carrière', italian: 'Carriera', spanish: 'Carrera', arabic: 'مسيرة مهنية' },
  'karriere': { english: 'Career', german: 'Karriere', french: 'Carrière', italian: 'Carriera', spanish: 'Carrera', arabic: 'مسيرة مهنية' },
  'carrière': { english: 'Career', german: 'Karriere', french: 'Carrière', italian: 'Carriera', spanish: 'Carrera', arabic: 'مسيرة مهنية' },
  'carriere': { english: 'Career', german: 'Karriere', french: 'Carrière', italian: 'Carriera', spanish: 'Carrera', arabic: 'مسيرة مهنية' },
  'carriera': { english: 'Career', german: 'Karriere', french: 'Carrière', italian: 'Carriera', spanish: 'Carrera', arabic: 'مسيرة مهنية' },
  'carrera': { english: 'Career', german: 'Karriere', french: 'Carrière', italian: 'Carriera', spanish: 'Carrera', arabic: 'مسيرة مهنية' },
  'مسيرة مهنية': { english: 'Career', german: 'Karriere', french: 'Carrière', italian: 'Carriera', spanish: 'Carrera', arabic: 'مسيرة مهنية' },

  'entrepreneur': { english: 'Entrepreneur', german: 'Unternehmer', french: 'Entrepreneur', italian: 'Imprenditore', spanish: 'Emprendedor', arabic: 'رائد أعمال' },
  'unternehmer': { english: 'Entrepreneur', german: 'Unternehmer', french: 'Entrepreneur', italian: 'Imprenditore', spanish: 'Emprendedor', arabic: 'رائد أعمال' },
  'imprenditore': { english: 'Entrepreneur', german: 'Unternehmer', french: 'Entrepreneur', italian: 'Imprenditore', spanish: 'Emprendedor', arabic: 'رائد أعمال' },
  'emprendedor': { english: 'Entrepreneur', german: 'Unternehmer', french: 'Entrepreneur', italian: 'Imprenditore', spanish: 'Emprendedor', arabic: 'رائد أعمال' },
  'رائد أعمال': { english: 'Entrepreneur', german: 'Unternehmer', french: 'Entrepreneur', italian: 'Imprenditore', spanish: 'Emprendedor', arabic: 'رائد أعمال' },

  'business': { english: 'Business', german: 'Unternehmen', french: 'Entreprise', italian: 'Azienda', spanish: 'Empresa', arabic: 'عمل تجاري' },
  'unternehmen': { english: 'Business', german: 'Unternehmen', french: 'Entreprise', italian: 'Azienda', spanish: 'Empresa', arabic: 'عمل تجاري' },
  'entreprise': { english: 'Business', german: 'Unternehmen', french: 'Entreprise', italian: 'Azienda', spanish: 'Empresa', arabic: 'عمل تجاري' },
  'azienda': { english: 'Business', german: 'Unternehmen', french: 'Entreprise', italian: 'Azienda', spanish: 'Empresa', arabic: 'عمل تجاري' },
  'empresa': { english: 'Business', german: 'Unternehmen', french: 'Entreprise', italian: 'Azienda', spanish: 'Empresa', arabic: 'عمل تجاري' },
  'عمل تجاري': { english: 'Business', german: 'Unternehmen', french: 'Entreprise', italian: 'Azienda', spanish: 'Empresa', arabic: 'عمل تجاري' },

  'goal': { english: 'Goal', german: 'Ziel', french: 'Objectif', italian: 'Obiettivo', spanish: 'Objetivo', arabic: 'هدف' },
  'ziel': { english: 'Goal', german: 'Ziel', french: 'Objectif', italian: 'Obiettivo', spanish: 'Objetivo', arabic: 'هدف' },
  'objectif': { english: 'Goal', german: 'Ziel', french: 'Objectif', italian: 'Obiettivo', spanish: 'Objetivo', arabic: 'هدف' },
  'obiettivo': { english: 'Goal', german: 'Ziel', french: 'Objectif', italian: 'Obiettivo', spanish: 'Objetivo', arabic: 'هدف' },
  'objetivo': { english: 'Goal', german: 'Ziel', french: 'Objectif', italian: 'Obiettivo', spanish: 'Objetivo', arabic: 'هدف' },
  'هدف': { english: 'Goal', german: 'Ziel', french: 'Objectif', italian: 'Obiettivo', spanish: 'Objetivo', arabic: 'هدف' },

  'strategy': { english: 'Strategy', german: 'Strategie', french: 'Stratégie', italian: 'Strategia', spanish: 'Estrategia', arabic: 'استراتيجية' },
  'strategie': { english: 'Strategy', german: 'Strategie', french: 'Stratégie', italian: 'Strategia', spanish: 'Estrategia', arabic: 'استراتيجية' },
  'stratégie': { english: 'Strategy', german: 'Strategie', french: 'Stratégie', italian: 'Strategia', spanish: 'Estrategia', arabic: 'استراتيجية' },
  'strategia': { english: 'Strategy', german: 'Strategie', french: 'Stratégie', italian: 'Strategia', spanish: 'Estrategia', arabic: 'استراتيجية' },
  'estrategia': { english: 'Strategy', german: 'Strategie', french: 'Stratégie', italian: 'Strategia', spanish: 'Estrategia', arabic: 'استراتيجية' },
  'استراتيجية': { english: 'Strategy', german: 'Strategie', french: 'Stratégie', italian: 'Strategia', spanish: 'Estrategia', arabic: 'استراتيجية' },

  'project': { english: 'Project', german: 'Projekt', french: 'Projet', italian: 'Progetto', spanish: 'Proyecto', arabic: 'مشروع' },
  'projekt': { english: 'Project', german: 'Projekt', french: 'Projet', italian: 'Progetto', spanish: 'Proyecto', arabic: 'مشروع' },
  'projet': { english: 'Project', german: 'Projekt', french: 'Projet', italian: 'Progetto', spanish: 'Proyecto', arabic: 'مشروع' },
  'progetto': { english: 'Project', german: 'Projekt', french: 'Projet', italian: 'Progetto', spanish: 'Proyecto', arabic: 'مشروع' },
  'proyecto': { english: 'Project', german: 'Projekt', french: 'Projet', italian: 'Progetto', spanish: 'Proyecto', arabic: 'مشروع' },
  'مشروع': { english: 'Project', german: 'Projekt', french: 'Projet', italian: 'Progetto', spanish: 'Proyecto', arabic: 'مشروع' },

  'client': { english: 'Client', german: 'Kunde', french: 'Client', italian: 'Cliente', spanish: 'Cliente', arabic: 'عميل' },
  'kunde': { english: 'Client', german: 'Kunde', french: 'Client', italian: 'Cliente', spanish: 'Cliente', arabic: 'عميل' },
  'cliente': { english: 'Client', german: 'Kunde', french: 'Client', italian: 'Cliente', spanish: 'Cliente', arabic: 'عميل' },
  'عميل': { english: 'Client', german: 'Kunde', french: 'Client', italian: 'Cliente', spanish: 'Cliente', arabic: 'عميل' },

  'investment': { english: 'Investment', german: 'Investition', french: 'Investissement', italian: 'Investimento', spanish: 'Inversión', arabic: 'استثمار' },
  'investition': { english: 'Investment', german: 'Investition', french: 'Investissement', italian: 'Investimento', spanish: 'Inversión', arabic: 'استثمار' },
  'investissement': { english: 'Investment', german: 'Investition', french: 'Investissement', italian: 'Investimento', spanish: 'Inversión', arabic: 'استثمار' },
  'investimento': { english: 'Investment', german: 'Investition', french: 'Investissement', italian: 'Investimento', spanish: 'Inversión', arabic: 'استثمار' },
  'inversión': { english: 'Investment', german: 'Investition', french: 'Investissement', italian: 'Investimento', spanish: 'Inversión', arabic: 'استثمار' },
  'inversion': { english: 'Investment', german: 'Investition', french: 'Investissement', italian: 'Investimento', spanish: 'Inversión', arabic: 'استثمار' },
  'استثمار': { english: 'Investment', german: 'Investition', french: 'Investissement', italian: 'Investimento', spanish: 'Inversión', arabic: 'استثمار' },

  'revenue': { english: 'Revenue', german: 'Umsatz', french: 'Revenu', italian: 'Fatturato', spanish: 'Ingresos', arabic: 'إيرادات' },
  'umsatz': { english: 'Revenue', german: 'Umsatz', french: 'Revenu', italian: 'Fatturato', spanish: 'Ingresos', arabic: 'إيرادات' },
  'revenu': { english: 'Revenue', german: 'Umsatz', french: 'Revenu', italian: 'Fatturato', spanish: 'Ingresos', arabic: 'إيرادات' },
  'fatturato': { english: 'Revenue', german: 'Umsatz', french: 'Revenu', italian: 'Fatturato', spanish: 'Ingresos', arabic: 'إيرادات' },
  'ingresos': { english: 'Revenue', german: 'Umsatz', french: 'Revenu', italian: 'Fatturato', spanish: 'Ingresos', arabic: 'إيرادات' },
  'إيرادات': { english: 'Revenue', german: 'Umsatz', french: 'Revenu', italian: 'Fatturato', spanish: 'Ingresos', arabic: 'إيرادات' },

  'profit': { english: 'Profit', german: 'Gewinn', french: 'Bénéfice', italian: 'Profitto', spanish: 'Ganancia', arabic: 'ربح' },
  'gewinn': { english: 'Profit', german: 'Gewinn', french: 'Bénéfice', italian: 'Profitto', spanish: 'Ganancia', arabic: 'ربح' },
  'bénéfice': { english: 'Profit', german: 'Gewinn', french: 'Bénéfice', italian: 'Profitto', spanish: 'Ganancia', arabic: 'ربح' },
  'benefice': { english: 'Profit', german: 'Gewinn', french: 'Bénéfice', italian: 'Profitto', spanish: 'Ganancia', arabic: 'ربح' },
  'profitto': { english: 'Profit', german: 'Gewinn', french: 'Bénéfice', italian: 'Profitto', spanish: 'Ganancia', arabic: 'ربح' },
  'ganancia': { english: 'Profit', german: 'Gewinn', french: 'Bénéfice', italian: 'Profitto', spanish: 'Ganancia', arabic: 'ربح' },
  'ربح': { english: 'Profit', german: 'Gewinn', french: 'Bénéfice', italian: 'Profitto', spanish: 'Ganancia', arabic: 'ربح' },

  'market': { english: 'Market', german: 'Markt', french: 'Marché', italian: 'Mercato', spanish: 'Mercado', arabic: 'سوق' },
  'markt': { english: 'Market', german: 'Markt', french: 'Marché', italian: 'Mercato', spanish: 'Mercado', arabic: 'سوق' },
  'marché': { english: 'Market', german: 'Markt', french: 'Marché', italian: 'Mercato', spanish: 'Mercado', arabic: 'سوق' },
  'marche': { english: 'Market', german: 'Markt', french: 'Marché', italian: 'Mercato', spanish: 'Mercado', arabic: 'سوق' },
  'mercato': { english: 'Market', german: 'Markt', french: 'Marché', italian: 'Mercato', spanish: 'Mercado', arabic: 'سوق' },
  'mercado': { english: 'Market', german: 'Markt', french: 'Marché', italian: 'Mercato', spanish: 'Mercado', arabic: 'سوق' },
  'سوق': { english: 'Market', german: 'Markt', french: 'Marché', italian: 'Mercato', spanish: 'Mercado', arabic: 'سوق' },

  'management': { english: 'Management', german: 'Management', french: 'Gestion', italian: 'Gestione', spanish: 'Gestión', arabic: 'إدارة' },
  'gestion': { english: 'Management', german: 'Management', french: 'Gestion', italian: 'Gestione', spanish: 'Gestión', arabic: 'إدارة' },
  'gestione': { english: 'Management', german: 'Management', french: 'Gestion', italian: 'Gestione', spanish: 'Gestión', arabic: 'إدارة' },
  'gestión': { english: 'Management', german: 'Management', french: 'Gestion', italian: 'Gestione', spanish: 'Gestión', arabic: 'إدارة' },
  'إدارة': { english: 'Management', german: 'Management', french: 'Gestion', italian: 'Gestione', spanish: 'Gestión', arabic: 'إدارة' },

  'startup': { english: 'Startup', german: 'Startup', french: 'Startup', italian: 'Startup', spanish: 'Startup', arabic: 'شركة ناشئة' },
  'شركة ناشئة': { english: 'Startup', german: 'Startup', french: 'Startup', italian: 'Startup', spanish: 'Startup', arabic: 'شركة ناشئة' },

  'to launch': { english: 'To launch', german: 'Starten', french: 'Lancer', italian: 'Lanciare', spanish: 'Lanzar', arabic: 'يطلق' },
  'starten': { english: 'To launch', german: 'Starten', french: 'Lancer', italian: 'Lanciare', spanish: 'Lanzar', arabic: 'يطلق' },
  'lancer': { english: 'To launch', german: 'Starten', french: 'Lancer', italian: 'Lanciare', spanish: 'Lanzar', arabic: 'يطلق' },
  'lanciare': { english: 'To launch', german: 'Starten', french: 'Lancer', italian: 'Lanciare', spanish: 'Lanzar', arabic: 'يطلق' },
  'lanzar': { english: 'To launch', german: 'Starten', french: 'Lancer', italian: 'Lanciare', spanish: 'Lanzar', arabic: 'يطلق' },
  'يطلق': { english: 'To launch', german: 'Starten', french: 'Lancer', italian: 'Lanciare', spanish: 'Lanzar', arabic: 'يطلق' },

  'to succeed': { english: 'To succeed', german: 'Erfolgreich sein', french: 'Réussir', italian: 'Avere successo', spanish: 'Tener éxito', arabic: 'ينجح' },
  'erfolgreich sein': { english: 'To succeed', german: 'Erfolgreich sein', french: 'Réussir', italian: 'Avere successo', spanish: 'Tener éxito', arabic: 'ينجح' },
  'avere successo': { english: 'To succeed', german: 'Erfolgreich sein', french: 'Réussir', italian: 'Avere successo', spanish: 'Tener éxito', arabic: 'ينجح' },
  'tener éxito': { english: 'To succeed', german: 'Erfolgreich sein', french: 'Réussir', italian: 'Avere successo', spanish: 'Tener éxito', arabic: 'ينجح' },
  'tener exito': { english: 'To succeed', german: 'Erfolgreich sein', french: 'Réussir', italian: 'Avere successo', spanish: 'Tener éxito', arabic: 'ينجح' },
  'ينجح': { english: 'To succeed', german: 'Erfolgreich sein', french: 'Réussir', italian: 'Avere successo', spanish: 'Tener éxito', arabic: 'ينجح' },

  'success': { english: 'Success', german: 'Erfolg', french: 'Succès', italian: 'Successo', spanish: 'Éxito', arabic: 'نجاح' },
  'erfolg': { english: 'Success', german: 'Erfolg', french: 'Succès', italian: 'Successo', spanish: 'Éxito', arabic: 'نجاح' },
  'succès': { english: 'Success', german: 'Erfolg', french: 'Succès', italian: 'Successo', spanish: 'Éxito', arabic: 'نجاح' },
  'succes': { english: 'Success', german: 'Erfolg', french: 'Succès', italian: 'Successo', spanish: 'Éxito', arabic: 'نجاح' },
  'successo': { english: 'Success', german: 'Erfolg', french: 'Succès', italian: 'Successo', spanish: 'Éxito', arabic: 'نجاح' },
  'éxito': { english: 'Success', german: 'Erfolg', french: 'Succès', italian: 'Successo', spanish: 'Éxito', arabic: 'نجاح' },
  'exito': { english: 'Success', german: 'Erfolg', french: 'Succès', italian: 'Successo', spanish: 'Éxito', arabic: 'نجاح' },
  'نجاح': { english: 'Success', german: 'Erfolg', french: 'Succès', italian: 'Successo', spanish: 'Éxito', arabic: 'نجاح' },

  'innovation': { english: 'Innovation', german: 'Innovation', french: 'Innovation', italian: 'Innovazione', spanish: 'Innovación', arabic: 'ابتكار' },
  'innovazione': { english: 'Innovation', german: 'Innovation', french: 'Innovation', italian: 'Innovazione', spanish: 'Innovación', arabic: 'ابتكار' },
  'innovación': { english: 'Innovation', german: 'Innovation', french: 'Innovation', italian: 'Innovazione', spanish: 'Innovación', arabic: 'ابتكار' },
  'innovacion': { english: 'Innovation', german: 'Innovation', french: 'Innovation', italian: 'Innovazione', spanish: 'Innovación', arabic: 'ابتكار' },
  'ابتكار': { english: 'Innovation', german: 'Innovation', french: 'Innovation', italian: 'Innovazione', spanish: 'Innovación', arabic: 'ابتكار' },

  'negotiation': { english: 'Negotiation', german: 'Verhandlung', french: 'Négociation', italian: 'Trattativa', spanish: 'Negociación', arabic: 'مفاوضات' },
  'verhandlung': { english: 'Negotiation', german: 'Verhandlung', french: 'Négociation', italian: 'Trattativa', spanish: 'Negociación', arabic: 'مفاوضات' },
  'négociation': { english: 'Negotiation', german: 'Verhandlung', french: 'Négociation', italian: 'Trattativa', spanish: 'Negociación', arabic: 'مفاوضات' },
  'negociation': { english: 'Negotiation', german: 'Verhandlung', french: 'Négociation', italian: 'Trattativa', spanish: 'Negociación', arabic: 'مفاوضات' },
  'trattativa': { english: 'Negotiation', german: 'Verhandlung', french: 'Négociation', italian: 'Trattativa', spanish: 'Negociación', arabic: 'مفاوضات' },
  'negociación': { english: 'Negotiation', german: 'Verhandlung', french: 'Négociation', italian: 'Trattativa', spanish: 'Negociación', arabic: 'مفاوضات' },
  'negociacion': { english: 'Negotiation', german: 'Verhandlung', french: 'Négociation', italian: 'Trattativa', spanish: 'Negociación', arabic: 'مفاوضات' },
  'مفاوضات': { english: 'Negotiation', german: 'Verhandlung', french: 'Négociation', italian: 'Trattativa', spanish: 'Negociación', arabic: 'مفاوضات' },

  'experience': { english: 'Experience', german: 'Erfahrung', french: 'Expérience', italian: 'Esperienza', spanish: 'Experiencia', arabic: 'خبرة' },
  'erfahrung': { english: 'Experience', german: 'Erfahrung', french: 'Expérience', italian: 'Esperienza', spanish: 'Experiencia', arabic: 'خبرة' },
  'expérience': { english: 'Experience', german: 'Erfahrung', french: 'Expérience', italian: 'Esperienza', spanish: 'Experiencia', arabic: 'خبرة' },
  'esperienza': { english: 'Experience', german: 'Erfahrung', french: 'Expérience', italian: 'Esperienza', spanish: 'Experiencia', arabic: 'خبرة' },
  'experiencia': { english: 'Experience', german: 'Erfahrung', french: 'Expérience', italian: 'Esperienza', spanish: 'Experiencia', arabic: 'خبرة' },
  'خبرة': { english: 'Experience', german: 'Erfahrung', french: 'Expérience', italian: 'Esperienza', spanish: 'Experiencia', arabic: 'خبرة' },

  'contract': { english: 'Contract', german: 'Vertrag', french: 'Contrat', italian: 'Contratto', spanish: 'Contrato', arabic: 'عقد' },
  'vertrag': { english: 'Contract', german: 'Vertrag', french: 'Contrat', italian: 'Contratto', spanish: 'Contrato', arabic: 'عقد' },
  'contrat': { english: 'Contract', german: 'Vertrag', french: 'Contrat', italian: 'Contratto', spanish: 'Contrato', arabic: 'عقد' },
  'contratto': { english: 'Contract', german: 'Vertrag', french: 'Contrat', italian: 'Contratto', spanish: 'Contrato', arabic: 'عقد' },
  'contrato': { english: 'Contract', german: 'Vertrag', french: 'Contrat', italian: 'Contratto', spanish: 'Contrato', arabic: 'عقد' },
  'عقد': { english: 'Contract', german: 'Vertrag', french: 'Contrat', italian: 'Contratto', spanish: 'Contrato', arabic: 'عقد' },

  // Master Lexicon Spanish Words
  'perro': { english: 'dog', french: 'chien', spanish: 'perro', german: 'Hund', italian: 'cane', arabic: 'كلب' },
  'desarrollo': { english: 'development', french: 'développement', spanish: 'desarrollo', german: 'Entwicklung', italian: 'sviluppo', arabic: 'تطوير / تنمية' },
  'enriquecer': { english: 'enrich', french: 'enrichir', spanish: 'enriquecer', german: 'bereichern', italian: 'arricchire', arabic: 'إثراء / يثري' },

  // Master Lexicon German Words
  'hund': { english: 'dog', french: 'chien', spanish: 'perro', german: 'Hund', italian: 'cane', arabic: 'كلب' },
  'entwicklung': { english: 'development', french: 'développement', spanish: 'desarrollo', german: 'Entwicklung', italian: 'sviluppo', arabic: 'تطوير' },

  // Master Lexicon French Words
  'maison': { english: 'house', french: 'maison', spanish: 'casa', german: 'Haus', italian: 'casa', arabic: 'منزل' },
  'développement': { english: 'development', french: 'développement', spanish: 'desarrollo', german: 'Entwicklung', italian: 'sviluppo', arabic: 'تطوير' },

  // Master Lexicon Arabic Words
  'منزل': { english: 'house', french: 'maison', spanish: 'casa', german: 'Haus', italian: 'casa', arabic: 'منزل' },
  'تطوير': { english: 'development', french: 'développement', spanish: 'desarrollo', german: 'Entwicklung', italian: 'sviluppo', arabic: 'تطوير' },
};

/**
 * Gets the card translation specifically in the user's interface language.
 * Handles LexicalEntry, VocabularyItem, and multi-language translation lookups.
 */
export function getCardTranslation(
  card: LexicalEntry | VocabularyItem | any,
  interfaceLanguage?: string
): string {
  if (!card) return '';

  const uiLangRaw = (interfaceLanguage || 'English').toLowerCase().trim();
  let uiLangKey: 'english' | 'french' | 'spanish' | 'german' | 'italian' | 'arabic' = 'english';

  if (uiLangRaw.startsWith('fr') || uiLangRaw === 'french') uiLangKey = 'french';
  else if (uiLangRaw.startsWith('es') || uiLangRaw.startsWith('spa') || uiLangRaw === 'spanish') uiLangKey = 'spanish';
  else if (uiLangRaw.startsWith('de') || uiLangRaw.startsWith('ger') || uiLangRaw === 'german') uiLangKey = 'german';
  else if (uiLangRaw.startsWith('it') || uiLangRaw === 'italian') uiLangKey = 'italian';
  else if (uiLangRaw.startsWith('ar') || uiLangRaw === 'arabic') uiLangKey = 'arabic';
  else uiLangKey = 'english';

  // 1. Explicit translations object on card
  const translations: CardTranslationMap | undefined = card.translations;
  if (translations && translations[uiLangKey]) {
    const val = translations[uiLangKey]?.trim();
    if (val) {
      // If translation matches card word and deck/card language is the same as UI language, try fallback
      const cardLang = (card.language || '').toLowerCase();
      const isSameLang = (uiLangKey === 'french' && (cardLang === 'french' || cardLang === 'fr')) ||
                         (uiLangKey === 'spanish' && (cardLang === 'spanish' || cardLang === 'es')) ||
                         (uiLangKey === 'german' && (cardLang === 'german' || cardLang === 'de')) ||
                         (uiLangKey === 'italian' && (cardLang === 'italian' || cardLang === 'it')) ||
                         (uiLangKey === 'arabic' && (cardLang === 'arabic' || cardLang === 'ar')) ||
                         (uiLangKey === 'english' && (cardLang === 'english' || cardLang === 'en'));
      
      if (val.toLowerCase() === card.word.toLowerCase() && isSameLang) {
        // Fallback to English translation if UI lang is the target lang
        if (uiLangKey !== 'english' && translations.english) {
          return translations.english;
        }
        if (uiLangKey === 'english' && translations.french) {
          return translations.french;
        }
      }
      return val;
    }
  }

  // 2. Known dictionary lookup map for master lexicon / common entries
  const wordLower = (card.word || '').toLowerCase().trim();
  const knownMap = MASTER_TRANSLATION_MAP[wordLower];
  if (knownMap && knownMap[uiLangKey]) {
    return knownMap[uiLangKey]!;
  }

  // 3. User vocabulary translation property (if present)
  if (card.translation && typeof card.translation === 'string' && card.translation.trim()) {
    // If translation is populated, check if it's usable
    return card.translation.trim();
  }

  // 4. Arabic translation property
  if (uiLangKey === 'arabic') {
    if (card.arabicTranslation && typeof card.arabicTranslation === 'string') {
      return card.arabicTranslation;
    }
    const sense = card.senses?.[0];
    if (sense?.arabicTranslation?.text) {
      return sense.arabicTranslation.text;
    }
  }

  // 5. English definition fallback for English interface
  if (uiLangKey === 'english') {
    const sense = card.senses?.[0];
    if (sense?.definition && sense.definition !== card.word) {
      return sense.definition;
    }
    if (card.definition && card.definition !== card.word) {
      return card.definition;
    }
  }

  // 6. Sense definition fallback
  const senseDef = card.senses?.[0]?.definition || card.definition;
  if (senseDef && senseDef !== card.word) {
    return senseDef;
  }

  // 7. Last resort fallback to arabicTranslation if available or card word
  if (card.arabicTranslation && typeof card.arabicTranslation === 'string') {
    return card.arabicTranslation;
  }

  return card.word || '';
}
