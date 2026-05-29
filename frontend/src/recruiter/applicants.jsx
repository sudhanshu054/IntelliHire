import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { usercontext } from "../appcontext.jsx";
import Styles from "./recruiter.module.css";
import { BrandNav } from "../ui.jsx";

function RecruiterApplicants() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { role, serviceURL } = useContext(usercontext);
  const [isloading, setisloading] = useState(true);
  const [apps, setapps] = useState([]);

  useEffect(() => {
    if (role !== "RECRUITER") {
      navigate("/");
      return;
    }
    setisloading(true);
    fetch(`${serviceURL}/recruiter/jobs/${jobId}/applications`, { method: "get", credentials: "include" })
      .then((response) => {
        if (response.ok) return response.json();
        return response.text().then((t) => {
          throw new Error(t || "Failed to load applicants");
        });
      })
      .then((data) => setapps(Array.isArray(data) ? data : []))
      .catch((err) => toast.error(err.message || "Network error"))
      .finally(() => setisloading(false));
  }, [jobId, role, navigate, serviceURL]);

  if (role !== "RECRUITER") {
    return null;
  }

  return (
    <div className={Styles.page}>
      <BrandNav active="Candidates" recruiter userInitial="JD" />
      <main className={Styles.main}>
      <div className={Styles.topbar}>
        <div>
          <h1 className={Styles.title}>Applicants</h1>
          <p className={Styles.subtle}>Evaluate resume quality and role-fit signals for each candidate.</p>
        </div>
        <button className={Styles.btnGhost} onClick={() => navigate("/recruiter/jobs")}>
          Back
        </button>
      </div>

      {isloading ? (
        <p className={Styles.subtle}>Loading...</p>
      ) : apps.length === 0 ? (
        <p className={Styles.subtle}>No applications yet.</p>
      ) : (
        <div className={Styles.list}>
          {apps.map((a) => (
            <div key={`${a.seekerEmail}-${a.appliedAt || ""}`} className={Styles.listCard}>
              <div className={Styles.row}>
                <h3>{a.seekerUsername}</h3>
                <div className={Styles.subtle}>{a.seekerEmail}</div>
              </div>
              {a.lastResumeAnalysis ? (
                <div className={Styles.desc}>
                  <div><b>ATS score</b>: {a.lastResumeAnalysis.score} / 100</div>
                  <div><b>Optimization</b>: {a.lastResumeAnalysis.atsoptimizationscore} / 100</div>
                  <div><b>Target roles</b>: {a.lastResumeAnalysis.roles}</div>
                </div>
              ) : (
                <div className={Styles.desc}>No resume analysis found for this applicant yet.</div>
              )}
            </div>
          ))}
        </div>
      )}
      </main>
    </div>
  );
}

export default RecruiterApplicants;

