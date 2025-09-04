/**
 * This is a simple build/bundler helper.
 * Instead of React or another heavy bundling framework we opt for a light
 * solution that allows us to organize different "components" of our UI
 * and output them in a single HYTOPIA compatible index.html file anytime
 * this script runs.
 * 
 * During development, we open a second terminal and have `bun run dev-ui` running
 * to watch and rebuild any UI changes to update the index.html file.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const outputContent = [];

function includeContent(filePath) {
  const fullPath = path.join(__dirname, filePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  outputContent.push(`<!-- Included from: ${filePath} -->\n${content}`);
}

// Include content for the output - Add our modules here!
includeContent('./root.html');
includeContent('./shared/item-stats.html');
includeContent('./shared/item-tooltips.html');
includeContent('./menus/backpack.html');
includeContent('./menus/skills.html');
includeContent('./menus/dialogue.html');
includeContent('./menus/quests.html');
includeContent('./menus/merchant.html');
includeContent('./menus/crafting.html');
includeContent('./menus/help.html');
includeContent('./scene-ui-templates/entity-nameplate.html');
includeContent('./scene-ui-templates/item-nameplate.html');
includeContent('./scene-ui-templates/progress-bar.html');
includeContent('./hud.html');

// Build a single index.html file
const html = outputContent.join('\n\n');
const fullOutputPath = path.join(__dirname, 'index.html');
fs.writeFileSync(fullOutputPath, html);
console.log('✓ Successfully built assets/ui/index.html');