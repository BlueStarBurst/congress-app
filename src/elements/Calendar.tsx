import { httpPostAsync } from "../assets/serverHandler";
import React, { useEffect, useState } from "react";
import { getStorage, setStorage } from "../assets/storageHandler";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import Item from "./Item";

let interval: any = "";

export default function Calendar(props: any) {
  const [items, setItems] = useState([]);

  // clearInterval(interval)

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

    setItems(
      data.map((e: any, i: number) => {
        return (
          <Item
            themes={themes}
            title={e.title}
            color={e.color}
            important={e.important}
            index={i}
          />
        );
      })
    );
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
    setItems(
      itemListTemp.map((e: any, i: number) => {
        return (
          <Item
            themes={themes}
            title={e.title}
            color={e.color}
            important={e.important}
            index={i}
          />
        );
      })
    );
  }, [props.update]);

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
      setItems(
        itemListTemp.map((e: any, i: number) => {
          return (
            <Item
              notAdded
              themes={themes}
              title={e.title}
              color={e.color}
              important={e.important}
              index={i}
            />
          );
        })
      );
      props.setDragging(false);
      return;
    }

    console.log(result);

    const [reorderedItem] = itemListTemp.splice(result.source.index, 1);
    itemListTemp.splice(result.destination.index, 0, reorderedItem);
    setStorage("items", itemListTemp);
    setItems(
      itemListTemp.map((e: any, i: number) => {
        return (
          <Item
            notAdded
            themes={themes}
            title={e.title}
            color={e.color}
            important={e.important}
            index={i}
          />
        );
      })
    );
    attemptServerUpdateData();

    props.setDragging(false);
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
    </DragDropContext>
  );
}
