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

import 'bootstrap/dist/css/bootstrap.min.css'

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

    var itemListTemp = getStorage('items') || [];
    itemListTemp.push(itemTemp);
    setStorage('items', itemListTemp);

    setTitle('')
    setTheme('')
    setColor('')
    setImportant(false)

    setShow(false)
    props.setUpdate()
  }

  function onChangeTheme(e : any) {
    var theme = e.target.value
    setTheme(theme)
  }

  return (
    <div className="ui">
      <div onClick={() => setShow(true)}>
        <img src="./imgs/plusWhite.png" />
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
                style={{ width: '8%', backgroundColor: color }}
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

function Item(props : any) {

  var themeColor = props.themes[props.color] || props.color;

  console.log(props.color)
  return (
    // https://codepen.io/retrofuturistic/pen/DJWYBv
    <li draggable className="item" style={{color: themeColor, borderColor: themeColor, backgroundColor: themeColor + "15"}}>
      <p>{props.title}</p>
    </li>
  )
}

function Calendar(props: any) {
  const [items, setItems] = useState([])

  useEffect(() => {
    console.log("update")
    var themes = getStorage('themes');
    var itemListTemp = getStorage('items'); 
    if (!itemListTemp) {
      return;
    }
    setItems(itemListTemp.map((e:any,i:number) => {
      return (<Item themes={themes} title={e.title} color={e.color} important={e.important}/>)
    }))

  }, [props.update])

  return (
    <ul className="calendar">
      {items}
    </ul>
  )
}

function App() {

  const [update, setUpdate] = useState(true)

  return (
    <div className="App">
      <Calendar update={update} />
      <UI setUpdate={() => setUpdate(!update)} />
    </div>
  )
}

export default App
