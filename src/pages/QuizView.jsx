import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Clock, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function QuizView() {
  const params = new URLSearchParams(window.location.search);
  const quizId = params.get("id");
  const courseId = params.get("courseId");
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: quiz } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => base44.entities.Quiz.filter({ id: quizId }).then(r => r[0]),
    enabled: !!quizId,
  });

  // Timer
  useEffect(() => {
    if (quiz?.time_limit_minutes && quiz.time_limit_minutes > 0 && !submitted) {
      setTimeLeft(quiz.time_limit_minutes * 60);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [quiz, submitted]);

  const questions = quiz?.questions || [];
  const question = questions[currentQ];

  const setAnswer = (qId, answer) => {
    setAnswers(prev => ({ ...prev, [qId]: answer }));
  };

  const toggleMultiSelect = (qId, option) => {
    const current = answers[qId] || [];
    const updated = current.includes(option)
      ? current.filter(o => o !== option)
      : [...current, option];
    setAnswer(qId, updated);
  };

  const handleSubmit = async () => {
    if (submitted) return;
    clearInterval(timerRef.current);

    let score = 0;
    let maxScore = 0;
    const gradedAnswers = questions.map(q => {
      const userAns = answers[q.id] || [];
      const userArray = Array.isArray(userAns) ? userAns : [userAns];
      const correctArray = q.correct_answers || [];
      const pts = q.points || 1;
      maxScore += pts;
      const isCorrect = JSON.stringify(userArray.sort()) === JSON.stringify(correctArray.sort());
      if (isCorrect) score += pts;
      return {
        question_id: q.id,
        user_answer: userArray,
        is_correct: isCorrect,
        points_earned: isCorrect ? pts : 0,
      };
    });

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const passed = percentage >= (quiz.passing_score || 70);

    const result = {
      user_email: user.email,
      quiz_id: quizId,
      course_id: courseId || quiz.course_id,
      answers: gradedAnswers,
      score,
      max_score: maxScore,
      percentage,
      passed,
      time_spent_seconds: quiz.time_limit_minutes ? (quiz.time_limit_minutes * 60 - (timeLeft || 0)) : 0,
    };

    await base44.entities.QuizAttempt.create(result);
    setResults(result);
    setSubmitted(true);
  };

  if (!quiz) {
    return <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Loading quiz...</div>;
  }

  if (submitted && results) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-10 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${results.passed ? "bg-green-50" : "bg-red-50"}`}>
            {results.passed ? <CheckCircle2 className="w-10 h-10 text-green-500" /> : <XCircle className="w-10 h-10 text-red-500" />}
          </div>
          <h1 className="text-2xl font-bold mb-1">{results.passed ? "Congratulations!" : "Keep Trying!"}</h1>
          <p className="text-muted-foreground text-sm mb-6">
            {results.passed ? "You passed the quiz." : `You need ${quiz.passing_score}% to pass.`}
          </p>
          <div className="flex justify-center gap-6 mb-8">
            <div><div className="text-3xl font-bold">{results.percentage}%</div><div className="text-xs text-muted-foreground">Score</div></div>
            <div><div className="text-3xl font-bold">{results.score}/{results.max_score}</div><div className="text-xs text-muted-foreground">Points</div></div>
          </div>

          {/* Review answers */}
          <div className="text-left space-y-4 mb-8">
            {questions.map((q, i) => {
              const graded = results.answers.find(a => a.question_id === q.id);
              return (
                <div key={q.id} className={`p-4 rounded-xl border ${graded?.is_correct ? "border-green-200 bg-green-50/30" : "border-red-200 bg-red-50/30"}`}>
                  <div className="flex items-start gap-2 mb-2">
                    {graded?.is_correct ? <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-500 mt-0.5" />}
                    <span className="text-sm font-medium">{q.question}</span>
                  </div>
                  {!graded?.is_correct && q.explanation && (
                    <p className="text-xs text-muted-foreground ml-6">{q.explanation}</p>
                  )}
                </div>
              );
            })}
          </div>

          <Link to={createPageUrl("CourseView") + `?id=${courseId || quiz.course_id}`}>
            <Button>Back to Course</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">{quiz.title}</h1>
          <p className="text-xs text-muted-foreground">Question {currentQ + 1} of {questions.length}</p>
        </div>
        {timeLeft !== null && (
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <Clock className="w-3 h-3" />
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </Badge>
        )}
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-8">
        {questions.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all",
              i === currentQ ? "bg-foreground" : i < currentQ || answers[questions[i]?.id] ? "bg-foreground/40" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Question */}
      {question && (
        <AnimatePresence mode="wait">
          <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-base font-semibold mb-5">{question.question}</h2>

            {question.type === "short_answer" ? (
              <Input
                value={answers[question.id]?.[0] || ""}
                onChange={(e) => setAnswer(question.id, [e.target.value])}
                placeholder="Type your answer..."
                className="text-sm"
              />
            ) : (
              <div className="space-y-2">
                {question.options?.map((option) => {
                  const userAns = answers[question.id] || [];
                  const selected = userAns.includes(option);
                  const isMulti = question.type === "multi_select";

                  return (
                    <button
                      key={option}
                      onClick={() => isMulti ? toggleMultiSelect(question.id, option) : setAnswer(question.id, [option])}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all",
                        selected ? "border-foreground bg-foreground/5 font-medium" : "border-border/60 hover:border-border"
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {question.type === "multi_select" && (
              <p className="text-[10px] text-muted-foreground mt-2">Select all that apply</p>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <Button
          variant="ghost"
          size="sm"
          disabled={currentQ === 0}
          onClick={() => setCurrentQ(prev => prev - 1)}
          className="text-xs"
        >
          Previous
        </Button>
        {currentQ < questions.length - 1 ? (
          <Button size="sm" onClick={() => setCurrentQ(prev => prev + 1)} className="text-xs">
            Next <ChevronRight className="w-3 h-3 ml-0.5" />
          </Button>
        ) : (
          <Button size="sm" onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-xs">
            Submit Quiz
          </Button>
        )}
      </div>
    </div>
  );
}