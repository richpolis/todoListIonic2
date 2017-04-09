import { Component } from '@angular/core';
import { NavController, ModalController, Platform, NavParams, LoadingController } from 'ionic-angular';

import { TodoService, TodoModel } from '../../providers/todo-service';
import { AddTaskModalPage } from '../add-task-modal/add-task-modal';
import { ListModel } from "../../providers/list-model";



 
/*
  Generated class for the Todos page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

@Component({
  selector: 'page-todos',
  templateUrl: 'todos.html'
})
export class TodosPage {
    toogleTodoTimeout: any = null;
    public list: ListModel;
  
  constructor(
    public navCtrl: NavController, 
    private modalCtrl:ModalController, 
    public todoService:TodoService, 
    private platform: Platform, 
    private params: NavParams,
    private loading: LoadingController) {
      this.list = this.params.get('list');
      this.todoService.loadFromList(this.list.id);
    }

  getTodoStyles(todo: TodoModel){
    let styles = {
      'text-decoration': todo.isDone ? 'line-through': 'none',
      'font-weight': todo.isImportant ? '600' : 'normal'
    };
    return styles;
  }

  toogleTodo(todo:TodoModel){
    if(this.toogleTodoTimeout)
      return;

    this.toogleTodoTimeout = setTimeout(() => {
      this.todoService.toogleTodo(todo);
      this.toogleTodoTimeout = null;
    }, this.platform.is('ios') ? 0 : 300 );

  }

  removeTodo(todo:TodoModel){
    console.log(todo);
    let loader = this.loading.create();
    loader.present();
    this.todoService.removeTodo(todo).subscribe( () =>{
      loader.dismiss();
      this.todoService.saveLocally(this.list.id);
    },err =>{
      loader.dismiss();
    });
  }

  editTodo(original:TodoModel, modified:TodoModel){
    console.log(modified);
    let loader = this.loading.create();
    loader.present();
    this.todoService.updateTodo(original,modified).subscribe( () =>{
      loader.dismiss();
      this.todoService.saveLocally(this.list.id);
    },err =>{
      loader.dismiss();
    });
  }

  showEditTodo(todo: TodoModel){
    // tambien es valido { todo }, como parametro, si los el valor y campo se llaman igual
    let modal = this.modalCtrl.create(AddTaskModalPage, { todo: todo});

    modal.onDidDismiss(data => {
      if(data){
        // update todo
        this.editTodo(todo, data);
      }
    });

    modal.present();

  }

  ionViewDidLoad() {
    console.log('Hello TodosPage Page');
  }

  ionViewWillUnload(){
    this.todoService.saveLocally(this.list.id);
  }

  addTodo(todo:TodoModel){
    console.log(todo);
    let loader = this.loading.create();
    loader.present();
    this.todoService.addTodo(todo).subscribe( () =>{
      loader.dismiss();
      this.todoService.saveLocally(this.list.id);
    },err =>{
      loader.dismiss();
    });
  }

  showAddTodo(){
    let modal = this.modalCtrl.create(AddTaskModalPage, {listId: this.list.id});
    modal.onDidDismiss(data => {
      if(data){
        this.addTodo(data);
      }
    });
    modal.present();
  }

}
