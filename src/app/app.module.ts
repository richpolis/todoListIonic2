import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { TodosPage } from '../pages/todos/todos';
import { AddTaskModalPage } from '../pages/add-task-modal/add-task-modal';
import { ListsPage } from '../pages/lists/lists';
import { TodoService } from '../providers/todo-service';
import { PrioritizedTodosPipe } from '../pipes/prioritized-todos-pipe';
import { DoneTodosPipe } from '../pipes/done-todos-pipe';
import { ListsService } from "../providers/lists-service";
import { Storage } from '@ionic/storage';

@NgModule({
  declarations: [
    MyApp,
    TodosPage,
    AddTaskModalPage,
    ListsPage,
    PrioritizedTodosPipe,
    DoneTodosPipe
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TodosPage,
    AddTaskModalPage,
    ListsPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, TodoService, ListsService, Storage ]
})
export class AppModule {}
