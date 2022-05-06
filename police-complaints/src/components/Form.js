import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import FaceIcon from "@mui/icons-material/Face";
import { Link } from "react-router-dom";
import {
  Button as Connectbutton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import Button from "./Button";
export default function BasicTextFields(props) {
  const [usertypevalue, setUserTypeValue] = React.useState("");
  return (
    <div>
      {props.title === "Login" ? (
        <Link style={{ textDecoration: "none" }} to="/register">
          <Connectbutton
            sx={{ marginTop: 3 }}
            variant="outlined"
            startIcon={<FaceIcon />}
          >
            Register
          </Connectbutton>
        </Link>
      ) : (
        <Link style={{ textDecoration: "none" }} to="/">
          <Connectbutton
            sx={{ marginTop: 3 }}
            variant="outlined"
            startIcon={<FaceIcon />}
          >
            Login
          </Connectbutton>
        </Link>
      )}
      <div className="heading-container">
        <h3>{props.title} Form</h3>
      </div>

      <Box
        component="form"
        sx={{
          "& > :not(style)": { m: 1, width: "25ch" },
        }}
        noValidate
        autoComplete="off"
      >
        <TextField
          id="email"
          label="Enter the Email"
          variant="outlined"
          onChange={(e) => props.setEmail(e.target.value)}
        />
        <TextField
          id="password"
          label="Enter the Password"
          variant="outlined"
          onChange={(e) => props.setPassword(e.target.value)}
        />
        {props.title !== "Login" && (
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">User Type</InputLabel>
            <Select
              defaultValue={"complainer"}
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Select User"
              onChange={(e) => {
                props.setUserType(e.target.value);
                setUserTypeValue(e.target.value);
              }}
            >
              <MenuItem value={"complainer"}>Complainer</MenuItem>
              <MenuItem value={"police"}>Police</MenuItem>
            </Select>
            {usertypevalue === "police" && (
              <div>
                <TextField
                  sx={{
                    marginTop: 2,
                  }}
                  onChange={(e) => props.setStationPin(e.target.value)}
                  id="outlined-basic"
                  label="PIN CODE"
                  variant="outlined"
                />
              </div>
            )}
          </FormControl>
        )}
        <Connectbutton
          onClick={props.handleConnect}
          className="connectbutton"
          variant="outlined"
        >
          {props.accountaddress ? "Connected" : "Connect"}
        </Connectbutton>
      </Box>

      <Button title={props.title} handleAction={props.handleAction} />
    </div>
  );
}
