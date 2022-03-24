import {
  Button,
  Form,
  FormCheck,
  FormControl,
  InputGroup,
  Modal,
} from "react-bootstrap";
import { httpPostAsync } from "../assets/serverHandler";
import React, { useEffect, useState, useRef } from "react";
import { getStorage, setStorage } from "../assets/storageHandler";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import Item from "./Item";
import { TwitterPicker } from "react-color";

import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import TimePicker from "@mui/lab/TimePicker";
import DateTimePicker from "@mui/lab/DateTimePicker";
import DesktopDatePicker from "@mui/lab/DesktopDatePicker";
import MobileDatePicker from "@mui/lab/MobileDatePicker";

let interval: any = "";

export default function Calendar(props: any) {
  const [date, setDate] = React.useState<Date | null>(new Date());

  const handleChange = (newValue: Date | null) => {
    setDate(newValue);
  };

  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("None");
  const [color, setColor] = useState("#ABB8C3");
  const [important, setImportant] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [themes, setThemes] = useState(getStorage("themes"));
  const [options, setOptions] = useState([] as any[]);

  const colorRef = useRef(null);
  const titleRef = useRef<any>(null);

  // clearInterval(interval)

  function createReactItems(data: any) {
    setItems(
      data.map((e: any, i: number) => {
        return (
          <Item
            themes={themes}
            title={e.title}
            color={e.color}
            date={e.date || null}
            important={e.important}
            index={i}
            setShowModal={setShowModal}
            setTitle={setTitle}
            setTheme={setTheme}
            setColor={setColor}
            setDate={setDate}
            setImportant={setImportant}
            setCurrentIndex={setCurrentIndex}
          />
        );
      })
    );
  }

  function handleGetServerData(data: any) {
    data = JSON.parse(data);
    data = JSON.parse(data);
    let themes = data.themes;
    data = data.items;

    if (!data) {
      return;
    }

    // console.log(getStorage('items') + '   ' + data)
    if (getStorage("items") === data) {
      return;
    }

    setStorage("items", data);
    setStorage("themes", themes);

    createReactItems(data);
  }

  function attemptServerUpdateData() {
    if (!props.loggedIn) {
      return;
    }
    httpPostAsync(
      "/setData",
      "user=" +
        localStorage.getItem("user") +
        "&items=" +
        JSON.stringify(getStorage("items")) +
        "&themes=" +
        JSON.stringify(getStorage("themes"))
    );
  }

  function unAuth() {
    console.log("IHIADSH");
    props.setToggleNeedsRefresh();
  }

  useEffect(() => {
    if (props.loggedIn) {
      clearInterval(interval);
      interval = setInterval(() => {
        httpPostAsync(
          "/getData",
          "user=" + localStorage.getItem("user"),
          handleGetServerData,
          console.log,
          unAuth
        );
      }, 1000);
    }
  }, [props.loggedIn]);

  useEffect(() => {
    console.log("update");

    var themes = getStorage("themes");
    var itemListTemp = getStorage("items");

    if (!itemListTemp) {
      return;
    }
    createReactItems(itemListTemp);
  }, [props.update]);

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
  }, [showModal]);

  function dragEnd(result: any) {
    console.log(result);

    if (!result.destination) return;

    var itemListTemp = getStorage("items");
    var themes = getStorage("themes");

    if (props.deleting) {
      // DELETING
      itemListTemp.splice(result.source.index, 1);
      console.log(itemListTemp);
      setStorage("items", itemListTemp);
      attemptServerUpdateData();
      createReactItems(itemListTemp);
      props.setDragging(false);
      return;
    }

    console.log(result);

    const [reorderedItem] = itemListTemp.splice(result.source.index, 1);
    itemListTemp.splice(result.destination.index, 0, reorderedItem);
    setStorage("items", itemListTemp);
    createReactItems(itemListTemp);
    attemptServerUpdateData();

    props.setDragging(false);
  }

  function onSub(e: any) {
    e.preventDefault();

    console.log(items);
    console.log(currentIndex);
    // return;

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
    itemTemp["date"] = date;
    itemTemp["important"] = important;

    var itemListTemp = getStorage("items") || [];
    itemListTemp[currentIndex] = itemTemp;
    setStorage("items", itemListTemp);
    attemptServerUpdateData();

    setTitle("");
    setTheme("None");
    setColor("#ABB8C3");
    setImportant(false);

    setShowModal(false);
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

  return (
    <DragDropContext
      onDragEnd={dragEnd}
      onDragStart={() => props.setDragging(true)}
    >
      <Droppable droppableId="calendar">
        {(provided) => (
          <ul
            className={props.loggedIn ? "calendar on" : "calendar off"}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {items}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>

      <Modal size="sm" show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <h1>Update Item</h1>
        </Modal.Header>
        <Form onSubmit={onSub}>
          <Modal.Body>
            <InputGroup className="mb-3">
              <InputGroup.Text id="title">Title</InputGroup.Text>
              <FormControl
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
            <Button onClick={() => setShowModal(false)} variant="secondary">
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </DragDropContext>
  );
}
