import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Brain, Lightbulb, CheckCircle, XCircle, Clock, ArrowRight, RotateCcw, Award, AlertCircle, BarChart2, CheckSquare, SkipForward, Star, Award as AwardIcon, Play, Menu, FileText, TrendingUp, Target } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { MODULES } from './data';
import { AppState, ModuleData, QuizStats, QuestionStatus } from './types';

// Sequence of modules for the full exam simulation
const MODULE_SEQUENCE = ['assessment', 'development', 'strategies'];

// --- Helper Functions for Grading Levels ---
const getLevelInfo = (percentage: number) => {
  if (percentage < 50) {
    return {
      title: 'غير مجتاز',
      color: 'text-rose-500',
      bgColor: 'bg-rose-500',
      borderColor: 'border-rose-500',
      bgSoft: 'bg-rose-500/10',
      msg: 'المستوى الحالي يتطلب تدخلاً عاجلاً. يوصى بإعادة دراسة المعايير وتكثيف التطبيقات العملية.',
      icon: XCircle
    };
  } else if (percentage < 70) {
    return {
      title: 'ممارس',
      color: 'text-amber-400',
      bgColor: 'bg-amber-400',
      borderColor: 'border-amber-400',
      bgSoft: 'bg-amber-400/10',
      msg: 'مستوى جيد كبداية، ولكنك بحاجة لتعميق الفهم في الجوانب التخصصية لترتقي للمستويات العليا.',
      icon: CheckSquare
    };
  } else if (percentage < 80) {
    return {
      title: 'متقدم',
      color: 'text-emerald-400', // Light Green
      bgColor: 'bg-emerald-400',
      borderColor: 'border-emerald-400',
      bgSoft: 'bg-emerald-400/10',
      msg: 'أداء رائع! تمتلك قاعدة معرفية قوية، ومع القليل من التركيز ستصل إلى مرحلة الخبرة.',
      icon: Star
    };
  } else {
    return {
      title: 'خبير',
      color: 'text-emerald-600', // Dark/Clear Green
      bgColor: 'bg-emerald-600',
      borderColor: 'border-emerald-600',
      bgSoft: 'bg-emerald-600/10',
      msg: 'أداء استثنائي ينم عن تمكن عالٍ وخبرة عميقة في المعايير التربوية. نبارك لك هذا التميز.',
      icon: Award
    };
  }
};

// --- Helper Components ---

const Header = ({ totalTime }: { totalTime: number }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/10 px-6 py-4 flex justify-between items-center shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
           <Award className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">منصة إتقان</h1>
          <p className="text-xs text-slate-400">الإصدار الاحترافي v1.0</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:block text-xs text-slate-400 font-medium">
          المصمم: <span className="text-amber-400 font-bold text-sm">الأستاذ أبو بسام</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-white/5">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-emerald-400 font-bold tracking-wider">{formatTime(totalTime)}</span>
        </div>
      </div>
    </header>
  );
};

