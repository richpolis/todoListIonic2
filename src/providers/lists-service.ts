import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import { Observable } from 'rxjs/Rx';
import { ListModel } from "./list-model";
import { Storage } from "@ionic/storage";
import { AppSettings } from './app-settings';

/*
  Generated class for the ListsService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class ListsService {

  public lists: ListModel[] = [];
  private local: Storage;
  
  constructor(public http: Http, public storage: Storage) {
    console.log('Hello ListsService Provider');
    this.local = storage;
    this.getLists();
  }

  getLists(){
    this.getFromLocal().then(()=>{ 
      this.getFromServer(); 
    }, ()=>{ 
      this.getFromServer()
    });
  }

  addList(name:string){
    let observable = this.postNewListToServer(name);

    observable.subscribe(
      (list:ListModel) =>{
        this.lists = [...this.lists, list];
        this.saveLocally();
      },
      err => { console.log("Error trying to post a new list to the server", err); }
    );
    
    return observable;
  }

  public getFromLocal(){
    return this.local.get('lists').then(data => {
      let localLists: ListModel[] = [];
      if( data ){
        data = JSON.parse(data);
        for(let list of data){
          localLists.push(new ListModel(list.name, list.id));
        }
      }
      this.lists = localLists;
    })
  }

  private getFromServer(){
    this.http.get(`${AppSettings.API_ENDPOINT}/lists`)
             .map( response => { return response.json(); })
             .map( ( lists:Object[] ) => {
                return lists.map( item => ListModel.fromJson(item));
             })
             .subscribe( 
               (results:ListModel[]) => {
                  this.lists = results;
                  this.saveLocally();
               },
               err => {
                 console.log("Error loading lists from server", err);
               }
            )
  }

  private postNewListToServer(name): Observable<ListModel>{
    let observable = this.http.post(`${AppSettings.API_ENDPOINT}/lists`, { name })
                              .share()
                              .map( response => { return response.json(); })
                              .map( list => ListModel.fromJson(list));
    observable.subscribe(()=>{}, ()=> {} );

    return observable;          

  }

  private deleteListFromServer(id:number){
    let observable = this.http.delete(`${AppSettings.API_ENDPOINT}/lists/${id}`)
                              .map( response => response.json() ).share();
    return observable;
  }

  public saveLocally(){
    this.local.set('lists',JSON.stringify(this.lists));
  }

  public removeList(list:ListModel){
    let observable = this.deleteListFromServer(list.id);
    observable.subscribe(
      () => {
        let index = this.lists.indexOf(list);
        this.lists = [...this.lists.slice(0,index), ...this.lists.slice(index+1)];
        this.saveLocally();
      },
      err => {
        console.log(`An error occurred while trying to remove list: ${list.name}`);
      }
    );
    return observable;
  }
}
