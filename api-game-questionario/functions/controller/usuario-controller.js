const functions = require('firebase-functions');

const admin = require('firebase-admin');
const { UsuarioDAO } = require('./dao/usuario-dao');

exports.signUp = functions.https.onCall((data, context) => {
    console.log(data)
    const usr = data;
    return this.usuarioDAO.createUsuario(usr,admin);
});

exports.getLoggedUsuario = functions.https.onCall((data, context) => {
    const uid = context.auth.uid;
    return this.usuarioDAO.getUsuarioByUID(uid,admin);
});

exports.updateUsuario = functions.https.onCall((data, context) => {
    //implementar verificação de senha server side antes do update
    const user = data;
    user.uid=context.auth.uid;
    return usuarioDAO.updateUsuario(user,admin);

});