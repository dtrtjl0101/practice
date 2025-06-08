import {
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  Fade,
  IconButton,
  Portal,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useCallback, useEffect, useState } from "react";

export interface CoachmarkStep {
  target: string;
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
  offset?: { x: number; y: number };
}

export interface CoachmarkProps {
  steps: CoachmarkStep[];
  isOpen: boolean;
  onComplete: () => void;
}

export default function Coachmark({
  steps,
  isOpen,
  onComplete,
}: CoachmarkProps) {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = steps[currentStep];

  const updateTargetRect = useCallback(() => {
    if (!step?.target) return;
    const element = document.querySelector(step.target) as HTMLElement | null;
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
    }
  }, [step?.target]);

  useEffect(() => {
    if (isOpen) {
      updateTargetRect();

      const handleResize = () => updateTargetRect();
      const handleScroll = () => updateTargetRect();

      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll);

      const observer = new MutationObserver(() => {
        updateTargetRect();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });

      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll);
        observer.disconnect();
      };
    }
  }, [isOpen, updateTargetRect]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);

      setTimeout(() => {
        updateTargetRect();
      }, 100);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);

      setTimeout(() => {
        updateTargetRect();
      }, 100);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const getTooltipPosition = () => {
    if (!targetRect) return { top: 0, left: 0 };

    const placement = step.placement || "bottom";
    const offset = step.offset || { x: 0, y: 0 };
    const tooltipOffset = 16;

    let top = 0;
    let left = 0;

    switch (placement) {
      case "top":
        top = targetRect.top - tooltipOffset + offset.y;
        left = targetRect.left + targetRect.width / 2 + offset.x;
        break;
      case "bottom":
        top = targetRect.bottom + tooltipOffset + offset.y;
        left = targetRect.left + targetRect.width / 2 + offset.x;
        break;
      case "left":
        top = targetRect.top + targetRect.height / 2 + offset.y;
        left = targetRect.left - tooltipOffset + offset.x;
        break;
      case "right":
        top = targetRect.top + targetRect.height / 2 + offset.y;
        left = targetRect.right + tooltipOffset + offset.x;
        break;
    }

    return { top, left };
  };

  const getHighlightStyle = () => {
    if (!targetRect) return {};

    return {
      position: "fixed" as const,
      top: targetRect.top - 4,
      left: targetRect.left - 4,
      width: targetRect.width + 8,
      height: targetRect.height + 8,
      border: `3px solid ${theme.palette.primary.main}`,
      borderRadius: theme.shape.borderRadius,
      backgroundColor: "transparent",
      pointerEvents: "none" as const,
    };
  };

  const tooltipPosition = getTooltipPosition();

  if (!isOpen || !step) return null;

  const shouldShowFallback = !targetRect;

  return (
    <Portal>
      <Fade in={isOpen}>
        <Backdrop open={isOpen} sx={{ zIndex: 9999 }}>
          {!shouldShowFallback && <Box sx={getHighlightStyle()} />}
          <Card
            sx={{
              position: "fixed",
              top: shouldShowFallback ? "50%" : tooltipPosition.top,
              left: shouldShowFallback ? "50%" : tooltipPosition.left,
              transform: shouldShowFallback
                ? "translate(-50%, -50%)"
                : step.placement === "top" || step.placement === "bottom"
                  ? "translateX(-50%)"
                  : step.placement === "left"
                    ? "translateX(-100%)"
                    : "translateX(0%)",
              maxWidth: 320,
              minWidth: 280,
              transition: "left 0.3s, top 0.3s",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 1,
                }}
              >
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{ fontWeight: 600 }}
                >
                  {step.title}
                </Typography>
                <IconButton
                  size="small"
                  onClick={onComplete}
                  sx={{ mt: -1, mr: -1 }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {step.content}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {currentStep + 1} / {steps.length}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={handleSkip}>
                    건너뛰기
                  </Button>
                  {currentStep > 0 && (
                    <Button size="small" onClick={handlePrev}>
                      이전
                    </Button>
                  )}
                  <Button variant="contained" size="small" onClick={handleNext}>
                    {currentStep === steps.length - 1 ? "완료" : "다음"}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Backdrop>
      </Fade>
    </Portal>
  );
}

export function useCoachmark(storageKey: string) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenCoachmark = localStorage.getItem(`coachmark_${storageKey}`);
    if (!hasSeenCoachmark) {
      setIsOpen(true);
    }
  }, [storageKey]);

  const completeCoachmark = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem(`coachmark_${storageKey}`, "true");
  }, [storageKey]);

  const resetCoachmark = useCallback(() => {
    localStorage.removeItem(`coachmark_${storageKey}`);
    setIsOpen(true);
  }, [storageKey]);

  return {
    isOpen,
    completeCoachmark,
    resetCoachmark,
  };
}
