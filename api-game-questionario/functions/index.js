const functions = require('firebase-functions');

const admin = require('firebase-admin');
const crypto = require('crypto');
const UsuarioDAO = require('./dao/usuario-dao');
const UserDAO = require('./dao/user-dao');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
admin.initializeApp();


//mover para controller
//não movi ainda porque muda todos os endereços

let userDAO = new UserDAO();
let usuarioDAO = new UsuarioDAO();

exports.signUp = functions.https.onCall((data, context) => {
    const usr = data;
    return usuarioDAO.createUsuario(usr,admin);
});

exports.getLoggedUsuario = functions.https.onCall((data, context) => {
    const uid = context.auth.uid;
    return usuarioDAO.getUsuarioByUID(uid,admin);
});

exports.disableUser = functions.https.onCall(async(data, context) => {
    let hmac = crypto.createHmac('sha256', 'a secret');
    const uid = context.auth.uid;
    const password=data.password;
    let snapshot = await admin.firestore().collection('usuario').where('uid', '==', uid).get()
    let senhaHash
    snapshot.forEach((doc)=>{
        senhaHash=doc.data().senha
    })
    let usuSenhaHash=hmac.update(password).digest('hex')
    if(senhaHash===usuSenhaHash){
        return userDAO.disableUser(uid,admin);
    }else{
        return {error:true,message:'senha'}
    }
});

exports.enableUser = functions.https.onCall(async(data, context) => {
    let hmac = crypto.createHmac('sha256', 'a secret');
    const email = data.email;
    let password = data.password;
    let userRecord=await admin.auth().getUserByEmail(email)
    const uid = userRecord.uid;
    console.log(uid)
    let snapshot = await admin.firestore().collection('usuario').where('uid', '==', uid).get()
    let senhaHash
    snapshot.forEach((doc)=>{
        senhaHash=doc.data().senha
    })
    let usuSenhaHash=hmac.update(password).digest('hex')
    console.log(senhaHash===usuSenhaHash)
    if(senhaHash===usuSenhaHash)
        return userDAO.enableUser(uid,admin);
    else
        return {error:true,message:'senha'};
});

exports.updateUsuario = functions.https.onCall(async(data, context) => {
    //implementar verificação de senha server side antes do update
    let hmac = crypto.createHmac('sha256', 'a secret');
    let usuario = data.usuario;
    usuario.uid=context.auth.uid;
    let snapshot = await admin.firestore().collection('usuario').where('uid', '==', usuario.uid).get()
    let senhaHash
    snapshot.forEach((doc)=>{
        usuario.docId=doc.id
        senhaHash=doc.data().senha
    })
    let usuSenhaHash=hmac.update(usuario.senhaantiga).digest('hex')
    if(senhaHash===usuSenhaHash)
        return usuarioDAO.updateUsuario(usuario,admin);
    else
        return {error:true,message:'senha'};

});