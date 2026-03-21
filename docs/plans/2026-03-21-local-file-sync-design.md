# Local File Sync Design

## Goal

Keep links and todos recoverable after browser cache or site data is cleared by adding optional local file persistence in addition to the existing `localStorage` storage.

## Decision

- Use a dual-mode model.
- Keep `localStorage` as the fast local runtime store.
- Add optional binding to a user-selected local JSON file.
- When file access is available and a file is bound, automatically sync database changes to that file.
- When file access is unavailable, keep the current manual import/export flow as the fallback path.

## Why This Approach

- It preserves the current architecture and avoids rewriting the entire storage flow.
- It reduces data-loss risk for normal use without making startup depend on file permissions.
- It works well in supported browsers over `http://localhost` while still degrading safely elsewhere.

## Scope

- Cover links, categories, todos, and existing plan data by syncing the full `state.db` payload.
- Add UI to bind a local file and manually trigger sync.
- Show sync status so users know whether data is protected by file persistence.
- Keep existing JSON import/export available.

## Out Of Scope

- Multi-file profiles
- Conflict resolution across multiple browser tabs or devices
- Automatic file watching and live reload from disk
- Cloud sync or remote backup

## Storage Model

- `state.db` remains the source of truth during runtime.
- `saveDb()` continues writing to `localStorage` first.
- File sync writes the same normalized database JSON to disk.
- Persist lightweight sync metadata separately so the app can remember sync state across sessions.

Suggested sync metadata:

```json
{
  "enabled": true,
  "lastSyncedAt": 0,
  "lastSyncStatus": "idle",
  "lastSyncError": ""
}
```

Note: file handles cannot be safely serialized everywhere, so the implementation should only persist what the platform supports and degrade gracefully when handle restoration fails.

## UX Design

### Entry Points

- Reuse the existing import/export area.
- Add actions for:
  - `绑定本地文件`
  - `立即同步`

### States

- Not supported:
  - Hide or disable auto-sync actions.
  - Explain that manual export remains available.
- Not bound:
  - Show a prompt to choose a local JSON file.
- Bound and healthy:
  - Show `已绑定本地文件` and the last sync time.
- Bound but failed:
  - Show `同步失败，请重新绑定` with a retry path.

### User Expectations

- Binding a file is explicit and user-driven.
- Daily edits should auto-sync without extra clicks after binding succeeds.
- Sync failures should not block normal editing.

## Write Flow

1. User changes links, todos, categories, or plan data.
2. Existing logic updates `state.db`.
3. `saveDb()` writes to `localStorage`.
4. If local file sync is enabled and writable, queue a file write.
5. On success, update sync status and timestamp.
6. On failure, keep local data, surface a toast, and mark sync state as failed.

## Load And Recovery Flow

1. App startup still loads from `localStorage` first for speed and simplicity.
2. If sync metadata exists and permissions are still valid, the UI can offer `从本地文件恢复` or `立即同步`.
3. Importing a JSON file continues using the current validation and normalization path.
4. A manual recovery path remains available even when automatic sync is unsupported.

## Error Handling

- User cancels file picker: do nothing and keep current state.
- Browser lacks File System Access API: show fallback guidance only.
- Permission lost or handle invalid: mark sync unavailable and ask user to rebind.
- File write fails: keep `localStorage` data intact and show a non-blocking failure toast.
- Invalid imported JSON: keep current validation behavior.

## Technical Notes

- Prefer using `window.showSaveFilePicker` or a compatible file handle flow when available.
- Keep all sync logic additive to the current storage system rather than replacing it.
- Avoid changing database shape unless necessary; if sync metadata is stored inside the main payload, normalization must handle missing fields safely.
- If file writes are triggered frequently, debounce or serialize them to avoid overlapping writes.

## Validation

- Confirm normal edits still persist in `localStorage`.
- Bind a local file, edit links and todos, and verify the JSON file updates.
- Reload the page and confirm data still appears.
- Simulate a failed write and confirm the UI reports failure without losing in-memory data.
- Confirm fallback behavior in environments without file system access support.

## Recommended Next Step

Implement the dual-mode sync in small slices:

1. sync metadata and helpers
2. bind/sync UI
3. automatic write integration with `saveDb()`
4. recovery and failure messaging
