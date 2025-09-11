import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import InputDialog from './components/InputDialog'
import LoginForm from './components/LoginForm'

function App() {
  const [jwt, setJwt] = useState(() => {
    const storedJwt = localStorage.getItem('jwt');
    if(storedJwt) {
      return storedJwt;
    }
    return '';
  });
  const [shouldRefetch, setShouldRefetch] = useState(true);
  const [threads, setThreads] = useState([]);
  const [thread, setThread] = useState([]);
  const [tid, setTid] = useState(0);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/forum/threads', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + jwt,
          }
        });
        const result = await response.json();
        if(result && result.error) {
          console.error('Error fetching threads list:', result.error)
          return
        }
        setThreads(result);
        console.log(result);
      } catch (error) {
        console.error('Error fetching threads list:', error);
      }
    };

    if(jwt && shouldRefetch) {
      fetchThreads();
      setShouldRefetch(false);
    }
  }, [shouldRefetch, jwt]);

  const handleNewThread = (event) => {
    event.preventDefault();
    const new_thread_name = document.querySelector('.new_thread_name');
    fetch('http://localhost:8080/api/forum/thread', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt,
      },
      body: JSON.stringify({
        title: new_thread_name.value,
        userId: 1,
      })
    })
    .then(response => response.json())
    .then(reply => {
      setShouldRefetch(true);
      console.log('Thread created:', reply)
    })
    .catch(error => {
      setShouldRefetch(true);
      console.error('Error creating thread:', error);
    });
  }

  const handleDelete = (item) => {
    fetch('http://localhost:8080/api/forum/thread/' + item.id, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt,
      },
      body: JSON.stringify({
        title: item.title,
        userId: item.uid,
      })
    })
    .then(reply => {
      setShouldRefetch(true);
      console.log('Thread deleted:', reply)
    })
    .catch(error => {
      setShouldRefetch(true);
      console.error('Error deleting thread:', error);
    });
  }

  const handleLogin = () => {
    // if this function is called, we know that local storage was recently modified
    setJwt(localStorage.getItem('jwt'));
  }

  const handleLogout = () => {
    // delete token in local storage so that the login screen pops up right away
    localStorage.setItem('jwt', '');
    setJwt('');
  }

  const handleOpenThread = async (e) => {
    console.log('opening thread', e.target.dataset.dbkey);
      try {
        const response = await fetch('http://localhost:8080/api/forum/posts/'
            + parseInt(e.target.dataset.dbkey), {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + jwt,
          }
        });
        const result = await response.json();
        if(result && result.error) {
          console.error('Error fetching thread:', result.error)
          return
        }
        setThread(result);
        setTid(parseInt(e.target.dataset.dbkey));
        console.log(result);
      } catch (error) {
        console.error('Error fetching threads list:', error);
      }

  }

  const handleGoHome = (e) => {
    setTid(0);
  }

  return (
    <>
      <div>
        {!jwt? <LoginForm onLoggedIn={handleLogin}/> :
          !tid? <>
            <button onClick={handleLogout}>Logout</button>
            <h1>Forum Threads:</h1>
            <input type="text" className="new_thread_name"/>
            <button onClick={handleNewThread}>Add New Thread</button>
            <ul>
              { threads.map((item) => (
                <li key={item.id} className="thread_item" data-dbkey={item.id}
                  onClick={handleOpenThread}>{item.title}</li>
              )) }
            </ul>
          </>:
          
          <>
            <button onClick={handleLogout}>Logout</button>
            <button onClick={handleGoHome}>Back to Threads list</button>
            <h1>Thread {tid}: </h1>
            <ul>
              { thread.map((item) => (
                <li key={item.id} data-dbkey={item.id}>{item.text}</li>
              )) }
            </ul>
          </>}
      </div>
    </>
  )
}

export default App
