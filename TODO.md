# EduLeap LMS Deployment TODO

## Phase 1: Clean Up ✅ [PARTIAL]
- [x] Delete `database.db` ✅
- [x] Delete `TODO-FUNCTIONALITY.md` ✅
- [ ] Delete `eduleap-lms/` (legacy - will overwrite)
- [ ] Delete `instance/` (PowerShell pending)

## Phase 2: Restructure ✅ [IN PROGRESS]
- [ ] Move `backend/app.py` → `eduleap-lms/app.py`

## Phase 2: Restructure ✅ [PENDING]
- [ ] Move `backend/app.py` → `eduleap-lms/app.py`
- [ ] Create `eduleap-lms/static/` → move `frontend/*`
- [ ] Copy `eduleap.db` → `eduleap-lms/`

## Phase 3: Deployment Files ✅ [PENDING]
- [ ] Create `eduleap-lms/requirements.txt`
- [ ] Update `eduleap-lms/app.py` (add static_folder)
- [ ] Create `eduleap-lms/run.py` (production runner)
- [ ] Create `eduleap-lms/README.md` (deploy instructions)

## Phase 4: Test ✅ [PENDING]
- [ ] `cd eduleap-lms && pip install -r requirements.txt`
- [ ] `python run.py`
- [ ] Test: http://localhost:5000 + /api/courses

## Phase 5: Deploy ✅ [PENDING]
- [ ] Heroku/PythonAnywhere instructions in README

**Current Progress: Starting Phase 1**
