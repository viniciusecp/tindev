const axios = require("axios");
const Dev = require("../models/Dev");

module.exports = {
  async index(req, res) {
    const { user } = req.headers;

    const loggedDev = await Dev.findById(user);

    if (!loggedDev) {
      return res.status(400).json({ error: "Dev not exists" });
    }

    const users = await Dev.find({
      $and: [
        { _id: { $ne: loggedDev._id } },
        { _id: { $nin: loggedDev.likes } },
        { _id: { $nin: loggedDev.dislikes } }
      ]
    });

    const combinations = await Promise.all(
      loggedDev.combinations.map(async item => await Dev.findById(item._id))
    );
    await Dev.updateOne({ _id: user }, { $set: { combinations: [] } });

    const response = { combinations, users };

    return res.json(response);
  },

  async store(req, res) {
    const { username } = req.body;

    const usersExists = await Dev.findOne({ user: username });

    if (usersExists) {
      return res.json(usersExists);
    }

    const response = await axios.get(
      `https://api.github.com/users/${username}`
    );

    const { name, bio, avatar_url: avatar } = response.data;

    const dev = await Dev.create({
      name,
      user: username,
      bio,
      avatar
    });

    return res.json(dev);
  }
};

// index: lista do recurso
// show: retornar apenas um do recurso
// store
// update
// delete
