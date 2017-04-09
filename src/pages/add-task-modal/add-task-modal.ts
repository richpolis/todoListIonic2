import { OnInit,Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { TodoModel } from '../../providers/todo-service';


/*
  Generated class for the AddTaskModal page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

@Component({
  selector: 'page-add-task-modal',
  templateUrl: 'add-task-modal.html',

})
export class AddTaskModalPage implements OnInit {
  
  public myForm: FormGroup;
  public model:TodoModel;
  public title:string = "Add new Task";
  public buttonText:string = "Add";

  constructor(public viewCtrl: ViewController, public formBuilder: FormBuilder, private params:NavParams) {
    if(this.params.get('todo')){
      this.model = TodoModel.clone(this.params.get('todo'));
      this.title = "Edit Task";
      this.buttonText = "Save changes";
    }else{
      let listId = this.params.get('listId');
      this.model = new TodoModel("", listId);
    }
  }

  ngOnInit(): any {
    this.myForm = this.formBuilder.group({
      'description': ['', [Validators.required, Validators.minLength(3), this.descriptionValidator.bind(this)]],
      'isImportant': ['']
    });
  }

  isValid(field: string) {
    let formField = this.myForm.get(field);
    return formField.valid || formField.pristine;
  }

  descriptionValidator(control: FormControl): {[s: string]: boolean} {
    if (!control.value.match("^[a-zA-Z ,.'-]+$")) {
      return {invalidName: true};
    }
  }

  submit(){
    this.viewCtrl.dismiss(this.model);
  }

  ionViewDidLoad() {
    console.log('Hello AddTaskModalPage Page');
  }

  dismiss(){
    this.viewCtrl.dismiss();
  }

}
