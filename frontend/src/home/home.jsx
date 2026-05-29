import Styles from "./home.module.css";
import { useContext, useState } from "react";
import { usercontext } from "../appcontext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BrandNav, Footer } from "../ui.jsx";
import homeVisual from "../assets/mockups/9.png";
import testVisual from "../assets/mockups/1.png";
import explorerVisual from "../assets/mockups/5.png";

function Home() {
  const navigate = useNavigate();
  const { islogged, username, isprevious, serviceURL, setusername, setislogged, setisprevious, role } = useContext(usercontext);
  const [isloading, setisloading] = useState(false);
  const [delloading, setdelloading] = useState(false);

  const logout = () => {
    setisloading(true);
    fetch(`${serviceURL}/logout`, { method: "post", credentials: "include" })
      .then((response) => {
        if (!response.ok) throw new Error("unauthorised access");
        setusername("");
        setislogged(false);
        setisprevious(false);
        toast.success("Successfully Loggedout");
        navigate("/login");
      })
      .catch((error) => toast.error(error.message || "Logout failed"))
      .finally(() => setisloading(false));
  };

  const delaccount = () => {
    setdelloading(true);
    fetch(`${serviceURL}/deleteAccount`, { method: "post", credentials: "include" })
      .then((response) => {
        if (!response.ok) throw new Error("Couldn't delete. Try again.");
        setislogged(false);
        setusername("");
        setisprevious(false);
        toast.success("Account Deleted Successfully");
        navigate("/login");
      })
      .catch((error) => toast.error(error.message || "Network Error"))
      .finally(() => setdelloading(false));
  };

  const guardedNavigate = (path) => {
    if (islogged) navigate(path);
    else navigate("/login");
  };

  return (
    <div className={Styles.page}>
      <BrandNav active="Home" userInitial={islogged && username ? username[0].toUpperCase() : ""} />

      <main>
        <section className={Styles.hero}>
          <div className={Styles.heroCopy}>
            <span className={Styles.badge}>AI Hiring Copilot</span>
            <h1>Next-Gen Recruitment <span>Intelligence.</span></h1>
            <p>
              Harness IntelliHire to screen resumes, practice role-based assessments,
              build career roadmaps, and discover recruiter-posted opportunities.
            </p>
            <div className={Styles.heroActions}>
              <button disabled={isloading} onClick={() => guardedNavigate("/uploaddoc")}>Analyse Resume</button>
              <button disabled={isloading} onClick={() => guardedNavigate("/careerroadmap")}>Career Roadmap</button>
            </div>
          </div>
          <div className={Styles.heroVisual}>
            <img src={homeVisual} alt="IntelliHire dashboard preview" />
          </div>
        </section>

        <section className={Styles.featureGrid}>
          <article className={Styles.insightCard} onClick={() => guardedNavigate(isprevious ? "/analysereport" : "/uploaddoc")}>
            <div className={Styles.cardTop}>
              <h2>ATS Insight Engine</h2>
              <span>-&gt;</span>
            </div>
            <p>Analyse resume quality, keyword gaps, and role alignment using your existing backend report flow.</p>
            <img src={explorerVisual} alt="ATS insight preview" />
          </article>

          <article className={Styles.practiceCard}>
            <h2>Practice</h2>
            <p>Custom role-based coding environments and soft-skill assessments designed to evaluate true proficiency.</p>
            <button disabled={isloading} onClick={() => guardedNavigate("/codingtest")}>Take Coding Test</button>
          </article>
        </section>

        <section className={Styles.discovery}>
          <img src={testVisual} alt="Coding test screen preview" />
          <div>
            <h2>Recruiter-led <span>Discovery.</span></h2>
            <p>
              Bridge AI efficiency and human hiring intuition. Browse jobs, apply with your account,
              and let recruiters review your latest resume analysis.
            </p>
            <div className={Styles.discoveryBullets}>
              <div><b>Targeted Sourcing</b><span>Find high-match roles using seeker profile signals.</span></div>
              <div><b>Collaborative Hiring</b><span>Sync with hiring managers through recruiter dashboards.</span></div>
            </div>
            <div className={Styles.heroActions}>
              {role === "JOB_SEEKER" ? <button onClick={() => guardedNavigate("/jobs")}>Browse Jobs</button> : null}
              {role === "JOB_SEEKER" ? <button onClick={() => guardedNavigate("/applications")}>My Applications</button> : null}
            </div>
          </div>
        </section>

        <section className={Styles.ask}>
          <img src={explorerVisual} alt="Opportunity search preview" />
          <div>
            <span className={Styles.miniLabel}>Neural Engine Active</span>
            <h2>Ask IntelliHire Anything</h2>
            <p>"Compare candidates, plan career moves, and understand skill gaps from the data already in your workflow."</p>
            <div className={Styles.askGrid}>
              <div><b>Predictive Retention</b><span>Forecast candidate longevity from historical data.</span></div>
              <div><b>Skill Gap Analysis</b><span>Identify exactly what training a new hire will need.</span></div>
            </div>
          </div>
        </section>
      </main>

      {islogged ? (
        <div className={Styles.accountBar}>
          <span>Signed in as {username}</span>
          <button disabled={isloading} onClick={logout}>Logout</button>
          <button disabled={delloading} onClick={delaccount}>{delloading ? "Deleting..." : "Delete account"}</button>
        </div>
      ) : null}

      <Footer />
    </div>
  );
}

export default Home;
