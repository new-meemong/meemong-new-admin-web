"use client";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  snsInducementDetectionAPI,
  type DetectionCandidate,
  type DetectionConditions,
  type DetectionRequest,
} from "@/apis/snsInducementDetections";
import {
  detectionFailure,
  mergeCandidates,
} from "@/lib/sns-inducement-detections";

const rulesKey = ["SNS_INDUCEMENT_DETECTION_RULES"];
export function useDetectionRules() {
  return useQuery({
    queryKey: rulesKey,
    queryFn: ({ signal }) => snsInducementDetectionAPI.getRules(signal),
  });
}
export function useSaveDetectionRules() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: snsInducementDetectionAPI.updateRules,
    onSuccess: (rules) => {
      client.setQueryData(rulesKey, rules);
    },
  });
}
export type InvestigationState = {
  status: "idle" | "running" | "paused" | "failed" | "complete";
  candidates: DetectionCandidate[];
  scanned: number;
  appliedRules: DetectionConditions | null;
  error: string;
  retryable: boolean;
};
const initial: InvestigationState = {
  status: "idle",
  candidates: [],
  scanned: 0,
  appliedRules: null,
  error: "",
  retryable: false,
};
export function useDetectionInvestigation() {
  const [state, setState] = useState<InvestigationState>(initial);
  const [pausing, setPausing] = useState(false);
  const execution = useRef(0);
  const busy = useRef(false);
  const pauseRequested = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const nextRequest = useRef<DetectionRequest | null>(null);
  const canResume = useRef(false);
  useEffect(
    () => () => {
      execution.current++;
      controller.current?.abort();
      busy.current = false;
    },
    [],
  );

  async function run(request: DetectionRequest, fresh: boolean) {
    if (busy.current) return;
    busy.current = true;
    canResume.current = false;
    pauseRequested.current = false;
    setPausing(false);
    const id = ++execution.current;
    controller.current?.abort();
    setState((previous) => ({
      ...(fresh ? initial : previous),
      status: "running",
      error: "",
      retryable: false,
    }));
    let current = request;
    while (id === execution.current) {
      nextRequest.current = current;
      const abort = new AbortController();
      controller.current = abort;
      // A timed-out batch remains retryable at the same cursor; no partial commit.
      const timeout = window.setTimeout(() => abort.abort(), 60_000);
      try {
        const response = await snsInducementDetectionAPI.preview(
          current,
          abort.signal,
        );
        if (id !== execution.current) return;
        const complete = response.nextCursor === null;
        const paused = pauseRequested.current && !complete;
        const next: DetectionRequest = {
          scanLimit: current.scanLimit,
          cursor: response.nextCursor,
          fieldList: [...response.appliedRules.fieldList],
          phraseList: [...response.appliedRules.phraseList],
        };
        nextRequest.current = complete ? null : next;
        canResume.current = paused;
        setState((previous) => ({
          status: complete ? "complete" : paused ? "paused" : "running",
          candidates: mergeCandidates(previous.candidates, response.dataList),
          scanned: previous.scanned + response.scannedRecordCount,
          appliedRules: response.appliedRules,
          error: "",
          retryable: false,
        }));
        if (complete || paused) break;
        current = next;
      } catch (error) {
        if (id !== execution.current) return;
        const failure = detectionFailure(error, current.cursor != null);
        canResume.current = failure.retryable;
        setState((previous) => ({
          ...previous,
          status: "failed",
          error: failure.message,
          retryable: failure.retryable,
        }));
        break;
      } finally {
        window.clearTimeout(timeout);
      }
    }
    if (id === execution.current) {
      busy.current = false;
      setPausing(false);
    }
  }
  return {
    ...state,
    pausing,
    start: (conditions: DetectionConditions, scanLimit: number) =>
      run(
        {
          fieldList: [...conditions.fieldList],
          phraseList: [...conditions.phraseList],
          scanLimit,
          cursor: null,
        },
        true,
      ),
    resume: () => {
      if (canResume.current && nextRequest.current)
        return run(nextRequest.current, false);
    },
    pause: () => {
      if (busy.current) {
        pauseRequested.current = true;
        setPausing(true);
      }
    },
  };
}
