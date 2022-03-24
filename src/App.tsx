import React, { useEffect, useRef, useState } from "react";

import "./App.css";

// import 'bootstrap/dist/css/bootstrap.min.css'
import "bootstrap-dark-5/dist/css/bootstrap-dark.min.css";
import UI from "./elements/UI";
import Calendar from "./elements/Calendar";

// window.location.href = "https://localhost:5000/"

function App() {
  const [update, setUpdate] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggleNeedsRefresh, setToggleNeedsRefresh] = useState(true);
  const container = useRef<any>(null);

  useEffect(() => {
    if (container.current) {
      container.current.scrollTo(0, 0);
    }
  });

  useEffect(() => {
    console.log("toggleNeedsRefresh");
  }, [toggleNeedsRefresh]);

  return (
    <div className="App" ref={container}>
      <Calendar
        deleting={deleting}
        update={update}
        setDragging={setDragging}
        setUpdate={() => setUpdate(!update)}
        loggedIn={loggedIn}
        setToggleNeedsRefresh={() => {
          setToggleNeedsRefresh(!toggleNeedsRefresh);
        }}
      />
      <UI
        setDeleting={setDeleting}
        dragging={dragging}
        setLoggedIn={setLoggedIn}
        setUpdate={() => setUpdate(!update)}
        toggleNeedsRefresh={toggleNeedsRefresh}
      />
    </div>
  );
}

export default App;
