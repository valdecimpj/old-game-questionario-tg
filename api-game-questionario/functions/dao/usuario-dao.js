const UserDAO = require("./user-dao");
const crypto = require('crypto');

class UsuarioDAO{

    constructor(){
        this.userDAO=new UserDAO();
    }

    createUsuario(usr,admin){
        return this.userDAO.createUser(usr,this.createUsuarioCallback,admin)
    }
    
    createUsuarioCallback(usr, admin){
        let hmac = crypto.createHmac('sha256', 'a secret');
        return admin.firestore().collection('usuario').add({
            idade: usr.idade,//data não está cadastrando
            nome: usr.nome,
            uid: usr.uid,
            senha: hmac.update(usr.senha).digest('hex')
        }).catch((msg) => { return msg })
    }

    enableUsuario(email,password,admin){

    }

    disableUsuario(password,admin){

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

    async updateUsuarioCallback(usuario,admin){
        let hmac = crypto.createHmac('sha256', 'a secret');
        let pw;
        if(usuario.novasenha!==undefined)
            pw = usuario.novasenha;
        else
            pw = usuario.senhaantiga
        console.log(usuario.nome)
        let hashpw = hmac.update(pw).digest('hex')
        let response=[];
        if (usuario.nome!==undefined) {
            console.log(pw,hashpw)
            response[0] = await admin.firestore().collection('usuario').doc(usuario.docId).update({
                nome: usuario.nome,
            });
        }
        if(usuario.novasenha!==undefined){
            response[1] = await admin.firestore().collection('usuario').doc(usuario.docId).update({
                senha: hashpw,
            });
        }
        return response;
    }
}
module.exports = UsuarioDAO;