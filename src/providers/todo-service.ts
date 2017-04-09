import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import { Observable } from 'rxjs/Rx';
import { Storage } from '@ionic/storage';
import { AppSettings } from './app-settings';


export class TodoModel{
  constructor(
    public description: string,
    public listId: number,
    public isImportant:boolean = false,
    public isDone:boolean = false,
    public id: number = 0
  ){}

  static clone(todo: TodoModel){
    return new TodoModel(todo.description, todo.listId,todo.isImportant,todo.isDone, todo.id);
  }

  static fromJson(data:any){
    if(!data.description || !data.id || !data.listId){
      throw( new Error("Invalid argument: argument structure do not match with structure TodoModel"));
    }

    return new TodoModel(data.description, data.listId,data.isImportant,data.isDone, data.id);
  }
}

/*
  Generated class for the TodoService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class TodoService {
  public todos: TodoModel[] = [];
  public local: Storage;
  public IdList: number;
  constructor(public http: Http, public storage: Storage) {
    this.local = storage;
   }
  
  public loadFromList(id:number){
    this.getFromLocally(id).then(() =>{
      this.loadFromServer(id);
    });
    this.IdList = id;
  }


  getFromLocally(id:number){
    let idList= `list/${id}`;
    return this.local.get(idList).then((data) =>{
      if(!data){
        this.todos = [];
        return;
      }
      data = JSON.parse(data);
      let localTodos: TodoModel[] = [];
      for(let todo of data){
        localTodos.push(TodoModel.clone(todo));
      }
      this.todos = localTodos;
    });
  }

  private loadFromServer(id:number){
    this.http.get(`${AppSettings.API_ENDPOINT}/lists/${id}/todos`)
             .map( response => { return response.json(); } )
             .map( (todos:Object[]) => {
               return todos.map(item => TodoModel.fromJson(item))
             })
             .subscribe((results:TodoModel[]) =>{
               this.todos = results;
               this.saveLocally(id);
             },err =>{
               console.log("Error loading lists from server ", err);
             })
  }

  private postNewTodoToService(todo:TodoModel): Observable<TodoModel>{
    let observable = this.http.post(`${AppSettings.API_ENDPOINT}/lists/${todo.listId}/todos`, {
      description: todo.description,
      isImportant: todo.isImportant,
      isDone: todo.isDone
    }).map( response => response.json() )
      .map( todo => TodoModel.fromJson(todo) )
      .share();

      return observable;
  }

  private updateTodoInServer(todo:TodoModel): Observable<TodoModel>{
    let observable = this.http.put(`${AppSettings.API_ENDPOINT}/todos/${todo.id}`, {
      description: todo.description,
      isImportant: todo.isImportant,
      isDone: todo.isDone,
      listId: todo.listId
    }).map( response => response.json() )
      .map( todo => TodoModel.fromJson(todo) )
      .share();

      return observable;
  }

  public saveLocally(id:number){
    this.local.set(`list/${id}`, JSON.stringify(this.todos));
  }

  toogleTodo(todo: TodoModel){
      let isDone = !todo.isDone;  
      // dame el indice del elemento en el array
      const index = this.todos.indexOf(todo);
      let updateTodo = TodoModel.clone(todo);
      updateTodo.isDone = isDone;
      this.updateTodo(todo, updateTodo);
  }

  private deleteTodoFromServer(todo:TodoModel): Observable<TodoModel>{
    let observable = this.http.delete(`${AppSettings.API_ENDPOINT}/todos/${todo.id}`)
                              .map( response => response.json() ).share();

      return observable;
  }

  removeTodo(todo:TodoModel){
    let observable = this.deleteTodoFromServer(todo);

    observable.subscribe(() =>{
        // dame el indice del elemento en el array
        const index = this.todos.indexOf(todo);
        // el primero dice que le de los elementos uno por uno antes del elemento encontrado,
        // el segundo dice que le de los elementos uno por uno despues del elemento encontrado
        this.todos = [
            ...this.todos.slice(0,index),
            ...this.todos.slice(index+1)
        ];
      }, 
      err => {
        console.log("Error trying to post a delete todo", todo);
      });

      return observable;
    
  }

  addTodo(todo:TodoModel){
    let observable = this.postNewTodoToService(todo);

    observable.subscribe((todo:TodoModel) =>{
        this.todos = [...this.todos, todo];
      }, 
      err => {
        console.log("Error trying to post a new todo")
      });

      return observable;
  }

  updateTodo(originalTodo:TodoModel, modifiedTodo: TodoModel):Observable<TodoModel>{
    let observable = this.updateTodoInServer(modifiedTodo);
    observable.subscribe((todo:TodoModel) =>{
      // dame el indice del elemento en el array
      const index = this.todos.indexOf(originalTodo);
      // el primero dice que le de los elementos uno por uno antes del elemento encontrado,
      // el segundo dice que le de los elementos uno por uno despues del elemento encontrado
      this.todos = [
          ...this.todos.slice(0,index),
          todo,
          ...this.todos.slice(index+1)
      ];
    },err=>{
      console.log("Error trying to update todo item");
    });
    return observable;
  }


}
