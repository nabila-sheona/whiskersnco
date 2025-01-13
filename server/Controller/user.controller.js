const User = require("../Model/user.model"); // Ensure this path is correct
const createError = require("../utils/createError");

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (req.userId !== user._id.toString()) {
      return next(createError(403, "You can delete only your account."));
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).send("deleted.");
  } catch (err) {
    next(err); // Make sure to handle errors
  }
};

const savePreferences = async (req, res, next) => {
  try {
    const userId = req.userId;
    const uid = req.uid;

    if (!userId && !uid) {
      return res.status(403).send("User ID not found. Please log in again.");
    }

    const { petTypes, areas } = req.body;

    const user = uid
      ? await User.findOneAndUpdate({ uid }, { petTypes, areas }, { new: true })
      : await User.findByIdAndUpdate(
          userId,
          { petTypes, areas },
          { new: true }
        );

    if (!user) return res.status(404).send("User not found.");
    res.status(200).send("Preferences saved successfully.");
  } catch (err) {
    console.error("Error saving preferences:", err);
    res.status(500).send("Something went wrong!");
  }
};

const getUser = async (req, res, next) => {
  try {
    let user;

    if (req.uid) {
      user = await User.findOne({ uid: req.uid });
    } else {
      user = await User.findById(req.userId);
    }

    if (!user) return res.status(404).send("User not found.");
    res.status(200).send(user);
  } catch (err) {
    next(err);
  }
};

// Update user information by either `uid` for Google users or `_id` for other users
const updateUser = async (req, res, next) => {
  try {
    const { username, email, img, newPassword } = req.body;
    const updatedData = { username, email, img };

    if (newPassword) updatedData.password = newPassword;

    // Use `uid` if available; otherwise, use `userId`
    const user = req.uid
      ? await User.findOneAndUpdate({ uid: req.uid }, updatedData, {
          new: true,
        })
      : await User.findByIdAndUpdate(req.userId, updatedData, { new: true });

    if (!user) return res.status(404).send("User not found.");
    res.status(200).send(user);
  } catch (err) {
    next(err);
  }
};
const addToWishlist = async (req, res, next) => {
  try {
    const { petId } = req.body;
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).send("User not found.");
    if (user.wishlist.includes(petId)) {
      return res.status(400).send("Pet already in wishlist.");
    }

    user.wishlist.push(petId);
    await user.save();
    res.status(200).send("Pet added to wishlist.");
  } catch (err) {
    next(err);
  }
};

// Export the functions
module.exports = {
  deleteUser,
  getUser,
  savePreferences,
  updateUser,
  addToWishlist,
};
