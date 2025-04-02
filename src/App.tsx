"use client";
import { useState } from "react";

// Import data + types
import questionsData from "./data/questions.json";
import { Question } from "./types";

// shadcn UI imports
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { ThemeProvider } from "./components/theme-provider";

// You can tweak PAGE_SIZE to 20, etc.
const PAGE_SIZE = 10;

interface DisplayQuestion {
  id: number;
  textA: string;
  textB: string;
  valA: "A" | "B";
  valB: "A" | "B";
}

export default function Questionnaire() {
  // 1) Create displayedQuestions with random flip ONCE
  const [displayedQuestions] = useState<DisplayQuestion[]>(() => {
    return (questionsData as Question[]).map((q) => {
      const flip = Math.random() < 0.5;
      if (flip) {
        return {
          id: q.id,
          textA: q.optionB,
          textB: q.optionA,
          valA: "B",
          valB: "A",
        };
      } else {
        return {
          id: q.id,
          textA: q.optionA,
          textB: q.optionB,
          valA: "A",
          valB: "B",
        };
      }
    });
  });

  // 2) Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(displayedQuestions.length / PAGE_SIZE);

  // Slice the relevant questions for this page
  const startIndex = currentPage * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, displayedQuestions.length);
  const questionsOnThisPage = displayedQuestions.slice(startIndex, endIndex);

  // 3) answers: questionId => "A" | "B" | "N"
  const [answers, setAnswers] = useState<{ [id: number]: "A" | "B" | "N" }>({});

  // 4) Dialog control
  const [open, setOpen] = useState(false);
  const [resultText, setResultText] = useState("");

  // 5) Handler for selecting an answer
  const handleSelect = (id: number, choice: "A" | "B" | "N") => {
    setAnswers((prev) => ({ ...prev, [id]: choice }));
  };

  // 6) Tally results - Final calculation and show results
  const handleSubmit = () => {
    let countA = 0;
    let countB = 0;
    let countN = 0;

    displayedQuestions.forEach((dq) => {
      const userChoice = answers[dq.id]; // "A", "B", or "N"
      if (!userChoice) return; // user didn't pick anything for this question

      if (userChoice === "N") {
        countN++;
        return;
      }

      // userChoice is "A" or "B" from the UI
      // map it to original A/B
      const originalSelected = userChoice === "A" ? dq.valA : dq.valB;
      if (originalSelected === "A") countA++;
      if (originalSelected === "B") countB++;
    });

    // Build interpretation string
    // 1) Basic counts
    let interpretation = `A count: ${countA}\nB count: ${countB}\nNeutral: ${countN}\n\n`;

    // 2) Percentages (only for A/B)
    const totalAB = countA + countB;
    if (totalAB > 0) {
      const percentA = ((countA / totalAB) * 100).toFixed(1);
      const percentB = ((countB / totalAB) * 100).toFixed(1);

      interpretation += `ENTP (A) ~ ${percentA}%\nESTP (B) ~ ${percentB}%\n\n`;
    } else {
      // Edge case: user basically picked all neutral (or left blank)
      interpretation += `No A/B picks, so no percentage comparison.\n\n`;
    }

    // 3) Which side is bigger?
    if (countA > countB) {
      interpretation += "You may lean more toward ENTP tendencies (informal).";
    } else if (countB > countA) {
      interpretation += "You may lean more toward ESTP tendencies (informal).";
    } else {
      interpretation +=
        "You appear balanced or undecided between ENTP & ESTP (informal).";
    }

    // Show results in a modal
    setResultText(interpretation);
    setOpen(true);
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Questionnaire (A/B Random & Neutral)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Render questions for the current page */}
            {questionsOnThisPage.map((q) => {
              const currentChoice = answers[q.id] || "";
              return (
                <div key={q.id} className="border-b pb-4 mb-4">
                  <p className="font-semibold mb-2">Question {q.id}</p>
                  <RadioGroup
                    value={currentChoice}
                    onValueChange={(val) =>
                      handleSelect(q.id, val as "A" | "B" | "N")
                    }
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id={`q${q.id}-A`} value="A" />
                      <label htmlFor={`q${q.id}-A`}>{q.textA}</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id={`q${q.id}-B`} value="B" />
                      <label htmlFor={`q${q.id}-B`}>{q.textB}</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id={`q${q.id}-N`} value="N" />
                      <label htmlFor={`q${q.id}-N`}>Neither / Neutral</label>
                    </div>
                  </RadioGroup>
                </div>
              );
            })}

            {/* Pagination controls */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>

              <span className="text-sm">
                Page {currentPage + 1} of {totalPages}
              </span>

              {currentPage >= totalPages - 1 ? (
                <Button onClick={handleSubmit}>Submit</Button>
              ) : (
                <Button
                  variant="outline"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Results</DialogTitle>
              <DialogDescription>
                <pre className="whitespace-pre-wrap mt-2">{resultText}</pre>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ThemeProvider>
  );
}
