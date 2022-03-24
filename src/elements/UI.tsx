import {
  Button,
  Form,
  FormCheck,
  FormControl,
  InputGroup,
  Modal,
} from "react-bootstrap";
import { TwitterPicker } from "react-color";
import { httpPostAsync } from "../assets/serverHandler";
import React, { useEffect, useRef, useState } from "react";
import { getStorage, setStorage } from "../assets/storageHandler";
import { b64_sha256 } from "../assets/hash";

// import AdapterDateFns from "@mui/lab/AdapterDateFns";
// import type LocalizationProvider from "@mui/lab/LocalizationProvider";
// import { DatePicker, LocalizationProvider } from "@mui/lab";
// import { TextField } from "@mui/material";

// import AdapterDateFns from "@material-ui/pickers/DatePicker"

import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import TimePicker from "@mui/lab/TimePicker";
import DateTimePicker from "@mui/lab/DateTimePicker";
import DesktopDatePicker from "@mui/lab/DesktopDatePicker";
import MobileDatePicker from "@mui/lab/MobileDatePicker";

let interval: any = "";

export default function UI(props: any) {
  const [date, setDate] = React.useState<Date | null>(new Date());

  const handleChange = (newValue: Date | null) => {
    setDate(newValue);
  };

  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("None");
  const [color, setColor] = useState("#ABB8C3");
  const [important, setImportant] = useState(false);

  const [themes, setThemes] = useState(getStorage("themes"));
  const [options, setOptions] = useState([] as any[]);

  const colorRef = useRef(null);
  const titleRef = useRef<any>(null);

  const [showSyncTab, setShowSyncTab] = useState("syncTab");
  const userRef = useRef(null);
  const [user, setUser] = useState(localStorage.getItem("user") || "");
  const passRef = useRef(null);
  const [pass, setPass] = useState(localStorage.getItem("pass") || "");
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const [createUserModalShow, setCreateUserModalShow] = useState(false);

  function attemptServerUpdateData() {
    httpPostAsync(
      "/setData",
      "user=" +
        localStorage.getItem("user") +
        "&items=" +
        JSON.stringify(getStorage("items")) +
        "&themes=" +
        JSON.stringify(getStorage("themes")),
      console.log,
      console.log,
      unAuth
    );
  }

  function handleError() {
    // setShowSyncTab('sync-inactive syncTab')
    setIsLoggedIn(false);
    props.setLoggedIn(false);
  }

  function unAuth(e: any) {
    console.log(e);
    localStorage.removeItem("session");
    // setShowSyncTab('sync-inactive syncTab')
    setIsLoggedIn(false);
    props.setLoggedIn(false);
  }

  function onAuth(data: any) {
    console.log(data);
    setIsLoggedIn(true);
    setShowSyncTab("sync-dis syncTab");
    console.log("yeah ok math checks out");
    props.setUpdate();
    props.setLoggedIn(true);
  }

  let counter = 0;
  function handleAuth(data: string) {
    localStorage.setItem("user", user);
    localStorage.setItem("pass", pass);
    localStorage.setItem("session", data);
    setShowSyncTab("sync-dis syncTab");
    props.setLoggedIn(true);
    counter = 0;
  }

  function initFail() {
    if (counter > 0) {
      return;
    }
    console.log("login");
    httpPostAsync(
      "/login",
      "user=" + user + "&pass=" + pass,
      handleAuth,
      handleError
    );
    counter++;
  }

  useEffect(() => {
    httpPostAsync("/auth", "", onAuth, console.log, initFail);
  }, [props.toggleNeedsRefresh]);

  useEffect(() => {
    if (!localStorage.getItem("session")) {
      if (localStorage.getItem("user") && localStorage.getItem("user")) {
        interval = setInterval(() => {
          httpPostAsync(
            "/login",
            "user=" + user + "&pass=" + pass,
            handleAuth,
            handleError
          );
        }, 5000);
      }
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus();
    }
    setThemes(getStorage("themes"));
    var tempOptions: any[] = [];
    if (themes) {
      Object.keys(themes).forEach((element) => {
        tempOptions.push(<option value={element}>{element}</option>);
      });
    } else {
      setStorage("themes", { None: "#ABB8C3" });
      tempOptions = [<option value={"None"}>None</option>];
    }
    setOptions(tempOptions);
  }, [show]);

  useEffect(() => {
    props.setDeleting(false);
  }, [props.dragging]);

  function onSub(e: any) {
    e.preventDefault();

    var itemTemp: any = {};

    if (theme.toLowerCase() !== "none") {
      var themesTemp = getStorage("themes");
      themesTemp[theme] = color;
      setStorage("themes", themesTemp);
      itemTemp["color"] = theme;
    } else {
      itemTemp["color"] = color;
    }

    itemTemp["title"] = title;
    itemTemp["important"] = important;
    itemTemp["date"] = date;

    var itemListTemp = getStorage("items") || [];
    itemListTemp.push(itemTemp);
    setStorage("items", itemListTemp);
    attemptServerUpdateData();

    setTitle("");
    setTheme("None");
    setColor("#ABB8C3");
    setImportant(false);

    setShow(false);
    props.setUpdate();
  }

  function onChangeTheme(e: any) {
    var theme = e.target.value;

    if (Object.keys(themes).includes(theme)) {
      setColor(themes[theme]);
    } else if (theme === "None") {
      console.log("theme");
      var themesTemp = getStorage("themes");
      themesTemp[theme] = color;
      setStorage("themes", themesTemp);
    }
    setTheme(theme);
  }

  function deleteDragIn(e: any) {
    if (props.dragging) {
      props.setDeleting(true);
    }
  }

  function deleteDragOut(e: any) {
    if (props.dragging) {
      props.setDeleting(false);
    }
  }

  function handleSyncClick(e: any) {
    if (localStorage.getItem("session")) {
      setShowSyncTab("sync-dis syncTab");
      return;
    }

    // console.log(e)
    if (e.target.id === "sync") {
      if (showSyncTab === "syncTab") {
        setShowSyncTab("syncTab sync-active");
      } else {
        setShowSyncTab("syncTab");
      }
    }
  }

  function handleSyncBtnClick(e: any) {
    e.preventDefault();

    if (localStorage.getItem("session")) {
      setShowSyncTab("syncTab");
      return;
    }

    // console.log(user + '  ' + pass)

    httpPostAsync("/login", "user=" + user + "&pass=" + pass, handleAuth, () =>
      setShowSyncTab("syncTab sync-active")
    );
    // setShowSyncTab("sync-dis syncTab")
  }

  const createUser = useRef<any>(null);
  const createPass = useRef<any>(null);
  const createPassCheck = useRef<any>(null);

  function onSuccessCreate(data: any) {
    setCreateUserModalShow(false);
    setUser(createUser.current.value);
    let tempSha = b64_sha256(createPass.current.value);
    setPass(tempSha);
    httpPostAsync(
      "/login",
      "user=" + createUser.current.value + "&pass=" + tempSha,
      handleAuth,
      () => setShowSyncTab("syncTab sync-active")
    );
    console.log("SUCCESS");
  }

  function submitCreateUser(e: any) {
    e.preventDefault();
    if (createPass?.current?.value !== createPassCheck?.current?.value) {
      return;
    }

    httpPostAsync(
      "/signup",
      "user=" +
        createUser.current.value +
        "&pass=" +
        b64_sha256(createPass.current.value),
      onSuccessCreate
    );
  }

  return (
    <div className="ui">
      <div className="ui-main">
        <div className="add" onClick={() => setShow(true)}>
          <img alt="a" src="./imgs/plusWhite.png" />
        </div>

        <div
          onMouseEnter={deleteDragIn}
          onMouseLeave={deleteDragOut}
          className={props.dragging ? "trash-on" : "trash-off"}
        >
          <img alt="b" src="./imgs/xWhite.png" />
        </div>

        <Modal size="sm" show={show} onHide={() => setShow(false)}>
          <Modal.Header closeButton>
            <h1>Add an Event</h1>
          </Modal.Header>
          <Form onSubmit={onSub}>
            <Modal.Body>
              <InputGroup className="mb-3">
                <InputGroup.Text id="title">Title</InputGroup.Text>
                <FormControl
                  ref={titleRef}
                  placeholder="Name of Event"
                  defaultValue={title}
                  required
                  onChange={(e) => setTitle(e.target.value)}
                />
              </InputGroup>
              <Stack>
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  className="mb-3"
                >
                  <DesktopDatePicker
                    label="Date"
                    inputFormat="MM/dd/yyyy"
                    value={date}
                    onChange={handleChange}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </Stack>

              <InputGroup className="mb-3 mt-3">
                <InputGroup.Text id="title">Theme</InputGroup.Text>
                <FormControl
                  required
                  list="list"
                  placeholder="Theme"
                  defaultValue={theme}
                  onChange={onChangeTheme}
                  onFocus={(e) => {
                    e.target.value = "";
                  }}
                />

                <datalist id="list">{options}</datalist>
              </InputGroup>

              <InputGroup className="mb-3">
                <InputGroup.Text
                  style={{ width: "2.5rem", backgroundColor: color }}
                  id="title"
                ></InputGroup.Text>
                <FormControl
                  required
                  ref={colorRef}
                  placeholder="(will set the theme to this color)"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </InputGroup>

              <TwitterPicker
                onChangeComplete={(e: any) => setColor(e.hex)}
                className="mb-3"
                colors={[
                  "#FF6900",
                  "#FCB900",
                  "#7BDCB5",
                  "#00D084",
                  "#8ED1FC",
                  "#0693E3",
                  "#ABB8C3",
                  "#EB144C",
                  "#F78DA7",
                  "#9900EF",
                ]}
                color={color}
              />

              <FormCheck
                label="Important"
                checked={important}
                onChange={(e) => setImportant(e.target.checked)}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => setShow(false)} variant="secondary">
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
      <div id="sync" className={showSyncTab} onClick={handleSyncClick}>
        <Form
          style={{ width: "100%" }}
          onSubmit={handleSyncBtnClick}
          autoComplete="on"
        >
          <InputGroup className="mb-0">
            <InputGroup.Text id="user">User</InputGroup.Text>
            <FormControl
              ref={userRef}
              placeholder="User Name"
              required
              defaultValue={user}
              autoComplete="username"
              type="username"
              onChange={(e) => setUser(e.target.value)}
            />
          </InputGroup>
          <InputGroup className="mb-0">
            <InputGroup.Text id="pass">Pass</InputGroup.Text>
            <FormControl
              ref={passRef}
              placeholder="Password"
              autoComplete="password"
              type="password"
              required
              defaultValue={pass}
              onChange={(e) => setPass(b64_sha256(e.target.value))}
            />
          </InputGroup>

          <div style={{ display: "flex" }}>
            <Button
              style={{ width: "50%" }}
              className="w-50"
              variant="secondary"
              onClick={(e) => {
                setCreateUserModalShow(true);
              }}
            >
              Create User
            </Button>
            <Button style={{ width: "50%" }} type="submit" className="w-50">
              Submit
            </Button>
          </div>
        </Form>
      </div>

      <Modal
        show={createUserModalShow}
        onHide={() => {
          setCreateUserModalShow(false);
        }}
      >
        <Form autoComplete="off" onSubmit={submitCreateUser}>
          <Modal.Header closeButton>Create User</Modal.Header>
          <Modal.Body>
            <InputGroup className="mb-3">
              <InputGroup.Text id="createUser">User</InputGroup.Text>
              <FormControl
                placeholder="User Name"
                required
                defaultValue={""}
                autoComplete="new-username"
                type="username"
                ref={createUser}
              />
            </InputGroup>

            <InputGroup className="mb-3">
              <InputGroup.Text id="createPass">Password</InputGroup.Text>
              <FormControl
                placeholder="Password"
                type="password"
                autoComplete="new-password"
                required
                defaultValue={""}
                ref={createPass}
              />
            </InputGroup>

            <InputGroup className="mb-3">
              <InputGroup.Text id="createPass">Password</InputGroup.Text>
              <FormControl
                placeholder="Confirm Password"
                type="password"
                autoComplete="new-password"
                required
                defaultValue={""}
                ref={createPassCheck}
              />
            </InputGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={() => {
                setCreateUserModalShow(false);
              }}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
