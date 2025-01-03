import { Router } from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  moveTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// All task routes require authentication
router.use(protect);

router.get('/:boardId', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id/move', moveTask);
router.delete('/:id', deleteTask);

export default router;
