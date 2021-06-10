import Dexie from 'dexie'
import store from '../store'
import { deepClone } from 'utils/common'
import creatfile from 'utils/creatFile'

let version = 1,
    userDatabase = null,
    groupDatabase = null

const getNum = (id) => {
  return Math.abs(Number(id) % 10)
}

const getId = () => {
  const loginData = store.state.loginData
  const myId = loginData && loginData.userInfo.uid
  return myId
}

const updateStoreMessage = (obj = {}, type) => {
  const storeData = store.state.dbMessageData
  const myId = getId()
  const toUid = obj.toUid
  const fromUid = obj.fromUid
  const friendId = obj.friendId || (toUid === myId ? fromUid : toUid)
  storeData[friendId] = storeData[friendId] || []
  switch (type) {
    case 'add':
      storeData[friendId].push(obj)
      break;
    case 'update':
      storeData[friendId].forEach(o => {
        if ((obj.flag && o.flag === obj.flag) || (obj.msgId && o.msgId === obj.msgId)) {
          const newObj = deepClone(obj)
          o = Object.assign(o, newObj)
        }
      })
      break;
    case 'delete':
      storeData[friendId] = storeData[friendId].filter(o => (obj.flag && o.flag !== obj.flag) || (obj.msgId && o.msgId !== obj.msgId))
      break;
    case 'set':
      storeData[friendId] = obj.list
      break;

    default:
      break;
  }
  // console.log(storeData)
  store.dispatch('setDBMessageData', storeData)
}

const mytables = {
  table0: '++id, uid, msgType, msgId, flag',
  table1: '++id, uid, msgType, msgId, flag',
  table2: '++id, uid, msgType, msgId, flag',
  table3: '++id, uid, msgType, msgId, flag',
  table4: '++id, uid, msgType, msgId, flag',
  table5: '++id, uid, msgType, msgId, flag',
  table6: '++id, uid, msgType, msgId, flag',
  table7: '++id, uid, msgType, msgId, flag',
  table8: '++id, uid, msgType, msgId, flag',
  table9: '++id, uid, msgType, msgId, flag'
}

const openDB = (isGroup) => {
  return new Promise(resolve => {
    const curDB = isGroup ? groupDatabase : userDatabase
    if (curDB) {
      resolve(curDB)
    } else {
      const loginData = store.state.loginData
      const uid = loginData && loginData.userInfo.uid
      const tableName = isGroup ? `msg_g${uid}` : `msg_u${uid}`
      var db = new Dexie(tableName)
      window.db = db
      db.version(version).stores(mytables)
      if (isGroup) {
        groupDatabase = db
      } else {
        userDatabase = db
      }
      //打开数据库时，会判断当前version值是否大于已经存在的version值，若大于则会upgrade即升到最高版本
      resolve(db)
    }
  })
}