const QuestionMap = ({ 
  total, 
  statuses, 
  currentIndex, 
  onSelect 
}: { 
  total: number; 
  statuses: QuestionStatus[]; 
  currentIndex: number;
  onSelect: (index: number) => void;
}) => {
  return (
    <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-blue-500 mb-6">
      <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
        <Menu size={16} /> خريطة الأسئلة (اضغط للتنقل)
      </h3>
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {Array.from({ length: total }).map((_, idx) => {
          const status = statuses[idx] || 'pending';
          let bgClass = "bg-slate-700/50 text-slate-400 border-white/5 hover:border-blue-400/50";
          
          if (idx === currentIndex) bgClass = "bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.5)] scale-110 z-10 font-bold";
          else if (status === 'correct') bgClass = "bg-emerald-600/90 text-white border-emerald-400";
          else if (status === 'incorrect') bgClass = "bg-rose-600/90 text-white border-rose-400";
          else if (status === 'skipped') bgClass = "bg-amber-500/90 text-white border-amber-400";

          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm transition-all duration-200 border cursor-pointer hover:scale-105 ${bgClass}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ModuleCard: React.FC<{ module: ModuleData; onSelect: () => void }> = ({ module, onSelect }) => {
  const Icon = module.iconType === 'chart' ? BarChart2 : module.iconType === 'brain' ? Brain : Lightbulb;
  
  return (
    <button 
      onClick={onSelect}
      className="group relative flex flex-col items-start p-6 rounded-2xl glass-panel hover:bg-slate-800/80 transition-all duration-300 border border-white/10 hover:border-amber-500/50 hover:-translate-y-1 w-full text-right"
    >
      <div className="absolute top-4 left-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon size={80} className="text-white" />
      </div>
      <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-white/10">
        <Icon className="text-amber-400 w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{module.title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed pl-4">{module.description}</p>
      <div className="mt-6 flex items-center text-xs font-bold text-amber-500 uppercase tracking-wider">
        ابدأ المحاكاة <ArrowRight className="w-3 h-3 mr-1" />
      </div>
    </button>
  );
};

const CircularTimer = ({ duration, current, size = 60 }: { duration: number; current: number; size?: number }) => {
  const radius = size / 2 - 4;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (current / duration) * circumference;
  const color = current < 10 ? 'text-rose-500' : current < 30 ? 'text-amber-500' : 'text-emerald-500';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-700" />
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          stroke="currentColor" 
          strokeWidth="4" 
          fill="transparent" 
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
          className={`transition-all duration-1000 ease-linear ${color}`}
          strokeLinecap="round"
        />
      </svg>
      <span className={`absolute text-sm font-bold ${color}`}>{current}</span>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  
  // Stats & Progress Tracking
  const [globalStats, setGlobalStats] = useState<Record<string, QuizStats>>({});
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  
  // Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [stats, setStats] = useState<QuizStats>({ correct: 0, incorrect: 0, skipped: 0, totalTime: 0 });
  const [questionStatuses, setQuestionStatuses] = useState<QuestionStatus[]>([]);
  const [questionTimer, setQuestionTimer] = useState(60);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackTimer, setFeedbackTimer] = useState(15);
  
  // Timer Refs
  const totalTimeRef = useRef<number | null>(null);
  const questionTimeRef = useRef<number | null>(null);
  const feedbackIntervalRef = useRef<number | null>(null);

  const activeModule = activeModuleId ? MODULES[activeModuleId] : null;

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      stopAllTimers();
    };
  }, []);

  const stopAllTimers = () => {
    if (totalTimeRef.current) clearInterval(totalTimeRef.current);
    if (questionTimeRef.current) clearInterval(questionTimeRef.current);
    if (feedbackIntervalRef.current) clearInterval(feedbackIntervalRef.current);
  };

  const startQuiz = (moduleId: string) => {
    stopAllTimers();
    setActiveModuleId(moduleId);
    setAppState(AppState.QUIZ);
    setCurrentQuestionIndex(0);
    setStats({ correct: 0, incorrect: 0, skipped: 0, totalTime: 0 });
    setQuestionStatuses(new Array(MODULES[moduleId].questions.length).fill('pending'));
    setQuestionTimer(60);
    setIsAnswered(false);
    setSelectedOption(null);
    setShowFeedback(false);

    // Start Total Timer
    totalTimeRef.current = window.setInterval(() => {
      setStats(prev => ({ ...prev, totalTime: prev.totalTime + 1 }));
    }, 1000);

    // Start First Question Timer
    startQuestionTimer();
  };

  const startQuestionTimer = () => {
    if (questionTimeRef.current) clearInterval(questionTimeRef.current);
    setQuestionTimer(60);
    questionTimeRef.current = window.setInterval(() => {
      setQuestionTimer(prev => {
        if (prev <= 1) {
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const updateQuestionStatus = (index: number, status: QuestionStatus) => {
    setQuestionStatuses(prev => {
      const newStatuses = [...prev];
      newStatuses[index] = status;
      return newStatuses;
    });
  };

  const jumpToQuestion = (index: number) => {
    // 1. Stop current question timer (if running)
    if (questionTimeRef.current) clearInterval(questionTimeRef.current);
    if (feedbackIntervalRef.current) clearInterval(feedbackIntervalRef.current);
    
    setShowFeedback(false);
    setCurrentQuestionIndex(index);
    setSelectedOption(null);

    // 2. Check status of target question
    const status = questionStatuses[index];
    
    if (status !== 'pending') {
      // Question already answered/skipped
      setIsAnswered(true);
      // Note: We don't restore the specific selected option visual here for simplicity,
      // but we know it's done. The user can see the status in the map.
    } else {
      // Question is pending
      setIsAnswered(false);
      startQuestionTimer();
    }
  };

  const handleTimeOut = () => {
    if (questionTimeRef.current) clearInterval(questionTimeRef.current);
    setIsAnswered(true);
    setStats(prev => ({ ...prev, skipped: prev.skipped + 1 }));
    updateQuestionStatus(currentQuestionIndex, 'skipped');
    
    startFeedbackTimer();
  };

  const handleOptionClick = (option: string) => {
    if (isAnswered || !activeModule) return;
    
    // Stop Timer
    if (questionTimeRef.current) clearInterval(questionTimeRef.current);
    
    setIsAnswered(true);
    setSelectedOption(option);
    
    const isCorrect = option === activeModule.questions[currentQuestionIndex].correctAnswer;
    
    if (isCorrect) {
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      updateQuestionStatus(currentQuestionIndex, 'correct');
    } else {
      setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      updateQuestionStatus(currentQuestionIndex, 'incorrect');
    }
    
    startFeedbackTimer();
  };

  const startFeedbackTimer = () => {
    setShowFeedback(true);
    setFeedbackTimer(15);
    
    if (feedbackIntervalRef.current) clearInterval(feedbackIntervalRef.current);
    
    feedbackIntervalRef.current = window.setInterval(() => {
      setFeedbackTimer(prev => {
        if (prev <= 1) {
          nextQuestion(); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const skipFeedback = () => {
    nextQuestion();
  };

  const nextQuestion = () => {
    if (!activeModule) return;
    
    if (feedbackIntervalRef.current) clearInterval(feedbackIntervalRef.current);
    setShowFeedback(false);

    if (currentQuestionIndex < activeModule.questions.length - 1) {
      // Logic to find next pending question if jumping around, 
      // OR just go to next numerical index. 
      // Standard flow is Next Index.
      jumpToQuestion(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    stopAllTimers();
    if (activeModuleId) {
      setGlobalStats(prev => ({...prev, [activeModuleId]: stats}));
      if (!completedModules.includes(activeModuleId)) {
        setCompletedModules(prev => [...prev, activeModuleId]);
      }
    }
    setAppState(AppState.RESULTS);
  };

  const returnHome = () => {
    stopAllTimers();
    setAppState(AppState.HOME);
    setActiveModuleId(null);
  };

  const goToNextModule = () => {
    if (!activeModuleId) return;
    const currentIndex = MODULE_SEQUENCE.indexOf(activeModuleId);
    if (currentIndex >= 0 && currentIndex < MODULE_SEQUENCE.length - 1) {
      const nextModuleId = MODULE_SEQUENCE[currentIndex + 1];
      startQuiz(nextModuleId);
    } else {
      setAppState(AppState.CERTIFICATE);
    }
  };

  const viewCertificate = () => {
    setAppState(AppState.CERTIFICATE);
  };

  // --- Render Functions ---

  const renderHome = () => (
    <div className="container mx-auto px-4 pt-24 pb-12 max-w-5xl">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 mb-4">
          محاكاة الرخصة المهنية
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          اختر أحد المحاور أدناه لبدء اختبار محاكاة يتكون من 20 سؤالاً. تم تصميم الأسئلة بعناية لتطابق المعايير الحديثة مع توقيت زمني حقيقي.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.values(MODULES).map(module => (
          <ModuleCard key={module.id} module={module} onSelect={() => startQuiz(module.id)} />
        ))}
      </div>

      <div className="mt-12 glass-panel p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-500/20 bg-emerald-900/10">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400">
             <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-1">جاهز للتحدي؟</h4>
            <p className="text-sm text-slate-400">نظام المحاكاة يوفر لك تجربة مطابقة للاختبار الفعلي مع تغذية راجعة فورية لتصحيح المفاهيم.</p>
          </div>
        </div>
        <div className="flex gap-4 text-center">
            <div className="bg-slate-800/80 px-4 py-2 rounded-lg border border-white/5">
                <span className="block text-xl font-bold text-white">60</span>
                <span className="text-xs text-slate-500">سؤال</span>
            </div>
            <div className="bg-slate-800/80 px-4 py-2 rounded-lg border border-white/5">
                <span className="block text-xl font-bold text-white">3</span>
                <span className="text-xs text-slate-500">محاور</span>
            </div>
             <div className="bg-slate-800/80 px-4 py-2 rounded-lg border border-white/5">
                <span className="block text-xl font-bold text-white">60د</span>
                <span className="text-xs text-slate-500">وقت</span>
            </div>
        </div>
      </div>
    </div>
  );

  const renderQuiz = () => {
    if (!activeModule) return null;
    const currentQuestion = activeModule.questions[currentQuestionIndex];

    return (
      <div className="container mx-auto px-4 pt-24 pb-8 max-w-4xl min-h-screen flex flex-col">
        {/* Live Stats Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
           <div className="flex items-center gap-4 bg-slate-800/50 p-2 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 px-3">
                <CheckCircle size={18} className="text-emerald-500" />
                <span className="font-bold text-emerald-100">{stats.correct}</span>
              </div>
              <div className="w-px h-6 bg-white/10"></div>
              <div className="flex items-center gap-2 px-3">
                <XCircle size={18} className="text-rose-500" />
                <span className="font-bold text-rose-100">{stats.incorrect}</span>
              </div>
              <div className="w-px h-6 bg-white/10"></div>
              <div className="flex items-center gap-2 px-3">
                <AlertCircle size={18} className="text-amber-500" />
                <span className="font-bold text-amber-100">{stats.skipped}</span>
              </div>
           </div>
           
           <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-white/5 text-amber-400">
              <Clock size={16} />
              <span className="font-mono font-bold">{questionTimer}s</span>
           </div>
        </div>

        {/* Question Map */}
        <QuestionMap 
          total={activeModule.questions.length} 
          statuses={questionStatuses} 
          currentIndex={currentQuestionIndex}
          onSelect={jumpToQuestion}
        />

        {/* Question Card */}
        <div className="glass-panel p-6 md:p-10 rounded-3xl relative animate-fadeIn border-t-4 border-t-amber-500 shadow-2xl flex-1">
           <div className="mb-8">
              <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full mb-4 border border-amber-500/20">
                {activeModule.title} - السؤال {currentQuestionIndex + 1}
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
                {currentQuestion.text}
              </h2>
           </div>

           <div className="grid grid-cols-1 gap-4">
             {currentQuestion.options.map((option, idx) => {
               let stateClass = "border-white/10 hover:bg-slate-700/50 hover:border-amber-500/50";
               
               // Logic to show colors if answered
               if (isAnswered) {
                  if (option === currentQuestion.correctAnswer) {
                     stateClass = "bg-emerald-500/20 border-emerald-500 text-emerald-100";
                  } else if (option === selectedOption) {
                     stateClass = "bg-rose-500/20 border-rose-500 text-rose-100";
                  } else {
                     stateClass = "opacity-50 border-transparent";
                  }
               } else if (selectedOption === option) {
                 stateClass = "bg-amber-500/20 border-amber-500";
               }

               return (
                 <button
                   key={idx}
                   onClick={() => handleOptionClick(option)}
                   disabled={isAnswered}
                   className={`w-full p-5 rounded-xl border-2 text-right transition-all duration-200 font-medium text-lg flex justify-between items-center ${stateClass}`}
                 >
                   <span>{option}</span>
                   {isAnswered && option === currentQuestion.correctAnswer && <CheckCircle className="text-emerald-500 w-6 h-6" />}
                   {isAnswered && option === selectedOption && option !== currentQuestion.correctAnswer && <XCircle className="text-rose-500 w-6 h-6" />}
                 </button>
               );
             })}
           </div>
        </div>
        
        {/* Mobile Spacer */}
        <div className="h-24 md:hidden"></div>
      </div>
    );
  };

  const renderFeedbackModal = () => {
    if (!showFeedback || !activeModule) return null;
    const currentQuestion = activeModule.questions[currentQuestionIndex];
    const isSkipped = selectedOption === null;

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-fadeIn">
        <div className="bg-slate-800 w-full max-w-2xl aspect-square md:aspect-auto md:h-auto md:min-h-[500px] rounded-3xl border border-amber-500/30 shadow-2xl overflow-hidden animate-zoomIn flex flex-col relative">
          
          <div className="absolute top-4 left-4">
             <CircularTimer duration={15} current={feedbackTimer} size={50} />
          </div>

          <div className={`p-6 flex items-center gap-3 border-b ${isSkipped ? 'bg-amber-500/10 border-amber-500/20' : selectedOption === currentQuestion.correctAnswer ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
            {isSkipped ? <Clock className="text-amber-500 w-8 h-8"/> : selectedOption === currentQuestion.correctAnswer ? <CheckCircle className="text-emerald-500 w-8 h-8" /> : <XCircle className="text-rose-500 w-8 h-8" />}
            <h3 className={`font-bold text-2xl ${isSkipped ? 'text-amber-400' : selectedOption === currentQuestion.correctAnswer ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isSkipped ? 'انتهى الوقت' : selectedOption === currentQuestion.correctAnswer ? 'إجابة صحيحة' : 'إجابة خاطئة'}
            </h3>
          </div>

          <div className="p-8 flex-1 flex flex-col justify-center">
            <div className="mb-6">
               <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 block">الإجابة الصحيحة</span>
               <p className="text-emerald-400 font-bold text-2xl leading-relaxed">{currentQuestion.correctAnswer}</p>
            </div>
            
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 flex-1 overflow-y-auto custom-scrollbar">
              <h4 className="text-amber-500 text-sm font-bold mb-2 flex items-center gap-2">
                <Lightbulb size={16}/> إضاءة إثرائية
              </h4>
              <p className="text-slate-200 leading-relaxed text-lg">
                {currentQuestion.feedback.replace(/\*\*/g, '')}
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-white/5 bg-slate-900/30">
            <button 
              onClick={skipFeedback}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              <SkipForward size={20} />
              تخطي والانتقال للسؤال التالي
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!activeModule) return null;
    const totalQuestions = activeModule.questions.length;
    const percentage = Math.round((stats.correct / totalQuestions) * 100);
    const level = getLevelInfo(percentage);
    
    // Determine next step
    const currentIndex = MODULE_SEQUENCE.indexOf(activeModule.id);
    const hasNextModule = currentIndex >= 0 && currentIndex < MODULE_SEQUENCE.length - 1;
    const isSequenceComplete = MODULE_SEQUENCE.every(id => completedModules.includes(id) || id === activeModule.id);

    // Chart Data
    const data = [
      { name: 'صحيح', value: stats.correct, color: '#10b981' },
      { name: 'خاطئ', value: stats.incorrect, color: '#f43f5e' },
      { name: 'متروك', value: stats.skipped, color: '#fbbf24' },
    ];

    return (
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl animate-fadeIn">
        <div className={`glass-panel p-8 md:p-12 rounded-3xl text-center border-t-4 ${level.borderColor}`}>
          <h2 className="text-3xl font-bold text-white mb-2">نتيجة المعيار</h2>
          <p className="text-slate-400 mb-8 text-xl font-medium">{activeModule.title}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-10">
            {/* Chart with Level Ring Color */}
            <div className="h-64 relative">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={data}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                     stroke="none"
                   >
                     {data.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                   <Legend verticalAlign="bottom" height={36} />
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[65%] text-center">
                 <span className={`block text-4xl font-extrabold ${level.color}`}>{percentage}%</span>
                 <span className={`text-sm font-bold ${level.color}`}>{level.title}</span>
               </div>
            </div>

            {/* Stats Grid */}
            <div className="flex flex-col gap-4">
               {/* Level Box */}
               <div className={`p-4 rounded-xl border ${level.borderColor} ${level.bgSoft} mb-4 text-right`}>
                  <div className={`font-bold text-lg mb-1 flex items-center gap-2 ${level.color}`}>
                     <level.icon size={20} />
                     <span>التقدير: {level.title}</span>
                  </div>
                  <p className="text-slate-300 text-sm">{level.msg}</p>
               </div>

               <div className="grid grid-cols-1 gap-4">
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-emerald-500/20 flex justify-between items-center px-6">
                      <div className="text-emerald-400 font-bold flex items-center gap-2"><CheckCircle size={20}/> إجابات صحيحة</div>
                      <div className="text-2xl font-bold text-white">{stats.correct}</div>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-rose-500/20 flex justify-between items-center px-6">
                      <div className="text-rose-400 font-bold flex items-center gap-2"><XCircle size={20}/> إجابات خاطئة</div>
                      <div className="text-2xl font-bold text-white">{stats.incorrect}</div>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-amber-500/20 flex justify-between items-center px-6">
                      <div className="text-amber-400 font-bold flex items-center gap-2"><AlertCircle size={20}/> وقت منتهي</div>
                      <div className="text-2xl font-bold text-white">{stats.skipped}</div>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center mt-8 pt-8 border-t border-white/10">
             <button 
               onClick={returnHome}
               className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-8 rounded-xl transition-all"
             >
               <RotateCcw className="w-5 h-5" />
               الشاشة الرئيسية
             </button>
             
             {hasNextModule && (
               <button 
                 onClick={goToNextModule}
                 className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-blue-500/20"
               >
                 الانتقال للمعيار التالي <ArrowRight className="w-5 h-5" />
               </button>
             )}

             {!hasNextModule && isSequenceComplete && (
                <button 
                  onClick={viewCertificate}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-amber-500/20"
                >
                  <AwardIcon className="w-5 h-5" />
                  عرض النتيجة النهائية
                </button>
             )}
          </div>
        </div>
      </div>
    );
  };

  const renderCertificate = () => {
    // Calculate Aggregate Stats
    let totalCorrect = 0;
    let totalQuestions = 0;
    
    Object.values(globalStats).forEach((s: QuizStats) => {
      totalCorrect += s.correct;
    });
    
    // Total questions across known modules
    MODULE_SEQUENCE.forEach(id => {
      totalQuestions += MODULES[id].questions.length;
    });

    const totalPercentage = Math.round((totalCorrect / totalQuestions) * 100);
    const level = getLevelInfo(totalPercentage);
    const isPassed = totalPercentage >= 50;
    const isCertificateEligible = totalPercentage >= 75;

    // --- CERTIFICATE VIEW (>= 75%) ---
    if (isCertificateEligible) {
      return (
        <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl animate-fadeIn">
          <div className={`relative p-10 md:p-16 rounded-[2rem] text-center border-4 shadow-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900/20 ${level.borderColor}`}>
             
             {/* Decor */}
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/30 blur-3xl rounded-full"></div>
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/30 blur-3xl rounded-full"></div>
             
             <div className="relative z-10">
               <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/5 border border-white/10 shadow-inner">
                 <Star size={48} className="text-amber-400 fill-amber-400 animate-pulse" />
               </div>
               
               <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight text-amber-400">
                 شهادة اجتياز احترافية
               </h1>
               <div className="h-1 w-32 bg-amber-500/50 mx-auto rounded-full mb-6"></div>
               
               <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                 تشهد منصة إتقان بأنك قد اجتزت كافة معايير المحاكاة للرخصة المهنية بنجاح باهر وأداء متميز.
               </p>
               
               <div className="bg-slate-900/60 rounded-2xl p-8 mb-8 border border-white/5 inline-block min-w-[320px]">
                  <div className="text-sm text-slate-400 uppercase tracking-widest mb-2">النتيجة النهائية</div>
                  <div className={`text-6xl font-black ${level.color} mb-2`}>{totalPercentage}%</div>
                  <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold border ${level.borderColor} ${level.bgColor} text-slate-900`}>
                    التقدير: {level.title}
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10 text-slate-400 text-sm">
                 <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                   <div className="font-bold text-white mb-1">{MODULES['assessment'].title}</div>
                   <div>مكتمل</div>
                 </div>
                 <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                   <div className="font-bold text-white mb-1">{MODULES['development'].title}</div>
                   <div>مكتمل</div>
                 </div>
                 <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                   <div className="font-bold text-white mb-1">{MODULES['strategies'].title}</div>
                   <div>مكتمل</div>
                 </div>
               </div>

               <div className="flex justify-center">
                 <button 
                    onClick={returnHome}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-full transition-all flex items-center gap-2 shadow-lg"
                  >
                    <RotateCcw className="w-5 h-5" />
                    عودة للبداية
                  </button>
               </div>
             </div>
          </div>
        </div>
      );
    }

    // --- REPORT VIEW (< 75%) ---
    return (
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl animate-fadeIn">
        <div className="bg-slate-800 rounded-[2rem] border border-slate-600 shadow-2xl overflow-hidden">
           <div className="bg-slate-900/50 p-6 md:p-8 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${level.bgSoft}`}>
                   <FileText size={32} className={level.color} />
                </div>
                <div>
                   <h1 className="text-2xl md:text-3xl font-bold text-white">تقرير الأداء التحليلي</h1>
                   <p className="text-slate-400">ملخص شامل لنقاط القوة والضعف</p>
                </div>
              </div>
              <div className={`text-center px-6 py-3 rounded-xl border ${level.borderColor} ${level.bgSoft}`}>
                 <span className="block text-xs text-slate-400 mb-1">النتيجة العامة</span>
                 <span className={`text-3xl font-black ${level.color}`}>{totalPercentage}%</span>
                 <span className={`block text-xs font-bold mt-1 ${level.color}`}>{level.title}</span>
              </div>
           </div>

           <div className="p-6 md:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Analysis */}
                <div className="space-y-6">
                   <h3 className="text-lg font-bold text-white flex items-center gap-2">
                     <Target className="text-blue-400" /> تحليل المستوى
                   </h3>
                   <div className="bg-slate-900/50 p-5 rounded-xl border border-white/5">
                      <p className="text-slate-300 leading-relaxed mb-4">
                        {level.msg}
                      </p>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                           <span className="text-slate-400">الإجابات الصحيحة</span>
                           <span className="text-emerald-400 font-bold">{totalCorrect}</span>
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                           <div className="bg-emerald-500 h-full" style={{ width: `${totalPercentage}%` }}></div>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-6">
                   <h3 className="text-lg font-bold text-white flex items-center gap-2">
                     <TrendingUp className="text-amber-400" /> خطة التحسين المقترحة
                   </h3>
                   <div className="bg-slate-900/50 p-5 rounded-xl border border-white/5 h-full">
                      <ul className="space-y-4">
                        <li className="flex gap-3 text-sm text-slate-300">
                           <span className="text-amber-500 font-bold">•</span>
                           <span>مراجعة المعايير التي حصلت فيها على نسبة أقل من 60%.</span>
                        </li>
                        <li className="flex gap-3 text-sm text-slate-300">
                           <span className="text-amber-500 font-bold">•</span>
                           <span>التركيز على فهم المصطلحات التربوية (الصدق، الثبات، نظريات التعلم) بدلاً من الحفظ.</span>
                        </li>
                        <li className="flex gap-3 text-sm text-slate-300">
                           <span className="text-amber-500 font-bold">•</span>
                           <span>التدرب على إدارة الوقت بشكل أفضل لتقليل عدد الأسئلة المتروكة.</span>
                        </li>
                        <li className="flex gap-3 text-sm text-slate-300">
                           <span className="text-amber-500 font-bold">•</span>
                           <span>إعادة المحاولة في وضع المحاكاة لرفع الكفاءة الذهنية.</span>
                        </li>
                      </ul>
                   </div>
                </div>
              </div>

              <div className="flex justify-center pt-6 border-t border-white/5">
                <button 
                  onClick={returnHome}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-10 rounded-full transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  إعادة المحاولة
                </button>
              </div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black text-white selection:bg-amber-500/30 font-sans">
      <Header totalTime={stats.totalTime} />
      
      <main className="relative z-10 pb-20">
        {appState === AppState.HOME && renderHome()}
        {appState === AppState.QUIZ && renderQuiz()}
        {appState === AppState.RESULTS && renderResults()}
        {appState === AppState.CERTIFICATE && renderCertificate()}
      </main>

      {/* Floating Blobs for aesthetics */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Modal Overlay */}
      {renderFeedbackModal()}

      {/* Footer */}
      <footer className="fixed bottom-0 w-full p-4 text-center text-xs text-slate-600 pointer-events-none z-0">
        منصة إتقان التربوية © 2024
      </footer>
    </div>
  );
};

export default App;