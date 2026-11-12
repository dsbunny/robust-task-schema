// vim: tabstop=8 softtabstop=0 noexpandtab shiftwidth=8 nosmarttab
// Copyright 2026 Digital Signage Bunny Corp. Use of this source code is
// governed by an MIT-style license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.
import * as z from 'zod';
import { dsbunnyRegistry } from '@dsbunny/zod-registry';
export var RobustTask;
(function (RobustTask) {
    // ===== Task Status Types =====
    RobustTask.StatusValues = [
        'pending', // Created but not started
        'running', // Currently executing
        'succeeded', // Completed successfully
        'failed', // Completed with error
        'rejected', // Failed without retry (e.g. validation error)
        'blocked-dependency', // Waiting for previous task
        'blocked-input', // Waiting for external input
        'skipped', // Task will never execute
        'pending-paused', // Execution paused
        'blocked-dependency-paused', // Manually paused while waiting for previous task
        'blocked-input-paused', // Manually paused while waiting for external input
    ];
    // ===== Task Structure =====
    RobustTask.ErrorInfoSchema = z.object({
        '@type': z.literal('ErrorInfo'),
        message: z.string(),
        code: z.string().optional(),
        stack: z.string().optional(),
        timestamp: z.iso.datetime(),
    }).register(dsbunnyRegistry, {
        id: 'ErrorInfoSchema',
        description: 'The schema for error information related to task execution',
    });
    ;
    RobustTask.RejectionInfoSchema = z.object({
        '@type': z.literal('RejectionInfo'),
        reason: z.string(),
        issues: z.array(z.string()).optional(),
        timestamp: z.iso.datetime(),
    }).register(dsbunnyRegistry, {
        id: 'RejectionInfoSchema',
        description: 'The schema for rejection information related to task execution',
    });
    RobustTask.TaskConfigSchema = z.object({
        '@type': z.literal('TaskConfig'),
        timeoutMs: z.number(),
        maxAttempts: z.number(),
    }).register(dsbunnyRegistry, {
        id: 'TaskConfigSchema',
        description: 'The schema for task configuration',
    });
    ;
    RobustTask.TaskStateSchema = z.object({
        '@type': z.literal('TaskState'),
        status: z.enum(RobustTask.StatusValues),
        createdAt: z.iso.datetime(),
        startedAt: z.iso.datetime().optional(),
        updatedAt: z.iso.datetime().optional(),
        finishedAt: z.iso.datetime().optional(),
        attempts: z.number(),
        runtimeToken: z.string().optional(),
        data: z.unknown().optional(),
        config: RobustTask.TaskConfigSchema.optional(),
        progress: z.unknown().optional(),
        result: z.unknown().optional(),
        error: RobustTask.ErrorInfoSchema.optional(),
        rejection: RobustTask.RejectionInfoSchema.optional(),
    }).register(dsbunnyRegistry, {
        id: 'TaskStateSchema',
        description: 'The schema for task state',
    });
    function normalizeTaskStateTypeTags(value) {
        const addTypeIfMissing = (input, type) => {
            if (!input || typeof input !== 'object' || Array.isArray(input) || '@type' in input) {
                return input;
            }
            return { ...input, '@type': type };
        };
        const taggedState = addTypeIfMissing(value, 'TaskState');
        if (!taggedState || typeof taggedState !== 'object' || Array.isArray(taggedState)) {
            return taggedState;
        }
        const state = taggedState;
        return {
            ...state,
            ...(state.config !== undefined && { config: addTypeIfMissing(state.config, 'TaskConfig') }),
            ...(state.error !== undefined && { error: addTypeIfMissing(state.error, 'ErrorInfo') }),
            ...(state.rejection !== undefined && { rejection: addTypeIfMissing(state.rejection, 'RejectionInfo') }),
        };
    }
    RobustTask.normalizeTaskStateTypeTags = normalizeTaskStateTypeTags;
    ;
    // ===== Type Guards =====
    function isTerminal(status) {
        return status === 'succeeded' || status === 'failed' || status === 'rejected' || status === 'skipped';
    }
    RobustTask.isTerminal = isTerminal;
    function isActive(status) {
        return status === 'pending' || status === 'running' || status === 'blocked-dependency' || status === 'blocked-input' || status === 'pending-paused' || status === 'blocked-dependency-paused' || status === 'blocked-input-paused';
    }
    RobustTask.isActive = isActive;
    function isPaused(status) {
        return status === 'pending-paused' || status === 'blocked-dependency-paused' || status === 'blocked-input-paused';
    }
    RobustTask.isPaused = isPaused;
})(RobustTask || (RobustTask = {}));
//# sourceMappingURL=robust-task.schema.js.map