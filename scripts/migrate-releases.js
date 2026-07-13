import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const LEGACY_REPO = 'veerverma828/Torrent';
const TEMP_DIR = path.join(process.cwd(), 'temp_migration');

// Run a command and return stdout as string
function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (err) {
    throw new Error(err.stderr || err.message);
  }
}

async function main() {
  console.log(`Checking target repository remote origin...`);
  let targetRepo = '';
  try {
    const remoteUrl = run('git config --get remote.origin.url');
    // Extract owner/repo from remote URL (supports HTTPS and SSH)
    const match = /(?:github\.com[:/])([^/]+\/[^.]+)(?:\.git)?/.exec(remoteUrl);
    if (match) {
      targetRepo = match[1];
      console.log(`Found target repository: ${targetRepo}`);
    }
  } catch (err) {
    console.warn(`Warning: Could not auto-detect target remote repository origin. Make sure you run 'git remote add origin ...' first.`);
  }

  if (!targetRepo) {
    console.log(`Please run this script after initializing git origin, or enter target repository name manually (e.g. veerverma828/Torrent-android):`);
    // Fallback to manual entry or exit
    if (process.argv[2]) {
      targetRepo = process.argv[2];
    } else {
      console.error(`Error: No target repository specified. Usage: node scripts/migrate-releases.js <owner/new-repo-name>`);
      process.exit(1);
    }
  }

  // Ensure temp dir exists
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
  }

  console.log(`Fetching releases from legacy repo: ${LEGACY_REPO}...`);
  let legacyReleases = [];
  try {
    const jsonStr = run(`gh release list --repo ${LEGACY_REPO} --limit 100 --json tagName,name,body`);
    legacyReleases = JSON.parse(jsonStr);
  } catch (err) {
    console.error(`Error listing legacy releases: ${err.message}`);
    process.exit(1);
  }

  console.log(`Found ${legacyReleases.length} releases in legacy repository.`);

  console.log(`Fetching existing releases from target repo: ${targetRepo}...`);
  let targetReleaseTags = new Set();
  try {
    const targetJsonStr = run(`gh release list --repo ${targetRepo} --limit 100 --json tagName`);
    const targetReleases = JSON.parse(targetJsonStr);
    targetReleases.forEach(r => targetReleaseTags.add(r.tagName));
    console.log(`Found ${targetReleaseTags.size} existing releases in target repository.`);
  } catch (err) {
    console.log(`Target repository releases not queryable (it might be empty or not pushed yet). Continuing...`);
  }

  // Process releases in reverse chronological order (oldest first)
  const toMigrate = legacyReleases.reverse().filter(r => !targetReleaseTags.has(r.tagName));
  console.log(`Found ${toMigrate.length} releases to migrate.`);

  for (let i = 0; i < toMigrate.length; i++) {
    const rel = toMigrate[i];
    console.log(`\n[${i + 1}/${toMigrate.length}] Migrating ${rel.tagName} (${rel.name})...`);

    // Clean up temp dir before download
    fs.readdirSync(TEMP_DIR).forEach(f => fs.unlinkSync(path.join(TEMP_DIR, f)));

    try {
      console.log(`Downloading APK for ${rel.tagName}...`);
      run(`gh release download ${rel.tagName} --repo ${LEGACY_REPO} --pattern "*.apk" --dir "${TEMP_DIR}"`);

      const files = fs.readdirSync(TEMP_DIR);
      const apkFile = files.find(f => f.endsWith('.apk'));
      if (!apkFile) {
        console.warn(`No APK asset found for release ${rel.tagName}. Skipping.`);
        continue;
      }

      const apkPath = path.join(TEMP_DIR, apkFile);
      console.log(`Downloaded: ${apkFile} (${(fs.statSync(apkPath).size / 1024 / 1024).toFixed(2)} MB)`);

      console.log(`Creating release ${rel.tagName} in ${targetRepo}...`);
      const escapedBody = rel.body ? rel.body.replace(/"/g, '\\"') : '';
      run(`gh release create ${rel.tagName} "${apkPath}" --repo ${targetRepo} --title "${rel.name}" --notes "${escapedBody || 'Automated release migration.'}"`);
      console.log(`✓ Successfully migrated ${rel.tagName}`);
    } catch (err) {
      console.error(`✗ Failed to migrate ${rel.tagName}: ${err.message}`);
    }
  }

  // Final cleanup
  if (fs.existsSync(TEMP_DIR)) {
    fs.readdirSync(TEMP_DIR).forEach(f => fs.unlinkSync(path.join(TEMP_DIR, f)));
    fs.rmdirSync(TEMP_DIR);
  }

  console.log(`\nMigration completed.`);
}

main().catch(console.error);
