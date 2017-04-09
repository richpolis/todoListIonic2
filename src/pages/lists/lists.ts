import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { TodosPage } from '../todos/todos'; 
import { ListsService } from '../../providers/lists-service';
import { ListModel } from "../../providers/list-model";

/*
  Generated class for the Lists page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-lists',
  templateUrl: 'lists.html'
})
export class ListsPage {
  private selectedList: ListModel = null;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              public alertCtrl: AlertController,
              public loadingCtrl: LoadingController,
              public listService: ListsService) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad ListsPage');
  }

  goToList(list: ListModel){
    this.clearSelectedList();
    this.navCtrl.push(TodosPage, { list });
  }

  addNewList(name:string){
    let loading = this.loadingCtrl.create();
    loading.present();
    
    this.listService.addList(name)
        .subscribe( (list:ListModel) =>{
          this.goToList(list);
          loading.dismiss();
        }, err =>{
          console.log("Error from server post new list", err);
          loading.dismiss();
        });
    this.listService.saveLocally();
  }

  showAddList() {
    let alert = this.alertCtrl.create({
      title: 'Add New List',
      inputs: [
        {
          name: 'name',
          placeholder: 'New name'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Add',
          handler: data => {
            console.log(data);
            let navTransition = alert.dismiss();
            navTransition.then(() =>{
              this.addNewList(data.name);
            });
          }
        }
      ]
    });
    alert.present();
  }

  clearSelectedList(){
    this.selectedList = null;
  }

  selectList(list:ListModel){
    if(this.selectedList == list){
      this.clearSelectedList();
    }else{
      this.selectedList = list;
    }
  }

  removeSelectedList(){
    let loading = this.loadingCtrl.create();
    loading.present();
    this.listService.removeList(this.selectedList).subscribe(()=>{
      loading.dismiss();
      this.clearSelectedList();
    }, err =>{
      loading.dismiss();
      this.clearSelectedList();
    });
  }

}
