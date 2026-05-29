import Home from "./home/home.jsx";
import Login from "./login/login.jsx";
import "./App.css"
import { ToastContainer } from "react-toastify";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useContext } from "react";
import { usercontext } from "./appcontext.jsx";
import Forgotpassword from "./resetpassword/resetpassword.jsx";
import Uploadpage from "./upload/upload.jsx";
import Analyse from "./analyse/analyse.jsx";
import CodingTest from "./codingtest/codingtest.jsx";
import CareerRoadmap from "./careerroadmap/careerroadmap.jsx";
import Styles from "./loadstyle.module.css"
import RecruiterDashboard from "./recruiter/dashboard.jsx";
import RecruiterPostJob from "./recruiter/postjob.jsx";
import RecruiterJobs from "./recruiter/jobs.jsx";
import RecruiterApplicants from "./recruiter/applicants.jsx";
import Jobs from "./jobs/jobs.jsx";
import Applications from "./jobs/applications.jsx";

function App() {

  const { isauthenticated, role } = useContext(usercontext)
  return (isauthenticated ?
    <>
      <ToastContainer theme="colored" stacked autoClose={1800} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={role === "RECRUITER" ? <RecruiterDashboard /> : <Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgotpassword" element={<Forgotpassword />} />
          <Route path="/uploaddoc" element={<Uploadpage />} />
          <Route path="/analysereport" element={<Analyse />} />
          <Route path="/codingtest" element={<CodingTest />} />
          <Route path="/careerroadmap" element={<CareerRoadmap />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/recruiter/post-job" element={<RecruiterPostJob />} />
          <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
          <Route path="/recruiter/jobs/:jobId/applications" element={<RecruiterApplicants />} />
        </Routes>
      </BrowserRouter>
    </> : 
    <div className={Styles.loadani} id="animate">
      <div className={Styles.loadanimation}>
        <div className={Styles.capstart}></div>
        <div className={Styles.loadblock}></div>
      </div>
    </div>

  )
}

export default App
