import { Router } from "express";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import { handleFileUpload } from "../controllers/uploadController.js";
import { upload } from "../middleware/uploadMiddleWare.js";

const router = Router();

router.post("/", authMiddleWare, upload.array("files", 10), handleFileUpload);

export default router;
