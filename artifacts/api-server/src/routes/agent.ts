import { Router } from "express";
import { getAuth } from "@clerk/express";
import { AgentChatBody } from "@workspace/api-zod";

const router = Router();

const SUGGESTIONS: Record<string, string[]> = {
  website: ["Add a hero section", "Create a contact form", "Add dark mode toggle", "Include a responsive navbar"],
  mobile: ["Add bottom navigation", "Create a splash screen", "Implement push notifications", "Add offline support"],
  game: ["Add a leaderboard", "Create particle effects", "Add sound effects", "Implement save states"],
  design: ["Create a component library", "Add animation presets", "Build a style guide", "Add export options"],
  slides: ["Add transitions", "Include speaker notes", "Add a progress bar", "Create a table of contents"],
  "data-viz": ["Add interactive filters", "Create a CSV export", "Add drill-down charts", "Include trend indicators"],
  animation: ["Add scroll triggers", "Create a loop animation", "Add easing presets", "Include timeline controls"],
  document: ["Add a table of contents", "Include code blocks", "Add version history", "Enable collaboration"],
};

router.post("/agent/chat", async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  const parsed = AgentChatBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request" });

  const { message, projectId } = parsed.data;

  const responses = [
    `I'll help you with that! Here's how I'd approach "${message}": Start by breaking it down into smaller components. First, scaffold the main structure, then add interactivity, and finally polish the UI.`,
    `Great idea! For "${message}", I recommend using modern best practices. Let me generate the code structure for you and explain each part as we go.`,
    `I can build that for you. "${message}" is a great feature to add. I'll create the necessary files and integrate them with your existing project seamlessly.`,
    `Let's make that happen! I'll analyze your project context and generate optimized code for "${message}". This should take just a moment.`,
  ];

  const response = responses[Math.floor(Math.random() * responses.length)];
  const typeKey = Object.keys(SUGGESTIONS).find(k => message.toLowerCase().includes(k)) ?? "website";
  const suggestions = SUGGESTIONS[typeKey] ?? SUGGESTIONS.website;

  return res.json({
    message: response,
    projectId,
    suggestions: suggestions.slice(0, 3),
  });
});

export default router;
