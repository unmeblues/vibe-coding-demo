// TODO 리스트 스크립트 - 로컬스토리지에 저장
const storageKey = 'vibe-todos'
let todos = []

// DOM
const todoList = document.getElementById('todoList')
const todoInput = document.getElementById('todoInput')
const addBtn = document.getElementById('addBtn')
const clearBtn = document.getElementById('clearBtn')

// 초기화
function loadTodos(){
  const raw = localStorage.getItem(storageKey)
  todos = raw ? JSON.parse(raw) : []
  renderList()
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
  txt.textContent = t.text

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

function addTodo(){
  const text = todoInput.value.trim()
  if(!text) return
  const t = { id: String(Date.now()), text, completed:false, starred:false, created: Date.now() }
  todos.unshift(t)
  saveTodos()
  renderList()
  todoInput.value = ''
  todoInput.focus()
}

function toggleComplete(id){
  const t = todos.find(x => x.id === id)
  if(!t) return
  t.completed = !t.completed
  saveTodos()
  renderList()
}

function toggleStar(id){
  const t = todos.find(x => x.id === id)
  if(!t) return
  t.starred = !t.starred
  saveTodos()
  renderList()
}

function deleteTodo(id){
  todos = todos.filter(x => x.id !== id)
  saveTodos()
  renderList()
}

function clearAll(){
  if(!todos.length) return
  if(!confirm('모든 항목을 삭제하시겠습니까?')) return
  todos = []
  saveTodos()
  renderList()
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
loadTodos()
