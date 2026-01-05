import { useState } from "react";
import { clearToken } from "../auth";
import Courses from "./Courses";
import CourseDetails from "./CourseDetails";

export default function Dashboard({ onLogout }) {
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  function logout() {
    clearToken();
    onLogout();
  }

  if (selectedCourseId) {
    return (
      <CourseDetails
        courseId={selectedCourseId}
        onBack={() => setSelectedCourseId(null)}
        onLogout={logout}
      />
    );
  }

  return (
    <Courses
      onOpenCourse={(id) => setSelectedCourseId(id)}
      onLogout={logout}
    />
  );
}
