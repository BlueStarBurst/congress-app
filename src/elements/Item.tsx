import { useRef } from "react";
import { Draggable } from "react-beautiful-dnd";

export default function Item(props: any) {
  let themeColor = props.themes[props.color] || props.color;
  let id = props.index;
  let importantClass = props.important ? "item-important" : "";

  const dateRef = useRef<any>(null);

  const styles = {
    color: themeColor,
    borderColor: themeColor,
    backgroundColor: props.important ? themeColor + "25" : themeColor + "15",
  };

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
    <Draggable key={props.title} draggableId={props.title} index={id}>
      {(provided) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div
            style={styles}
            onMouseEnter={onHoverEnter}
            onMouseLeave={onHoverLeave}
            className={
              props.notAdded
                ? "item added notAdded " + importantClass
                : "item added " + importantClass
            }
          >
            <div onClick={onEditClick} className="item-over"></div>
            <div className="item-col">
              <p>{props.title}</p>
              {(props.date && typeof props.date === "string" ) ? (
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
