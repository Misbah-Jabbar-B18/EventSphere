// backend/routes/users.js
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

// GET all users
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const users = await db.collection('users')
      .find({})
      .project({ password: 0 }) // Exclude password
      .toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

// DELETE user
router.delete('/:userId', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { userId } = req.params;
    
    const result = await db.collection('users').deleteOne({ 
      _id: new ObjectId(userId) 
    });
    
    // Also delete user's RSVPs and feedback
    await db.collection('rsvps').deleteMany({ userId: new ObjectId(userId) });
    await db.collection('feedback').deleteMany({ userId: new ObjectId(userId) });
    
    if (result.deletedCount === 1) {
      res.json({ message: 'User and related data deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
});

// Block/Unblock user
router.patch('/:userId/block', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { userId } = req.params;
    const { blocked } = req.body;
    
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          blocked: blocked, 
          updatedAt: new Date() 
        } 
      }
    );
    
    if (result.modifiedCount === 1) {
      res.json({ 
        message: `User ${blocked ? 'blocked' : 'unblocked'} successfully` 
      });
    } else {
      res.status(404).json({ message: 'User not found or no changes made' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user status', error: err.message });
  }
});

// Update user role
router.patch('/:userId/role', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { userId } = req.params;
    const { role } = req.body;
    
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          role: role, 
          updatedAt: new Date() 
        } 
      }
    );
    
    if (result.modifiedCount === 1) {
      res.json({ message: 'User role updated successfully' });
    } else {
      res.status(404).json({ message: 'User not found or no changes made' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user role', error: err.message });
  }
});

module.exports = router;