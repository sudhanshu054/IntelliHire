import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { usercontext } from "../appcontext.jsx";
import Styles from "./recruiter.module.css";
import { BrandNav } from "../ui.jsx";

function RecruiterJobs() {
  const navigate = useNavigate();
  const { role, serviceURL } = useContext(usercontext);
  const [jobs, setjobs] = useState([]);
  const [isloading, setisloading] = useState(true);
  const [activeTab, setActiveTab] = useState("Active Jobs");

  useEffect(() => {
    if (role !== "RECRUITER") {
      navigate("/");
      return;
    }
    setisloading(true);
    fetch(`${serviceURL}/recruiter/jobs`, { method: "get", credentials: "include" })
      .then((response) => {
        if (response.ok) return response.json();
        return response.text().then((t) => {
          throw new Error(t || "Failed to load jobs");
        });
      })
      .then((data) => setjobs(Array.isArray(data) ? data : []))
      .catch((err) => toast.error(err.message || "Network error"))
      .finally(() => setisloading(false));
  }, [role, navigate, serviceURL]);

  if (role !== "RECRUITER") {
    return null;
  }

  return (
    <div className={Styles.page}>
      <BrandNav active="Jobs" recruiter userInitial="JD" />
      <main className={Styles.main}>
      <div className={Styles.topbar}>
        <div>
          <p className={Styles.subtle}>Recruitment Portal</p>
          <h1 className={Styles.title}>My Job Postings</h1>
          <p className={Styles.subtle}>Monitor openings and review candidate pipelines.</p>
        </div>
        <div className={Styles.actions}>
          <button className={Styles.btnPrimary} onClick={() => navigate("/recruiter/post-job")}>
            Post job
          </button>
          <button className={Styles.btnGhost} onClick={() => navigate("/")}>
            Back
          </button>
        </div>
      </div>
      <div className={Styles.tabs}>
        {["Active Jobs", "Drafts", "Closed"].map((tab) => (
          <button
            type="button"
            key={tab}
            className={activeTab === tab ? Styles.activeTab : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "Active Jobs" ? `Active Jobs (${jobs.length})` : tab}
          </button>
        ))}
      </div>
      {isloading ? (
        <p className={Styles.subtle}>Loading...</p>
      ) : activeTab !== "Active Jobs" ? (
        <section className={Styles.emptyPanel}>
          <div>
            <div className={Styles.emptyIcon}>[]</div>
            <h2>No {activeTab.toLowerCase()} yet.</h2>
            <p>{activeTab === "Drafts" ? "Draft job posting support is not enabled yet." : "Closed jobs will appear here when a posting is completed."}</p>
            <button className={Styles.btnGhost} onClick={() => setActiveTab("Active Jobs")}>View Active Jobs</button>
          </div>
        </section>
      ) : jobs.length === 0 ? (
        <section className={Styles.emptyPanel}>
          <div>
            <div className={Styles.emptyIcon}>[]</div>
            <h2>No jobs posted yet.</h2>
            <p>Get started by creating your first job posting to attract top talent for your organization.</p>
            <button className={Styles.btnGhost} onClick={() => navigate("/recruiter/post-job")}>Create First Listing</button>
          </div>
        </section>
      ) : (
        <div className={Styles.list}>
          {jobs.map((j) => (
            <div key={j.id} className={Styles.listCard}>
              <div className={Styles.row}>
                <h3>{j.title}</h3>
                <button
                  onClick={() => navigate(`/recruiter/jobs/${j.id}/applications`)}
                  className={Styles.btnGhost}
                >
                  Applicants
                </button>
              </div>
              <div className={Styles.metaRow}>
                <span>{j.companyName || "Company N/A"}</span>
                <span>{j.location || "Location N/A"}</span>
                <span>{j.workMode || "Mode N/A"}</span>
                <span>{j.employmentType || "Type N/A"}</span>
                <span>{j.experienceLevel || "Experience N/A"}</span>
                <span>{j.salaryRange || "Salary N/A"}</span>
              </div>
              <p className={Styles.skills}>Skills: {j.skills || "Not specified"}</p>
              <p className={Styles.desc}>{j.description}</p>
            </div>
          ))}
        </div>
      )}
      </main>
    </div>
  );
}

export default RecruiterJobs;

