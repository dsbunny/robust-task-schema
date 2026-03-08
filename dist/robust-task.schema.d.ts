import { z } from 'zod/v4';
export declare namespace RobustTask {
    const StatusValues: readonly ["pending", "running", "succeeded", "failed", "rejected", "blocked-dependency", "blocked-input", "skipped", "pending-paused", "blocked-dependency-paused", "blocked-input-paused"];
    type Status = (typeof StatusValues)[number];
    type TerminalStatus = 'succeeded' | 'failed' | 'rejected' | 'skipped';
    type ActiveStatus = 'pending' | 'running' | 'blocked-dependency' | 'blocked-input' | 'pending-paused' | 'blocked-dependency-paused' | 'blocked-input-paused';
    type PausedStatus = 'pending-paused' | 'blocked-dependency-paused' | 'blocked-input-paused';
    const ErrorInfoSchema: z.ZodObject<{
        message: z.ZodString;
        code: z.ZodOptional<z.ZodString>;
        stack: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodISODateTime;
    }, z.core.$strip>;
    interface ErrorInfo {
        readonly message: string;
        readonly code?: string;
        readonly stack?: string;
        readonly timestamp: string;
    }
    const RejectionInfoSchema: z.ZodObject<{
        reason: z.ZodString;
        issues: z.ZodOptional<z.ZodArray<z.ZodString>>;
        timestamp: z.ZodISODateTime;
    }, z.core.$strip>;
    interface RejectionInfo {
        readonly reason: string;
        readonly issues?: string[];
        readonly timestamp: string;
    }
    const TaskConfigSchema: z.ZodObject<{
        timeoutMs: z.ZodNumber;
        maxAttempts: z.ZodNumber;
    }, z.core.$strip>;
    interface TaskConfig {
        readonly timeoutMs: number;
        readonly maxAttempts: number;
    }
    const TaskStateSchema: z.ZodObject<{
        status: z.ZodEnum<{
            pending: "pending";
            running: "running";
            succeeded: "succeeded";
            failed: "failed";
            rejected: "rejected";
            "blocked-dependency": "blocked-dependency";
            "blocked-input": "blocked-input";
            skipped: "skipped";
            "pending-paused": "pending-paused";
            "blocked-dependency-paused": "blocked-dependency-paused";
            "blocked-input-paused": "blocked-input-paused";
        }>;
        createdAt: z.ZodISODateTime;
        startedAt: z.ZodOptional<z.ZodISODateTime>;
        updatedAt: z.ZodOptional<z.ZodISODateTime>;
        finishedAt: z.ZodOptional<z.ZodISODateTime>;
        attempts: z.ZodNumber;
        runtimeToken: z.ZodOptional<z.ZodString>;
        data: z.ZodOptional<z.ZodUnknown>;
        config: z.ZodOptional<z.ZodObject<{
            timeoutMs: z.ZodNumber;
            maxAttempts: z.ZodNumber;
        }, z.core.$strip>>;
        progress: z.ZodOptional<z.ZodUnknown>;
        result: z.ZodOptional<z.ZodUnknown>;
        error: z.ZodOptional<z.ZodObject<{
            message: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            stack: z.ZodOptional<z.ZodString>;
            timestamp: z.ZodISODateTime;
        }, z.core.$strip>>;
        rejection: z.ZodOptional<z.ZodObject<{
            reason: z.ZodString;
            issues: z.ZodOptional<z.ZodArray<z.ZodString>>;
            timestamp: z.ZodISODateTime;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    interface TaskState<TData = unknown, TConfig = unknown, TProgress = unknown, TResult = unknown> {
        readonly status: Status;
        readonly createdAt: string;
        readonly startedAt?: string;
        readonly updatedAt?: string;
        readonly finishedAt?: string;
        readonly attempts: number;
        readonly runtimeToken?: string;
        readonly data?: TData;
        readonly config?: TConfig;
        readonly progress?: TProgress;
        readonly result?: TResult;
        readonly error?: ErrorInfo;
        readonly rejection?: RejectionInfo;
    }
    function isTerminal(status: Status): status is TerminalStatus;
    function isActive(status: Status): status is ActiveStatus;
    function isPaused(status: Status): status is PausedStatus;
}
