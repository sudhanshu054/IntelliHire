import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { usercontext } from "../appcontext.jsx";
import { BrandNav, Footer } from "../ui.jsx";
import Styles from "./jobs.module.css";

function Jobs() {
  const navigate = useNavigate();
  const { role, serviceURL, islogged, username } = useContext(usercontext);
  const [isloading, setisloading] = useState(true);
  const [jobs, setjobs] = useState([]);
  const [applyingId, setapplyingId] = useState(null);
  const [search, setsearch] = useState("");
  const [sortBy, setsortBy] = useState("latest");
  const [experienceFilters, setExperienceFilters] = useState(["Mid-Senior"]);
  const [workFilters, setWorkFilters] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    if (!islogged) {
      navigate("/login");
      return;
    }
    if (role !== "JOB_SEEKER") {
      navigate("/");
      return;
    }
    setisloading(true);
    fetch(`${serviceURL}/jobs`, { method: "get", credentials: "include" })
      .then((response) => {
        if (response.ok) return response.json();
        return response.text().then((t) => {
          throw new Error(t || "Failed to load jobs");
        });
      })
      .then((data) => setjobs(Array.isArray(data) ? data : []))
      .catch((err) => toast.error(err.message || "Network error"))
      .finally(() => setisloading(false));
  }, [islogged, role, navigate, serviceURL]);

  const filteredJobs = useMemo(() => [...jobs]
    .filter((j) => {
      const q = search.trim().toLowerCase();
      const haystack = `${j.title || ""} ${j.description || ""} ${j.skills || ""} ${j.companyName || ""}`.toLowerCase();
      const matchesSearch = !q || haystack.includes(q);
      const exp = String(j.experienceLevel || "").toLowerCase();
      const mode = String(j.workMode || "").toLowerCase();
      const matchesExperience =
        experienceFilters.length === 0 ||
        experienceFilters.some((filter) => {
          if (filter === "Entry Level") return exp.includes("entry") || exp.includes("junior");
          if (filter === "Mid-Senior") return exp.includes("mid") || exp.includes("senior") || exp.includes("lead");
          return exp.includes("executive");
        });
      const matchesWork = workFilters.length === 0 || workFilters.some((filter) => mode.includes(filter.toLowerCase().replace("-", "")) || mode.includes(filter.toLowerCase()));
      return matchesSearch && matchesExperience && matchesWork;
    })
    .sort((a, b) => {
      if (sortBy === "title") return (a.title || "").localeCompare(b.title || "");
      return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    }), [jobs, search, sortBy, experienceFilters, workFilters]);

  const visibleJobs = filteredJobs.slice(0, visibleCount);

  const toggleListValue = (value, setter) => {
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
    setVisibleCount(5);
  };

  const runSearch = () => {
    setVisibleCount(5);
    toast.info(search.trim() ? "Search applied" : "Showing all opportunities");
  };

  const clearFilters = () => {
    setsearch("");
    setExperienceFilters([]);
    setWorkFilters([]);
    setsortBy("latest");
    setVisibleCount(5);
    toast.info("Filters cleared");
  };

  const applyOptimization = () => {
    setsearch("cloud");
    setExperienceFilters(["Mid-Senior"]);
    setWorkFilters(["Remote"]);
    setVisibleCount(5);
    toast.success("Optimization applied");
  };

  const apply = (jobId) => {
    setapplyingId(jobId);
    fetch(`${serviceURL}/jobs/${jobId}/apply`, { method: "post", credentials: "include" })
      .then((response) => {
        if (response.ok) return response.text();
        return response.text().then((t) => {
          throw new Error(t || "Failed to apply");
        });
      })
      .then(() => {
        toast.success("Applied");
        setjobs((prev) => prev.filter((j) => j.id !== jobId));
        navigate("/applications");
      })
      .catch((err) => toast.error(err.message || "Network error"))
      .finally(() => setapplyingId(null));
  };

  return (
    <div className={Styles.page}>
      <BrandNav active="Explorer" userInitial={username ? username[0].toUpperCase() : ""} />
      <main className={Styles.main}>
        <section className={Styles.header}>
          <div>
            <h1>Explore <span>Opportunities</span></h1>
            <p>Leverage AI-driven recruitment matching to find roles precision-engineered for your career trajectory.</p>
          </div>
          <div className={Styles.headerActions}>
            <button onClick={() => navigate("/")}>Back</button>
            <button onClick={() => navigate("/applications")}>My Applications</button>
          </div>
        </section>

        <section className={Styles.searchPanel}>
          <input
            value={search}
            onChange={(e) => setsearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") runSearch();
            }}
            placeholder="Search by job title, skill, or keyword..."
          />
          <select value={sortBy} onChange={(e) => setsortBy(e.target.value)}>
            <option value="latest">Sort: Latest</option>
            <option value="title">Sort: Title A-Z</option>
          </select>
          <button type="button" onClick={runSearch}>Search</button>
        </section>

        <section className={Styles.contentGrid}>
          <aside className={Styles.filters}>
            <div className={Styles.filterHead}><span>Filters</span><button type="button" onClick={clearFilters}>Clear all</button></div>
            <h3>Experience Level</h3>
            {["Entry Level", "Mid-Senior", "Executive"].map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={experienceFilters.includes(item)}
                  onChange={() => toggleListValue(item, setExperienceFilters)}
                />
                {item}
              </label>
            ))}
            <h3>Work Model</h3>
            <div className={Styles.chips}>
              {["Remote", "Hybrid", "On-site"].map((item) => (
                <button
                  type="button"
                  key={item}
                  className={workFilters.includes(item) ? Styles.activeChip : ""}
                  onClick={() => toggleListValue(item, setWorkFilters)}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className={Styles.reco}>
              <h3>AI Recommendation</h3>
              <p>Based on your profile, you're in the top 5% of candidates for high-match roles.</p>
              <button type="button" onClick={applyOptimization}>Apply Optimization</button>
            </div>
          </aside>

          <div className={Styles.jobs}>
            <p className={Styles.count}>{isloading ? "Loading opportunities..." : `${filteredJobs.length} opportunities found`}</p>
            {isloading ? null : filteredJobs.length === 0 ? (
              <div className={Styles.loadMore}>No matching opportunities yet</div>
            ) : (
              <div className={Styles.jobGrid}>
                {visibleJobs.map((j, index) => (
                  <article key={j.id} className={index === 0 ? Styles.featuredJob : Styles.jobCard}>
                    <div className={Styles.thumb}></div>
                    <div className={Styles.jobBody}>
                      <div className={Styles.row}>
                        <h2>{j.title}</h2>
                        <span>{j.salaryRange || "Salary N/A"}</span>
                      </div>
                      <p className={Styles.meta}>{j.companyName || "Company N/A"} - {j.location || "Location N/A"} - {j.workMode || "Mode N/A"}</p>
                      <p>{j.description}</p>
                      <div className={Styles.tagRow}>
                        {(j.skills || "Java, Spring Boot, SQL").split(",").slice(0, 4).map((skill) => <span key={skill}>{skill.trim()}</span>)}
                      </div>
                      <button
                        className={Styles.applyBtn}
                        disabled={applyingId === j.id}
                        onClick={() => apply(j.id)}
                      >
                        {applyingId === j.id ? "Applying..." : "Apply"}
                      </button>
                    </div>
                  </article>
                ))}
                <button
                  type="button"
                  className={Styles.loadMore}
                  onClick={() => {
                    if (visibleCount >= filteredJobs.length) {
                      toast.info("All opportunities are visible");
                      return;
                    }
                    setVisibleCount((count) => count + 5);
                  }}
                >
                  {visibleCount >= filteredJobs.length ? "All Opportunities Loaded" : "Load More Opportunities"}
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Jobs;
