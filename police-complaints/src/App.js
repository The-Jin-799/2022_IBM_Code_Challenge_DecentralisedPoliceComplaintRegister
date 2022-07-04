import { useState, useEffect } from "react";
import "./App.css";
import Form from "./components/Form";
import Home from "./Home";
import PoliceHome from "./PoliceHome";
import { Routes, Route, useNavigate } from "react-router-dom";
import { app } from "./firebase-config";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase-config";
import Web3 from "web3";
function App() {
  let navigate = useNavigate();
  useEffect(() => {
    let authToken = sessionStorage.getItem("Auth Token");

    if (authToken) {
      usertype === "complainer" ? navigate("/home") : console.log(authToken);
    }
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usertype, setUserType] = useState("");
  const [stationpin, setStationPin] = useState("");
  const [accountaddress, setAccountAddress] = useState("");

  const handleAction = (id) => {
    const authentication = getAuth();
    if (id === 1) {
      signInWithEmailAndPassword(authentication, email, password)
        .then(async (response) => {
          const docRef = doc(db, "users", response.user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            //console.log("Document data:", docSnap.data().useraddress);
            const UserType = docSnap.data();
            if (UserType.useraddress === accountaddress) {
              sessionStorage.setItem(
                "Auth Token",
                response._tokenResponse.refreshToken
              );
              UserType.usertype === "complainer"
                ? navigate("/home")
                : navigate("/policehome");
            } else toast.error("Connect with correct address");
          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }

          console.log(response.user.uid);
        })
        .catch((error) => {
          console.log(error.code);
          if (error.code === "auth/wrong-password") {
            toast.error("Please check the Password");
          }
          if (error.code === "auth/user-not-found") {
            toast.error("Please check the Email");
          }
        });
    }

    if (id === 2) {
      createUserWithEmailAndPassword(authentication, email, password)
        .then(async (response) => {
          try {
            if (usertype === "police") {
              const userRef = doc(db, "users", response.user.uid);
              setDoc(
                userRef,
                {
                  usertype: usertype,
                  stationpin: stationpin,
                  useraddress: accountaddress,
                },
                { merge: true }
              );
              navigate("/policehome");

              console.log("Document written with ID: ", userRef.id);
            } else {
              const userRef = doc(db, "users", response.user.uid);
              setDoc(
                userRef,
                { usertype: usertype, useraddress: accountaddress },
                { merge: true }
              );
              console.log("Document written with ID: ", userRef.id);
              navigate("/home");
            }
          } catch (e) {
            console.error("Error adding document: ", e);
          }

          sessionStorage.setItem(
            "Auth Token",
            response._tokenResponse.refreshToken
          );
        })
        .catch((error) => {
          if (error.code === "auth/email-already-in-use") {
            toast.error("Email Already in Use");
          }
        });
    }
  };

  const handleConnect = async () => {
    if (typeof window.ethereum !== "undefined") {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      setAccountAddress(accounts[0]);
    }
  };
  return (
    <div className="App">
      <>
        <ToastContainer />
        <Routes>
          <Route
            path="/"
            element={
              <Form
                title="Login"
                setEmail={setEmail}
                setPassword={setPassword}
                accountaddress={accountaddress}
                handleConnect={() => handleConnect()}
                handleAction={() => handleAction(1)}
              />
            }
          />
          <Route
            path="/register"
            element={
              <Form
                title="Register"
                setEmail={setEmail}
                setPassword={setPassword}
                setUserType={setUserType}
                setStationPin={setStationPin}
                handleConnect={() => handleConnect()}
                handleAction={() => handleAction(2)}
                accountaddress={accountaddress}
              />
            }
          />

          <Route path="/home" element={<Home />} />
          <Route path="/policehome" element={<PoliceHome />} />
        </Routes>
      </>
    </div>
  );
}

export default App;
