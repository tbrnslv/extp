"use client";
import { useEffect, useState } from "react";
import questionsData from "./data/questions.json";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// ------------------
// Type Definitions
// ------------------
interface Question {
  id: number;
  description: string;
  optionA: string;
  optionB: string;
  optionC: string;
  explanation: string;
  functionsCompared: [string, string];
  shuffledOptions?: ShuffledOption[];
}

interface ShuffledOption {
  key: "A" | "B" | "C";
  text: string;
}

// If your question file is shaped differently, adjust accordingly

// ------------------
// Utility: Shuffle an array in-place
// ------------------
function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ------------------
// The main component
// ------------------
export default function Questionnaire() {
  // Shuffled questions
  const [questions, setQuestions] = useState<Question[]>([]);
  // Current question index
  const [currentIndex, setCurrentIndex] = useState(0);
  // User's answers: questionId => "A" | "B" | "C"
  const [answers, setAnswers] = useState<{ [qid: number]: "A" | "B" | "C" }>(
    {}
  );
  // Dialog states
  const [showDialog, setShowDialog] = useState(false);
  const [resultsText, setResultsText] = useState("");
  // Whether to show the "review explanations" screen
  const [reviewMode, setReviewMode] = useState(false);

  // ------------------
  // On mount: shuffle questions & shuffle their options
  // ------------------
  useEffect(() => {
    const copied: Question[] = JSON.parse(JSON.stringify(questionsData));
    shuffleArray(copied);
    copied.forEach((q) => {
      const opts: ShuffledOption[] = [
        { key: "A", text: q.optionA },
        { key: "B", text: q.optionB },
        { key: "C", text: q.optionC },
      ];
      shuffleArray(opts);
      q.shuffledOptions = opts;
    });
    setQuestions(copied);
  }, []);

  // Loading fallback
  if (questions.length === 0) {
    return <div className="p-4">Loading questions...</div>;
  }

  const currentQuestion = questions[currentIndex];
  const userChoice = answers[currentQuestion.id] || "";

  // ------------------
  // Handlers
  // ------------------
  const handleOptionSelect = (val: "A" | "B" | "C") => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = () => {
    // Tally how many times user picked A/B/C
    let countA = 0;
    let countB = 0;
    let countC = 0;

    questions.forEach((q) => {
      const ans = answers[q.id];
      if (ans === "A") countA++;
      if (ans === "B") countB++;
      if (ans === "C") countC++;
    });

    // Build a result string
    let text = `You have completed the questionnaire!\n\n`;
    text += `A (ENTP-like) picks: ${countA}\n`;
    text += `B (ESTP-like) picks: ${countB}\n`;
    text += `C (Neutral): ${countC}\n\n`;

    // Add percentages for ENTP vs. ESTP (only if total A/B > 0)
    const totalAB = countA + countB;
    if (totalAB > 0) {
      const percentA = ((countA / totalAB) * 100).toFixed(1);
      const percentB = ((countB / totalAB) * 100).toFixed(1);
      text += `ENTP (A) ~ ${percentA}%\nESTP (B) ~ ${percentB}%\n\n`;
    }

    // Interpret final leaning
    if (countA > countB) {
      text += "You lean more ENTP in this informal quiz.";
    } else if (countB > countA) {
      text += "You lean more ESTP in this informal quiz.";
    } else {
      text += "You appear balanced between ENTP and ESTP traits.";
    }

    setResultsText(text);
    setShowDialog(true);
  };

  const handleShowReview = () => {
    setShowDialog(false); // close the results dialog
    setReviewMode(true); // go to review mode
  };

  // -----------------------------
  // "Review Explanations" Screen
  // -----------------------------
  // If reviewMode is true, we show a list of all Q/As
  if (reviewMode) {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-4">
          Review of Your Answers & Explanations
        </h1>

        {questions.map((q) => {
          const userAnswer = answers[q.id]; // "A" | "B" | "C" or undefined
          const answerText = userAnswer
            ? userAnswer === "A"
              ? q.optionA
              : userAnswer === "B"
              ? q.optionB
              : q.optionC
            : "[No answer selected]";

          // Which type does userAnswer correspond to?
          let answerType = "Neutral";
          if (userAnswer === "A") answerType = "ENTP";
          if (userAnswer === "B") answerType = "ESTP";

          return (
            <Card
              key={q.id}
              className="border border-gray-700 bg-gray-900 text-white"
            >
              <CardHeader>
                <CardTitle className="text-lg text-blue-400">
                  Question {q.id}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold text-gray-100">{q.description}</p>
                <p className="text-sm text-gray-300">
                  <strong className="text-green-400">Your Answer:</strong>{" "}
                  {userAnswer || "None"} –{" "}
                  <span className="text-yellow-300">{answerText}</span>
                </p>
                <p className="text-sm text-gray-300">
                  <strong className="text-purple-400">Answer Type:</strong>{" "}
                  {answerType}
                </p>
                <p className="text-sm text-gray-300">
                  <strong className="text-pink-400">Functions Compared:</strong>{" "}
                  {q.functionsCompared[0]}{" "}
                  <span className="text-white">vs.</span>{" "}
                  {q.functionsCompared[1]}
                </p>
                <p className="text-sm text-gray-300">
                  <strong className="text-red-400">Explanation:</strong>{" "}
                  {q.explanation}
                </p>
              </CardContent>
            </Card>
          );
        })}

        <Button onClick={() => setReviewMode(false)}>Back to Start</Button>
      </div>
    );
  }

  // -----------------------------
  // Normal Quiz Screen
  // -----------------------------
  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>
            Question {currentIndex + 1} / {questions.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="font-medium">{currentQuestion.description}</p>

          <RadioGroup
            value={userChoice}
            onValueChange={(val) => handleOptionSelect(val as "A" | "B" | "C")}
            className="flex flex-col space-y-3"
          >
            {currentQuestion.shuffledOptions?.map((opt) => (
              <div key={opt.key} className="flex items-center space-x-2">
                <RadioGroupItem
                  id={`q${currentQuestion.id}-option${opt.key}`}
                  value={opt.key}
                />
                <label
                  htmlFor={`q${currentQuestion.id}-option${opt.key}`}
                  className="leading-tight"
                >
                  {opt.text}
                </label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button onClick={handleNext} disabled={!userChoice}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!userChoice}>
                Submit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Results</DialogTitle>
            <DialogDescription>
              <pre className="whitespace-pre-wrap">{resultsText}</pre>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="space-x-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Close
            </Button>
            <Button onClick={handleShowReview}>Show Explanations</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
