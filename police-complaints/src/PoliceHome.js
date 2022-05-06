import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ipfs from "./ipfs";
import SimpleStorageContract from "./contracts/PoliceComplaint.json";
import Button from "@mui/material/Button";
import Web3 from "web3";
import moment from "moment";
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
function PoliceHome() {
  const [accountaddress, setAccountAddress] = useState();
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [complaints, setComplaints] = useState();
  const [filebuffer, setFileBuffer] = useState(null);
  const [ipfshash, setIPFSHash] = useState();
  const [selectedcomplaintid, setSelectedComplaintId] = useState();
  const [reasonfilebuffer, setReasonFileBuffer] = useState(null);
  const [reasonipfshash, setReasonIPFSHash] = useState();
  let navigate = useNavigate();
  useEffect(() => {
    connectweb3();
  }, []);
  useEffect(() => {
    if (web3 && contract) {
      getComplaints();
      console.log(0);
    }
  }, [web3, contract]);

  useEffect(() => {
    console.log("filebuffer ", filebuffer);
  }, [filebuffer]);

  useEffect(() => {
    console.log(reasonfilebuffer);
  }, [reasonfilebuffer]);

  useEffect(() => {
    if (ipfshash && selectedcomplaintid) {
      console.log(ipfshash);
      submitFir(selectedcomplaintid, ipfshash);
    }
  }, [ipfshash]);

  useEffect(() => {
    if (reasonipfshash && selectedcomplaintid) {
      console.log(reasonipfshash);
      submitSpam(selectedcomplaintid, reasonipfshash);
    }
  }, [reasonipfshash]);

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
  //styles
  const Input = styled("input")({
    display: "none",
  });
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
  //styles end
  //call smartcontract
  const handleLogout = () => {
    sessionStorage.removeItem("Auth Token");
    navigate("/");
  };

  const getComplaints = async () => {
    const userComplaints = await contract.methods
      .getComplainerComplaints()
      .call({ from: accountaddress });
    setComplaints(userComplaints);
  };

  const submitFir = async (id) => {
    await contract.methods.setFir(id, ipfshash).send({ from: accountaddress });
    window.location.reload();
  };

  const acceptComplaint = async (id) => {
    await contract.methods.setAcceptance(id).send({ from: accountaddress });
    window.location.reload();
  };

  const submitSpam = async (id) => {
    await contract.methods
      .setSpam(id, reasonipfshash)
      .send({ from: accountaddress });
    window.location.reload();
  };
  //end smartcontract methods
  //get uploaded FIR doc
  const captureFile = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      setFileBuffer(Buffer(reader.result));
    };
    console.log("buffer:", filebuffer);
  };

  //get uploaded reason doc
  const captureReasonFile = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      setReasonFileBuffer(Buffer(reader.result));
    };
    console.log("Reason buffer:", reasonfilebuffer);
  };

  const handleSubmit = (id) => {
    ipfs.files.add(filebuffer, async (error, result) => {
      if (error) {
        console.error(error);
        return;
      }
      setSelectedComplaintId(id);
      setIPFSHash(result[0].hash);
    });
  };

  const handleSpam = (id) => {
    ipfs.files.add(reasonfilebuffer, async (error, result) => {
      if (error) {
        console.error(error);
        return;
      }
      setSelectedComplaintId(id);
      setReasonIPFSHash(result[0].hash);
    });
  };
  return (
    <>
      <h1>Police Home</h1>
      <Button variant="outlined" color="error" onClick={handleLogout}>
        Log out
      </Button>
      <Container>
        <h1>Received Complaints</h1>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 800 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Complaint ID</StyledTableCell>
                <StyledTableCell align="right">
                  Complainer address
                </StyledTableCell>
                <StyledTableCell align="right">Complaint</StyledTableCell>
                <StyledTableCell align="right">Accepted / Not</StyledTableCell>
                <StyledTableCell align="right">FIR</StyledTableCell>
                <StyledTableCell align="right">Spam</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {complaints &&
                complaints.map(
                  (complaint, i) =>
                    complaint.policestation_address === accountaddress && (
                      <StyledTableRow key={i}>
                        <StyledTableCell align="right">
                          {complaint.complaint_id}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {complaint.complainer_address}
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
                            <Button
                              onClick={() => {
                                acceptComplaint(complaint.complaint_id);
                              }}
                              color="success"
                              variant="text"
                            >
                              Accept Complaint
                            </Button>
                          )}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {complaint.fir_status ? (
                            <Link
                              href={`https://cloudflare-ipfs.com/ipfs/${complaint.FIR_doc_hash}`}
                            >
                              {moment(Number(complaint.fir_date) * 1000).format(
                                "MMMM Do YYYY, h:mm:ss a"
                              )}
                            </Link>
                          ) : complaint.mark_as_spam ? (
                            <Button variant="contained" disabled>
                              Spammed Complaint
                            </Button>
                          ) : filebuffer && complaint.complaint_id ? (
                            <Button
                              onClick={() => {
                                handleSubmit(complaint.complaint_id);
                              }}
                              variant="contained"
                              color="success"
                            >
                              Submit FIR
                            </Button>
                          ) : (
                            <label htmlFor="contained-button-file">
                              <Input
                                accept="*"
                                id="contained-button-file"
                                type="file"
                                onChange={captureFile}
                              />
                              <Button variant="contained" component="span">
                                File FIR
                              </Button>
                            </label>
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
                          ) : complaint.fir_status ||
                            complaint.complaint_accepted ? (
                            <Button variant="contained" disabled>
                              FIR Filed
                            </Button>
                          ) : !reasonfilebuffer ? (
                            <label htmlFor="contained-button-file">
                              <Input
                                accept="*"
                                id="contained-button-file"
                                type="file"
                                onChange={captureReasonFile}
                              />
                              <Button
                                color="error"
                                component="span"
                                variant="contained"
                              >
                                File spam
                              </Button>
                            </label>
                          ) : (
                            <Button
                              onClick={() => {
                                handleSpam(complaint.complaint_id);
                              }}
                              variant="contained"
                              color="success"
                            >
                              Submit Reason
                            </Button>
                          )}
                        </StyledTableCell>
                      </StyledTableRow>
                    )
                )}{" "}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </>
  );
}
export default PoliceHome;
