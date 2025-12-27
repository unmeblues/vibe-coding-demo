  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
  import { getDatabase, ref, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";
  import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyBsu-DQXfcJiGP0jITMPUxZFzKmllEzpf4",
    authDomain: "vibe-coding-backend-11151.firebaseapp.com",
    projectId: "vibe-coding-backend-11151",
    storageBucket: "vibe-coding-backend-11151.firebasestorage.app",
    messagingSenderId: "145221515426",
    appId: "1:145221515426:web:2b0b9f95f84b91a3b9bffb",
    databaseURL: "https://vibe-coding-backend-11151-default-rtdb.asia-southeast1.firebasedatabase.app/"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  const todosRef = ref(db, 'todos');
  const auth = getAuth(app);

  // DOM elements for auth UI
  const authBtn = document.getElementById('authBtn')
  const welcome = document.getElementById('welcome')

  function setupAuthUI(){
    onAuthStateChanged(auth, (user)=>{
      if(user){
        const name = user.displayName || user.email || '사용자'
        if(welcome) welcome.textContent = `${name} 님 환영합니다`
        if(authBtn){
          authBtn.textContent = '로그아웃'
          authBtn.href = '#'
          authBtn.onclick = async (e) => { e.preventDefault(); try{ await signOut(auth); }catch(err){ console.error('signOut error', err); alert('로그아웃 실패') } }
        }
      } else {
        if(welcome) welcome.textContent = ''
        if(authBtn){
          authBtn.textContent = '로그인'
          authBtn.href = 'login.html'
          authBtn.onclick = null
        }
      }
    })
  }

// TODO 리스트 스크립트 - 로컬스토리지에 저장
const storageKey = 'vibe-todos'
let todos = []

// DOM
const todoList = document.getElementById('todoList')
const todoInput = document.getElementById('todoInput')
const addBtn = document.getElementById('addBtn')
const clearBtn = document.getElementById('clearBtn')

// 초기화 (Firebase 실시간 동기화 설정, 로컬스토리지 폴백)
function setupRealtimeSync(){
  onValue(todosRef, (snap)=>{
    const val = snap.val()
    if(val){
      todos = Object.keys(val).map(k => ({ id: k, ...val[k] }))
      todos.sort((a,b)=> b.created - a.created)
    } else {
      todos = []
    }
    renderList()
    updateClearVisibility()
    try{ localStorage.setItem(storageKey, JSON.stringify(todos)) }catch(e){}
  }, (err)=>{
    console.error('Firebase read error', err)
    const raw = localStorage.getItem(storageKey)
    todos = raw ? JSON.parse(raw) : []
    renderList()
    updateClearVisibility()
  })
}

function saveTodos(){
  localStorage.setItem(storageKey, JSON.stringify(todos))
}

function mkItem(t){
  const li = document.createElement('li')
  li.className = 'todo-item'
  li.dataset.id = t.id

  const check = document.createElement('button')
  check.className = 'check'
  check.textContent = t.completed ? '✓' : ''
  check.addEventListener('click', ()=> toggleComplete(t.id))

  const txt = document.createElement('div')
  txt.className = 'text' + (t.completed ? ' completed' : '')

  // main text
  const content = document.createElement('div')
  content.className = 'text-content'
  content.textContent = t.text
  txt.appendChild(content)

  // author meta (always show; default to '익명' when missing)
  const authorName = t.author && (t.author.displayName || t.author.email) ? (t.author.displayName || t.author.email) : '익명'
  const meta = document.createElement('div')
  meta.className = 'meta'
  meta.textContent = `작성자: ${authorName}`
  txt.appendChild(meta)

  const star = document.createElement('button')
  star.className = 'star' + (t.starred ? ' active' : '')
  star.title = t.starred ? '중요 표시 해제' : '중요 표시'
  star.textContent = t.starred ? '★' : '☆'
  star.addEventListener('click', ()=> toggleStar(t.id))

  const del = document.createElement('button')
  del.className = 'delete'
  del.title = '삭제'
  del.textContent = '🗑️'
  del.addEventListener('click', ()=> deleteTodo(t.id))

  li.appendChild(check)
  li.appendChild(txt)
  li.appendChild(star)
  li.appendChild(del)

  return li
}

function renderList(){
  todoList.innerHTML = ''
  // starred items first, then newest
  const sorted = todos.slice().sort((a,b)=>{
    const sa = a.starred ? 1 : 0
    const sb = b.starred ? 1 : 0
    if(sb !== sa) return sb - sa
    return b.created - a.created
  })
  sorted.forEach(t => todoList.appendChild(mkItem(t)))
  updateClearVisibility()
}

async function addTodo(){
  const text = todoInput.value.trim()
  if(!text) return
  // attach current user as author when available
  const user = auth.currentUser
  const author = user ? { uid: user.uid, displayName: user.displayName || null, email: user.email || null } : null
  const t = { text, completed:false, starred:false, created: Date.now(), author }
  try{
    await push(todosRef, t)
    todoInput.value = ''
    todoInput.focus()
  }catch(e){
    console.error('addTodo error', e)
    // fallback: save locally (include author if we have it)
    const local = { id: String(Date.now()), ...t }
    todos.unshift(local)
    try{ localStorage.setItem(storageKey, JSON.stringify(todos)) }catch(e){}
    renderList()
    todoInput.value = ''
    todoInput.focus()
  }
} 

async function toggleComplete(id){
  const t = todos.find(x => x.id === id)
  if(!t) return
  try{
    await update(ref(db, 'todos/' + id), { completed: !t.completed })
  }catch(e){ console.error('toggleComplete error', e) }
}

async function toggleStar(id){
  const t = todos.find(x => x.id === id)
  if(!t) return
  try{
    await update(ref(db, 'todos/' + id), { starred: !t.starred })
  }catch(e){ console.error('toggleStar error', e) }
}

async function deleteTodo(id){
  try{
    await remove(ref(db, 'todos/' + id))
  }catch(e){ console.error('deleteTodo error', e) }
}

async function clearAll(){
  if(!todos.length) return
  if(!confirm('모든 항목을 삭제하시겠습니까?')) return
  try{
    await remove(todosRef)
  }catch(e){ console.error('clearAll error', e) }
}

function updateClearVisibility(){
  clearBtn.style.display = todos.length ? 'inline-block' : 'none'
}

function escapeHtml(s){
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

// 이벤트
addBtn.addEventListener('click', addTodo)
todoInput.addEventListener('keydown', (e)=> { if(e.key === 'Enter') addTodo() })
clearBtn.addEventListener('click', clearAll)

// 초기 로드
setupRealtimeSync()
setupAuthUI()
