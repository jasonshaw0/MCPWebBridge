# Repo Steward Report - 2025-01-27

## Current Workspace Analysis

### Expected Layout vs Actual
**Expected:** `/extension`, `/dev`, `/docs`, `/reports`, `/test`
**Actual:** Root-level files + `/background`, `/content`, `/docs`, `/image`, `/scripts`

### Issues Identified

#### 1. **Critical Layout Violation**
- Extension files are at root level instead of `/extension/` directory
- Files that should be in `/extension/`: `manifest.json`, `background.js`, `content.js`, `/background/`, `/content/`
- This breaks the documented setup instructions

#### 2. **Documentation Reference Mismatch**
- `docs/SETUP.md` instructs: "select the repository root" for load unpacked
- `README.md` instructs: "select this repository root folder" 
- Both are incorrect - should reference `/extension/` directory

#### 3. **Missing Expected Directories**
- `/dev/` - missing (for development assets)
- `/reports/` - missing (for agent outputs)
- `/test/` - missing (for test files)
- `/extension/` - missing (for runtime files)

#### 4. **Stray Files Analysis**
- `image/README/1756949498859.png` - appears to be documentation asset, should move to `/docs/` or `/dev/`
- `scripts/mcp-localdev.js` - development script, should move to `/dev/`
- `docs/logs and outdated/` - contains duplicate/outdated files that should be cleaned up

#### 5. **Duplicate Documentation**
- `docs/logs and outdated/DECISIONS.md` vs `docs/DECISIONS.md`
- `docs/logs and outdated/DESIGN.md` vs `docs/DESIGN.md`
- These should be consolidated or clearly marked as deprecated

### Recommended Actions

#### High Priority (Layout Compliance)
1. Create `/extension/` directory
2. Move `manifest.json`, `background.js`, `content.js`, `/background/`, `/content/` to `/extension/`
3. Update all documentation to reference "Load unpacked from `/extension/`"

#### Medium Priority (Organization)
1. Create `/dev/` directory and move `scripts/mcp-localdev.js` there
2. Create `/reports/` directory for agent outputs
3. Create `/test/` directory for future test files
4. Move `image/README/1756949498859.png` to appropriate location

#### Low Priority (Cleanup)
1. Review and consolidate duplicate documentation in `docs/logs and outdated/`
2. Consider archiving or removing outdated files

### Constraints Check
- ✅ No permission changes required
- ✅ No logic changes required  
- ✅ No `.cursorrules` conflicts identified
- ✅ Safe to proceed with mechanical file moves

### Next Steps
1. Create branch `agent/steward/tidy-2025-01-27`
2. Apply the high-priority layout changes
3. Update documentation references
4. Open PR with steward checklist

### Ambiguities
- Purpose of `image/README/1756949498859.png` unclear - needs context to determine proper location
- Whether `docs/logs and outdated/` should be archived or cleaned up needs decision