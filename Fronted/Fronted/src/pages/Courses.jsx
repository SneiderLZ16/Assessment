import { useEffect, useMemo, useState } from "react";
import api from "../api";

function isDraftStatus(status) {
  if (typeof status === "number") return status === 0;
  if (typeof status === "string") return status.toLowerCase() === "draft";
  return false;
}

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

function MetricCard({ label, value, hint }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="helper-text" style={{ marginTop: 4 }}>
        {hint}
      </div>
    </div>
  );
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
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [totalCount, pageSize],
  );

  const draftCount = useMemo(
    () => items.filter((item) => isDraftStatus(item.status)).length,
    [items],
  );

  const publishedCount = useMemo(
    () => items.filter((item) => !isDraftStatus(item.status)).length,
    [items],
  );

  async function loadCourses() {
    setLoading(true);
    setError("");

    try {
      const params = { page, pageSize };
      if (status) params.status = status;

      const res = await api.get("/api/courses/search", { params });
      const raw = res.data;
      const normalized = Array.isArray(raw)
        ? { items: raw, totalCount: raw.length }
        : {
            items: raw.items ?? [],
            totalCount: raw.totalCount ?? 0,
          };

      let nextItems = normalized.items;
      if (q.trim()) {
        const term = q.trim().toLowerCase();
        nextItems = nextItems.filter((course) =>
          course.title?.toLowerCase().includes(term),
        );
      }

      setItems(nextItems);
      setTotalCount(normalized.totalCount);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  async function createCourse() {
    setError("");
    setSuccess("");
    if (!newTitle.trim()) return setError("Course title is required");
    
    if(!newDescription.trim()) return setError("Course description is required");

    try {
      await api.post("/api/courses", { title: newTitle.trim(), description: newDescription.trim() });
      setNewTitle("");
      setNewDescription("");
      setSuccess("Course created successfully.");
      await loadCourses();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create course");
    }
  }

  async function publish(id) {
    setBusyId(id);
    setError("");
    setSuccess("");
    try {
      await api.patch(`/api/courses/${id}/publish`);
      setSuccess("Course published.");
      await loadCourses();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to publish course");
    } finally {
      setBusyId(null);
    }
  }

  async function unpublish(id) {
    setBusyId(id);
    setError("");
    setSuccess("");
    try {
      await api.patch(`/api/courses/${id}/unpublish`);
      setSuccess("Course moved back to draft.");
      await loadCourses();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to unpublish course");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteCourse(id) {
    setBusyId(id);
    setError("");
    setSuccess("");
    try {
      await api.delete(`/api/courses/${id}`);
      setSuccess("Course removed successfully.");
      await loadCourses();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete course");
    } finally {
      setBusyId(null);
    }
  }

  async function renameCourse(id, title) {
    setBusyId(id);
    setError("");
    setSuccess("");
    try {
      await api.put(`/api/courses/${id}`, { title });
      setSuccess("Course updated.");
      await loadCourses();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update course");
    } finally {
      setBusyId(null);
    }
  }

  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, status]);

  return (
    <div className="app-shell fade-in">
      <div className="dashboard-shell">
        <header className="page-header">
          <div>
            <div className="auth-badge">🚀 Professional workspace</div>
            <h1 className="page-title">Course management dashboard</h1>
            <div className="page-subtitle">
              Create, refine and publish learning content with better visibility
              and smoother controls.
            </div>
          </div>

          <div className="row-wrap">
            <div className="badge">
              Page {page} / {totalPages}
            </div>
            <button className="btn-secondary" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="metric-grid slide-up">
          <MetricCard
            label="Visible courses"
            value={totalCount}
            hint="Results returned by current query"
          />
          <MetricCard
            label="Drafts in page"
            value={draftCount}
            hint="Still private and editable"
          />
          <MetricCard
            label="Published in page"
            value={publishedCount}
            hint="Ready to be consumed"
          />
        </section>

        <section className="panel glass-card slide-up">
          <div className="grid-2 dashboard-top-grid">
            <div className="form-stack">
              <div>
                <h3 style={{ margin: 0 }}>Explore courses</h3>
                <div className="helper-text" style={{ marginTop: 6 }}>
                  Search faster and filter by publication status.
                </div>
              </div>

              <div className="row-wrap">
                <input
                  className="input"
                  placeholder="Search courses..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <select
                  className="select"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                  style={{ maxWidth: 200 }}
                >
                  <option value="">All statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
                <button
                  className="btn"
                  onClick={() => {
                    setPage(1);
                    loadCourses();
                  }}
                >
                  Search
                </button>
              </div>
            </div>

            <div className="form-stack">
              <div>
                <h3 style={{ margin: 0 }}>Create a new course</h3>
                <div className="helper-text" style={{ marginTop: 6 }}>
                  Drafts stay editable until you decide to publish.
                </div>
              </div>

              <div className="row-wrap">
                <input
                  className="input"
                  placeholder="New course title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <button className="btn" onClick={createCourse}>
                  Create
                </button>
              </div>
            </div>
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
              <h3 style={{ margin: 0 }}>Your courses</h3>
              <div className="helper-text" style={{ marginTop: 6 }}>
                Open details, rename courses, publish drafts or remove outdated
                content.
              </div>
            </div>
            <div className="badge">Total records: {totalCount}</div>
          </div>

          {loading ? (
            <div className="empty-state">Loading courses...</div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              No courses found with the current filters.
            </div>
          ) : (
            <div className="list-grid">
              {items.map((course) => (
                <CourseItem
                  key={course.id}
                  course={course}
                  onOpen={() => onOpenCourse(course.id)}
                  onPublish={() => publish(course.id)}
                  onUnpublish={() => unpublish(course.id)}
                  onDelete={() => deleteCourse(course.id)}
                  onRename={(title) => renameCourse(course.id, title)}
                  busy={busyId === course.id}
                />
              ))}
            </div>
          )}

          <div className="pagination-bar">
            <div className="row-wrap">
              <button
                className="btn-ghost btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                className="btn-ghost btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>

            <div className="row-wrap">
              <span className="helper-text">Rows per page</span>
              <select
                className="select"
                style={{ width: 100 }}
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
          </div>
        </section>
      </div>
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
  busy,
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(course.title);

  useEffect(() => {
    setTitle(course.title);
  }, [course.title]);

  const draft = isDraftStatus(course.status);

  async function handleSave() {
    const next = title.trim();
    if (!next) return;
    await onRename(next);
    setEditing(false);
  }

  return (
    <div className="course-card">
      <div className="card-top">
        <div style={{ flex: 1 }}>
          {editing ? (
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Course title"
            />
          ) : (
            <>
              <h4 className="card-title">{course.title}</h4>
              <div className="row-wrap" style={{ marginTop: 10 }}>
                <span
                  className={`badge ${draft ? "badge-warning" : "badge-success"}`}
                >
                  {draft ? "Draft" : "Published"}
                </span>
                <span className="helper-text">
                  {course.totalLessons} lessons
                </span>
              </div>
            </>
          )}
        </div>

        <div className="helper-text">
          Updated{" "}
          {course.updatedAt
            ? new Date(course.updatedAt).toLocaleDateString()
            : "-"}
        </div>
      </div>

      <div className="course-actions">
        {editing ? (
          <>
            <button className="btn btn-sm" disabled={busy} onClick={handleSave}>
              Save
            </button>
            <button
              className="btn-ghost btn-sm"
              disabled={busy}
              onClick={() => {
                setTitle(course.title);
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
              disabled={busy}
              onClick={onOpen}
            >
              Open
            </button>
            <button
              className="btn-ghost btn-sm"
              disabled={busy}
              onClick={() => setEditing(true)}
            >
              Rename
            </button>
            {draft ? (
              <button
                className="btn-success btn-sm"
                disabled={busy}
                onClick={onPublish}
              >
                Publish
              </button>
            ) : (
              <button
                className="btn-warning btn-sm"
                disabled={busy}
                onClick={onUnpublish}
              >
                Unpublish
              </button>
            )}
            <button
              className="btn-danger btn-sm"
              disabled={busy}
              onClick={onDelete}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
