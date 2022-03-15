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
import { httpPostAsync } from './serverHandler'
import internal from 'stream'
import { IntervalHistogram } from 'perf_hooks'

// window.location.href = "https://localhost:5000/"

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
  const [theme, setTheme] = useState('None')
  const [color, setColor] = useState('#ABB8C3')
  const [colorDisplay, setColorDisplay] = useState(true)
  const [important, setImportant] = useState(false)

  const [themes, setThemes] = useState(getStorage('themes'))
  const [options, setOptions] = useState([] as any[])

  const colorRef = useRef(null)
  const titleRef = useRef<any>(null)

  const [showSyncTab, setShowSyncTab] = useState('syncTab')
  const userRef = useRef(null)
  const [user, setUser] = useState(localStorage.getItem('user') || '')
  const passRef = useRef(null)
  const [pass, setPass] = useState(localStorage.getItem('pass') || '')
  const [isLoggedIn, setIsLoggedIn] = useState(true)

  let checkEx: any

  function attemptServerUpdateData() {
    httpPostAsync(
      '/setData',
      'user=' +
        localStorage.getItem('user') +
        '&items=' +
        JSON.stringify(getStorage('items')) +
        '&themes=' +
        JSON.stringify(getStorage('themes')),
    )
  }

  function handleError() {
    setShowSyncTab('sync-inactive syncTab')
    setIsLoggedIn(false)
    props.setLoggedIn(false)
  }

  function unAuth(e: any) {
    console.log(e)
    localStorage.removeItem('session')
    // setShowSyncTab('sync-inactive syncTab')
    setIsLoggedIn(false)
    props.setLoggedIn(false)
  }

  function onAuth(data: any) {
    console.log(data)
    setIsLoggedIn(true)
    setShowSyncTab('sync-dis syncTab')
    console.log('yeah ok math checks out')
    props.setUpdate()
    props.setLoggedIn(true)
  }

  function handleAuth(data: string) {
    localStorage.setItem('session', data)
    setShowSyncTab('sync-dis syncTab')
    props.setLoggedIn(true)
  }

  useEffect(() => {
    httpPostAsync('/auth', '', onAuth, unAuth, unAuth)
  }, [props.toggleNeedsRefresh])

  useEffect(() => {
    if (!localStorage.getItem('session')) {
      if (user !== '' && pass !== '') {
        interval = setInterval(() => {
          httpPostAsync(
            '/login',
            'user=' + user + '&pass=' + pass,
            handleAuth,
            handleError,
          )
        }, 5000)
      }
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus()
    }
    setThemes(getStorage('themes'))
    var tempOptions: any[] = []
    if (themes) {
      Object.keys(themes).forEach((element) => {
        tempOptions.push(<option value={element}>{element}</option>)
      })
    } else {
      setStorage('themes', { None: '#ABB8C3' })
      tempOptions = [<option value={'None'}>None</option>]
    }
    setOptions(tempOptions)
  }, [show])

  useEffect(() => {
    props.setDeleting(false)
  }, [props.dragging])

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
    attemptServerUpdateData()

    setTitle('')
    setTheme('None')
    setColor('#ABB8C3')
    setImportant(false)

    setShow(false)
    props.setUpdate()
  }

  function onChangeTheme(e: any) {
    var theme = e.target.value

    if (Object.keys(themes).includes(theme)) {
      setColor(themes[theme])
    } else if (theme === 'None') {
      console.log('theme')
      var themesTemp = getStorage('themes')
      themesTemp[theme] = color
      setStorage('themes', themesTemp)
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

  function handleSyncClick(e: any) {
    if (localStorage.getItem('session')) {
      setShowSyncTab('sync-dis syncTab')
      return
    }

    // console.log(e)
    if (e.target.id === 'sync') {
      if (showSyncTab === 'sync-inactive syncTab') {
        setShowSyncTab('syncTab')
      } else {
        setShowSyncTab('sync-inactive syncTab')
      }
    }
  }

  function handleSyncBtnClick(e: any) {
    // e.preventDefault()

    if (localStorage.getItem('session')) {
      setShowSyncTab('sync-inactive syncTab')
      return
    }

    console.log(user + '  ' + pass)

    localStorage.setItem('user', user)
    localStorage.setItem('pass', pass)

    httpPostAsync('/login', 'user=' + user + '&pass=' + pass, handleAuth, () =>
      setShowSyncTab('sync-inactive syncTab'),
    )
    // setShowSyncTab("sync-dis syncTab")
  }

  return (
    <div className="ui">
      <div className="ui-main">
        <div className="add" onClick={() => setShow(true)}>
          <img src="./imgs/plusWhite.png" />
        </div>

        <div
          onMouseEnter={deleteDragIn}
          onMouseLeave={deleteDragOut}
          className={props.dragging ? 'trash-on' : 'trash-off'}
        >
          <img src="./imgs/xWhite.png" />
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
                  autoFocus
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
                  onFocus={(e) => {
                    e.target.value = ''
                  }}
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
                  colors={[
                    '#FF6900',
                    '#FCB900',
                    '#7BDCB5',
                    '#00D084',
                    '#8ED1FC',
                    '#0693E3',
                    '#ABB8C3',
                    '#EB144C',
                    '#F78DA7',
                    '#9900EF',
                  ]}
                  color={color}
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
      <div id="sync" className={showSyncTab} onClick={handleSyncClick}>
        <Form
          style={{ width: '100%' }}
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
              autoFocus
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
              autoFocus
              onChange={(e) => setPass(e.target.value)}
            />
          </InputGroup>

          <Button type="submit" className="w-100">
            Submit
          </Button>
        </Form>
      </div>
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
          <div
            style={styles}
            className={props.notAdded ? 'item added notAdded' : 'added item'}
          >
            <div className="item-over"></div>
            <p>{props.title}</p>
          </div>
        </li>
      )}
    </Draggable>
  )
}

