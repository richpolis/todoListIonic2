export class ListModel{
    constructor(
        public name:string,
        public id:number
    ){}

    static fromJson(item:any){
        if(!item.name || !item.id){
            throw(new Error("Invalid argument: argument structure do not match with ListModel"));
        }
        return new ListModel(item.name, item.id);
    }
}