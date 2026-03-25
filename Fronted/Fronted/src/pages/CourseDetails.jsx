import { useEffect, useMemo, useState } from "react";
import api from "../api";

function Notice({ type = "info", message, onClose }) {
  if (!message) return null;
  return (
    <div className={`notice notice-${type}`}>
      <p>{message}</p>
      <button type="button" onClick={onClose} aria-label="Close notice">
        ✕
      </button>
    </div>
  );
}

export default function CourseDetails({ courseId, onBack, onLogout }) {
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonOrder, setLessonOrder] = useState(1);

  const nextOrder = useMemo(() => (lessons?.length || 0) + 1, [lessons]);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const summary = await api.get(`/api/courses/${courseId}/summary`);
      setCourse(summary.data);

      const res = await api.get(`/api/courses/${courseId}/lessons`);
      setLessons(res.data || []);
      setLessonOrder((res.data?.length || 0) + 1);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  }

  async function createLesson() {
    setError("");
    setSuccess("");
    if (!lessonTitle.trim()) return setError("Lesson title is required");

    if(!lessonDescription.trim()) return setError("Lesson description is required");

    try {
      await api.post(`/api/courses/${courseId}/lessons`, {
        title: lessonTitle.trim(),
        description: lessonDescription.trim(),
        order: Number(lessonOrder),
      });
      setLessonTitle("");
      setLessonDescription("");
      setSuccess("Lesson created.");
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create lesson");
    }
  }

  async function updateLesson(lessonId, title, lessondescription, order) {
    setError("");
    setSuccess("");
    try {
      await api.put(`/api/lessons/${lessonId}`, {
        title,
        lessondescription,
        order: Number(order),
      });
      setSuccess("Lesson updated.");
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update lesson");
    }
  }

  async function deleteLesson(lessonId) {
    setError("");
    setSuccess("");
    try {
      await api.delete(`/api/lessons/${lessonId}`);
      setSuccess("Lesson deleted.");
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete lesson");
    }
  }

  async function moveUp(lessonId) {
    setError("");
    setSuccess("");
    try {
      await api.patch(`/api/lessons/${lessonId}/move-up`);
      setSuccess("Lesson moved up.");
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Move up failed");
    }
  }

  async function moveDown(lessonId) {
    setError("");
    setSuccess("");
    try {
      await api.patch(`/api/lessons/${lessonId}/move-down`);
      setSuccess("Lesson moved down.");
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Move down failed");
    }
  }

  useEffect(() => {
    loadAll();
  }, [courseId]);

  return (
    <div className="app-shell fade-in">
      <div className="dashboard-shell">
        <header className="page-header">
          <div>
            <div className="auth-badge">🎓 Course details</div>
            <h1 className="page-title">Lesson editor workspace</h1>
            <div className="page-subtitle">
              Manage lesson order, edits and content updates in a more focused
              layout.
            </div>
          </div>
          <div className="row-wrap">
            <button className="btn-ghost" onClick={onBack}>
              Back
            </button>
            <button className="btn-secondary" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        {course && (
          <section className="metric-grid panel glass-card slide-up">
            <div className="metric-card">
              <div className="metric-label">Course</div>
              <div className="metric-value" style={{ fontSize: "1.25rem" }}>
                {course.title}
              </div>
              <div className="helper-text" style={{ marginTop: 6 }}>
                Main course summary
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Status</div>
              <div className="metric-value" style={{ fontSize: "1.25rem" }}>
                {course.status}
              </div>
              <div className="helper-text" style={{ marginTop: 6 }}>
                Publication state
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Lessons</div>
              <div className="metric-value">{course.totalLessons}</div>
              <div className="helper-text" style={{ marginTop: 6 }}>
                Last update{" "}
                {course.lastModification
                  ? new Date(course.lastModification).toLocaleString()
                  : "-"}
              </div>
            </div>
          </section>
        )}

        <section className="panel glass-card slide-up">
          <div className="page-header" style={{ marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0 }}>Create lesson</h3>
              <div className="helper-text" style={{ marginTop: 6 }}>
                Add new content blocks and control the order from the start.
              </div>
            </div>
            <div className="badge">Suggested order: {nextOrder}</div>
          </div>

          <div className="row-wrap">
            <input
              className="input"
              placeholder="Lesson title..."
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
            />
             <input
              className="input"
              placeholder="Lesson description..."
              value={lessonDescription}
              onChange={(e) => setLessonDescription(e.target.value)}
            />
            <input
              className="input"
              type="number"
              min={1}
              style={{ maxWidth: 140 }}
              value={lessonOrder}
              onChange={(e) => setLessonOrder(e.target.value)}
            />
           
            <button className="btn" onClick={createLesson}>
              Add lesson
            </button>
          </div>

          <div style={{ marginTop: 18 }}>
            <Notice type="error" message={error} onClose={() => setError("")} />
            <Notice
              type="success"
              message={success}
              onClose={() => setSuccess("")}
            />
          </div>
        </section>

        <section className="panel glass-card slide-up">
          <div className="page-header" style={{ marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0 }}>Lesson list</h3>
              <div className="helper-text" style={{ marginTop: 6 }}>
                Edit titles, reorder items and remove lessons with immediate
                feedback.
              </div>
            </div>
            <div className="badge">{lessons.length} lesson(s)</div>
          </div>

          {loading ? (
            <div className="empty-state">Loading course information...</div>
          ) : !course ? (
            <div className="empty-state">Course not found.</div>
          ) : lessons.length === 0 ? (
            <div className="empty-state">
              No lessons yet. Add your first lesson above.
            </div>
          ) : (
            <div className="list-grid">
              {lessons.map((lesson) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  onMoveUp={() => moveUp(lesson.id)}
                  onMoveDown={() => moveDown(lesson.id)}
                  onDelete={() => deleteLesson(lesson.id)}
                  onSave={(title, order) =>
                    updateLesson(lesson.id, title, order)
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function LessonRow({ lesson, onMoveUp, onMoveDown, onDelete, onSave }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [order, setOrder] = useState(lesson.order);

  useEffect(() => {
    setTitle(lesson.title);
    setOrder(lesson.order);
  }, [lesson.title, lesson.order]);

  async function save() {
    const nextTitle = title.trim();
    if (!nextTitle) return;
    await onSave(nextTitle, order);
    setEditing(false);
  }

  return (
    <div className="lesson-card slide-up">
      <div className="card-top">
        <div style={{ flex: 1 }}>
          {editing ? (
            <div className="row-wrap">
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input type="input" />
              <input
                className="input"
                placeholder="Lesson description..."
                value={lessonDescription}
                onChange={(e) => setLessonDescription(e.target.value)}
              />
              <input
                className="input"
                type="number"
                min={1}
                style={{ maxWidth: 110 }}
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              />
            </div>
          ) : (
            <>
              <h4 className="card-title">
                {lesson.order}. {lesson.title}
              </h4>
              <div className="helper-text" style={{ marginTop: 6 }}>
                Updated{" "}
                {lesson.updatedAt
                  ? new Date(lesson.updatedAt).toLocaleString()
                  : "-"}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="course-actions">
        {editing ? (
          <>
            <button className="btn btn-sm" onClick={save}>
              Save
            </button>
            <button
              className="btn-ghost btn-sm"
              onClick={() => {
                setTitle(lesson.title);
                setLessonDescription(lesson.description);
                setOrder(lesson.order);
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              className="btn-ghost btn-sm"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
            <button className="btn-ghost btn-sm" onClick={onMoveUp}>
              Move up
            </button>
            <button className="btn-ghost btn-sm" onClick={onMoveDown}>
              Move down
            </button>
            <button className="btn-danger btn-sm" onClick={onDelete}>
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
