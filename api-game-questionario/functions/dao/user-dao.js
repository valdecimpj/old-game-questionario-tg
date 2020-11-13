class UserDAO{
    
    createUser(usr,callback, admin){
        return admin.auth().createUser({
            email: usr.email,
            password: usr.senha,
            emailVerified: false,
            displayName: usr.nome,
        }).then((doneUsr) => {
            usr.uid=doneUsr.uid;
            return callback(usr,admin);
        }).catch((msg) => { return msg });
    }

    async updateUser(user,callback,admin){
        return admin.auth().updateUser(user.uid, {
            email: user.email,
            password: user.novasenha
        }).then(() => {
            return callback(user,admin);
        }).catch((e) => {
            return e;
        })
    }
}

module.exports = UserDAO;