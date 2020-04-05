
class TodoItem {
    constructor(todoItem){
        this.todoItem = todoItem;
    }
    setDone() {
        this.noteDone = this.todoItem ;
        const { text, title } = {
            text: JSON.parse(this.noteDone.value).text,
            title: JSON.parse(this.noteDone.value).title
        };
        this.noteDoneObj = {
            'priority': 1,
            'value': JSON.stringify({
                'text': text,
                'title': title
            }),
            'checked': true
        };
        this.optionsDone = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                // eslint-disable-next-line
                'Authorization': 'Bearer ' + login.getToken()
            },
            body: JSON.stringify(this.noteDoneObj)
        };
        return fetch(`${this.urlTodo}/${this.todoItem.id}/toggle`, this.optionsDone);
    }
    editNote(title, text, confirm) {
        if (confirm) {
            this.editedNoteObj = {
                'priority': 1,
                'value': JSON.stringify({
                    'text': text,
                    'title': title,
                })
            };
            this.optionsEdited = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // eslint-disable-next-line
                    'Authorization': 'Bearer ' + login.getToken()
                },
                body: JSON.stringify(this.editedNoteObj)
            };
            return fetch(`${this.urlTodo}/${this.todoItem.id}`, this.optionsEdited);
        }

    }
    renderEditor(note) {
        this.valueEdit = JSON.parse(this.todoItem.value);
        note.innerHTML =
            `<input type="text" name="title" value="${this.valueEdit.title}">
        
                        <textarea rows="5"  name="text"  >${this.valueEdit.text}</textarea>
                        <button type="button" class="note_add">add</button>`;


    }
    removeNote( confirm) {
        if (confirm === true) {
            this.optionsDelete = {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    // eslint-disable-next-line
                    'Authorization': 'Bearer ' + login.getToken()
                },
            };
            return fetch(`${this.urlTodo}/${this.todoItem.id}`, this.optionsDelete);
        }
    }

}


class Todo {
    // eslint-disable-next-line max-params
    constructor($todoForm, $list, $sum, $done, template) {
        this.form = $todoForm;
        this.notes = [];
        this.list = $list;
        this.sum = $sum;
        this.done = $done;
        this.template = template;
        this.noteObject = {};
        this.urlTodo = 'https://todo.hillel.it/todo';
    }
    // eslint-disable-next-line class-methods-use-this
    formDataToObject(data) {
        const obj = {};
        data.forEach((value, key) => {
            if (key === 'completed') {
                // eslint-disable-next-line
                obj[key] = 'false' ? false : true;
            } else {
                obj[key] = value;
            }
        });
        return obj;
    }
    add() {
        this.formData = new FormData(this.form);
        this.noteObject = this.formDataToObject(this.formData);
        this.noteObjectJson = JSON.stringify(this.noteObject);
        this.todoData = {
            'priority': 1,
            'value': this.noteObjectJson
        };
        this.optionsAdd = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // eslint-disable-next-line
                'Authorization': 'Bearer ' + login.getToken()
            },
            body: JSON.stringify(this.todoData)
        };
        fetch(this.urlTodo, this.optionsAdd)
            .then(res => res.json()).then();
    }

    getSum() {
        return this.notes.length;
    }
    getDone() {
        return this.notes.filter((el) => el.checked === true).length;
    }
    notesRender(container) {
        fetch(this.urlTodo, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // eslint-disable-next-line
                'Authorization': 'Bearer ' + login.getToken()
            }
        }).then(res => res.json()).then(res => {
            this.notes = res;
            container.innerHTML = '';
            this.notes.forEach(note => {
                const { id, checked, value } = { id: note._id, checked: note.checked, value: JSON.parse(note.value) };
                container.innerHTML += this.template(value, id, checked);
                this.sum.textContent = this.getSum();
                this.done.textContent = this.getDone();
            });
        });
    }
    init() {
        this.notesRender(this.list);
        this.form.addEventListener('submit', e => {
            e.preventDefault();
            this.add();
            this.form.reset();
            this.notesRender(this.list);
            this.sum.textContent = this.getSum();
        });
        this.list.addEventListener('click', e => {
            const todoItem = new TodoItem (this.notes.find(el => el._id === +e.target.closest('li').id));
            if (e.target.classList.contains('note_done')) {
                todoItem.setDone().then(() => {
                    this.notesRender(this.list);
                    this.done.textContent = this.getDone();
                });;

            }
            if (e.target.classList.contains('note_remove')) {
                this.removeNote(confirm('Sure')).then(() => {
                    this.notesRender(this.list);
                    this.done.textContent = this.getDone();
                    this.sum.textContent = this.getSum();
                });

            }
            if (e.target.classList.contains('note_edit')) {
                todoItem.renderEditor(e.target.closest('li'), e.target.closest('li').id);

            }
            if (e.target.classList.contains('note_add')) {
                const inputTitle = e.target.parentNode.querySelector('[name="title"]');
                const inputText = e.target.parentNode.querySelector('[name="text"]');
                this.editNote(inputTitle.value, inputText.value, confirm('Sure?')).then(this.notesRender(this.list))
            }
        });
    }
}

const $todoForm = document.querySelector('#todo');
const $todoContainer = document.querySelector('.todo');
const $list = document.querySelector('.notes');
const $sum = document.querySelector('.sum_span');
const $done = document.querySelector('.done_span');
const toDoList = new Todo(
    $todoForm,
    $list,
    $sum,
    $done,
    (note, id, checked) => `<li class="notes_item ${checked ? 'completed' : ''}" id = ${id}  > 
                    <h4 class="note_title">${note.title}</h4>
                    <p class="note_text">${note.text}</p>
                    <div class="buttons">
                        <button type="button" class="note_done" ${checked ? 'disabled' : ''} >Done</button>
                        <button type="button" class="note_remove"  >Remove</button>
                        <button type="button" class="note_edit"  ${checked ? 'disabled' : ''} >Edit</button>
                    </div>

                </li>`
);




class Login {
    constructor($authorizationForm) {
        this.form = $authorizationForm;
        this.tokenKey = 'access';
    }
    authorization() {
        const urlAuth = 'https://todo.hillel.it/auth/login';
        this.options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.getFormData())
        };
        fetch(urlAuth, this.options)
            .then(res => res.json())
            .then(res => {
                this.form.reset();
                this.form.classList.add('hidden');
                localStorage.setItem(this.tokenKey, res['access_token']);
                $todoContainer.classList.remove('hidden');
                if (this.getToken()) {
                    toDoList.init();
                }
            });
    }
    getFormData() {
        this.formData = new FormData(this.form);
        this.formDataObj = {
            value: ''
        };
        this.formData.forEach(value => this.formDataObj.value += value);
        return this.formDataObj;
    }
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }
    init() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.getFormData();
            this.authorization();
        });
    }
}

const $authorizationForm = document.querySelector('#login');
const login = new Login($authorizationForm);
login.init();