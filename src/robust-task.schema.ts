// vim: tabstop=8 softtabstop=0 noexpandtab shiftwidth=8 nosmarttab
// Copyright 2026 Digital Signage Bunny Corp. Use of this source code is
// governed by an MIT-style license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { z } from 'zod/v4';

export namespace RobustTask  {
	// ===== Task Status Types =====
	export const StatusValues = [
		'pending',	// Created but not started
		'running',	// Currently executing
		'succeeded',	// Completed successfully
		'failed',	// Completed with error
		'rejected',	// Failed without retry (e.g. validation error)
		'blocked',	// Waiting for previous task
		'skipped',	// Task will never execute
		'pending-paused',	// Execution paused
		'blocked-paused',	// Manually paused while waiting for previous task
	] as const;
	export type Status = (typeof StatusValues)[number];

	export type TerminalStatus = 'succeeded' | 'failed' | 'rejected' | 'skipped';
	export type ActiveStatus = 'pending' | 'running' | 'blocked' | 'pending-paused' | 'blocked-paused';
	export type PausedStatus = 'pending-paused' | 'blocked-paused';

	// ===== Task Structure =====

	export const ErrorInfoSchema = z.object({
		message: z.string(),
		code: z.string().optional(),
		stack: z.string().optional(),
		timestamp: z.iso.datetime(),
	});
	export interface ErrorInfo {
		readonly message: string;
		readonly code?: string;
		readonly stack?: string;
		readonly timestamp: string;
	}

	export const RejectionInfoSchema = z.object({
		reason: z.string(),
		issues: z.array(z.string()).optional(),
		timestamp: z.iso.datetime(),
	});
	export interface RejectionInfo {
		readonly reason: string;
		readonly issues?: string[];
		readonly timestamp: string;
	}

	export const TaskStateSchema = z.object({
		status: z.enum(StatusValues),
		createdAt: z.iso.datetime(),
		startedAt: z.iso.datetime().optional(),
		updatedAt: z.iso.datetime().optional(),
		finishedAt: z.iso.datetime().optional(),
		attempts: z.number(),
		runtimeToken: z.string().optional(),
		progress: z.unknown().optional(),
		result: z.unknown().optional(),
		error: ErrorInfoSchema.optional(),
		rejection: RejectionInfoSchema.optional(),
	});
	export interface TaskState<TProgress = unknown, TResult = unknown> {
		readonly status: Status;
		readonly createdAt: string;
		readonly startedAt?: string;
		readonly updatedAt?: string;
		readonly finishedAt?: string;
		readonly attempts: number;
		readonly runtimeToken?: string;
		readonly progress?: TProgress;
		readonly result?: TResult;
		readonly error?: ErrorInfo;
		readonly rejection?: RejectionInfo;
	}

	// ===== Type Guards =====

	export function isTerminal(status: Status): status is TerminalStatus {
		return status === 'succeeded' || status === 'failed' || status === 'rejected' || status === 'skipped';
	}

	export function isActive(status: Status): status is ActiveStatus {
		return status === 'pending' || status === 'running' || status === 'blocked' || status === 'pending-paused' || status === 'blocked-paused';
	}

	export function isPaused(status: Status): status is PausedStatus {
		return status === 'pending-paused' || status === 'blocked-paused';
	}
}
