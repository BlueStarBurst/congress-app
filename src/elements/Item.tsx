import { useEffect, useRef } from "react";
import { Draggable } from "react-beautiful-dnd";

export default function Item(props: any) {
  let themeColor = props.themes[props.color] || props.color;
  let id = props.id;
  let importantClass = props.important ? "item-important" : "";

  let daysLeft: any =
    props.date && typeof props.date === "string"
      ? new Date(props.date).getUTCDay() - new Date().getUTCDay()
      : null;
  switch (daysLeft) {
    case null:
      break;
    case 0:
      daysLeft = "today";
      break;
    case 1:
      daysLeft = "1 day left";
      break;
    case daysLeft > 1:
      daysLeft = "1 day left";
      break;
    default:
      daysLeft = daysLeft + " days left";
  }

  const dateRef = useRef<any>(null);

  const styles = {
    color: themeColor,
    borderColor: themeColor,
    backgroundColor: props.important ? themeColor + "50" : themeColor + "15",
  };

  // useEffect(()=> {
  //   console.log("sdkfj");
  // },[props.index])

  function onEditClick(e: any) {
    props.setTitle(props.title);
    if (props.themes[props.color]) {
      props.setTheme(props.color);
    }
    props.setColor(themeColor);
    props.setImportant(props.important);
    props.setCurrentIndex(props.index);
    props.setDate(props.date);
    props.setShowModal(true);
  }

  function onHoverEnter(e: any) {
    if (!dateRef.current) {
      return;
    }
    dateRef.current.className = "item-date expanded";
  }

  function onHoverLeave(e: any) {
    if (!dateRef.current) {
      return;
    }
    dateRef.current.className = "item-date";
  }

  return (
    <Draggable key={props.title} draggableId={id} index={props.index}>
      {(provided) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={"itemIn"}
          id={id}
        >
          <div
            style={styles}
            onMouseEnter={onHoverEnter}
            onMouseLeave={onHoverLeave}
            className={
              props.notAdded
                ? "item " + importantClass
                : "item " + importantClass
            }
          >
            <div onClick={onEditClick} className="item-over"></div>
            <div className="item-col">
              <div className="item-head">
                <p>{props.title}</p>
                {daysLeft ? <p className="item-head-small">{daysLeft}</p> : null}
              </div>

              {props.date && typeof props.date === "string" ? (
                <p ref={dateRef} className="item-date">
                  {new Date(props.date).toDateString()}
                </p>
              ) : null}
            </div>
          </div>
        </li>
      )}
    </Draggable>
  );
}
