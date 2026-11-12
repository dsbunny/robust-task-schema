# Robust Task Schema
ZOD schema for the `@dsbunny/robust-task` interface.

All exported object schemas require an `@type` discriminator matching the
corresponding type name (for example, `TaskState`).

Use `RobustTask.normalizeTaskStateTypeTags` before parsing persisted task states
to add tags missing from legacy values; existing, incorrect tags are preserved
for schema validation to reject.
