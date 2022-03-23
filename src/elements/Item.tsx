import { Draggable } from "react-beautiful-dnd";

export default function Item(props: any) {
  var themeColor = props.themes[props.color] || props.color;
  var id = props.index;

  const styles = {
    color: themeColor,
    borderColor: themeColor,
    backgroundColor: themeColor + "15",
  };

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
            className={props.notAdded ? "item added notAdded" : "added item"}
          >
            <div className="item-over"></div>
            <p>{props.title}</p>
          </div>
        </li>
      )}
    </Draggable>
  );
}
