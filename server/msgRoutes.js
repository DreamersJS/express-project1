import express from 'express';
import db from './db.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import * as deepl from 'deepl-node';

dotenv.config();

const router = express.Router();

// Middleware to parse JSON requests
router.use(express.json());


// Backend API route to GET messages from a specific room
router.get('/rooms/:roomName/messages', async (req, res) => {
  const { roomName } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  if (typeof roomName !== 'string') {
    console.log('roomName must be a string');
    throw new Error('Room name must be a string');
  }
  try {
    const [roomRows] = await db.query('SELECT id FROM rooms WHERE name = ?', [roomName]);
    const room = roomRows[0];

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const order = req.query.order === 'desc' ? 'DESC' : 'ASC';
    const [messageRows] = await db.query(
      `SELECT id, username, message, sent_at FROM messages WHERE room_id = ? ORDER BY sent_at ${order} LIMIT ? OFFSET ?`, [room.id, parseInt(limit, 10), parseInt(offset, 10)]);
    res.json(messageRows);
  } catch (error) {
    console.error(`Error retrieving messages for room ${roomName}:`, error);
    res.status(500).json({ message: 'Failed to retrieve messages' });
  }
});

// Edit a message
router.put('/messages/:id', async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  try {
    const [existingMessage] = await db.query('SELECT * FROM messages WHERE id = ?', [id]);
    if (existingMessage.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await db.query('UPDATE messages SET message = ? WHERE id = ?', [message, id]);

    res.status(200).json({ id, message });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// Delete a message
router.delete('/messages/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [existingMessage] = await db.query('SELECT * FROM messages WHERE id = ?', [id]);
    if (existingMessage.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await db.query('DELETE FROM messages WHERE id = ?', [id]);

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Use DeepL API 
const authKey = process.env.DEEPL_API_KEY; 
const translator = new deepl.Translator(authKey);

router.post('/translate', async (req, res) => {
  const { q, target } = req.body;

  if (!q || !target) {
    return res.status(400).json({ error: 'Missing required fields: q (text) or target (language)' });
  }

  try {
    // null auto detects the source language
    const result = await translator.translateText(q, null, 'en-US');
    return res.json(result.text);
  } catch (deeplError) {
    console.error('DeepL API error:', deeplError);
  }

});


export default router;
  