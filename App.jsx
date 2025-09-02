import { useState, useEffect } from "react";

const lectureSubjects = [
  "MA111 - Real Analysis and Calculus",
  "CY121 - Inorganic & Physical Chemistry",
  "ECE102 - Fundamentals of Electronics Engg.",
  "PY111 - Classical Physics",
];

const optionalSubject = "LM101 - Basic English";

const labSubjects = [
  "ECE101 - Electronics Engg. Work Practices",
  "EEV101 - Electrical Engg. Work Practices",
  "ECE102L - Electronics Engg. Lab",
  "PY111L - Physics Lab",
  "CY121L - Chemistry Lab",
  "ME131 - Workshop Practices",
];

function App() {
  const [includeEnglish, setIncludeEnglish] = useState(true);

  const subjects = includeEnglish
    ? [...lectureSubjects, optionalSubject, ...labSubjects]
    : [...lectureSubjects, ...labSubjects];

  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem("attendance");
    if (saved) return JSON.parse(saved);
    return [...lectureSubjects, optionalSubject, ...labSubjects].reduce(
      (acc, sub) => {
        acc[sub] = { present: 0, total: 0 };
        return acc;
      },
      {}
    );
  });

  useEffect(() => {
    localStorage.setItem("attendance", JSON.stringify(attendance));
  }, [attendance]);

  const markAttendance = (subject, present) => {
    setAttendance((prev) => ({
      ...prev,
      [subject]: {
        present: prev[subject].present + (present ? 1 : 0),
        total: prev[subject].total + 1,
      },
    }));
  };

  const resetAttendance = () => {
    if (confirm("Are you sure you want to reset all attendance data?")) {
      const resetData = [...lectureSubjects, optionalSubject, ...labSubjects].reduce(
        (acc, sub) => {
          acc[sub] = { present: 0, total: 0 };
          return acc;
        },
        {}
      );
      setAttendance(resetData);
      localStorage.removeItem("attendance");
    }
  };

  const getTarget = (present, total) => {
    if (total === 0) return "No classes yet.";
    const percent = (present / total) * 100;
    if (percent >= 75) return "Safe! 🎉";
    let needed = 0;
    let tempPresent = present;
    let tempTotal = total;
    while ((tempPresent / tempTotal) * 100 < 75) {
      needed++;
      tempPresent++;
      tempTotal++;
    }
    return `You need ${needed} more classes in a row to reach 75%.`;
  };

  const SubjectCard = ({ sub }) => {
    const { present, total } = attendance[sub];
    const percent = total > 0 ? (present / total) * 100 : 0;
    return (
      <div className="mb-6 p-4 bg-white shadow rounded border border-gray-200">
        <h2 className="text-xl font-semibold">{sub}</h2>
        <p>{present}/{total} classes attended</p>
        <p className={percent < 75 ? "text-red-500" : "text-green-500"}>
          {percent.toFixed(1)}%
        </p>
        <p className="mt-1 text-sm text-gray-600">{getTarget(present, total)}</p>
        <div className="mt-2">
          <button
            onClick={() => markAttendance(sub, true)}
            className="mr-2 px-4 py-2 bg-green-500 text-white rounded"
          >
            Present
          </button>
          <button
            onClick={() => markAttendance(sub, false)}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Absent
          </button>
        </div>
      </div>
    );
  };

  const overallStats = () => {
    let totalPresent = 0;
    let totalClasses = 0;
    subjects.forEach((sub) => {
      totalPresent += attendance[sub].present;
      totalClasses += attendance[sub].total;
    });
    const percent = totalClasses > 0 ? (totalPresent / totalClasses) * 100 : 0;

    let message = "No classes yet.";
    if (totalClasses > 0) {
      if (percent >= 75) {
        message = "Safe! 🎉";
      } else {
        let needed = 0;
        let tempPresent = totalPresent;
        let tempTotal = totalClasses;
        while ((tempPresent / tempTotal) * 100 < 75) {
          needed++;
          tempPresent++;
          tempTotal++;
        }
        message = `You need ${needed} more classes in a row (overall) to reach 75%.`;
      }
    }

    return { totalPresent, totalClasses, percent, message };
  };

  const { totalPresent, totalClasses, percent, message } = overallStats();

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">RGIPT Attendance Tracker</h1>

      <div className="mb-6 p-4 bg-white shadow rounded border border-gray-300">
        <h2 className="text-xl font-semibold">📊 Overall Attendance</h2>
        <p>{totalPresent}/{totalClasses} total classes attended</p>
        <p className={percent < 75 ? "text-red-500" : "text-green-500"}>
          Overall: {percent.toFixed(1)}%
        </p>
        <p className="mt-1 text-sm text-gray-600">{message}</p>
      </div>

      <div className="mb-6">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={includeEnglish}
            onChange={() => setIncludeEnglish(!includeEnglish)}
          />
          <span>Include LM101 - Basic English</span>
        </label>
      </div>

      <button
        onClick={resetAttendance}
        className="mb-6 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-900"
      >
        Reset All Data
      </button>

      <h2 className="text-2xl font-bold mb-4">📚 Lectures</h2>
      {lectureSubjects.map((sub) => (
        <SubjectCard key={sub} sub={sub} />
      ))}
      {includeEnglish && <SubjectCard sub={optionalSubject} />}

      <h2 className="text-2xl font-bold mt-8 mb-4">🧪 Labs & Workshops</h2>
      {labSubjects.map((sub) => (
        <SubjectCard key={sub} sub={sub} />
      ))}
    </div>
  );
}

export default App;
