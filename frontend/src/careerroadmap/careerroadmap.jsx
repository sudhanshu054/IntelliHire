import { useContext, useEffect, useState } from "react";
import { usercontext } from "../appcontext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Styles from "./careerroadmap.module.css";
import { BrandNav, Footer } from "../ui.jsx";
import roadmapVisual from "../assets/mockups/screen.png";

function CareerRoadmap() {
    const { serviceURL, islogged } = useContext(usercontext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [roadmap, setRoadmap] = useState(null);
    const [formData, setFormData] = useState({
        targetRole: "",
        currentSkills: "",
        experience: ""
    });

    useEffect(() => {
        if (!islogged) {
            toast.warn("Please login to use Career Roadmap");
            navigate("/login");
        }
    }, [islogged, navigate]);

    const onChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const loadSampleRoadmap = (targetRole, currentSkills, experience) => {
        setFormData({ targetRole, currentSkills, experience });
        setRoadmap(null);
        toast.info("Roadmap draft loaded. Review it and generate.");
        window.scrollTo({ top: 360, behavior: "smooth" });
    };

    const generateRoadmap = (event) => {
        event.preventDefault();
        if (!formData.targetRole.trim() || !formData.currentSkills.trim() || !formData.experience.trim()) {
            toast.warn("Please fill all fields");
            return;
        }
        setIsLoading(true);
        setRoadmap(null);
        fetch(`${serviceURL}/career/roadmap`, {
            method: "post",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                targetRole: formData.targetRole.trim(),
                currentSkills: formData.currentSkills.trim(),
                experience: formData.experience.trim()
            })
        })
            .then(async (response) => {
                const contentType = response.headers.get("content-type") || "";
                if (!response.ok || !contentType.includes("application/json")) {
                    if (response.status === 401 || response.status === 403) {
                        throw new Error("Please login again");
                    }
                    throw new Error("Career roadmap API failed");
                }
                return response.json();
            })
            .then((data) => {
                setRoadmap(data);
                toast.success("Roadmap generated");
            })
            .catch((error) => toast.error(error.message || "Unable to generate roadmap"))
            .finally(() => setIsLoading(false));
    };

    return (
        <div className={Styles.container}>
            <BrandNav active="Roadmaps" />
            <main className={Styles.main}>
                <section className={Styles.hero}>
                    <div>
                        <span className={Styles.badge}>AI-Powered Career Planning</span>
                        <h1>Engineer Your <span>Professional Evolution</span></h1>
                        <p>Map out your journey from where you are to where you want to be. Our AI analyzes trends, skill gaps, and market demand to build your personalized precision roadmap.</p>
                    </div>
                    <div className={Styles.visual}>
                        <img src={roadmapVisual} alt="Career roadmap dashboard preview" />
                    </div>
                </section>

                <div className={Styles.workbench}>
                    <div>
                        <div className={Styles.card}>
                            <h2>Roadmap Parameters</h2>
                            <form onSubmit={generateRoadmap} className={Styles.form}>
                                <div className={Styles.fieldRow}>
                                    <label>Target Role
                                        <input name="targetRole" value={formData.targetRole} onChange={onChange} placeholder="e.g. Senior DevOps Engineer" />
                                    </label>
                                    <label>Experience Level
                                        <input name="experience" value={formData.experience} onChange={onChange} placeholder="Junior (0-2 years)" />
                                    </label>
                                </div>
                                <label>Current Skills & Stack
                                    <textarea name="currentSkills" value={formData.currentSkills} onChange={onChange} placeholder="List your key technologies, frameworks, and methodologies..." />
                                </label>
                                <div className={Styles.formFooter}>
                                    <div className={Styles.pills}><span>Market Insight Enabled</span><span>Skill Gap Analysis</span></div>
                                    <button type="submit" disabled={isLoading}>{isLoading ? "Generating..." : "Generate Roadmap"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <aside className={Styles.sideRail}>
                        <div className={Styles.sideCard}>
                            <h3>AI Context Loaded</h3>
                            <p>Based on recent job postings, we've identified high-growth skill clusters for your target role.</p>
                            <div className={Styles.signal}><span>Cloud Architecture</span><b>High Demand</b></div>
                            <div className={Styles.signal}><span>MLOps Foundations</span><b>Emerging</b></div>
                        </div>
                        <div className={Styles.sideCard}>
                            <h3>Your Future, Quantified.</h3>
                            <p>Join professionals using IntelliHire to navigate career pivots with precision.</p>
                        </div>
                    </aside>
                </div>

            {roadmap ? (
                <div className={Styles.result}>
                    <h3>Summary</h3>
                    <p>{roadmap.summary}</p>

                    <h3>Skill Gaps</h3>
                    <ul>
                        {(roadmap.skillGaps || []).map((gap, idx) => <li key={idx}>{gap}</li>)}
                    </ul>

                    <h3>Weekly Plan</h3>
                    {(roadmap.weeklyPlan || []).map((week, idx) => (
                        <div key={idx} className={Styles.week}>
                            <h4>{week.week} - {week.focus}</h4>
                            <ul>
                                {(week.tasks || []).map((task, i) => <li key={i}>{task}</li>)}
                            </ul>
                        </div>
                    ))}

                    <h3>Project Ideas</h3>
                    <ul>
                        {(roadmap.projectIdeas || []).map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>

                    <h3>Interview Checklist</h3>
                    <ul>
                        {(roadmap.interviewChecklist || []).map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                </div>
            ) : null}
                <section className={Styles.recent}>
                    <div className={Styles.recentHeader}>
                        <div><h3>Recent Explorations</h3><p>Resume your previous career path simulations</p></div>
                        <button type="button" className={Styles.historyBtn} onClick={() => toast.info("Showing recent roadmap drafts")}>View All History &gt;</button>
                    </div>
                    <div className={Styles.recentGrid}>
                        <article className={Styles.recentCard}><h3>AI Solutions Architect</h3><div className={Styles.progress}></div><p>65% Ready</p><button type="button" onClick={() => loadSampleRoadmap("AI Solutions Architect", "Java, Spring Boot, REST APIs, SQL", "2 years")}>Resume Roadmap</button></article>
                        <article className={Styles.recentCard}><h3>Cybersecurity Lead</h3><div className={Styles.progress}></div><p>25% Ready</p><button type="button" onClick={() => loadSampleRoadmap("Cybersecurity Lead", "Networking, Linux, Java, OWASP basics", "3 years")}>Resume Roadmap</button></article>
                        <article className={Styles.recentCard}><h3>Staff Data Scientist</h3><div className={Styles.progress}></div><p>80% Ready</p><button type="button" onClick={() => loadSampleRoadmap("Staff Data Scientist", "Python, SQL, statistics, machine learning", "4 years")}>Resume Roadmap</button></article>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

export default CareerRoadmap;