let interval: any = ''
function Calendar(props: any) {
  const [items, setItems] = useState([])

  // clearInterval(interval)

  function handleGetServerData(data: any) {
    data = JSON.parse(data)
    data = JSON.parse(data)
    let themes = data.themes
    data = data.items

    if (!data) {
      return
    }

    console.log(getStorage('items') + '   ' + data)
    if (getStorage('items') === data) {
      return
    }

    setStorage('items', data)
    setStorage('themes', themes)

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
        )
      }),
    )
  }

  function attemptServerUpdateData() {
    httpPostAsync(
      '/setData',
      'user=' +
        localStorage.getItem('user') +
        '&items=' +
        JSON.stringify(getStorage('items')) +
        '&themes=' +
        JSON.stringify(getStorage('themes')),
    )
  }

  function unAuth() {
    props.setToggleNeedsRefresh()
  }

  useEffect(() => {
    if (props.loggedIn) {
      clearInterval(interval)
      interval = setInterval(() => {
        httpPostAsync(
          '/getData',
          'user=' + localStorage.getItem('user'),
          handleGetServerData,
          console.log,
          unAuth,
        )
      }, 1000)
    }
  }, [props.loggedIn])

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
    console.log(result)

    if (!result.destination) return

    var itemListTemp = getStorage('items')
    var themes = getStorage('themes')

    if (props.deleting) {
      // DELETING
      itemListTemp.splice(result.source.index, 1)
      console.log(itemListTemp)
      setStorage('items', itemListTemp)
      attemptServerUpdateData()
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
          )
        }),
      )
      props.setDragging(false)
      return
    }

    console.log(result)

    const [reorderedItem] = itemListTemp.splice(result.source.index, 1)
    itemListTemp.splice(result.destination.index, 0, reorderedItem)
    setStorage('items', itemListTemp)
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
        )
      }),
    )
    attemptServerUpdateData()

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
            className={props.loggedIn ? 'calendar on' : 'calendar off'}
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
  const [loggedIn, setLoggedIn] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toggleNeedsRefresh, setToggleNeedsRefresh] = useState(true)

  useEffect(() => {
    console.log('main')
  })

  useEffect(() => {
    console.log('toggleNeedsRefresh')
  }, [toggleNeedsRefresh])

  return (
    <div className="App">
      <Calendar
        deleting={deleting}
        update={update}
        setDragging={setDragging}
        loggedIn={loggedIn}
        setToggleNeedsRefresh={() => {
          setToggleNeedsRefresh(!toggleNeedsRefresh)
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
  )
}

export default App
