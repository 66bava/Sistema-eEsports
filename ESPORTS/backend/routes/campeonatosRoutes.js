import { Router } from "express";
import { listarEquipes, buscarEquipe, cadastrarEquipe, atualizarEquipe, excluirEquipe }
    from "../controllers/campeonatosControllers.js";

const router = Router();
router.get("/", listarEquipes);
router.get("/:id", buscarEquipe);
router.post("/", cadastrarEquipe);
router.put("/:id", atualizarEquipe);
router.delete("/:id", excluirEquipe);

export default router;
