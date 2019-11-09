let expect = require("expect");

const { Users } = require("../users");

describe("Users", () => {
  let users;

  beforeEach(() => {
    users = new Users();
    users.users = [
      { id: "1", name: "Success", room: "Rome Devers" },
      { id: "2", name: "Princess", room: "Rome Dancers" },
      { id: "3", name: "Jonas", room: "Rome Devers" }
    ];
  });

  it("should remove a user", () => {
    let userId = "1";
    let user = users.removeUser(userId);

    expect(user.id).toBe(userId);
    expect(users.users.length).toBe(2);
  });

  it("should not remove user", () => {
    let userId = "99";
    let user = users.removeUser(userId);

    expect(user).toNotExist();
    expect(users.users.length).toBe(3);
  });

  it("should find user", () => {
    let userId = "2";
    let user = users.getUser(userId);

    expect(user.id).toBe(userId);
  });

  it("should not find user", () => {
    let userId = "32";
    let user = users.getUser(userId);

    expect(user).toNotExist();
  });

  it("should add new user", () => {
    let users = new Users();
    let user = { id: "123", name: "Success", room: "Rome Devers" };
    users.addUser(user.id, user.name, user.room);
    expect(users.users).toEqual([user]);
  });

  it("should return names of user in same room", () => {
    let userList = users.getUserList("Rome Devers");

    expect(userList).toEqual(["Success", "Jonas"]);
  });
});
