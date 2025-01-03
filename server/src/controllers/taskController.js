import Task from '../models/Task.js';
import Board from '../models/Board.js';

// Verify that a board exists and belongs to the requesting user
const verifyBoardOwnership = async (boardId, userId) => {
  return Board.findOne({ _id: boardId, owner: userId });
};

export const getTasks = async (req, res) => {
  try {
    const board = await verifyBoardOwnership(req.params.boardId, req.user._id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const tasks = await Task.find({ board: board._id }).sort({ status: 1, order: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, priority, status, dueDate, boardId } = req.body;

    if (!title || !boardId) {
      return res.status(400).json({ message: 'Title and boardId are required' });
    }

    const board = await verifyBoardOwnership(boardId, req.user._id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Place task at the end of its column
    const columnTaskCount = await Task.countDocuments({
      board: boardId,
      status: status || 'todo',
    });

    const task = await Task.create({
      title,
      description,
      priority,
      status,
      dueDate,
      order: columnTaskCount,
      board: boardId,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const board = await verifyBoardOwnership(task.board, req.user._id);
    if (!board) {
      return res.status(403).json({ message: 'Not authorized to modify this task' });
    }

    const { title, description, priority, status, dueDate, order } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (order !== undefined) task.order = order;

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const moveTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const board = await verifyBoardOwnership(task.board, req.user._id);
    if (!board) {
      return res.status(403).json({ message: 'Not authorized to modify this task' });
    }

    const { status, order } = req.body;
    if (status !== undefined) task.status = status;
    if (order !== undefined) task.order = order;

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const board = await verifyBoardOwnership(task.board, req.user._id);
    if (!board) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