const msgDB = {
  creatUserDB (id) {
    // 每次都是删除数据库
    const dbInfo = {
      db: `msg_u${id}`,
      table: mytables
    }
    return new Promise(resolve => {
      const userDatabase = new Dexie(dbInfo.db)
      window.db = userDatabase
      userDatabase.version(version).stores(dbInfo.table)
      userDatabase.open()
      userDatabase.transaction('rw', [userDatabase.table0, userDatabase.table1, userDatabase.table2, userDatabase.table3, userDatabase.table4, userDatabase.table5, userDatabase.table6, userDatabase.table7, userDatabase.table8, userDatabase.table9], () => {
        resolve(userDatabase)
      })
    })
  },
  creatGroupDB (id) {
    const dbInfo = {
      db: `msg_g${id}`,
      table: mytables
    }
    return new Promise(resolve => {
      let groupDatabase = new Dexie(dbInfo.db)
      groupDatabase.version(version).stores(dbInfo.table)
      groupDatabase.open()
      groupDatabase.transaction('rw', [groupDatabase.table0, groupDatabase.table1, groupDatabase.table2, groupDatabase.table3, groupDatabase.table4, groupDatabase.table5, groupDatabase.table6, groupDatabase.table7, groupDatabase.table8, groupDatabase.table9], () => {
        resolve(groupDatabase)
      })
    })
  },
  async add(msgObj) {
    const isGroup = msgObj.groupId
    const curDB = await openDB(isGroup)
    const myId = getId()
    const toUid = msgObj.toUid
    const fromUid = msgObj.fromUid
    const friendId = toUid === myId ? fromUid : toUid
    console.log(friendId)
    const num = getNum(friendId)
    const tableName = `table${num}`
    return new Promise(resolve => {
      curDB.transaction('rw', curDB[tableName], () => {
        curDB[tableName].add(msgObj).then(() => {
          updateStoreMessage(msgObj, 'add')
          resolve({code: 200})
        }).catch((e) => {
          console.log('新增失败')
          resolve({code: -1, msg: '数据库中已有该数据'})
        })
      })
    })
  },

  async update(msgObj) {
    const isGroup = msgObj.groupId
    const curDB = await openDB(isGroup)
    const myId = getId()
    const toUid = msgObj.toUid
    const fromUid = msgObj.fromUid
    const friendId = msgObj.friendId || (toUid === myId ? fromUid : toUid)
    const num = getNum(friendId)
    const tableName = `table${num}`
    const key = msgObj.index
    return new Promise(resolve => {
      curDB.transaction('rw', curDB[tableName], async() => {
        const msgItem = await curDB[tableName].where(key).equals(msgObj[key]).first()
        const result = await curDB[tableName].put(Object.assign(msgItem, msgObj))
        if (result) {
          updateStoreMessage(msgObj, 'update')
          resolve({code: 200})
        } else {
          resolve({code: -1, msg: '更新失败'})
        }
      })
    })
  },

  async deleteUser(user) {
    const isGroup = user.groupId
    const curDB = await openDB(isGroup)
    const myId = getId()
    const friendId = user.uid
    const num = getNum(friendId)
    const tableName = `table${num}`

    return new Promise(resolve => {
      curDB.transaction('rw', curDB[tableName], async() => {
        curDB[tableName].where('uid').equals(friendId).each((item => {
          item.url ? creatfile.deleteOneFile(item.url) : ''
          item.thumbURL ? creatfile.deleteOneFile(item.thumbURL) : ''
        }))
        curDB[tableName].where('uid').equals(friendId).delete().then(() => {
          resolve({code: 200})
        })
      })
    })
  },
  // 清除所有聊天记录
  async clearAllTable() {
    const groupDB = await openDB(true)
    const userDB = await openDB(false)
    return new Promise(resolve => {
      const tableList = ['table0', 'table1', 'table2', 'table3', 'table4', 'table5', 'table6', 'table7', 'table8', 'table9']
      tableList.forEach(table => {
        groupDB.transaction('rw', groupDB[table], async() => {
          groupDB[table].clear()
        })
        userDB.transaction('rw', userDB[table], async() => {
          userDB[table].clear()
        })
      })
      resolve({code: 200})
    })
  },
  async delete(msgObj) {
    const isGroup = msgObj.groupId
    const curDB = await openDB(isGroup)
    const myId = getId()
    const toUid = msgObj.toUid
    const fromUid = msgObj.fromUid
    const friendId =  msgObj.friendId || (toUid === myId ? fromUid : toUid)

    const num = getNum(friendId)
    const tableName = `table${num}`
    const key = msgObj.index
    return new Promise(resolve => {
      curDB.transaction('rw', curDB[tableName], async() => {
        curDB[tableName].where(key).equals(msgObj[key]).delete().then(() => {
          updateStoreMessage(msgObj, 'delete')
          if (msgObj.url) {
            creatfile.deleteOneFile(msgObj.url)
          }
          resolve({code: 200})
          msgObj.url ? creatfile.deleteOneFile(msgObj.url) : ''
          msgObj.thumbURL ? creatfile.deleteOneFile(msgObj.thumbURL) : ''
        }).catch(() => {
          resolve({code: -1, msg: '更新失败'})
        })
      })
    })
  },

  async getPageData(user, lastId) {
    const pageSize = 50
    if (!user.uid) return
    const isGroup = user.groupId || user.groupid
    const curDB = await openDB(isGroup)
    const num = getNum(user.uid)
    const tableName = `table${num}`
    return new Promise(async resolve => {
      const data = await curDB[tableName].where('uid').equals(user.uid).reverse()
      const list = lastId ? (await data.and((msg) => {
        return msg.id < lastId
      }).limit(pageSize).toArray()).reverse() : (await data.offset(0).limit(pageSize).toArray()).reverse()
      updateStoreMessage({
        list,
        toUid: user.uid
      }, 'set')
      resolve(list)
    })
  },

  close() {
    if (userDatabase) {
      userDatabase.close()
      userDatabase = null
    }
    if (groupDatabase) {
      groupDatabase.close()
      groupDatabase = null
    }
  }
}

export default msgDB
