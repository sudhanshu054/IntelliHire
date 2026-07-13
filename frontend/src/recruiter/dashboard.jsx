import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { usercontext } from "../appcontext.jsx";
import { Footer } from "../ui.jsx";
import Styles from "./recruiter.module.css";

function RecruiterDashboard() {
  const navigate = useNavigate();
  const { username, role, serviceURL, setusername, setislogged, setisprevious } = useContext(usercontext);

  if (role !== "RECRUITER") {
    navigate("/");
    return null;
  }

  const logout = () => {
    fetch(`${serviceURL}/logout`, { method: "post", credentials: "include" })
      .then((response) => {
        if (!response.ok) throw new Error("Logout failed");
        setusername("");
        setislogged(false);
        setisprevious(false);
        toast.success("Successfully Loggedout");
        navigate("/login");
      })
      .catch((err) => toast.error(err.message || "Logout failed"));
  };

  return (
    <div className={Styles.page}>
      <main className={Styles.dash}>
        <header className={Styles.recruiterHeader}>
          <div>
            <Link className={Styles.brandLine} to="/"><span>IH</span><h1>IntelliHire Recruiter Hub</h1></Link>
            <p>Welcome back, <b>{username}</b>. Manage openings and shortlist better.</p>
          </div>
          <button className={Styles.btnGhost} onClick={logout}>Logout</button>
        </header>

        <section className={Styles.kpiGrid}>
          <article><span>Hiring Pipeline</span><h2>Active</h2><i></i></article>
          <article><span>Candidate Signals</span><h2>ATS + Fit</h2><i></i></article>
          <article><span>Decision Speed</span><h2>Faster</h2><i></i></article>
        </section>

        <section className={Styles.ctaGrid}>
          <button onClick={() => navigate("/recruiter/post-job")}>
            <span className={Styles.ctaIcon}>+</span>
            <h2>Create Job Posting</h2>
            <p>Publish a role with requirements, responsibilities, and screening intent.</p>
            <b>Get Started &gt;</b>
          </button>
          <button onClick={() => navigate("/recruiter/jobs")}>
            <span className={Styles.ctaIcon}>[]</span>
            <h2>Manage My Jobs</h2>
            <p>Track live postings, review applicants, and inspect seeker analysis quality.</p>
            <b>View Dashboard &gt;</b>
          </button>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default RecruiterDashboard;
