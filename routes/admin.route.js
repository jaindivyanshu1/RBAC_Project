const User = require('../models/user.model');
const router = require('express').Router();
const mongoose = require('mongoose');
const { roles } = require('../utils/constants');

router.get('/users', async (req, res, next) =>{
    try{
        const users = await User.find()
        // res.send(users);
        res.render('manage-users', {users})
    }catch(e){
        next(e)
    }
})

router.get('/users/:id', async (req, res, next) => {
    try {
        const {id} = req.params
        if(!mongoose.Types.ObjectId.isValid(id)){
            req.flash('error', 'Invalid ID')
            res.redirect('/admin/users')
            return
        }

        const person = await User.findById(id)
        res.render('profile', {person})
    }catch(e){
        next(e)
    }
})

router.post('/update-role', async (req, res, next) => {
    try {
      const { id, role } = req.body;
  
      // Checking for id and roles in req.body
      if (!id || !role) {
        req.flash('error', 'Invalid request');
        return res.redirect('back');
      }
  
      // Check for valid mongoose objectID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash('error', 'Invalid id');
        return res.redirect('back');
      }
  
      // Check for Valid role
      const rolesArray = Object.values(roles);
      if (!rolesArray.includes(role)) {
        req.flash('error', 'Invalid role');
        return res.redirect('back');
      }
  
      // Admin cannot remove himself/herself as an admin
      if (req.user.id === id) {
        req.flash(
          'error',
          'Admins cannot remove themselves from Admin, ask another admin.'
        );
        return res.redirect('back');
      }
  
      // Finally update the user
      const user = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true, runValidators: true }
      );
  
      req.flash('info', `updated role for ${user.email} to ${user.role}`);
      res.redirect('back');
    } catch (error) {
      next(error);
    }
  });
  
router.post('/update-status', async (req, res, next) => {
  try {
    const { id, status } = req.body;

    // Check for a valid ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid user ID.');
      return res.redirect('back');
    }

    // Prevent the admin from deactivating themselves
    if (req.user.id === id) {
      req.flash('error', 'Admins cannot deactivate themselves.');
      return res.redirect('back');
    }

    // Update the user's status
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { status: status === 'on' }, // Checkbox sends "on" when checked
      { new: true, runValidators: true }
    );

    req.flash('info', `User ${updatedUser.email}'s status updated successfully.`);
    res.redirect('back');
  } catch (error) {
    next(error);
  }
});


module.exports = router