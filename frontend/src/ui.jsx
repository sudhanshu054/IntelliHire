import { useNavigate } from "react-router-dom";
import Styles from "./ui.module.css";

export function BrandNav({ active = "Home", onLogout, userInitial, recruiter = false }) {
  const navigate = useNavigate();
  const goToSearch = () => navigate(recruiter ? "/recruiter/jobs" : "/jobs");
  const goToAlerts = () => navigate(recruiter ? "/recruiter/jobs" : "/applications");
  const goToProfile = () => navigate(recruiter ? "/" : "/applications");
  const links = recruiter
    ? [
        ["Dashboard", "/"],
        ["Jobs", "/recruiter/jobs"],
        ["Candidates", "/recruiter/jobs"],
      ]
    : [
        ["Home", "/"],
        ["Explorer", "/jobs"],
        ["Roadmaps", "/careerroadmap"],
        ["My Applications", "/applications"],
      ];

  return (
    <header className={Styles.nav}>
      <button type="button" className={Styles.brand} onClick={() => navigate("/")}>
        <span className={Styles.logoMark}>IH</span>
        IntelliHire
      </button>
      <nav className={Styles.links}>
        {links.map(([label, path]) => (
          <button
            type="button"
            key={label}
            className={active === label ? Styles.activeLink : ""}
            onClick={() => navigate(path)}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className={Styles.navActions}>
        <button type="button" className={Styles.search} onClick={goToSearch}>Search <span>{recruiter ? "candidates..." : "roles..."}</span></button>
        <button type="button" className={Styles.iconBtn} onClick={goToAlerts}>!</button>
        {onLogout ? (
          <button type="button" className={Styles.authBtn} onClick={onLogout}>Logout</button>
        ) : userInitial ? (
          <button type="button" className={Styles.avatar} onClick={goToProfile}>{userInitial}</button>
        ) : (
          <button type="button" className={Styles.authBtn} onClick={() => navigate("/login")}>Sign In</button>
        )}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className={Styles.footer}>
      <div>
        <h3>IntelliHire AI</h3>
        <p>© 2024 IntelliHire AI. Precision Recruitment Engineered.</p>
      </div>
      <div className={Styles.footerLinks}>
        <span>Privacy Policy</span>
        <span>Terms of Service</span>
        <span>AI Ethics</span>
        <span>Support</span>
        <span>Careers</span>
      </div>
    </footer>
  );
}

export function EmptyState({ icon = "[]", title, text, primary, secondary }) {
  return (
    <section className={Styles.empty}>
      <div className={Styles.emptyIcon}>{icon}</div>
      <h2>{title}</h2>
      <p>{text}</p>
      <div className={Styles.emptyActions}>
        {primary}
        {secondary}
      </div>
    </section>
  );
}
