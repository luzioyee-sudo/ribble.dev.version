import React from 'react';
import { motion } from 'motion/react';
import { QuizHistory } from '../types';
import { getTranslation } from '../utils/i18n';
import { Calendar, Trophy, Clock, CheckCircle2, ChevronRight, History, BarChart3 } from 'lucide-react';

interface QuizHistoryViewProps {
  history: QuizHistory[];
  settings: any;
  onSelectQuiz?: (quizId: string) => void;
}

export const QuizHistoryView: React.FC<QuizHistoryViewProps> = ({ history, settings, onSelectQuiz }) => {
  const t = getTranslation(settings?.interfaceLanguage || 'English');

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-2xl border border-dashed border-[#D1D1D6] dark:border-[#38383A]">
        <div className="w-16 h-16 bg-[#EDEDF0] dark:bg-[#2C2C2E] rounded-2xl flex items-center justify-center mb-4">
          <History className="w-8 h-8 text-[#8E8E93]" />
        </div>
        <h3 className="text-xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">No history yet</h3>
        <p className="text-[#6E6E73] dark:text-[#98989D] font-medium max-w-xs text-sm">
          Your examination results will appear here once you complete your first quiz.
        </p>
      </div>
    );
  }

  const averageScore = Math.round(history.reduce((acc, curr) => acc + curr.percentage, 0) / history.length);
  const totalQuizzes = history.length;

  return (
    <div className="space-y-8">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-2xl border border-[#D1D1D6] dark:border-[#38383A] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-[#34C759]/10 text-[#34C759] rounded-2xl flex items-center justify-center shadow-xs">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#6E6E73] dark:text-[#98989D] uppercase tracking-widest">Average Score</p>
            <p className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{averageScore}%</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-2xl border border-[#D1D1D6] dark:border-[#38383A] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-[#007AFF]/10 text-[#007AFF] dark:text-[#0A84FF] rounded-2xl flex items-center justify-center shadow-xs">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#6E6E73] dark:text-[#98989D] uppercase tracking-widest">Quizzes Taken</p>
            <p className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{totalQuizzes}</p>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] px-1">Recent Examinations</h3>
        <div className="space-y-3">
          {history.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectQuiz?.(record.quizId)}
              className="bg-white dark:bg-[#1C1C1E] p-4 md:p-5 rounded-2xl border border-[#D1D1D6] dark:border-[#38383A] hover:border-[#007AFF] dark:hover:border-[#0A84FF] transition-all group flex items-center justify-between cursor-pointer active:scale-99 shadow-xs"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                  record.percentage >= 80 ? 'bg-[#34C759]/10 text-[#34C759]' : 
                  record.percentage >= 50 ? 'bg-[#FF9500]/10 text-[#FF9500]' : 
                  'bg-[#FF3B30]/10 text-[#FF3B30]'
                }`}>
                  {record.percentage}%
                </div>
                <div>
                  <h4 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-base group-hover:text-[#007AFF] dark:group-hover:text-[#0A84FF] transition-colors">
                    {record.quizTitle}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-[#6E6E73] dark:text-[#98989D] font-medium">
                      <Clock className="w-3 h-3" />
                      {new Date(record.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#6E6E73] dark:text-[#98989D] font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      {record.score}/{record.totalQuestions}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#8E8E93] group-hover:text-[#007AFF] dark:group-hover:text-[#0A84FF] transition-all" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
