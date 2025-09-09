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
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/forum/threads', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + jwt,
          }
        });
        const result = await response.json();
        setData(result);
        console.log(result)
      } catch (error) {
        console.error('Error fetching threads list:', error);
      }
    };

    if(jwt && shouldRefetch) {
      fetchData();
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

  return (
    <>
      <div>
        {!jwt? <LoginForm onLoggedIn={handleLogin}/> : <>
        <button onClick={handleLogout}>Logout</button>
        <h1>Forum Threads:</h1>
        <input type="text" className="new_thread_name"/>
        <button onClick={handleNewThread}>Add New Thread</button>
        <ul>
          { data.map((item) => (
            <li key={item.id}>{item.title} {item.uid==1?
            <button onClick={() => handleDelete(item)}>Delete Thread!</button>: ''}</li>
          )) }
        </ul> </>}
      </div>
    </>
  )
}

export default App
