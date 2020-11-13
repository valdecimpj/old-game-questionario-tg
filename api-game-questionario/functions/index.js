const functions = require('firebase-functions');

const admin = require('firebase-admin');
const crypto = require('crypto');
const UsuarioDAO = require('./dao/usuario-dao');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
admin.initializeApp();
const hmac = crypto.createHmac('sha256', 'a secret');


//mover para controller

let usuarioDAO = new UsuarioDAO();

exports.signUp = functions.https.onCall((data, context) => {
    const usr = data;
    return usuarioDAO.createUsuario(usr,admin);
});

exports.getLoggedUsuario = functions.https.onCall((data, context) => {
    const uid = context.auth.uid;
    return usuarioDAO.getUsuarioByUID(uid,admin);
});

exports.updateUsuario = functions.https.onCall(async(data, context) => {
    //implementar verificação de senha server side antes do update
    let usuario = data.usuario;
    usuario.uid=context.auth.uid;
    let snapshot = await admin.firestore().collection('usuario').where('uid', '==', usuario.uid).get()
    let docId;
    let senhaHash
    snapshot.forEach((doc)=>{
        usuario.docId=doc.id
        senhaHash=doc.data().senha
    })
    let usuSenhaHash=hmac.update(usuario.senhaantiga).digest('hex')
    if(senhaHash==usuSenhaHash)
        return usuarioDAO.updateUsuario(usuario,admin);
    else
        return {error:true,message:'senha'};

});