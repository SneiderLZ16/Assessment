import { useEffect, useMemo, useState } from "react";
import api from "../api";

export default function CourseDetails({ courseId, onBack, onLogout }) {
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    if (!lessonTitle.trim()) return setError("Lesson title is required");

    try {
      await api.post(`/api/courses/${courseId}/lessons`, {
        title: lessonTitle.trim(),
        order: Number(lessonOrder),
      });
      setLessonTitle("");
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create lesson");
    }
  }

  async function updateLesson(lessonId, title, order) {
    setError("");
    try {
      await api.put(`/api/lessons/${lessonId}`, { title, order: Number(order) });
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update lesson");
    }
  }

  async function deleteLesson(lessonId) {
    setError("");
    try {
      await api.delete(`/api/lessons/${lessonId}`);
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete lesson");
    }
  }

  async function moveUp(lessonId) {
    setError("");
    try {
      await api.patch(`/api/lessons/${lessonId}/move-up`);
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Move up failed");
    }
  }

  async function moveDown(lessonId) {
    setError("");
    try {
      await api.patch(`/api/lessons/${lessonId}/move-down`);
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Move down failed");
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={{ fontWeight: 800 }}>Course Details</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            Lessons CRUD + reorder (Up/Down)
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button style={styles.btn} onClick={onBack}>Back</button>
          <button style={styles.btn} onClick={onLogout}>Logout</button>
        </div>
      </header>

      {error && <div style={styles.error}>{error}</div>}

      <section style={styles.card}>
        {loading ? (
          <div style={{ opacity: 0.7 }}>Loading...</div>
        ) : !course ? (
          <div style={{ opacity: 0.7 }}>Course not found</div>
        ) : (
          <>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 900, fontSize: 18 }}>{course.title}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                Status: {course.status} — Lessons: {course.totalLessons}
              </div>
              {course.lastModification && (
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  Last modification: {new Date(course.lastModification).toLocaleString()}
                </div>
              )}
            </div>

            <div style={styles.row}>
              <input
                style={styles.input}
                placeholder="Lesson title..."
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
              />

              <input
                style={styles.input}
                type="number"
                min={1}
                placeholder={`Order (suggested ${nextOrder})`}
                value={lessonOrder}
                onChange={(e) => setLessonOrder(e.target.value)}
              />

              <button style={styles.btn} onClick={createLesson}>Add lesson</button>
            </div>

            <div style={{ marginTop: 12 }}>
              {lessons.length === 0 ? (
                <div style={{ opacity: 0.7 }}>No lessons yet</div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {lessons.map((l) => (
                    <LessonRow
                      key={l.id}
                      lesson={l}
                      onMoveUp={() => moveUp(l.id)}
                      onMoveDown={() => moveDown(l.id)}
                      onDelete={() => deleteLesson(l.id)}
                      onSave={(title, order) => updateLesson(l.id, title, order)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>
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
    const t = title.trim();
    if (!t) return;
    await onSave(t, order);
    setEditing(false);
  }

  return (
    <div style={styles.item}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div style={{ flex: 1 }}>
          {editing ? (
            <div style={styles.row}>
              <input style={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} />
              <input style={styles.input} type="number" min={1} value={order} onChange={(e) => setOrder(e.target.value)} />
            </div>
          ) : (
            <div style={{ fontWeight: 800 }}>
              #{lesson.order} — {lesson.title}
            </div>
          )}
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            Updated: {new Date(lesson.updatedAt).toLocaleString()}
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button style={styles.btnSmall} onClick={onMoveUp}>Up</button>
          <button style={styles.btnSmall} onClick={onMoveDown}>Down</button>

          {!editing ? (
            <button style={styles.btnSmall} onClick={() => setEditing(true)}>Edit</button>
          ) : (
            <>
              <button style={styles.btnSmall} onClick={save}>Save</button>
              <button style={styles.btnSmall} onClick={() => { setEditing(false); setTitle(lesson.title); setOrder(lesson.order); }}>
                Cancel
              </button>
            </>
          )}

          <button style={styles.btnSmallDanger} onClick={onDelete}>Delete</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#0b1220", color: "#e6eefc", padding: 16 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  card: { background: "#121a2b", border: "1px solid #25324a", borderRadius: 12, padding: 12 },
  row: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
  input: {
    flex: 1, minWidth: 180,
    padding: 10, borderRadius: 10, border: "1px solid #25324a",
    background: "#0f1726", color: "#e6eefc", outline: "none"
  },
  btn: {
    padding: "10px 12px", borderRadius: 10, border: "1px solid #2c3f66",
    background: "#1e2b44", color: "#e6eefc", cursor: "pointer", whiteSpace: "nowrap"
  },
  btnSmall: {
    padding: "8px 10px", borderRadius: 10, border: "1px solid #2c3f66",
    background: "#1e2b44", color: "#e6eefc", cursor: "pointer", whiteSpace: "nowrap", fontSize: 12
  },
  btnSmallDanger: {
    padding: "8px 10px", borderRadius: 10, border: "1px solid #6b2b3c",
    background: "#2b1620", color: "#ffd1dc", cursor: "pointer", whiteSpace: "nowrap", fontSize: 12
  },
  item: { padding: 10, borderRadius: 12, border: "1px solid #25324a", background: "#0f1726" },
  error: { marginBottom: 10, padding: 10, borderRadius: 12, background: "#2b1620", border: "1px solid #6b2b3c", color: "#ffd1dc" },
};
