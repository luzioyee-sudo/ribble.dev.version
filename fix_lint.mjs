import fs from 'fs';

// Fix Header.tsx
let header = fs.readFileSync('src/components/Header.tsx', 'utf8');
if (!header.includes('Youtube')) {
  header = header.replace(/import \{ Home, BookOpen, Settings, Layers, Zap, ShieldCheck, UserCheck, Users, ChevronDown, Check \} from 'lucide-react';/, "import { Home, BookOpen, Settings, Layers, Zap, ShieldCheck, UserCheck, Users, ChevronDown, Check, Youtube } from 'lucide-react';");
  fs.writeFileSync('src/components/Header.tsx', header);
}

// Fix App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/let sectionName: 'Bilingual Reader' \| 'Library Shelf' \| 'Flashcards SRS' \| 'Admin Console' \| 'Settings' \| 'Onboarding' = 'Library Shelf';/, "let sectionName: 'Bilingual Reader' | 'Library Shelf' | 'Flashcards SRS' | 'Admin Console' | 'Settings' | 'Onboarding' | 'Play-with-Script' = 'Library Shelf';");
fs.writeFileSync('src/App.tsx', app);
