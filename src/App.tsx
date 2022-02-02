import React, { useEffect, useRef, useState } from 'react'
import logo from './logo.svg'
import './App.css'
import {
  Button,
  Form,
  FormCheck,
  FormControl,
  InputGroup,
  Modal,
} from 'react-bootstrap'

import { TwitterPicker } from 'react-color'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

// import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-dark-5/dist/css/bootstrap-dark.min.css'


function setStorage(name: string, value: any) {
  localStorage.setItem(name, JSON.stringify(value))
}

function getStorage(name: string) {
  var item = localStorage.getItem(name)
  if (item) {
    return JSON.parse(item)
  }
  return null
}

function UI(props: any) {
  const [show, setShow] = useState(false)
  const [title, setTitle] = useState('')
  const [theme, setTheme] = useState('')
  const [color, setColor] = useState('')
  const [colorDisplay, setColorDisplay] = useState(true)
  const [important, setImportant] = useState(false)

  const [themes, setThemes] = useState(getStorage('themes'))
  const [options, setOptions] = useState([] as any[])

  const colorRef = useRef(null)

  useEffect(() => {
    setThemes(getStorage('themes'))

    var tempOptions: any[] = []
    if (themes) {
      Object.keys(themes).forEach((element) => {
        tempOptions.push(<option value={element}>{element}</option>)
      })
    } else {
      setStorage('themes', { None: null })
      tempOptions = [<option value={'None'}>None</option>]
    }
    setOptions(tempOptions)
  }, [show])

  useEffect(() => {
    props.setDeleting(false)
  },[props.dragging])

  function onSub(e: any) {
    e.preventDefault()

    var itemTemp: any = {}

    if (theme.toLowerCase() !== 'none') {
      var themesTemp = getStorage('themes')
      themesTemp[theme] = color
      setStorage('themes', themesTemp)
      itemTemp['color'] = theme
    } else {
      itemTemp['color'] = color
    }

    itemTemp['title'] = title
    itemTemp['important'] = important

    var itemListTemp = getStorage('items') || []
    itemListTemp.push(itemTemp)
    setStorage('items', itemListTemp)

    setTitle('')
    setTheme('')
    setColor('')
    setImportant(false)

    setShow(false)
    props.setUpdate()
  }

  function onChangeTheme(e: any) {
    var theme = e.target.value;
    if (Object.keys(themes).includes(theme)) {
      setColor(themes[theme]);
    }
    setTheme(theme)
    
  }

  function deleteDragIn(e: any) {
    if (props.dragging) {
      props.setDeleting(true)
    }
  }

  function deleteDragOut(e: any) {
    if (props.dragging) {
      props.setDeleting(false)
    }
  }

  return (
    <div className="ui">
      <div className="add" onClick={() => setShow(true)}>
        <img src="./imgs/plusWhite.png" />
      </div>

      <div onMouseEnter={deleteDragIn} onMouseLeave={deleteDragOut} className={(props.dragging) ? 'trash-on' : 'trash-off'}>
        <img src="./imgs/xWhite.png" />
      </div>

      <Modal  size="sm" show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <h1>Add an Event</h1>
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

            <InputGroup className="mb-3">
              <InputGroup.Text id="title">Theme</InputGroup.Text>
              <FormControl
                required
                list="list"
                placeholder="Theme"
                defaultValue={theme}
                onChange={onChangeTheme}
              />

              <datalist id="list">{options}</datalist>
            </InputGroup>

            <InputGroup className="mb-3">
              <InputGroup.Text
                style={{ width: '2.5rem', backgroundColor: color }}
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

            {colorDisplay ? (
              <TwitterPicker
                onChangeComplete={(e: any) => setColor(e.hex)}
                className="mb-3"
              />
            ) : null}

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
  )
}

function Item(props: any) {
  var themeColor = props.themes[props.color] || props.color
  var id = props.index

  const styles = {
    color: themeColor,
    borderColor: themeColor,
    backgroundColor: themeColor + '15',
  }

  return (
    <Draggable key={props.title} draggableId={props.title} index={id}>
      {(provided) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div style={styles} className="item">
            <p>{props.title}</p>
          </div>
        </li>
      )}
    </Draggable>
  )
}

function Calendar(props: any) {
  const [items, setItems] = useState([])

  useEffect(() => {
    console.log('update')
    var themes = getStorage('themes')
    var itemListTemp = getStorage('items')
    if (!itemListTemp) {
      return
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
        )
      }),
    )
  }, [props.update])

  function dragEnd(result: any) {
    if (!result.destination) return

    var itemListTemp = getStorage('items')
    var themes = getStorage('themes')

    if (props.deleting) {
      itemListTemp.splice(result.destination.index, 1)
      console.log(itemListTemp)
      setStorage('items', itemListTemp)
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
          )
        }),
      )
      props.setDragging(false)
      return;
    }

    console.log(result)

    
    const [reorderedItem] = itemListTemp.splice(result.source.index, 1)
    itemListTemp.splice(result.destination.index, 0, reorderedItem)
    setStorage('items', itemListTemp)
    
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
        )
      }),
    )
    props.setDragging(false)
  }

  return (
    <DragDropContext
      onDragEnd={dragEnd}
      onDragStart={() => props.setDragging(true)}
    >
      <Droppable droppableId="calendar">
        {(provided) => (
          <ul
            className="calendar"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {items}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  )
}

function App() {
  const [update, setUpdate] = useState(true)
  const [dragging, setDragging] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    console.log('dragging')
  })

  return (
    <div className="App">
      <Calendar deleting={deleting} update={update} setDragging={setDragging} />
      <UI setDeleting={setDeleting} dragging={dragging} setUpdate={() => setUpdate(!update)} />
    </div>
  )
}

export default App
