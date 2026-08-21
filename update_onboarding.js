const fs = require('fs');
const content = fs.readFileSync('src/components/OnboardingView.tsx', 'utf8');

const updated = content
  .replace("import { motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';\nimport { auth, googleProvider } from '../lib/firebase';\nimport { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';")
  .replace("const [language, setLanguage] = useState('');", "const [language, setLanguage] = useState('');\n  const [email, setEmail] = useState('');\n  const [password, setPassword] = useState('');\n  const [isLogin, setIsLogin] = useState(false);\n  const [authError, setAuthError] = useState('');\n  const [isLoading, setIsLoading] = useState(false);")
  .replace(
    "setLanguage(lang.id);\n                      onComplete(name, lang.id);",
    "setLanguage(lang.id);\n                      setStep(3);"
  )
  .replace(
    "          {step === 2 && (",
    `          {step === 2 && (`
  );
  
fs.writeFileSync('src/components/OnboardingView.tsx', updated);
