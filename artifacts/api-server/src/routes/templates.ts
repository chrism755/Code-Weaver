import { Router } from "express";

const router = Router();

const TEMPLATES = [
  { id: "1", name: "React Website", type: "website", description: "Modern React app with Vite", language: "TypeScript", category: "website", iconUrl: null, popularity: 100 },
  { id: "2", name: "Next.js App", type: "website", description: "Full-stack Next.js application", language: "TypeScript", category: "website", iconUrl: null, popularity: 95 },
  { id: "3", name: "HTML/CSS/JS", type: "website", description: "Classic web development stack", language: "JavaScript", category: "website", iconUrl: null, popularity: 90 },
  { id: "4", name: "React Native App", type: "mobile", description: "Cross-platform mobile app with Expo", language: "TypeScript", category: "mobile", iconUrl: null, popularity: 85 },
  { id: "5", name: "Flutter App", type: "mobile", description: "Beautiful native mobile app", language: "Dart", category: "mobile", iconUrl: null, popularity: 80 },
  { id: "6", name: "Phaser Game", type: "game", description: "2D browser game with Phaser.js", language: "JavaScript", category: "game", iconUrl: null, popularity: 75 },
  { id: "7", name: "Three.js 3D", type: "game", description: "3D experience with Three.js", language: "JavaScript", category: "game", iconUrl: null, popularity: 70 },
  { id: "8", name: "Figma Clone", type: "design", description: "Interactive design canvas", language: "TypeScript", category: "design", iconUrl: null, popularity: 65 },
  { id: "9", name: "Reveal.js Slides", type: "slides", description: "Beautiful presentation slides", language: "JavaScript", category: "slides", iconUrl: null, popularity: 60 },
  { id: "10", name: "React Charts", type: "data-viz", description: "Interactive data dashboard", language: "TypeScript", category: "data-viz", iconUrl: null, popularity: 78 },
  { id: "11", name: "Framer Motion", type: "animation", description: "Animated React components", language: "TypeScript", category: "animation", iconUrl: null, popularity: 72 },
  { id: "12", name: "Python Script", type: "document", description: "Python data processing", language: "Python", category: "document", iconUrl: null, popularity: 88 },
  { id: "13", name: "Node.js API", type: "website", description: "REST API with Express", language: "JavaScript", category: "website", iconUrl: null, popularity: 92 },
  { id: "14", name: "Vue.js App", type: "website", description: "Progressive Vue.js application", language: "JavaScript", category: "website", iconUrl: null, popularity: 82 },
];

router.get("/templates", (req, res) => {
  const { category } = req.query;
  let templates = TEMPLATES;
  if (category && typeof category === "string") {
    templates = templates.filter(t => t.category === category);
  }
  return res.json(templates);
});

export default router;
