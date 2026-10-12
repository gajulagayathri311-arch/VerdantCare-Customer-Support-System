import { Router } from "express";
import { getAllArticles, voteArticle } from "../controllers/kbController.js";

const router = Router();

router.get("/", getAllArticles);
router.post("/:id/vote", voteArticle);

export default router;
