// vim: tabstop=8 softtabstop=0 noexpandtab shiftwidth=8 nosmarttab
// Copyright 2026 Digital Signage Bunny Corp. Use of this source code is
// governed by an MIT-style license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import * as z from 'zod';
import { dsbunnyRegistry } from '@dsbunny/zod-registry';

export namespace RobustTask  {
	// ===== Task Status Types =====
	export const StatusValues = [
		'pending',			// Created but not started
		'running',			// Currently executing
		'succeeded',			// Completed successfully
		'failed',			// Completed with error
		'rejected',			// Failed without retry (e.g. validation error)
		'blocked-dependency',		// Waiting for previous task
		'blocked-input',		// Waiting for external input
		'skipped',			// Task will never execute
		'pending-paused',		// Execution paused
		'blocked-dependency-paused',	// Manually paused while waiting for previous task
		'blocked-input-paused',		// Manually paused while waiting for external input
	] as const;
	export type Status = (typeof StatusValues)[number];

	export type TerminalStatus = 'succeeded' | 'failed' | 'rejected' | 'skipped';
	export type ActiveStatus = 'pending' | 'running' | 'blocked-dependency' | 'blocked-input' | 'pending-paused' | 'blocked-dependency-paused' | 'blocked-input-paused';
	export type PausedStatus = 'pending-paused' | 'blocked-dependency-paused' | 'blocked-input-paused';

	// ===== Task Structure =====

	export const ErrorInfoSchema = z.object({
		'@type': z.literal('ErrorInfo'),
		message: z.string(),
		code: z.string().optional(),
		stack: z.string().optional(),
		timestamp: z.iso.datetime(),
	}).register(dsbunnyRegistry, {
		id: 'ErrorInfoSchema',
		description: 'The schema for error information related to task execution',
	});
	export interface ErrorInfo {
		readonly '@type': 'ErrorInfo';
		readonly message: string;
		readonly code?: string;
		readonly stack?: string;
		readonly timestamp: string;
	};

	export const RejectionInfoSchema = z.object({
		'@type': z.literal('RejectionInfo'),
		reason: z.string(),
		issues: z.array(z.string()).optional(),
		timestamp: z.iso.datetime(),
	}).register(dsbunnyRegistry, {
		id: 'RejectionInfoSchema',
		description: 'The schema for rejection information related to task execution',
	});
	export interface RejectionInfo {
		readonly '@type': 'RejectionInfo';
		readonly reason: string;
		readonly issues?: string[];
		readonly timestamp: string;
	}

	export const TaskConfigSchema = z.object({
		'@type': z.literal('TaskConfig'),
		timeoutMs: z.number(),
		maxAttempts: z.number(),
	}).register(dsbunnyRegistry, {
		id: 'TaskConfigSchema',
		description: 'The schema for task configuration',
	});
	export interface TaskConfig {
		readonly '@type': 'TaskConfig';
		readonly timeoutMs: number;
		readonly maxAttempts: number;
	};

	export const TaskStateSchema = z.object({
		'@type': z.literal('TaskState'),
		status: z.enum(StatusValues),
		createdAt: z.iso.datetime(),
		startedAt: z.iso.datetime().optional(),
		updatedAt: z.iso.datetime().optional(),
		finishedAt: z.iso.datetime().optional(),
		attempts: z.number(),
		runtimeToken: z.string().optional(),
		data: z.unknown().optional(),
		config: TaskConfigSchema.optional(),
		progress: z.unknown().optional(),
		result: z.unknown().optional(),
		error: ErrorInfoSchema.optional(),
		rejection: RejectionInfoSchema.optional(),
	}).register(dsbunnyRegistry, {
		id: 'TaskStateSchema',
		description: 'The schema for task state',
	});

	export function normalizeTaskStateTypeTags(value: unknown): unknown {
		const addTypeIfMissing = (input: unknown, type: string): unknown => {
			if(!input || typeof input !== 'object' || Array.isArray(input) || '@type' in input) {
				return input;
			}
			return { ...input, '@type': type };
		};
		const taggedState = addTypeIfMissing(value, 'TaskState');
		if(!taggedState || typeof taggedState !== 'object' || Array.isArray(taggedState)) {
			return taggedState;
		}
		const state = taggedState as Record<string, unknown>;
		return {
			...state,
			...(state.config !== undefined && { config: addTypeIfMissing(state.config, 'TaskConfig') }),
			...(state.error !== undefined && { error: addTypeIfMissing(state.error, 'ErrorInfo') }),
			...(state.rejection !== undefined && { rejection: addTypeIfMissing(state.rejection, 'RejectionInfo') }),
		};
	}

	export interface TaskState<TData = unknown, TConfig = unknown, TProgress = unknown, TResult = unknown> {
		readonly '@type': 'TaskState';
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
	};

	// ===== Type Guards =====

	export function isTerminal(status: Status): status is TerminalStatus {
		return status === 'succeeded' || status === 'failed' || status === 'rejected' || status === 'skipped';
	}

	export function isActive(status: Status): status is ActiveStatus {
		return status === 'pending' || status === 'running' || status === 'blocked-dependency' || status === 'blocked-input' || status === 'pending-paused' || status === 'blocked-dependency-paused' || status === 'blocked-input-paused';
	}

	export function isPaused(status: Status): status is PausedStatus {
		return status === 'pending-paused' || status === 'blocked-dependency-paused' || status === 'blocked-input-paused';
	}
}
