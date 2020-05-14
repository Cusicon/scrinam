class Users {
  constructor() {
    this.users = [];
    this.links = [];
  }

  addUser(id, name, room) {
    let user = { id, name, room };
    this.users.push(user);
    return user;
  }

  removeUser(id) {
    let user = this.getUser(id);
    if (user) {
      this.users = this.users.filter(user => user.id !== id);
    }
    return user;
  }
  
  getUser(id) {
    return this.users.filter(user => user.id === id)[0];
  }
  
  getUserList(room) {
    let users = this.users.filter(user => user.room === room);
    return users;
    // let namesArr = users.map(user => user.name);
    // return namesArr;
  }
  
  addLink(file_link, room) {
    let link = {file_link, room};
    this.links.push(link);
  }

  getRoomLinks(room) {
    return this.links.filter(link => link.room.toLowerCase() === room);
  }
}

module.exports = { Users };
