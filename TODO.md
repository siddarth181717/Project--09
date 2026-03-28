# Connect Backend to Frontend & Fix Workspace Issues

## Approved Plan Steps:

### 1. **Update frontend/app.js** (Replace mocks with API fetches)
   - loadDashboard(): fetch user/stats
   - loadCourses(): fetch courses
   - loadProgress(): fetch others/achievements  
   - loadCoursePlaylist(): fetch course video + modules (with completed status)
   - markAsWatched(): POST complete-module
   - completeCourse(): POST complete-course
   - Add error handling/loading

### 2. **Fix accessibility - frontend/index.html**
   - Add placeholder/aria-label to search input
   - Wrap cert checkboxes in proper <label>
   - Add title attribute to video iframe

### 3. **Fix CSS Safari support - frontend/app.css**
   - Add `-webkit-backdrop-filter` prefixes

### 4. **Backend setup & deps**
   - `pip install -r requirements.txt` (if needed)
   - Start server: `cd backend && python app.py`

### 5. **Testing & Verification**
   - Refresh frontend → real data loads from API
   - Test modal: load course modules, mark watched → points update
   - Complete course → bonus points
   - Check browser console, db updates

**Progress: 2/5 complete - app.js full API ✅ + Accessibility fixed ✅**

**Next step: Fix CSS Safari backdrop-filter**

