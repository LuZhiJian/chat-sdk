import Dexie from 'dexie'
import store from '../store'

const version = 1
let mydb = null

const mytables = {
  chatusers: 'uid',
  contacts: 'uid'
}

const updateVerDB = (tableName, db) => {
  return new Promise(resolve => {
    db.close()
    mydb = new Dexie(tableName)
    mydb.version(version).stores(mytables).upgrade(tx => {
      // console.log(tx)
      mydb.open()
    })
    setTimeout(() => {
      resolve(mydb)
    }, 200)
  })
}

const openDB = () => {
  return new Promise(async resolve => {
    const oDb = mydb
    if (oDb) {
      resolve(oDb)
    } else {
      const loginData = store.state.loginData
      const uid = loginData && loginData.userInfo.uid
      const tableName = `user_${uid}_db`
      let db = new Dexie(tableName)
      window.db = db
      db.version(1).stores()
      //打开数据库时，会判断当前version值是否大于已经存在的version值，若大于则会upgrade即升到最高版本
      mydb = await updateVerDB(tableName, db)
      // mydb = db
      resolve(mydb)
    }
  })
}

const userDB = {
  creatDB (id) {
    // 每次都是删除数据库
    const dbInfo = {
      db: `user_${id}_db`,
      table: mytables
    }
    return new Promise(async resolve => {
      let dataBase = new Dexie(dbInfo.db)
      window.db = dataBase
      dataBase = await updateVerDB(dbInfo.db, dataBase)
      // dataBase.version(myversion).stores(oldtables)
      // dataBase.open()
      // dataBase.transaction('rw', [dataBase.chatusers, dataBase.contactsList, dataBase.receiptMsgList], () => {
      resolve(dataBase)
      // })
    })
  },
  contacts: {
    async addContact(user) { //新增通讯录信息
      mydb = mydb ? mydb : await openDB()
      return new Promise(resolve => {
        mydb.transaction('rw', mydb.contacts, () => {
          const newItem = Object.assign(user, {})
          mydb.contacts.put(newItem).then(() => {
            console.log('新增成功')
          }).catch(function (e) {
            console.log('新增失败')
            resolve({code: -1, msg: '插入失败'})
          })
        })
      })
    },
    // 保存通讯录联系人列表
    async saveContacts(list) {
      mydb = mydb ? mydb : await openDB()
      list.map(o => {
        o.uid = o.userInfo.uid
      })
      return new Promise(resolve => {
        mydb.transaction('rw', mydb.contacts, () => {
          mydb.contacts.bulkAdd(list).then(() => {
            console.log('新增成功')
            resolve({code: 200})
          }).catch(function (e) {
            console.log('新增失败')
            resolve({code: -1, msg: '插入失败'})
          })
        })
      })
    },
    // 获取通讯录联系人列表
    async getContacts() {
      mydb = mydb ? mydb : await openDB()
      return new Promise(async resolve => {
        const list = await mydb.contacts.toArray()
        console.log(list)
        resolve(list)
      })
    },
    // 获取通讯录联系人详情
    async getContactDetail(uid) {
      mydb = mydb ? mydb : await openDB()
      return new Promise(async resolve => {
        const list = await mydb.contacts.where('uid').equals(uid).first()
        resolve(list)
      })
    }
  },
  chatUsers: {
    async addChatUser(user) { //新增会话
      mydb = mydb ? mydb : await openDB()
      return new Promise(resolve => {
        const newItem = Object.assign(user, {
          time: user.time || new Date().getTime()
        })
        mydb.transaction('rw', mydb.chatusers, () => {
          mydb.chatusers.put(newItem).then(() => {
            resolve({code: 200})
          }).catch(function (e) {
            console.log('新增失败',e)
            resolve({code: -1, msg: '插入失败'})
          })
        })
      })
    },
    async getChattingList() { //获取会话列表
      mydb = mydb ? mydb : await openDB()
      return new Promise(async resolve => {
        const data = await mydb.chatusers.limit(600).toArray()
        const list = data.sort((a, b) => {
          return b.time - a.time
        }).sort((a, b) => {
          return (a.bfTop ? 1 : 0) - (b.bfTop ? 1 : 0)
        })
        console.log(list)
        resolve(list)
      })
    },
  },

  close() {
    if (mydb) {
      mydb.close()
      mydb = null
    }
  }
}

export default userDB
