import { useEffect, useMemo, useState } from "react";
import api from "../api";


function isDraftStatus(status) {
  if (typeof status === "number") return status === 0;
  if (typeof status === "string") return status.toLowerCase() === "draft";
  return false;
}

export default function Courses({ onOpenCourse, onLogout }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(""); 
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [newTitle, setNewTitle] = useState("");

  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalPages = useMemo(() => {
    const pages = Math.ceil(totalCount / pageSize);
    return pages <= 0 ? 1 : pages;
  }, [totalCount, pageSize]);

  async function loadCourses() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());

     
      if (status) params.set("status", status);

      params.set("page", String(page));
      params.set("pageSize", String(pageSize));

      const res = await api.get(`/api/courses/search?${params.toString()}`);
      setItems(res.data.items || []);
      setTotalCount(res.data.totalCount || 0);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  async function createCourse() {
    setError("");
    if (!newTitle.trim()) return setError("Title is required");

    try {
      await api.post("/api/courses", { title: newTitle.trim() });
      setNewTitle("");
      setPage(1);
      await loadCourses();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create course");
    }
  }

  async function updateCourse(courseId, title) {
    setError("");
    try {
      await api.put(`/api/courses/${courseId}`, { title });
      await loadCourses();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update course");
    }
  }

  async function deleteCourse(courseId) {
    setError("");
    try {
      await api.delete(`/api/courses/${courseId}`);
      await loadCourses();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete course");
    }
  }

  async function publish(courseId) {
    setError("");
    try {
      await api.patch(`/api/courses/${courseId}/publish`);
      await loadCourses();
    } catch (err) {
      setError(err?.response?.data?.message || "Publish failed");
    }
  }

  async function unpublish(courseId) {
    setError("");
    try {
      await api.patch(`/api/courses/${courseId}/unpublish`);
      await loadCourses();
    } catch (err) {
      setError(err?.response?.data?.message || "Unpublish failed");
    }
  }

  useEffect(() => {
    loadCourses();
    
  }, [page, pageSize]);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={{ fontWeight: 800 }}>Courses</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            Draft ↔ Published (enum-safe)
          </div>
        </div>
        <button style={styles.btn} onClick={onLogout}>
          Logout
        </button>
      </header>

      {error && <div style={styles.error}>{error}</div>}

      <section style={styles.card}>
        <div style={styles.row}>
          <input
            style={styles.input}
            placeholder="Search (q)..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <select
            style={styles.input}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
          </select>

          <button
            style={styles.btn}
            onClick={() => {
              setPage(1);
              loadCourses();
            }}
          >
            Search
          </button>
        </div>

        <div style={{ ...styles.row, marginTop: 10 }}>
          <input
            style={styles.input}
            placeholder="New course title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button style={styles.btn} onClick={createCourse}>
            Create
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          {loading ? (
            <div style={{ opacity: 0.7 }}>Loading...</div>
          ) : items.length === 0 ? (
            <div style={{ opacity: 0.7 }}>No courses found</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {items.map((c) => (
                <CourseItem
                  key={c.id}
                  course={c}
                  onOpen={() => onOpenCourse(c.id)}
                  onPublish={() => publish(c.id)}
                  onUnpublish={() => unpublish(c.id)}
                  onDelete={() => deleteCourse(c.id)}
                  onRename={(t) => updateCourse(c.id, t)}
                />
              ))}
            </div>
          )}
        </div>

        <div style={styles.pager}>
          <button
            style={styles.btnSmall}
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>

          <div style={{ fontSize: 12, opacity: 0.8 }}>
            Page {page} / {totalPages} — Total {totalCount}
          </div>

          <button
            style={styles.btnSmall}
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>

          <select
            style={styles.inputSmall}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </section>
    </div>
  );
}

function CourseItem({
  course,
  onOpen,
  onPublish,
  onUnpublish,
  onDelete,
  onRename,
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(course.title);

  useEffect(() => setTitle(course.title), [course.title]);

  async function save() {
    const t = title.trim();
    if (!t) return;
    await onRename(t);
    setEditing(false);
  }

  const isDraft = isDraftStatus(course.status);

  return (
    <div style={styles.item}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div style={{ flex: 1 }}>
          {editing ? (
            <input
              style={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
            />
          ) : (
            <div style={{ fontWeight: 800 }}>
              {course.title}{" "}
              <span style={{ fontSize: 12, opacity: 0.7 }}>
                ({isDraft ? "Draft" : "Published"})
              </span>
            </div>
          )}

          <div style={{ fontSize: 12, opacity: 0.7 }}>
            Lessons: {course.totalLessons}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <button style={styles.btnSmall} onClick={onOpen}>
            Open
          </button>

          {isDraft ? (
            <button style={styles.btnSmall} onClick={onPublish}>
              Publish
            </button>
          ) : (
            <button style={styles.btnSmall} onClick={onUnpublish}>
              Unpublish
            </button>
          )}

          {!editing ? (
            <button style={styles.btnSmall} onClick={() => setEditing(true)}>
              Edit
            </button>
          ) : (
            <>
              <button style={styles.btnSmall} onClick={save}>
                Save
              </button>
              <button
                style={styles.btnSmall}
                onClick={() => {
                  setEditing(false);
                  setTitle(course.title);
                }}
              >
                Cancel
              </button>
            </>
          )}

          <button style={styles.btnSmallDanger} onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0b1220",
    color: "#e6eefc",
    padding: 16,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  card: {
    background: "#121a2b",
    border: "1px solid #25324a",
    borderRadius: 12,
    padding: 12,
  },
  row: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },
  input: {
    flex: 1,
    minWidth: 180,
    padding: 10,
    borderRadius: 10,
    border: "1px solid #25324a",
    background: "#0f1726",
    color: "#e6eefc",
    outline: "none",
  },
  inputSmall: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #25324a",
    background: "#0f1726",
    color: "#e6eefc",
    outline: "none",
  },
  btn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #2c3f66",
    background: "#1e2b44",
    color: "#e6eefc",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  btnSmall: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #2c3f66",
    background: "#1e2b44",
    color: "#e6eefc",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontSize: 12,
  },
  btnSmallDanger: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #6b2b3c",
    background: "#2b1620",
    color: "#ffd1dc",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontSize: 12,
  },
  item: {
    padding: 10,
    borderRadius: 12,
    border: "1px solid #25324a",
    background: "#0f1726",
  },
  pager: {
    marginTop: 12,
    display: "flex",
    gap: 8,
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  error: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 12,
    background: "#2b1620",
    border: "1px solid #6b2b3c",
    color: "#ffd1dc",
  },
};
