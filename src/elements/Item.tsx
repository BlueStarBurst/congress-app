import { Draggable } from "react-beautiful-dnd";

export default function Item(props: any) {
  let themeColor = props.themes[props.color] || props.color;
  let id = props.index;
  let importantClass = (props.important) ? "item-important" : "";

  const styles = {
    color: themeColor,
    borderColor: themeColor,
    backgroundColor: (props.important) ? themeColor + "25" : themeColor + "15",
  };

  function onEditClick(e: any) {
    props.setTitle(props.title);
    if (props.themes[props.color]) {
      props.setTheme(props.color);
    }
    props.setColor(themeColor);
    props.setImportant(props.important);
    props.setCurrentIndex(props.index);
    props.setShowModal(true)
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
            className={props.notAdded ? "item added notAdded " + importantClass : "added item " + importantClass}
          >
            <div onClick={onEditClick} className="item-over"></div>
            <p>{props.title}</p>
          </div>
        </li>
      )}
    </Draggable>
  );
}
