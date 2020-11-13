const UserDAO = require("./user-dao");
const crypto = require('crypto');
const hmac = crypto.createHmac('sha256', 'a secret');

class UsuarioDAO{

    constructor(){
        this.userDAO=new UserDAO();
    }

    createUsuario(usr,admin){
        return this.userDAO.createUser(usr,this.createUsuarioCallback,admin)
    }
    
    createUsuarioCallback(usr, admin){
        return admin.firestore().collection('usuario').add({
            idade: usr.idade,//data não está cadastrando
            nome: usr.nome,
            uid: usr.uid,
            senha: hmac.update(usr.senha).digest('hex')
        }).catch((msg) => { return msg })
    }

    getUsuarioByUID(uid,admin){
        return admin.firestore().collection('usuario').where('uid', '==', uid).get().then((query) => {
            let lst = query.docs;
            return lst[0].data();
        }).catch((e) => { return e });
    }

    updateUsuario(user,admin){
        return this.userDAO.updateUser(user,this.updateUsuarioCallback,admin);
    }

    updateUsuarioCallback(usuario,admin){
        if (usuario.nome!==undefined) {
            return admin.firestore().collection('usuario').doc(usuario.docId).update({
                nome: usuario.nome,
            });
        }
        else{
            return
        }
    }
}
module.exports = UsuarioDAO;