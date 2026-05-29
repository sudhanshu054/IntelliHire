import { createContext, useEffect, useState} from "react";
import { toast } from "react-toastify";

export const usercontext =createContext();

function Appcontext({children}){
    const apiOrigin = window.location.port === "5173"
        ? `${window.location.protocol}//${window.location.hostname}:8080`
        : `${window.location.protocol}//${window.location.host}`;
    const backendURL=`${apiOrigin}/resumeAnalyser/entry/v1`
    const serviceURL=`${apiOrigin}/resumeAnalyserCore/service/v1`
    const [islogged,setislogged]=useState(false)
    const [isprevious,setisprevious]=useState(false)
    const [username,setusername]=useState("")
    const [role,setrole]=useState("JOB_SEEKER")
    const [isauthenticated,setisauthenticated]=useState(false)


   useEffect(() => {
        fetch(`${serviceURL}/isValid`, { method: "post", credentials: 'include' }).then(response => {
            if (response.ok) {
                return response.json()
                
            }
            else {
                setisauthenticated(true)
                return;
            }
        })
            .then(data => {
                if (data != null) {
                    setusername(data.username);
                    setisprevious(data.isPrevious)
                    if (data.role) setrole(data.role)
                    setislogged(true)
                    setisauthenticated(true)
                }
            }).catch(error=> setisauthenticated(true))

    }, [])


    const arr ={islogged,setislogged,isprevious,setisprevious,username,setusername,role,setrole,backendURL,serviceURL,isauthenticated}

    return (
        <usercontext.Provider value={arr}>
            {children}
        </usercontext.Provider>
    )
}

export default Appcontext
