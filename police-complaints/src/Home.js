import "./App.css";
import ipfs from "./ipfs";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, TextField, Input } from "@mui/material";
import { Box } from "@mui/system";
function App() {
  const [buttonGroup, setButton] = useState(1);
  const [policepin, setPolicePIN] = useState("");
  const [filebuffer, setFileBuffer] = useState(null);
  const [ipfshash, setIPFSHash] = useState("");
  let navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("Auth Token");
    navigate("/login");
  };

  useEffect(() => {
    let authToken = sessionStorage.getItem("Auth Token");

    if (authToken) {
      navigate("/home");
    }

    if (!authToken) {
      navigate("/login");
    }
  }, []);

  const captureFile = (event) => {
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      // this.setState({ buffer: Buffer(reader.result)
      setFileBuffer(Buffer(reader.result));
    };
    console.log("buffer:", filebuffer);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    ipfs.files.add(filebuffer, async (error, result) => {
      if (error) {
        console.error(error);
        return;
      }
      setIPFSHash(result[0].hash);
      console.log("ifpsHash", ipfshash);
    });
  };

  return (
    <div className="Home">
      <h1>Home</h1>
      <Button variant="outlined" color="error" onClick={handleLogout}>
        Log out
      </Button>
      <div>
        <ButtonGroup sx={{ margin: 4 }} disableElevation variant="contained">
          <Button onClick={() => setButton(1)}>View Complaints</Button>
          <Button onClick={() => setButton(2)}>File A Complaint</Button>
        </ButtonGroup>
        {buttonGroup === 1 ? (
          <Container>Complaints</Container>
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
