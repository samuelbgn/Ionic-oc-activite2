import { Book } from "../models/Book";
import { Cd } from "../models/Cd";
import { Subject } from "rxjs";
import * as firebase from 'firebase';
import DataSnapshot = firebase.database.DataSnapshot;
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class MainService {

    booksList: Book[] = [];
    cdsList: Cd[] = [];

    books$ = new Subject<Book[]>();
    cds$ = new Subject<Cd[]>();

    constructor(private storage: Storage) {
        this.fetchList();
    }

    emitBooks() {
        this.books$.next(this.booksList.slice());
    }

    emitCds() {
        this.cds$.next(this.cdsList.slice());
    }

    onLendMedium(index:number,list:string, borrower: string){
        if (list == 'book') {
            this.booksList[index].isLent = !this.booksList[index].isLent;
            this.booksList[index].borrower = borrower;
            this.storage.set('books', this.booksList);
            this.emitBooks();
        } else if (list == 'cd') {
            this.cdsList[index].isLent = !this.cdsList[index].isLent;
            this.cdsList[index].borrower = borrower;
            this.storage.set('cds', this.cdsList);
            this.emitCds();
        }
    }

    saveData() {
        return new Promise((resolve, reject) => {
            firebase.database().ref('books').set(this.booksList).then(
                (data: DataSnapshot) => {
                    resolve(data);
                },
                (error) => {
                    reject(error);
                }
            );
            firebase.database().ref('cds').set(this.cdsList).then(
                (data: DataSnapshot) => {
                    resolve(data);
                },
                (error) => {
                    reject(error);
                }
            );
            //this.booksList.push(this.book);
            //this.cdsList.push(this.cd);
            this.saveList();
            this.emitBooks();
            this.emitCds();
        });

    }

    retrieveData() {
        return new Promise((resolve, reject) => {
            firebase.database().ref('books').once('value').then(
                (data: DataSnapshot) => {
                    this.booksList = data.val();
                    this.emitBooks();
                    resolve('Données récupérées avec succès !');
                }, (error) => {
                    reject(error);
                }
            );
            firebase.database().ref('cds').once('value').then(
                (data: DataSnapshot) => {
                    this.cdsList = data.val();
                    this.emitCds();
                    resolve('Données récupérées avec succès !');
                }, (error) => {
                    reject(error);
                }
            );
        });
    }

    saveList() {
        this.storage.set('books', this.booksList);
        this.storage.set('cds', this.cdsList);

    }

    fetchListBook() {
        this.storage.get('books').then(
            (list) => {
                if (list && list.length) {
                    this.booksList = list.slice();
                }
                this.emitBooks();
            }
        );
    }

    fetchListCd() {
        this.storage.get('cds').then(
            (list) => {
                if (list && list.length) {
                    this.cdsList = list.slice();
                }
                this.emitCds();
            }
        );
    }

    fetchList() {
        this.storage.get('books').then(
            (booksList) => {
                booksList && booksList.length ? this.booksList = booksList.slice() : 0;
                this.emitBooks();
            }
        ).catch(
            (error) => {
                console.log(`Books Retrieve error : ${error}`);
            }
        );

        this.storage.get('cds').then(
            (cdsList) => {
                cdsList && cdsList.length ? this.cdsList = cdsList.slice() : 0;
                this.emitCds();
            }
        ).catch(
            (error) => {
                console.log(`Cds Retrieve error : +  ${error}`);
            }
        );
    }

}
