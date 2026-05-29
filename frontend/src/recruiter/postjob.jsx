import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { usercontext } from "../appcontext.jsx";
import Styles from "./recruiter.module.css";
import { BrandNav } from "../ui.jsx";

function RecruiterPostJob() {
  const navigate = useNavigate();
  const { role, serviceURL } = useContext(usercontext);
  const [title, settitle] = useState("");
  const [companyName, setcompanyName] = useState("");
  const [location, setlocation] = useState("");
  const [workMode, setworkMode] = useState("Remote");
  const [employmentType, setemploymentType] = useState("Full-time");
  const [experienceLevel, setexperienceLevel] = useState("Mid");
  const [salaryRange, setsalaryRange] = useState("");
  const [skills, setskills] = useState("");
  const [description, setdescription] = useState("");
  const [isloading, setisloading] = useState(false);

  if (role !== "RECRUITER") {
    navigate("/");
    return null;
  }

  const submit = (e) => {
    e.preventDefault();
    if (
      title.trim() === "" ||
      companyName.trim() === "" ||
      location.trim() === "" ||
      salaryRange.trim() === "" ||
      skills.trim() === "" ||
      description.trim() === ""
    ) {
      toast.warn("Please fill all required fields");
      return;
    }
    setisloading(true);
    fetch(`${serviceURL}/recruiter/jobs`, {
      method: "post",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        companyName: companyName.trim(),
        location: location.trim(),
        workMode,
        employmentType,
        experienceLevel,
        salaryRange: salaryRange.trim(),
        skills: skills.trim(),
        description: description.trim(),
      }),
    })
      .then((response) => {
        if (response.ok) return response.json();
        return response.text().then((t) => {
          throw new Error(t || "Failed to create job");
        });
      })
      .then(() => {
        toast.success("Job posted");
        settitle("");
        setcompanyName("");
        setlocation("");
        setworkMode("Remote");
        setemploymentType("Full-time");
        setexperienceLevel("Mid");
        setsalaryRange("");
        setskills("");
        setdescription("");
        navigate("/recruiter/jobs");
      })
      .catch((err) => toast.error(err.message || "Network error"))
      .finally(() => setisloading(false));
  };

  return (
    <div className={Styles.page}>
      <BrandNav active="Jobs" recruiter userInitial="JD" />
      <main className={Styles.main}>
      <div className={Styles.topbar}>
        <div>
          <h1 className={Styles.title}>Create a New Job</h1>
          <p className={Styles.subtle}>Craft a clear role brief to attract stronger candidates.</p>
        </div>
        <button className={Styles.btnGhost} onClick={() => navigate("/")}>
          Back
        </button>
      </div>
      <form onSubmit={submit} className={Styles.form}>
        <input
          className={Styles.input}
          value={title}
          onChange={(e) => settitle(e.target.value)}
          placeholder="Job title"
        />
        <input
          className={Styles.input}
          value={companyName}
          onChange={(e) => setcompanyName(e.target.value)}
          placeholder="Company name"
        />
        <div className={Styles.gridTwo}>
          <input
            className={Styles.input}
            value={location}
            onChange={(e) => setlocation(e.target.value)}
            placeholder="Location (e.g. Bengaluru)"
          />
          <input
            className={Styles.input}
            value={salaryRange}
            onChange={(e) => setsalaryRange(e.target.value)}
            placeholder="Salary range (e.g. 12-18 LPA)"
          />
        </div>
        <div className={Styles.gridThree}>
          <select className={Styles.input} value={workMode} onChange={(e) => setworkMode(e.target.value)}>
            <option>Remote</option>
            <option>Hybrid</option>
            <option>Onsite</option>
          </select>
          <select className={Styles.input} value={employmentType} onChange={(e) => setemploymentType(e.target.value)}>
            <option>Full-time</option>
            <option>Contract</option>
            <option>Internship</option>
            <option>Part-time</option>
          </select>
          <select className={Styles.input} value={experienceLevel} onChange={(e) => setexperienceLevel(e.target.value)}>
            <option>Entry</option>
            <option>Mid</option>
            <option>Senior</option>
            <option>Lead</option>
          </select>
        </div>
        <input
          className={Styles.input}
          value={skills}
          onChange={(e) => setskills(e.target.value)}
          placeholder="Skills (comma separated, e.g. Java, Spring Boot, SQL)"
        />
        <textarea
          className={Styles.textarea}
          value={description}
          onChange={(e) => setdescription(e.target.value)}
          placeholder="Job description"
          rows={8}
        />
        <button disabled={isloading} type="submit" className={Styles.btnPrimary} style={{opacity: isloading ? 0.7 : 1}}>
          {isloading ? "Creating..." : "Create job"}
        </button>
      </form>
      </main>
    </div>
  );
}

export default RecruiterPostJob;

