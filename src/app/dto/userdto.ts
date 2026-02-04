/*
 Enumeration che permette di definire i ruoli al interno del applicazione
 */
 
export enum UserRole {
    ADMIN = "admin",
    USER = 'Utente',
}
/*
    Interfaccia che definisce la struttura di un utente
*/
export interface User {
    id: string;
    name: string;
    surname: string;
    email: string;
    role: UserRole;
}