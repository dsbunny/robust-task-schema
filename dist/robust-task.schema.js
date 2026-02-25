// vim: tabstop=8 softtabstop=0 noexpandtab shiftwidth=8 nosmarttab
// Copyright 2026 Digital Signage Bunny Corp. Use of this source code is
// governed by an MIT-style license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.
import { z } from 'zod/v4';
export var RobustTask;
(function (RobustTask) {
    // ===== Task Status Types =====
    RobustTask.StatusValues = [
        'pending', // Created but not started
        'running', // Currently executing
        'succeeded', // Completed successfully
        'failed', // Completed with error
        'rejected', // Failed without retry (e.g. validation error)
        'blocked', // Waiting for previous task
        'skipped', // Task will never execute
        'pending-paused', // Execution paused
        'blocked-paused', // Manually paused while waiting for previous task
    ];
    // ===== Task Structure =====
    RobustTask.ErrorInfoSchema = z.object({
        message: z.string(),
        code: z.string().optional(),
        stack: z.string().optional(),
        timestamp: z.iso.datetime(),
    });
    RobustTask.RejectionInfoSchema = z.object({
        reason: z.string(),
        issues: z.array(z.string()).optional(),
        timestamp: z.iso.datetime(),
    });
    RobustTask.TaskStateSchema = z.object({
        status: z.enum(RobustTask.StatusValues),
        createdAt: z.iso.datetime(),
        startedAt: z.iso.datetime().optional(),
        updatedAt: z.iso.datetime().optional(),
        finishedAt: z.iso.datetime().optional(),
        attempts: z.number(),
        runtimeToken: z.string().optional(),
        progress: z.unknown().optional(),
        result: z.unknown().optional(),
        error: RobustTask.ErrorInfoSchema.optional(),
        rejection: RobustTask.RejectionInfoSchema.optional(),
    });
    // ===== Type Guards =====
    function isTerminal(status) {
        return status === 'succeeded' || status === 'failed' || status === 'rejected' || status === 'skipped';
    }
    RobustTask.isTerminal = isTerminal;
    function isActive(status) {
        return status === 'pending' || status === 'running' || status === 'blocked' || status === 'pending-paused' || status === 'blocked-paused';
    }
    RobustTask.isActive = isActive;
    function isPaused(status) {
        return status === 'pending-paused' || status === 'blocked-paused';
    }
    RobustTask.isPaused = isPaused;
})(RobustTask || (RobustTask = {}));
//# sourceMappingURL=robust-task.schema.js.map