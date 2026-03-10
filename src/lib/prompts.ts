import { GenerateFormData } from "./validations";

export function buildWhitepaperPrompt(data: GenerateFormData, language: string): string {
  const languageInstruction =
    language === "chinese"
      ? "Write the whitepaper entirely in Chinese."
      : language === "both"
      ? "Write the whitepaper in both English and Chinese, with English first followed by Chinese translation."
      : "Write the whitepaper in English.";

  const tokenSection = data.hasToken
    ? `
## Tokenomics
- Token Name: ${data.tokenName || "TBD"}
- Token Symbol: ${data.tokenSymbol || "TBD"}
- Total Supply: ${data.totalSupply || "TBD"}
- Distribution: ${data.tokenDistribution || "TBD"}
- Utility: ${data.tokenUtility || "TBD"}
`
    : "";

  const teamSection =
    data.teamMembers && data.teamMembers.length > 0
      ? `
## Team
${data.teamMembers.map((m) => `- ${m.name} (${m.role}): ${m.background || "N/A"}`).join("\n")}
`
      : "";

  const roadmapSection =
    data.roadmap && data.roadmap.length > 0
      ? `
## Roadmap
${data.roadmap.map((r) => `- ${r.quarter} ${r.year}: ${r.milestones}`).join("\n")}
`
      : "";

  return `You are an expert Web3 whitepaper writer. Generate a professional, comprehensive whitepaper for the following project.

${languageInstruction}

## Project Information
- Name: ${data.projectName}
- Tagline: ${data.tagline || "N/A"}
- Description: ${data.description}
- Problem Statement: ${data.problemStatement || "N/A"}
- Solution: ${data.solution || "N/A"}
- Target Audience: ${data.targetAudience || "N/A"}
${tokenSection}${teamSection}${roadmapSection}

## Requirements
1. Generate a professional Web3 whitepaper in Markdown format
2. Structure: Executive Summary, Problem, Solution, Technology Architecture, Tokenomics (if applicable), Team (if provided), Roadmap (if provided), Conclusion
3. Tone: Technical but accessible to general audience
4. Length: Approximately 3000 words
5. Include relevant sections based on provided data
6. Make it compelling and investor-ready
7. Use proper Markdown formatting with headers, bullet points, and emphasis

Output ONLY the whitepaper content in Markdown format. Do not include any meta-commentary.`;
}

export function buildLandingPagePrompt(data: GenerateFormData, language: string): string {
  const languageInstruction =
    language === "chinese"
      ? "Write all text content in Chinese."
      : language === "both"
      ? "Include both English and Chinese text (English as primary, Chinese in parentheses or as alt)."
      : "Write all text content in English.";

  const tokenSection = data.hasToken
    ? `
Tokenomics:
- Token Name: ${data.tokenName || "TBD"}
- Token Symbol: ${data.tokenSymbol || "TBD"}
- Total Supply: ${data.totalSupply || "TBD"}
- Distribution: ${data.tokenDistribution || "TBD"}
- Utility: ${data.tokenUtility || "TBD"}
`
    : "";

  const teamSection =
    data.teamMembers && data.teamMembers.length > 0
      ? `
Team Members:
${data.teamMembers.map((m) => `- ${m.name} (${m.role}): ${m.background || "N/A"}`).join("\n")}
`
      : "";

  const roadmapSection =
    data.roadmap && data.roadmap.length > 0
      ? `
Roadmap:
${data.roadmap.map((r) => `- ${r.quarter} ${r.year}: ${r.milestones}`).join("\n")}
`
      : "";

  return `You are an expert Web3 landing page designer. Generate a complete, production-ready single-page HTML landing page.

${languageInstruction}

## Project Information
- Name: ${data.projectName}
- Tagline: ${data.tagline || "N/A"}
- Description: ${data.description}
- Problem Statement: ${data.problemStatement || "N/A"}
- Solution: ${data.solution || "N/A"}
- Target Audience: ${data.targetAudience || "N/A"}
${tokenSection}${teamSection}${roadmapSection}

## Requirements
1. Generate a complete, self-contained HTML file
2. Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
3. Include all sections: Hero, Problem, Solution, Features, Tokenomics (if applicable), Roadmap (if provided), Team (if provided), CTA
4. Modern Web3 aesthetic with:
   - Dark theme (bg-gray-900 or similar)
   - Gradient backgrounds and text
   - Glassmorphism effects
   - Smooth animations
   - Professional typography
5. Mobile responsive
6. Include placeholder images using gradient backgrounds or SVG shapes
7. Add hover effects and transitions
8. Include a sticky navigation header
9. Add a footer with social links placeholders

Output ONLY valid HTML code. Do not include any explanation or commentary. The output should be immediately usable as an HTML file.`;
}
