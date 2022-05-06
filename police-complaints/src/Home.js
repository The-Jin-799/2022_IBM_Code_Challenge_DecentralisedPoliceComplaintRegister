import "./App.css";
import ipfs from "./ipfs";
import SimpleStorageContract from "./contracts/PoliceComplaint.json";
import moment from "moment";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Input,
  Stack,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  styled,
  Link,
  Table,
} from "@mui/material";
import { Box } from "@mui/system";
import { collection, query, where, getDocs, doc } from "firebase/firestore";
import Web3 from "web3";
import { app } from "./firebase-config";
import { db } from "./firebase-config";
function App() {
  const [buttonGroup, setButton] = useState(1);
  const [policepin, setPolicePIN] = useState("");
  const [filebuffer, setFileBuffer] = useState(null);
  const [ipfshash, setIPFSHash] = useState();
  const [policeaddress, setPoliceAddress] = useState();
  const [accountaddress, setAccountAddress] = useState();
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [complaints, setComplaints] = useState();
  const [setdate, setDate] = useState();
  let navigate = useNavigate();

  useEffect(() => {
    connectweb3();
  }, []);
  useEffect(() => {
    if (web3 && contract) getComplaints();
  }, [web3, contract]);
  useEffect(() => {
    if (web3 && contract) {
      getComplaints();
    }
  }, [web3, contract]);

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  }));

  const connectweb3 = async () => {
    if (typeof window.ethereum !== "undefined") {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      setAccountAddress(accounts[0]);
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address
      );
      setWeb3(web3);
      setContract(instance);
    }
  };

  const submitComplaint = async (paddress) => {
    console.log(paddress, "=>", ipfshash);
    await contract.methods
      .fileComplaint(paddress, ipfshash)
      .send({ from: accountaddress });
    window.location.reload();
  };

  const getComplaints = async () => {
    const userComplaints = await contract.methods
      .getComplainerComplaints()
      .call({ from: accountaddress });
    setComplaints(userComplaints);
  };
  useEffect(() => {
    if (typeof ipfshash != "undefined" && policepin) {
      console.log("ipfs: ", ipfshash);
      getPinCodeAddress();
    }
  }, [ipfshash, policepin]);
  const handleLogout = () => {
    sessionStorage.removeItem("Auth Token");
    navigate("/");
  };

  useEffect(() => {
    let authToken = sessionStorage.getItem("Auth Token");

    if (authToken) {
      navigate("/home");
    }

    if (!authToken) {
      navigate("/");
    }
  }, []);

  const captureFile = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      // this.setState({ buffer: Buffer(reader.result)
      setFileBuffer(Buffer(reader.result));
    };
    console.log("buffer:", filebuffer);
  };

  const getPinCodeAddress = async () => {
    const q = query(
      collection(db, "users"),
      where("stationpin", "==", policepin)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
      setPoliceAddress(doc.data().useraddress);
      submitComplaint(doc.data().useraddress);
    });
  };

  const getPolicePinCodeAddress = async (address) => {
    const q = query(
      collection(db, "users"),
      where("useraddress", "==", address)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
      return doc.data().policepin;
    });
  };

  const handleSubmit = (event) => {
    ipfs.files.add(filebuffer, async (error, result) => {
      if (error) {
        console.error(error);
        return;
      }
      setIPFSHash(result[0].hash);
    });
  };

  return (
    <div className="Home">
      <h1>Complainer Home</h1>
      <Button variant="outlined" color="error" onClick={handleLogout}>
        Log out
      </Button>
      <div>
        <ButtonGroup sx={{ margin: 4 }} disableElevation variant="contained">
          <Button onClick={() => setButton(1)}>View Complaints</Button>
          <Button onClick={() => setButton(2)}>File A Complaint</Button>
        </ButtonGroup>
        {buttonGroup === 1 ? (
          <Container>
            <h1>Complaints</h1>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 700 }} aria-label="customized table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Complaint ID</StyledTableCell>
                    <StyledTableCell align="right">Police PIN</StyledTableCell>
                    <StyledTableCell align="right">Complaint</StyledTableCell>
                    <StyledTableCell align="right">
                      Accepted / Not
                    </StyledTableCell>
                    <StyledTableCell align="right">FIR</StyledTableCell>
                    <StyledTableCell align="right">Spam</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {complaints &&
                    complaints.map(
                      (complaint, i) =>
                        complaint.complainer_address === accountaddress && (
                          <StyledTableRow key={i}>
                            <StyledTableCell align="right">
                              {complaint.complaint_id}
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              {complaint.policestation_address}
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              <Link
                                href={`https://cloudflare-ipfs.com/ipfs/${complaint.complaint_doc_hash}`}
                              >
                                Download
                              </Link>
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              {complaint.complaint_accepted ? (
                                moment(
                                  Number(complaint.accepted_date) * 1000
                                ).format("MMMM Do YYYY, h:mm:ss a")
                              ) : complaint.mark_as_spam ? (
                                <Button variant="contained" disabled>
                                  Spammed Complaint
                                </Button>
                              ) : (
                                "Pending"
                              )}
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              {complaint.fir_status ? (
                                <Link
                                  href={`https://cloudflare-ipfs.com/ipfs/${complaint.FIR_doc_hash}`}
                                >
                                  {moment(
                                    Number(complaint.fir_date) * 1000
                                  ).format("MMMM Do YYYY, h:mm:ss a")}
                                </Link>
                              ) : complaint.mark_as_spam ? (
                                <Button variant="contained" disabled>
                                  Spammed Complaint
                                </Button>
                              ) : (
                                "Pending"
                              )}
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              {complaint.mark_as_spam ? (
                                <Link
                                  href={`https://cloudflare-ipfs.com/ipfs/${complaint.spam_reason_doc}`}
                                >
                                  {moment(
                                    Number(complaint.markasspam_date) * 1000
                                  ).format("MMMM Do YYYY, h:mm:ss a")}
                                </Link>
                              ) : (
                                "No"
                              )}
                            </StyledTableCell>
                          </StyledTableRow>
                        )
                    )}{" "}
                </TableBody>
              </Table>
            </TableContainer>
          </Container>
        ) : (
          <Container>
            <TextField
              margin="normal"
              id="policepincode"
              label="Police Pincode"
              variant="outlined"
              onChange={(e) => setPolicePIN(e.target.value)}
            />
            <Box sx={{ margin: 4 }}>
              <Input
                onChange={captureFile}
                color="primary"
                className="complaintupload"
                type="file"
              />
            </Box>
            <Button onClick={handleSubmit} variant="outlined" color="success">
              Submit
            </Button>
          </Container>
        )}
      </div>
    </div>
  );
}

export default App;
